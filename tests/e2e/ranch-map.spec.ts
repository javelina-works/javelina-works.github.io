import { test, expect, type Page, type Route } from "@playwright/test";
import { readFileSync } from "node:fs";

// The Fox Canyon sample is a real bundle from the tasks-ranchmap backend, so
// it doubles as the fixture for the mocked API run below.
const BUNDLE = readFileSync("public/tools/ranch-map/fox-canyon.json", "utf8");
const API = /\/api\/ranch-map(-staging)?(\/.*)?$/;

// One clockwise ring = one TxGIO parcel (the Fox Canyon sample box).
const PARCEL = {
  results: [
    {
      attributes: {
        objectid: 1,
        OWNER_NAME: "SOMEONE PRIVATE",
        COUNTY: "JEFF DAVIS",
      },
      geometry: {
        rings: [
          [
            [-104.049101, 30.930708],
            [-104.049101, 30.938208],
            [-104.039936, 30.938208],
            [-104.039936, 30.930708],
            [-104.049101, 30.930708],
          ],
        ],
      },
    },
  ],
};

function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`[pageerror] ${e.message}`));
  page.on("console", (m) => {
    // Basemap tiles can 404 at the edges of coverage; that's not our bug.
    if (
      m.type() === "error" &&
      !/arcgisonline|Failed to load resource/.test(m.text())
    )
      errors.push(`[console.error] ${m.text()}`);
  });
  return errors;
}

// The consent banner sits over the bottom of the page; a visitor would
// answer it first, so the tests do too.
async function open(page: Page) {
  const res = await page.goto("/tools/ranch-map/");
  const reject = page.getByRole("button", { name: "Reject" });
  if (await reject.isVisible().catch(() => false)) await reject.click();
  return res;
}

async function mapIsPainted(page: Page, id: string) {
  return page.evaluate((cid) => {
    const c = document.getElementById(cid) as HTMLCanvasElement;
    const d = c.getContext("2d")!.getImageData(0, 0, c.width, c.height).data;
    let colors = new Set<number>();
    for (let i = 0; i < d.length; i += 4 * 997)
      colors.add((d[i] << 16) | (d[i + 1] << 8) | d[i + 2]);
    return colors.size;
  }, id);
}

test("ranch map page renders its lookup without errors", async ({ page }) => {
  const errors = trackErrors(page);
  const res = await open(page);
  expect(res?.status()).toBeLessThan(400);
  await expect(page.locator("h1")).toContainText("map of your ranch");
  await expect(page.locator("#rmLookupMap .leaflet-tile-pane")).toBeAttached();
  await expect(page.locator("#rmStudio")).toBeHidden();
  expect(errors, errors.join("\n")).toEqual([]);
});

test("the Fox Canyon sample draws a map and a print preview", async ({
  page,
}) => {
  const errors = trackErrors(page);
  await open(page);
  await page.click("#rmSample");
  await expect(page.locator("#rmStudio")).toBeVisible();
  await expect(page.locator("#loading")).toBeHidden({ timeout: 20_000 });
  expect(await mapIsPainted(page, "map")).toBeGreaterThan(20);
  await expect(page.locator("#legend")).toContainText("Contour");

  // switching styles redraws without errors
  await page
    .locator("label.swatch", { has: page.locator("#st-night") })
    .click();
  await expect(page.locator("#sheet")).toHaveAttribute("data-style", "night");
  await page
    .locator("label.swatch", { has: page.locator("#st-modern") })
    .click();
  await expect(page.locator("#sheet")).toHaveAttribute("data-style", "modern");

  // print preview: a standard scale and a real-size sheet
  await page.click("#mPrint");
  await expect(page.locator("#plan")).toContainText(/scale 1:[\d,]+/);
  expect(await mapIsPainted(page, "pcanvas")).toBeGreaterThan(20);
  const w = await page
    .locator("#page")
    .evaluate((el) => (el as HTMLElement).style.width);
  expect(w).toMatch(/^(11|17|36|8\.5|24)in$/);
  await page.selectOption("#paper", "letter");
  await expect(page.locator("#plan")).toContainText("Letter");
  expect(errors, errors.join("\n")).toEqual([]);
});

