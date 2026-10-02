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

test("articles index renders posts without errors", async ({ page }) => {
  const errors = trackBrowserErrors(page);
  const response = await page.goto("/articles/");
  expect(response?.status(), "articles index returned non-2xx").toBeLessThan(
    400,
  );
  await expect(page.locator('main a[href*="/articles/"]').first()).toBeVisible();
  expect(errors, errors.join("\n")).toEqual([]);
});

test("contact page renders without errors", async ({ page }) => {
  const errors = trackBrowserErrors(page);
  const response = await page.goto("/contact/");
  expect(response?.status(), "contact returned non-2xx").toBeLessThan(400);
  await expect(page.locator("h1").first()).toBeVisible();
  expect(errors, errors.join("\n")).toEqual([]);
});
