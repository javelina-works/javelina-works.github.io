import { test, expect, type Page, type Route } from "@playwright/test";

// The address box has three ways in: a typeahead pick, Enter / "Find it" on
// what was typed, and the Census → Nominatim chain when Mapbox can't answer.
// Every outside service is mocked so the tests pin the page's decisions, not
// a provider's index of West Texas (which is what broke for a partner).

const SUGGEST = /api\.mapbox\.com\/search\/searchbox\/v1\/suggest/;
const RETRIEVE = /api\.mapbox\.com\/search\/searchbox\/v1\/retrieve\//;
const FORWARD = /api\.mapbox\.com\/search\/searchbox\/v1\/forward/;
const PARCELS = /feature\.geographic\.texas\.gov\/.*\/identify/;
const CENSUS =
  /geocoding\.geo\.census\.gov\/geocoder\/locations\/onelineaddress/;
const NOMINATIM = /nominatim\.openstreetmap\.org\/search/;
// Every lookup is reported to the API as one log line, consent or not.
const LOOKUPS = /\/api\/ballpark(-staging)?\/lookups$/;

async function captureLookups(page: Page) {
  const reports: Record<string, unknown>[] = [];
  await page.route(LOOKUPS, (r: Route) => {
    reports.push(r.request().postDataJSON());
    r.fulfill({ status: 204, body: "" });
  });
  return reports;
}

const TX_LABEL = "03 Ranch Road, Fort Davis, Texas 79734, United States";

function feature(
  name: string,
  placeFormatted: string,
  featureType: string,
  regionCode: string,
  coordinates: [number, number],
) {
  return {
    type: "Feature",
    geometry: { type: "Point", coordinates },
    properties: {
      name,
      place_formatted: placeFormatted,
      feature_type: featureType,
      context: { region: { region_code: regionCode } },
    },
  };
}

const RANCH_ROAD_TX = feature(
  "03 Ranch Road",
  "Fort Davis, Texas 79734, United States",
  "street",
  "TX",
  [-104.043296, 30.933141],
);
const RANCH_ROAD_FL = feature(
  "03 Ranch Road",
  "Davie, Florida 33326, United States",
  "street",
  "FL",
  [-80.3, 26.07],
);
const SHOPPING_POI = feature(
  "Fort Davis Shopping Center",
  "Washington, District of Columbia 20020, United States",
  "poi",
  "DC",
  [-76.95, 38.87],
);

function suggestion(id: string, f: ReturnType<typeof feature>) {
  return { mapbox_id: id, ...f.properties };
}

function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`[pageerror] ${e.message}`));
  page.on("console", (m) => {
    // Basemap tiles can 404 at the edges of coverage; that's not our bug.
    if (
      m.type() === "error" &&
      !/arcgisonline|Failed to load resource/.test(m.text())
    ) {
      errors.push(`[console.error] ${m.text()}`);
    }
  });
  return errors;
}

async function openTool(page: Page) {
  // Keep the cookie banner out of the way; it is not what's under test.
  await page.addInitScript(() => {
    localStorage.setItem("cookie-consent", "rejected");
  });
  // No county parcel at the pin: the page falls back to the sizing circle,
  // which is enough to prove the lookup produced a point on the map.
  await page.route(PARCELS, (r) => r.fulfill({ json: { results: [] } }));
  const response = await page.goto("/tools/ballpark/");
  expect(response?.status()).toBeLessThan(400);
}

const addressBox = (page: Page) =>
  page.getByRole("textbox", { name: /ranch address/i });
// The intake panel hides once a place is found, so read the value by id.
const addressValue = (page: Page) => page.locator("#bpAddrInput");
const confirmHeading = (page: Page) =>
  page.getByRole("heading", { name: "Is this the place?" });

