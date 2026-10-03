#!/usr/bin/env node
/**
 * Capture screenshots of the Brush Targeting app from the LOCAL stack for use
 * on the marketing site. Read-only against the app; uses the seeded dev login.
 *
 * Prereqs (in the brush-targeting repo):
 *   cd supabase && supabase start          # local Postgres/Auth/Storage on :54321
 *   cd backend  && uv run --package brush-targeting serve   # API on :8000
 *   cd frontend2 && yarn dev               # Nuxt on :3000
 * Seeded logins live in supabase/seeds/01_users_seed.sql (dev password there).
 *
 * Usage:
 *   read -rsp "Screenshot password: " SCREENSHOT_PASSWORD; echo
 *   export SCREENSHOT_PASSWORD
 *   node scripts/capture-app-screenshots.mjs <outDir> <email> <path> [<path> ...]
 *
 * The password comes from the environment so it never sits in `ps` output or
 * shell history.
 * Example:
 *   node scripts/capture-app-screenshots.mjs /tmp/shots a@e.com <pw> \
 *     /region/<jobRegionId>/zone/<zoneId>/plan /region/<jobRegionId>/zone/<zoneId>/target-check
 *
 * Notes: Nuxt dev never reaches "networkidle" (HMR socket), so waits are on
 * load + a fixed settle. Login waits a few seconds for the Turnstile widget.
 * Routes only draw on the Plan page while they are un-flown ("Up next").
 */
import { chromium } from "@playwright/test";

const [, , out, email, ...paths] = process.argv;
const password = process.env.SCREENSHOT_PASSWORD;
if (!out || !email || !password || paths.length === 0) {
  console.error(
    "usage: capture-app-screenshots.mjs <outDir> <email> <path> [...] (export SCREENSHOT_PASSWORD first)",
  );
  process.exit(1);
}
const base = process.env.APP_BASE || "http://localhost:3000";
const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  deviceScaleFactor: 2,
});
const page = await ctx.newPage();
page.on("dialog", (d) => d.dismiss());

await page.goto(base + "/auth/login", { waitUntil: "load", timeout: 90000 });
await page.waitForSelector("input[type=email]", { timeout: 60000 });
await page.locator("input[type=email]").fill(email);
await page.locator("input[type=password]").fill(password);
await page.waitForTimeout(6000); // Turnstile token
await Promise.all([
  page
    .waitForURL((u) => !u.toString().includes("/auth/"), { timeout: 45000 })
    .catch(() => {}),
  page.locator("form button[type=submit]").first().click(),
]);
if (page.url().includes("/auth/")) {
  console.error("login did not complete:", page.url());
  process.exit(2);
}

for (const path of paths) {
  const r = await page
    .goto(base + path, { waitUntil: "load", timeout: 90000 })
    .catch(() => null);
  if (!r?.ok()) {
    throw new Error(
      `navigation failed for ${base + path}: ${r ? r.status() : "ERR"}`,
    );
  }
  await page.waitForTimeout(6000);
  const name =
    path
      .replace(/^\//, "")
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/-$/, "") || "home";
  await page.screenshot({ path: `${out}/${name}.png` });
  const map = page.locator(".leaflet-container").first();
  if (await map.count())
    await map.screenshot({ path: `${out}/${name}-map.png` });
  console.log(r ? r.status() : "ERR", path, "->", `${name}.png`);
}
await browser.close();