test("search, parcel pick and a full API run end in a rendered map", async ({
  page,
}) => {
  const errors = trackErrors(page);
  const posted: unknown[] = [];
  let polls = 0;
  await page.route(/feature\.geographic\.texas\.gov/, (r: Route) =>
    r.fulfill({
      contentType: "application/json",
      body: JSON.stringify(PARCEL),
    }),
  );
  await page.route(API, async (r: Route) => {
    const url = r.request().url();
    if (r.request().method() === "POST") {
      posted.push(r.request().postDataJSON());
      return r.fulfill({
        status: 202,
        contentType: "application/json",
        body: JSON.stringify({
          workflow_run_id: "run-e2e",
          status: "queued",
          acres: 179.9,
        }),
      });
    }
    if (url.endsWith("/bundle"))
      return r.fulfill({ contentType: "application/json", body: BUNDLE });
    polls += 1;
    const done = polls >= 2;
    return r.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        workflow_run_id: "run-e2e",
        status: done ? "succeeded" : "running",
        result: done ? { acres: 179.9 } : null,
      }),
    });
  });

  await open(page);
  await page.fill("#rmAddr", "30.9345, -104.0445");
  await page.click("#rmFind button[type=submit]");
  await expect(page.locator("#rmAcres")).toContainText(
    /1\d\d acres · 1 parcel · Jeff Davis County/,
    { timeout: 15_000 },
  );
  await page.fill("#rmName", "Test Ranch");
  await page.click("#rmBuild");
  await expect(page.locator("#rmStudio")).toBeVisible({ timeout: 30_000 });
  await expect(page.locator("#loading")).toBeHidden({ timeout: 20_000 });
  await expect(page.locator("#sTitle")).toHaveText("Test Ranch");
  await expect(page.locator("#sSub")).toHaveText("Jeff Davis County, Texas");
  expect(polls).toBeGreaterThanOrEqual(2);

  // only geometry goes to our API: never the owner name from the parcel layer
  expect(posted).toHaveLength(1);
  expect(Object.keys(posted[0] as object)).toEqual(["geometry"]);
  expect(JSON.stringify(posted[0])).not.toContain("SOMEONE PRIVATE");
  expect(errors, errors.join("\n")).toEqual([]);
});

test("a failed run shows the backend's message", async ({ page }) => {
  await page.route(/feature\.geographic\.texas\.gov/, (r: Route) =>
    r.fulfill({
      contentType: "application/json",
      body: JSON.stringify(PARCEL),
    }),
  );
  await page.route(API, (r: Route) =>
    r.request().method() === "POST"
      ? r.fulfill({
          status: 202,
          contentType: "application/json",
          body: JSON.stringify({ workflow_run_id: "run-bad", acres: 179.9 }),
        })
      : r.fulfill({
          contentType: "application/json",
          body: JSON.stringify({
            workflow_run_id: "run-bad",
            status: "failed",
            error: "No elevation data covers that boundary.",
          }),
        }),
  );
  await open(page);
  await page.fill("#rmAddr", "30.9345, -104.0445");
  await page.click("#rmFind button[type=submit]");
  await expect(page.locator("#rmBuild")).toBeEnabled({ timeout: 15_000 });
  await page.click("#rmBuild");
  await expect(page.locator("#rmMsg")).toHaveText(
    "No elevation data covers that boundary.",
    { timeout: 15_000 },
  );
  await expect(page.locator("#rmStudio")).toBeHidden();
});

test("printing sizes the page to the chosen sheet", async ({ page }) => {
  await open(page);
  await page.click("#rmSample");
  await expect(page.locator("#loading")).toBeHidden({ timeout: 20_000 });
  await page.evaluate(() => {
    (window as unknown as { __printed: boolean }).__printed = false;
    window.print = () => {
      (window as unknown as { __printed: boolean }).__printed = true;
    };
  });
  await page.selectOption("#paper", "tabloid");
  await page.click("#printBtn");
  expect(
    await page.evaluate(
      () => (window as unknown as { __printed: boolean }).__printed,
    ),
  ).toBe(true);
  await expect(page.locator("html")).toHaveClass(/rm-printing/);
  const rule = await page.locator("#rmPageRule").textContent();
  expect(rule).toMatch(/@page \{ size: (11in 17in|17in 11in); margin: 0; \}/);
});
