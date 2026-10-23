import { test, expect } from "@playwright/test";
import sharp from "sharp";
import { readFileSync } from "node:fs";
const catalogue: { code: string; name: string }[] = JSON.parse(readFileSync("public/data/destinations.json", "utf8"));
const passports: { code: string; name: string }[] = JSON.parse(readFileSync("public/data/passports.json", "utf8"));
const geometry: { features: { properties: { ISO_A2_EH: string; ISO_A2: string } }[] } = JSON.parse(readFileSync("public/data/countries.geojson", "utf8"));

const sourceUrl = "https://www.consilium.europa.eu/en/policies/eu-visa-policy/";
const rulesFixture = {
  US: { FR: { category: "evisa", notes: "Acceptance fixture: ordinary passports, short tourist visits only.", sourceUrl, checkedAt: "2025-01-01T00:00:00.000Z", approvedBy: "acceptance-fixture" } },
  GB: { FR: { category: "visa_free", notes: "Acceptance fixture: check short-stay conditions.", sourceUrl, checkedAt: "2026-10-01T00:00:00.000Z", approvedBy: "acceptance-fixture", duration: 90 } },
};
const disclaimer = "Check official sources before travel. Entry is not guaranteed.";

test("all 194 destinations and every country without map geometry are reachable", async ({ page }) => {
  await page.goto("/?p=US");
  const results = page.getByLabel("Destination results");
  await expect(results.getByRole("button")).toHaveCount(194);
  for (const destination of catalogue.filter(({ code }) => code !== "US")) {
    await expect(results.getByRole("button", { name: new RegExp(`^${destination.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} `) })).toHaveCount(1);
  }
  const featureCodes = new Set(geometry.features.map(({ properties }) => properties.ISO_A2_EH !== "-99" ? properties.ISO_A2_EH : properties.ISO_A2));
  const withoutGeometry = catalogue.filter(({ code }) => !featureCodes.has(code));
  expect(withoutGeometry.length).toBe(29);
  for (const { name } of withoutGeometry) {
    await page.getByRole("searchbox", { name: "Search destinations" }).fill(name);
    await expect(results.getByRole("button", { name: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} `) })).toHaveCount(1);
  }
  for (const name of ["Singapore", "Malta", "Maldives"]) {
    await page.getByRole("searchbox", { name: "Search destinations" }).fill(name);
    await results.getByRole("button").click();
    await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
    await expect(page.getByText(disclaimer, { exact: true }).last()).toBeVisible();
    await page.getByRole("button", { name: "Close entry details" }).last().click();
  }
});

test("passport selector keeps all 50 choices and second passport requires a distinct choice", async ({ page }) => {
  await page.goto("/?p=SG");
  await page.getByRole("button", { name: "Passport: Singapore", exact: true }).click();
  await expect(page.getByRole("option")).toHaveCount(50);
  for (const { name } of passports) await expect(page.getByRole("option", { name: new RegExp(name) })).toHaveCount(1);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Passport: Singapore", exact: true })).toBeFocused();
  await page.getByRole("button", { name: "2nd Passport", exact: true }).click();
  expect(await page.evaluate(() => localStorage.getItem("visa-maps-passport-2"))).toBeNull();
  await page.getByRole("button", { name: "2nd Passport: Choose a passport", exact: true }).click();
  await expect(page.getByRole("option")).toHaveCount(49);
  await expect(page.getByRole("option", { name: /Singapore/ })).toHaveCount(0);
  await page.getByRole("option", { name: /India/ }).click();
  await expect(page.getByRole("button", { name: "2nd Passport: India", exact: true })).toBeVisible();
});

test("source provenance, stale label, unknown state, winning passport and destination flights", async ({ page }) => {
  await page.route("**/data/visa-rules.json", (route) => route.fulfill({ json: rulesFixture }));
  await page.goto("/?p=US&destination=FR");
  const detail = page.locator(".country-detail:visible");
  await expect(detail.getByText("eVisa", { exact: true })).toBeVisible();
  await expect(detail.getByText(rulesFixture.US.FR.notes)).toBeVisible();
  await expect(detail.getByRole("link", { name: sourceUrl, exact: true })).toHaveAttribute("href", sourceUrl);
  await expect(detail.getByText("1 January 2025", { exact: true })).toBeVisible();
  await expect(detail.getByText(/Stale: checked over 30 days/)).toBeVisible();
  await expect(detail.getByText(disclaimer, { exact: true })).toBeVisible();
  await expect(detail.getByRole("button", { name: "Apply for Visa unavailable" })).toBeDisabled();
  const flights = new URL((await detail.getByRole("link", { name: "Search Flights" }).getAttribute("href"))!);
  expect(flights.searchParams.get("q")).toBe("Flights from United States to France");
  await expect(detail.getByRole("link", { name: "Search Flights" })).toHaveAttribute("target", "_blank");
  await page.goto("/?p=US&p2=GB&destination=FR");
  await expect(detail.getByText("Visa Free", { exact: true })).toBeVisible();
  await expect(detail.getByText("Using your United Kingdom passport", { exact: true })).toBeVisible();
  await page.goto("/?p=US&destination=SG");
  await expect(detail.getByRole("heading", { name: "No data", exact: true })).toBeVisible();
  await expect(detail.getByText(disclaimer, { exact: true })).toBeVisible();
});

test("failed data load offers a working retry and waitlist configuration failure is honest", async ({ page }) => {
  let failLoad = true;
  await page.route("**/data/visa-rules.json", (route) => failLoad ? route.fulfill({ status: 503, body: "unavailable" }) : route.fulfill({ json: rulesFixture }));
  await page.route("**/api/waitlist", (route) => route.fulfill({ status: 503, json: { error: "Waitlist unavailable" } }));
  await page.goto("/?p=US");
  await expect(page.locator(".load-error")).toContainText("Visa data couldn’t load");
  await expect(page.locator(".map-loading")).toHaveCount(0);
  failLoad = false;
  await page.getByRole("button", { name: "Retry data" }).click();
  await expect(page.getByText("1 of 194 destinations source checked. Grey means No data.", { exact: true })).toBeVisible();
  await page.getByText("Future visa-change alerts", { exact: true }).click();
  await page.getByRole("textbox", { name: "Email address" }).fill("acceptance@example.com");
  await page.getByRole("button", { name: "Join Waitlist" }).click();
  await expect(page.locator(".error-message")).toHaveText("Signups are unavailable while the waitlist is being configured. Please try again later.");
  await expect(page.getByText("Your email is on the waitlist.", { exact: false })).toHaveCount(0);
});

test("all target widths support light and dark modes without horizontal overflow", async ({ page }) => {
  for (const colorScheme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
    for (const width of [320, 375, 414, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/?p=IN&p2=GB");
      await expect(page.getByRole("button", { name: "Passport: India", exact: true })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      const tooSmall = await page.locator(".atlas-app button:visible, .atlas-app input:visible").evaluateAll((controls) => controls.filter((control) => control.getBoundingClientRect().height < 43.5).map((control) => control.outerHTML.slice(0, 120)));
      expect(tooSmall).toEqual([]);
      if (width < 768) {
        const list = (await page.locator(".destination-list").boundingBox())!;
        const waitlist = (await page.locator(".waitlist-disclosure").boundingBox())!;
        expect(waitlist.y).toBeGreaterThanOrEqual(list.y + list.height);
      }
    }
  }
});

test("actual map frame recolors under 300ms and paints the visa color", async ({ page }) => {
  await page.route("**/data/visa-rules.json", (route) => route.fulfill({ json: rulesFixture }));
  await page.goto("/?p=US");
  const map = page.locator("[data-map-ready=true]");
  await expect(map).toHaveAttribute("data-rendered-fill-expression", /#3b82f6/);
  await page.getByRole("button", { name: "Passport: United States", exact: true }).click();
  await page.evaluate(() => {
    const map = document.querySelector("[data-map-ready=true]")!;
    let start = 0;
    document.addEventListener("click", () => { start = performance.now(); }, { once: true, capture: true });
    const observer = new MutationObserver(() => {
      if (!start || !map.getAttribute("data-rendered-fill-expression")?.includes("#22c55e")) return;
      map.setAttribute("data-click-to-render-ms", String(performance.now() - start)); observer.disconnect();
    });
    observer.observe(map, { attributes: true, attributeFilter: ["data-rendered-fill-expression"] });
  });
  await page.getByRole("option", { name: /United Kingdom/ }).click();
  await expect(map).toHaveAttribute("data-rendered-fill-expression", /#22c55e/);
  const elapsed = Number(await map.getAttribute("data-click-to-render-ms"));
  expect(elapsed).toBeGreaterThan(0);
  expect(elapsed).toBeLessThan(300);
  const [x, y] = JSON.parse((await map.getAttribute("data-france-point"))!);
  const screenshot = await page.locator(".maplibregl-canvas").screenshot();
  const imageWidth = (await sharp(screenshot).metadata()).width!;
  const canvasWidth = (await page.locator(".maplibregl-canvas").boundingBox())!.width;
  const scale = imageWidth / canvasWidth;
  const { data } = await sharp(screenshot).extract({ left: Math.round(x * scale), top: Math.round(y * scale), width: 1, height: 1 }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  expect(data[1]).toBeGreaterThan(data[0] + 40);
  expect(data[1]).toBeGreaterThan(data[2] + 20);
  console.log(`P0 actual MapLibre render ${elapsed.toFixed(1)}ms; France pixel RGB ${[...data]}`);
});

test("passport SEO routes, canonical, sitemap and social preview are real", async ({ page, request }) => {
  await page.goto("/passport/in");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("India passport entry rules");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://visa-maps.vercel.app/passport/in");
  await expect(page.getByText(/Ranked #|Henley Passport Index/)).toHaveCount(0);
  expect((await request.get("/passport/not-a-passport")).status()).toBe(404);
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  expect(await sitemap.text()).toContain("https://visa-maps.vercel.app/passport/in");
  expect((await request.get("/robots.txt")).ok()).toBe(true);
  const image = await request.get("/opengraph-image");
  expect(image.ok()).toBe(true);
  expect(image.headers()["content-type"]).toContain("image/png");
});
