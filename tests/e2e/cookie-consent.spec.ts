import { test, expect, type Page } from "@playwright/test";

// Opt-out consent: the banner records what the visitor turns off. These
// tests pin what gets stored for each way out of the banner, and that the
// footer link reopens the pane with the saved state. PostHog itself is not
// loaded in dev, so what reaches it is covered by the init logic in
// posthog.astro, not here.

const KEY = "cookie-consent";

async function stored(page: Page) {
  const raw = await page.evaluate((k) => localStorage.getItem(k), KEY);
  return raw ? (JSON.parse(raw) as Record<string, unknown>) : null;
}

const banner = (page: Page) => page.locator("#cookie-banner");

test("first visit shows the banner; Accept all stores everything on", async ({
  page,
}) => {
  await page.goto("/");
  await expect(banner(page)).toBeVisible();
  await expect(page.getByRole("button", { name: "Accept all" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Customize" })).toBeVisible();

  await page.getByRole("button", { name: "Accept all" }).click();
  await expect(banner(page)).toBeHidden();
  expect(await stored(page)).toMatchObject({ analytics: true, replay: true });

  await page.reload();
  await expect(banner(page)).toBeHidden();
});

test("closing the banner keeps the defaults on", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /close and keep/i }).click();
  await expect(banner(page)).toBeHidden();
  expect(await stored(page)).toMatchObject({ analytics: true, replay: true });
});

test("Customize lets the visitor keep analytics but drop recordings", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Customize" }).click();
  const analytics = page.locator("#cookie-opt-analytics");
  const replay = page.locator("#cookie-opt-replay");
  await expect(analytics).toBeChecked();
  await expect(replay).toBeChecked();

  await replay.uncheck();
  await page.getByRole("button", { name: "Save choices" }).click();
  await expect(banner(page)).toBeHidden();
  expect(await stored(page)).toMatchObject({ analytics: true, replay: false });
});

test("turning analytics off also turns recordings off", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Customize" }).click();
  await page.locator("#cookie-opt-analytics").uncheck();
  await expect(page.locator("#cookie-opt-replay")).toBeDisabled();
  await expect(page.locator("#cookie-opt-replay")).not.toBeChecked();
  await page.getByRole("button", { name: "Save choices" }).click();
  expect(await stored(page)).toMatchObject({
    analytics: false,
    replay: false,
  });
});

test("the footer link reopens the pane with the saved choice", async ({
  page,
}) => {
  await page.addInitScript((k) => {
    localStorage.setItem(
      k,
      JSON.stringify({ v: 2, analytics: true, replay: false }),
    );
  }, KEY);
  await page.goto("/");
  await expect(banner(page)).toBeHidden();

  await page.getByRole("button", { name: "Cookie preferences" }).click();
  await expect(banner(page)).toBeVisible();
  await expect(page.locator("#cookie-opt-analytics")).toBeChecked();
  await expect(page.locator("#cookie-opt-replay")).not.toBeChecked();
  await page.getByRole("button", { name: "Accept all" }).click();
  expect(await stored(page)).toMatchObject({ analytics: true, replay: true });
});

test("the older string values still count as a saved choice", async ({
  page,
}) => {
  await page.addInitScript((k) => localStorage.setItem(k, "rejected"), KEY);
  await page.goto("/");
  await expect(banner(page)).toBeHidden();
  await page.getByRole("button", { name: "Cookie preferences" }).click();
  await expect(page.locator("#cookie-opt-analytics")).not.toBeChecked();
});
