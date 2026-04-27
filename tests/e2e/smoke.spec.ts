import { test, expect, type Page } from "@playwright/test";

function trackBrowserErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(`[console.error] ${msg.text()}`);
  });
  page.on("pageerror", (err) => errors.push(`[pageerror] ${err.message}`));
  return errors;
}

test("home page renders without errors", async ({ page }) => {
  const errors = trackBrowserErrors(page);
  const response = await page.goto("/");
  expect(response?.status(), "home returned non-2xx").toBeLessThan(400);
  await expect(page).toHaveTitle(/.+/);
  await expect(page.locator("h1, h2").first()).toBeVisible();
  expect(errors, errors.join("\n")).toEqual([]);
});

test("blog index renders posts without errors", async ({ page }) => {
  const errors = trackBrowserErrors(page);
  const response = await page.goto("/blog/");
  expect(response?.status(), "blog index returned non-2xx").toBeLessThan(400);
  await expect(page.locator('a[href*="/blog/"]').first()).toBeVisible();
  expect(errors, errors.join("\n")).toEqual([]);
});

test("contact page renders without errors", async ({ page }) => {
  const errors = trackBrowserErrors(page);
  const response = await page.goto("/contact/");
  expect(response?.status(), "contact returned non-2xx").toBeLessThan(400);
  await expect(page.locator("h1").first()).toBeVisible();
  expect(errors, errors.join("\n")).toEqual([]);
});
