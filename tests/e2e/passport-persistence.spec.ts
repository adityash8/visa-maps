import { test, expect } from "@playwright/test";

declare global {
  interface Window { visaEvents: unknown[]; }
}

test("an explicit single-passport share clears a locally saved second passport", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("visa-maps-passport", "US");
    localStorage.setItem("visa-maps-passport-2", "GB");
  });
  await page.goto("/?p=IN");
  await expect.poll(() => page.evaluate(() => ({
    primary: localStorage.getItem("visa-maps-passport"),
    secondary: localStorage.getItem("visa-maps-passport-2"),
  }))).toEqual({ primary: "IN", secondary: null });
  await expect(page.getByRole("button", { name: /India/ }).first()).toBeVisible();
});

test("invalid shared codes produce a valid default instead of stale local choices", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("visa-maps-passport", "IN");
    localStorage.setItem("visa-maps-passport-2", "GB");
  });
  await page.goto("/?p=invalid&p2=XX");
  await expect.poll(() => page.evaluate(() => ({
    primary: localStorage.getItem("visa-maps-passport"),
    secondary: localStorage.getItem("visa-maps-passport-2"),
  }))).toEqual({ primary: "US", secondary: null });
  await expect(page.getByRole("button", { name: /United States/ }).first()).toBeVisible();
});

test("a valid dual-passport share persists both passports", async ({ page }) => {
  await page.goto("/?p=US&p2=GB");
  await expect.poll(() => page.evaluate(() => ({
    primary: localStorage.getItem("visa-maps-passport"),
    secondary: localStorage.getItem("visa-maps-passport-2"),
  }))).toEqual({ primary: "US", secondary: "GB" });
  await expect(page.getByRole("button", { name: /United Kingdom/ }).first()).toBeVisible();
});

test("invalid waitlist input fails before reaching persistence", async ({ request }) => {
  const response = await request.post("/api/waitlist", { data: { email: "invalid" } });
  expect(response.status()).toBe(400);
  expect(await response.json()).toEqual({ error: "Invalid email" });
});

test("passport analytics stays local and contains only allowed fields", async ({ page }) => {
  const externalAnalytics: string[] = [];
  page.on("request", (request) => {
    if (/posthog|i\.posthog/i.test(request.url())) externalAnalytics.push(request.url());
  });
  await page.addInitScript(() => {
    window.visaEvents = [];
    window.addEventListener("visa-maps:event", (event) => window.visaEvents.push((event as CustomEvent).detail));
  });
  await page.goto("/?p=IN");
  await page.getByRole("button", { name: /India/ }).first().click();
  await page.getByRole("option", { name: /Japan/ }).click();
  await expect.poll(() => page.evaluate(() => window.visaEvents))
    .toContainEqual({ name: "passport_selected", properties: { passport_iso: "JP" } });
  expect(externalAnalytics).toEqual([]);
});

test("the real MapLibre worker loads without a runtime error", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && /worker failed|branch labels must be unique/i.test(message.text())) errors.push(message.text());
  });
  await page.goto("/?p=US&p2=GB");
  await expect(page.locator(".maplibregl-canvas")).toBeVisible();
  await page.waitForTimeout(1000);
  expect(errors).toEqual([]);
});
