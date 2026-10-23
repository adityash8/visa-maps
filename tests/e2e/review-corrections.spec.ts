import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import sharp from "sharp";

const rules = JSON.parse(readFileSync("public/data/visa-rules.json", "utf8"));
const checkedAt: string = rules.US.FR.checkedAt;
const threshold = Date.parse(checkedAt) + 30 * 86400000;

async function mapPaint(page: import("@playwright/test").Page) {
  const map = page.locator("[data-rendered-feature-count]");
  await expect(map).toBeVisible();
  expect(Number(await map.getAttribute("data-rendered-feature-count"))).toBeGreaterThan(0);
  const [x, y] = JSON.parse((await map.getAttribute("data-france-point"))!);
  const canvas = page.locator(".maplibregl-canvas");
  const screenshot = await canvas.screenshot();
  const width = (await sharp(screenshot).metadata()).width!;
  const scale = width / (await canvas.boundingBox())!.width;
  const { data } = await sharp(screenshot).extract({ left: Math.round(x * scale), top: Math.round(y * scale), width: 1, height: 1 }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  expect(data[1]).toBeGreaterThan(data[0] + 40);
  expect(data[1]).toBeGreaterThan(data[2] + 20);
}

test("VM-R1 mobile modal traps keyboard focus and restores the opening row", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?p=US");
  await page.getByRole("searchbox", { name: "Search destinations" }).fill("Malta");
  const trigger = page.getByLabel("Destination results").getByRole("button", { name: /^Malta / });
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect.poll(() => dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  const controls = dialog.locator('button:not([disabled]), a[href], input:not([disabled]), [tabindex="0"]');
  const first = controls.first();
  const last = controls.last();
  await first.focus();
  await page.keyboard.press("Shift+Tab");
  await expect(last).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(first).toBeFocused();
  for (let index = 0; index <= await controls.count(); index++) {
    await page.keyboard.press("Tab");
    await expect.poll(() => dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await dialog.getByRole("button", { name: "Close entry details" }).click();
  await expect(trigger).toBeFocused();
});

test("VM-R2 static guide becomes stale at the exact current-clock boundary without a rebuild", async ({ page }) => {
  await page.clock.install({ time: new Date(threshold - 1000) });
  await page.clock.pauseAt(new Date(threshold));
  await page.goto("/passport/us");
  const france = page.locator("tbody tr").filter({ has: page.getByRole("link", { name: "France", exact: true }) });
  await expect(france).toBeVisible();
  await expect(france.getByText(/Stale:/)).toHaveCount(0);
  await page.clock.runFor(1);
  await expect(france.getByText(/Stale: checked over 30 days ago/)).toBeVisible();
  await page.reload();
  await expect(france.getByText(/Stale: checked over 30 days ago/)).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://visa-maps.vercel.app/passport/us");
});

test("VM-R2 an already open map detail becomes stale as current time crosses 30 days", async ({ page }) => {
  await page.clock.install({ time: new Date(threshold - 1000) });
  await page.clock.pauseAt(new Date(threshold));
  await page.goto("/?p=US&destination=FR");
  const detail = page.locator(".country-detail:visible");
  await expect(detail.getByRole("heading", { name: "France", exact: true })).toBeVisible();
  await expect(detail.getByText(/Stale:/)).toHaveCount(0);
  await page.clock.runFor(1);
  await expect(detail.getByText(/Stale: checked over 30 days ago/)).toBeVisible();
});

test("VM-R3 real keyboard canvas focus is visible in both themes", async ({ page }) => {
  for (const colorScheme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme });
    await page.goto("/?p=US");
    const canvas = page.locator(".maplibregl-canvas");
    await canvas.focus();
    await page.keyboard.press("ArrowLeft");
    const focus = await canvas.evaluate((element) => {
      const style = getComputedStyle(element);
      const context = document.createElement("canvas").getContext("2d")!;
      function luminance(color: string) {
        context.fillStyle = color; context.fillRect(0, 0, 1, 1);
        const rgb = [...context.getImageData(0, 0, 1, 1).data].slice(0, 3).map((value) => { const channel = value / 255; return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4; });
        return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
      }
      const ring = luminance(style.outlineColor);
      const map = luminance(getComputedStyle(document.documentElement).getPropertyValue("--color-unknown"));
      return { visible: element.matches(":focus-visible"), outline: style.outlineStyle, width: parseFloat(style.outlineWidth), offset: parseFloat(style.outlineOffset), contrast: (Math.max(ring, map) + .05) / (Math.min(ring, map) + .05) };
    });
    expect(focus.visible).toBe(true);
    expect(focus.outline).not.toBe("none");
    expect(focus.width).toBeGreaterThanOrEqual(3);
    expect(focus.offset).toBeLessThan(0);
    expect(focus.contrast).toBeGreaterThanOrEqual(3);
  }
});

for (const failedRequest of ["style", "boundaries"] as const) {
  test(`VM-R4 actual ${failedRequest} failure exposes retry and recovers genuine country paint`, async ({ page, context }) => {
    const pattern = failedRequest === "style" ? "**/basemaps.cartocdn.com/gl/positron-gl-style/style.json" : "**/data/countries.geojson";
    let blocked = 0;
    await context.route(pattern, (route) => { blocked++; return route.abort("failed"); });
    try {
      await page.goto("/?p=US");
      await expect.poll(() => blocked).toBeGreaterThan(0);
      await expect(page.getByRole("alert").filter({ hasText: "Map couldn’t load" })).toBeVisible();
      await expect(page.locator(".map-loading")).toHaveCount(0);
      await page.getByRole("searchbox", { name: "Search destinations" }).fill("Singapore");
      await expect(page.getByLabel("Destination results").getByRole("button", { name: /^Singapore / })).toBeVisible();
    } finally {
      await context.unroute(pattern);
    }
    await page.getByRole("button", { name: "Retry map", exact: true }).click();
    await mapPaint(page);
    await expect(page.getByRole("button", { name: "Retry map", exact: true })).toHaveCount(0);
  });
}