test("'Find it' on a typed address resolves through Mapbox and prefers Texas", async ({
  page,
}) => {
  const errors = trackErrors(page);
  await page.route(SUGGEST, (r) => r.fulfill({ json: { suggestions: [] } }));
  // Florida first, a DC point of interest last: the page must still pick
  // the Texas street.
  await page.route(FORWARD, (r) =>
    r.fulfill({
      json: { features: [RANCH_ROAD_FL, RANCH_ROAD_TX, SHOPPING_POI] },
    }),
  );
  const reports = await captureLookups(page);
  await openTool(page);

  await addressBox(page).fill("03 Ranch Road, Fort Davis");
  const forward = page.waitForRequest(FORWARD);
  await page.getByRole("button", { name: "Find it" }).click();
  const url = new URL((await forward).url());
  expect(url.searchParams.get("q")).toBe("03 Ranch Road, Fort Davis");
  expect(url.searchParams.get("country")).toBe("US");

  await expect(confirmHeading(page)).toBeVisible();
  await expect(addressValue(page)).toHaveValue(TX_LABEL);
  await expect(page.getByText(/size the circle/)).toBeVisible();
  await expect.poll(() => reports.length).toBe(1);
  expect(reports[0]).toMatchObject({
    tool: "ballpark",
    query: "03 Ranch Road, Fort Davis",
    source: "submit",
    provider: "mapbox",
    outcome: "no_parcel",
    picked: TX_LABEL,
    analytics: false,
  });
  // Florida and the DC point of interest were ranked out; only Texas was offered.
  expect(reports[0].candidates).toHaveLength(1);
  expect(errors, errors.join("\n")).toEqual([]);
});

test("Enter with the dropdown open takes the Texas suggestion, not the first one", async ({
  page,
}) => {
  const errors = trackErrors(page);
  await page.route(SUGGEST, (r) =>
    r.fulfill({
      json: {
        suggestions: [
          suggestion("fl", RANCH_ROAD_FL),
          suggestion("tx", RANCH_ROAD_TX),
        ],
      },
    }),
  );
  await page.route(RETRIEVE, (r: Route) => {
    const id = r.request().url().split("/retrieve/")[1].split("?")[0];
    r.fulfill({
      json: { features: [id === "tx" ? RANCH_ROAD_TX : RANCH_ROAD_FL] },
    });
  });
  await openTool(page);

  await addressBox(page).pressSequentially("03 Ranch Road, Fort Davis");
  await expect(page.getByRole("option").first()).toBeVisible();
  const retrieve = page.waitForRequest(RETRIEVE);
  await addressBox(page).press("Enter");
  expect((await retrieve).url()).toContain("/retrieve/tx");

  await expect(confirmHeading(page)).toBeVisible();
  await expect(addressValue(page)).toHaveValue(TX_LABEL);
  expect(errors, errors.join("\n")).toEqual([]);
});

test("offers the choices when Mapbox has several equal matches", async ({
  page,
}) => {
  const errors = trackErrors(page);
  await page.route(SUGGEST, (r) => r.fulfill({ json: { suggestions: [] } }));
  // Two streets, neither in Texas: nothing to prefer, so ask.
  await page.route(FORWARD, (r) =>
    r.fulfill({
      json: {
        features: [
          feature(
            "Rancho Drive",
            "Escondido, California 92026",
            "street",
            "CA",
            [-117.1, 33.13],
          ),
          feature(
            "Rancho Drive",
            "Escondido, California 92029",
            "street",
            "CA",
            [-117.12, 33.06],
          ),
        ],
      },
    }),
  );
  await openTool(page);

  await addressBox(page).fill("Rancho Escondido");
  await page.getByRole("button", { name: "Find it" }).click();
  await expect(page.getByText("A few matches — pick yours:")).toBeVisible();
  await expect(page.getByRole("option")).toHaveCount(2);
  await page.getByRole("option").last().click();
  await expect(confirmHeading(page)).toBeVisible();
  await expect(addressValue(page)).toHaveValue(
    "Rancho Drive, Escondido, California 92029",
  );
  expect(errors, errors.join("\n")).toEqual([]);
});

test("falls back to Census and Nominatim when Mapbox is down, and says so when neither can place it", async ({
  page,
}) => {
  const errors = trackErrors(page);
  await page.route(SUGGEST, (r) => r.fulfill({ json: { suggestions: [] } }));
  await page.route(FORWARD, (r) => r.fulfill({ status: 500, body: "" }));
  // The Census geocoder is called as JSONP: answer with the callback it named.
  await page.route(CENSUS, (r: Route) => {
    const cb = new URL(r.request().url()).searchParams.get("callback");
    r.fulfill({
      contentType: "application/javascript",
      body: `${cb}({"result":{"addressMatches":[]}})`,
    });
  });
  const nominatim = page.waitForRequest(NOMINATIM);
  await page.route(NOMINATIM, (r) => r.fulfill({ json: [] }));
  await openTool(page);

  await addressBox(page).fill("Somewhere That Isn't Anywhere");
  await page.getByRole("button", { name: "Find it" }).click();
  await nominatim;
  await expect(page.getByText(/Couldn't place that/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Find it" })).toBeEnabled();
  expect(errors, errors.join("\n")).toEqual([]);
});
