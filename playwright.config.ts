import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PREVIEW_URL ?? "http://localhost:4321";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: process.env.PREVIEW_URL
    ? undefined
    : {
        command: "pnpm dev",
        url: "http://localhost:4321",
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
