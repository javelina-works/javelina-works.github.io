// Brush-control return model behind /tools/brush-roi/. Every coefficient
// here is tied to a published source; the comments name it.

export type Brush = "mesquite" | "juniper" | "mixed";
export type Hydrology = "upland" | "karst" | "draw";
export type YearType = "low" | "normal" | "high";

export interface Site {
  id: string;
  label: string;
  // NRCS rangeland production for the reference (grassland) community,
  // lb/acre/yr air-dry, for unfavorable / normal / favorable years.
  low: number;
  normal: number;
  high: number;
  // Desert Grassland sites are grama shortgrass; Mixed Prairie carries
  // midgrasses, which mesquite suppresses much harder (REM 2013).
  grass: "short" | "mid";
  // Share of the ground cattle actually use; steep rocky hills get 60%.
  grazable: number;
  source: string;
}

// Jeff Davis County ecological sites, MLRA 42A, from NRCS Soil Data Access
// (the same rangeland production values Web Soil Survey shows), weighted by
// map-unit acreage. The last entry is the Edwards Plateau zero-canopy
// intercept from Johnson et al. 1999, for comparison with Hill Country
// juniper studies.
export const SITES: Site[] = [
  {
    id: "loamy-dg",
    label: "Loamy, Desert Grassland",
    low: 693,
    normal: 1034,
    high: 1562,
    grass: "short",
    grazable: 1,
    source: "NRCS SDA, Jeff Davis Co.",
  },
  {
    id: "clayloam-mp",
    label: "Clay Loam, Mixed Prairie",
    low: 1000,
    normal: 1800,
    high: 2200,
    grass: "mid",
    grazable: 1,
    source: "NRCS SDA, Jeff Davis Co.",
  },
  {
    id: "gravelly-mp",
    label: "Gravelly, Mixed Prairie",
    low: 900,
    normal: 1100,
    high: 1300,
    grass: "mid",
    grazable: 1,
    source: "NRCS SDA, Jeff Davis Co.",
  },
  {
    id: "gravelly-dg",
    label: "Gravelly, Desert Grassland",
    low: 300,
    normal: 530,
    high: 706,
    grass: "short",
    grazable: 1,
    source: "NRCS SDA, Jeff Davis Co.",
  },
  {
    id: "shallow-mp",
    label: "Shallow, Mixed Prairie",
    low: 600,
    normal: 914,
    high: 1200,
    grass: "mid",
    grazable: 1,
    source: "NRCS SDA, Jeff Davis Co.",
  },
  {
    id: "igneous-mp",
    label: "Igneous Hill and Mountain, Mixed Prairie",
    low: 1557,
    normal: 2048,
    high: 2334,
    grass: "mid",
    grazable: 0.6,
    source: "NRCS SDA, Jeff Davis Co.",
  },
  {
    id: "edwards",
    label: "Edwards Plateau rangeland (comparison)",
    low: 800,
    normal: 1151,
    high: 1500,
    grass: "mid",
    grazable: 1,
    source: "Johnson et al. 1999 (normal); low/high illustrative",
  },
];

// Share of site potential left under brush canopy C (percent).
// Juniper: Y = Y0 · exp(−0.000441·C²), Johnson et al. 1999 (redberry
// juniper), normalized to 1 at no canopy.
// Mesquite: linear losses of 23.2% (shortgrass) and 75.5% (midgrass) at 35%
// canopy, "Woody Cover and Grass Production in a Mesquite Savanna", Rangeland
// Ecol. Manage. 66(6), 2013; held at 10% of potential past that.
export function canopyFactor(
  brush: Brush,
  grass: "short" | "mid",
  cover: number,
): number {
  const c = clamp(cover, 0, 100);
  const juniper = Math.exp(-0.000441 * c * c);
  const k = grass === "short" ? 0.232 / 35 : 0.755 / 35;
  const mesquite = Math.max(0.1, 1 - k * c);
  if (brush === "juniper") return juniper;
  if (brush === "mesquite") return mesquite;
  return (juniper + mesquite) / 2;
}

// The Trans-Pecos high for forage gained after near-complete kill (Morton
// et al. 1990, Fort Stockton and Chihuahuan Desert sites).
export const MAX_GAIN_LB = 700;

// Years a treatment holds before regrowth erodes it. Root-killing mesquite
// herbicides 15–20 yr (Teague 2001; Medlin 2019); Ashe and one-seed juniper
// don't resprout once killed (20–30 yr, Johnson; Ueckert 2001).
export const TREATMENT_LIFE: Record<Brush, number> = {
  mesquite: 15,
  juniper: 25,
  mixed: 15,
};

// Water the brush stops using, inches/yr per canopy point removed, before
// the rainfall adjustment. ~0.4 in per 10 points of scrub cover (Bosch &
// Hewlett 1982, via TSSWCB TR-338); Saleh et al. 2009 measured 0.45–0.9
// in/yr at North Concho for mesquite. Juniper canopy also intercepts 2.4
// in/yr at 20% cover (Owens, Lyons & Alejandro 2006), so it gets a higher
// rate. Most of this stays in the soil for grass rather than running off.
export const ET_IN_PER_POINT: Record<Brush, number> = {
  mesquite: 0.04,
  juniper: 0.06,
  mixed: 0.05,
};

export const LB_PER_AUM = 790; // 1,000 lb cow at 26 lb/day (AgriLife E-128)
export const LB_PER_AUY = 9490;
export const GAL_PER_ACRE_INCH = 27154;
export const GAL_PER_ACRE_FOOT = 325851;

// FY2025 Texas EQIP Brush Management (314), individual plant treatment.
// Statewide rates; no Trans-Pecos county has a county-specific rate.
export const EQIP_IPT = [
  { maxPlants: 200, regular: 21.3, hu: 25.56 },
  { maxPlants: 400, regular: 51.61, hu: 61.93 },
];

export interface Inputs {
  acres: number;
  brush: Brush;
  coverNow: number; // percent canopy today
  coverAfter: number; // percent canopy left after treatment (what you keep)
  siteId: string;
  customY0?: number; // lb/ac override for site potential
  yearType: YearType;
  rainfall: number; // long-term average, inches
  hydrology: Hydrology;
  harvestEfficiency: number; // 0.25 = take half, leave half
  pricePerAum: number;
  spreadPerYear: number; // canopy points/yr the brush gains if left alone
  plantsPerAcre: number;
  costPerAcre?: number; // what you'd pay per acre, before cost share
  costShare: "none" | "eqip" | "eqip-hu";
  horizon: number; // years
  discountRate: number; // 0.05
}

export const DEFAULTS: Inputs = {
  acres: 640,
  brush: "mesquite",
  coverNow: 25,
  coverAfter: 5,
  siteId: "loamy-dg",
  yearType: "normal",
  rainfall: 16,
  hydrology: "upland",
  harvestEfficiency: 0.25,
  pricePerAum: 14.5,
  spreadPerYear: 1,
  plantsPerAcre: 120,
  costShare: "none",
  horizon: 20,
  discountRate: 0.0525,
};

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

export function siteById(id: string): Site {
  return SITES.find((x) => x.id === id) ?? SITES[0];
}

export function siteFor(
  i: Pick<Inputs, "siteId" | "customY0" | "yearType">,
): number {
  if (i.customY0 && i.customY0 > 0) return i.customY0;
  return siteById(i.siteId)[i.yearType];
}

export function grassAt(
  y0: number,
  brush: Brush,
  cover: number,
  grass: "short" | "mid" = "mid",
): number {
  return y0 * canopyFactor(brush, grass, cover);
}

export function acresPerAu(grass: number, he: number): number {
  return grass > 0 ? LB_PER_AUY / (grass * he) : Infinity;
}

// Response builds over the first growing seasons: 35% in year 1, 75% in
// year 2, full from year 3. Jacoby 1982 measured the Fort Stockton response
// at 32 months; the hexazinone label allows up to two years in the dry West.
export function phaseIn(year: number): number {
  return year <= 1 ? 0.35 : year === 2 ? 0.75 : 1;
}

export type StreamTier =
  "none" | "low" | "marginal" | "modelled" | "karst" | "riparian";

export interface WaterResult {
  onSiteInches: number; // per acre per year, at full effect
  onSiteGallonsPerAcre: number;
  onSiteGallonsTotal: number;
  streamTier: StreamTier;
  streamRangePerAcre: [number, number]; // gallons/acre/yr, published range
}

export function water(i: Inputs): WaterResult {
  const removed = Math.max(0, i.coverNow - i.coverAfter);
  // Drier country has less water for brush to take: scale by rainfall
  // relative to the ~20 in sites where the field rates were measured.
  const rainFactor = clamp(i.rainfall / 20, 0.4, 1.4);
  const onSiteInches = removed * ET_IN_PER_POINT[i.brush] * rainFactor;
  const perAcre = onSiteInches * GAL_PER_ACRE_INCH;

  // What reaches streams, springs or aquifers is a published range, not a
  // computed number. TSSWCB screens out sites under 18 in (Hibbert 1983);
  // Wilcox 2002: "little if any real potential" under ~20 in.
  let streamTier: StreamTier;
  let range: [number, number];
  if (i.hydrology === "draw") {
    streamTier = "riparian";
    range = [0, 0.5 * GAL_PER_ACRE_FOOT]; // Hart; McDonald 2015 (Pecos)
  } else if (i.rainfall < 18) {
    streamTier = i.hydrology === "karst" ? "low" : "none";
    range = [0, i.hydrology === "karst" ? 17300 : 5000]; // USGS 2016 Double Mtn Fork
  } else if (i.hydrology === "karst" && i.brush !== "mesquite") {
    streamTier = "karst";
    range = [GAL_PER_ACRE_INCH, 4 * GAL_PER_ACRE_INCH]; // 1–4 acre-in, Edwards
  } else if (i.rainfall < 20 && i.hydrology === "upland") {
    // Past the state's 18 in screen but under Wilcox's ~20 in floor.
    streamTier = "marginal";
    range = [0, 17300];
  } else {
    streamTier = "modelled";
    range = [17300, 89900]; // USGS 2016; TSSWCB Concho feasibility study
  }
  return {
    onSiteInches,
    onSiteGallonsPerAcre: perAcre,
    onSiteGallonsTotal: perAcre * i.acres,
    streamTier,
    streamRangePerAcre: range,
  };
}

export type FireTier = "low" | "moderate" | "high" | "very-high";

// Qualitative: woody fuel raises intensity, ember spotting and resistance
// to control (Twidwell et al. 2021, OSU E-1054; Donovan et al. 2023).
// Juniper torches and crowns; mesquite mostly carries ladder fuel.
export function fireTier(brush: Brush, cover: number): FireTier {
  const w = brush === "juniper" ? 1.4 : brush === "mixed" ? 1.2 : 1;
  const c = cover * w;
  if (c < 10) return "low";
  if (c < 25) return "moderate";
  if (c < 45) return "high";
  return "very-high";
}

// TPWD Trans-Pecos woody-cover ranges (2010 wildlife management guidelines).
export const WILDLIFE = [
  { species: "Pronghorn", min: 1, max: 10 },
  { species: "Bobwhite quail", min: 5, max: 25 },
  { species: "Scaled quail", min: 10, max: 35 },
  { species: "Mule deer", min: 15, max: 40 },
  { species: "Turkey", min: 40, max: 60 },
  { species: "White-tailed deer", min: 50, max: 75 },
];

export interface YearRow {
  year: number;
  coverUntreated: number;
  grassUntreated: number;
  grassTreated: number; // with the phase-in and fade applied
  aumGained: number; // whole property
  value: number; // undiscounted $
}

export interface Result {
  y0: number;
  grassNow: number;
  grassAfter: number;
  grassGainPerAcre: number; // at full effect vs today
  acresPerAuNow: number;
  acresPerAuAfter: number;
  auNow: number;
  auAfter: number;
  aumGainedPerYear: number; // at full effect, vs today
  grazingValuePerYear: number;
  npvPerAcre: number; // discounted grazing value over the horizon, $/ac
  npvTotal: number;
  waitCostPerAcre: number; // part of npv from brush you stop from spreading
  rows: YearRow[];
  water: WaterResult;
  fireNow: FireTier;
  fireAfter: FireTier;
  wildlifeFits: string[];
  wildlifeRanges: typeof WILDLIFE;
  eqipRatePerAcre: number | null;
  netCostPerAcre: number | null;
  paybackYear: number | null;
  wildlifeValuationAcres: number;
}

export function eqipRate(plants: number, hu: boolean): number | null {
  const tier = EQIP_IPT.find((t) => plants >= 50 && plants <= t.maxPlants);
  if (!tier) return null;
  return hu ? tier.hu : tier.regular;
}

export function run(i: Inputs): Result {
  const y0 = siteFor(i);
  const site = siteById(i.siteId);
  const g = site.grass;
  // Usable forage per pound grown: harvest efficiency on the grazable share.
  const he = i.harvestEfficiency * site.grazable;
  const after = Math.min(i.coverAfter, i.coverNow);
  const grassNow = grassAt(y0, i.brush, i.coverNow, g);
  const grassAfter = Math.min(
    grassAt(y0, i.brush, after, g),
    grassNow + MAX_GAIN_LB,
  );
  const life = TREATMENT_LIFE[i.brush];
  // Keeping as much brush as there is today means no treatment at all.
  const treating = after < i.coverNow;

  const rows: YearRow[] = [];
  let npvTotal = 0;
  let npvNoSpread = 0;
  for (let t = 1; t <= i.horizon; t++) {
    const coverUntreated = Math.min(100, i.coverNow + i.spreadPerYear * t);
    const grassUntreated = grassAt(y0, i.brush, coverUntreated, g);
    // Past its life the brush starts back from what was kept, at the same
    // spread rate as untreated country.
    const treatedCover = !treating
      ? coverUntreated
      : t <= life
        ? after
        : Math.min(100, after + i.spreadPerYear * (t - life));
    // The cap is on recovery from today's grass, not on the gap to an
    // untreated pasture that keeps declining.
    const grassTreated = Math.min(
      grassAt(y0, i.brush, treatedCover, g),
      grassNow + MAX_GAIN_LB,
    );
    const gain = Math.max(0, grassTreated - grassUntreated) * phaseIn(t);
    const gainNoSpread = !treating
      ? 0
      : Math.max(0, grassTreated - grassNow) * phaseIn(t);
    const aum = (gain * he * i.acres) / LB_PER_AUM;
    const value = aum * i.pricePerAum;
    const df = Math.pow(1 + i.discountRate, -t);
    npvTotal += value * df;
    npvNoSpread +=
      ((gainNoSpread * he * i.acres) / LB_PER_AUM) * i.pricePerAum * df;
    rows.push({
      year: t,
      coverUntreated,
      grassUntreated,
      grassTreated: grassUntreated + gain,
      aumGained: aum,
      value,
    });
  }

  const acresPerAuNow = acresPerAu(grassNow, he);
  const acresPerAuAfter = acresPerAu(grassAfter, he);
  const aumGainedPerYear =
    ((grassAfter - grassNow) * he * i.acres) / LB_PER_AUM;

  const eqip =
    i.costShare === "none"
      ? null
      : eqipRate(i.plantsPerAcre, i.costShare === "eqip-hu");
  const netCostPerAcre =
    i.costPerAcre != null && i.costPerAcre > 0
      ? Math.max(0, i.costPerAcre - (eqip ?? 0))
      : null;

  let paybackYear: number | null = null;
  if (netCostPerAcre != null) {
    let cum = 0;
    for (const r of rows) {
      cum += r.value / i.acres;
      if (cum >= netCostPerAcre) {
        paybackYear = r.year;
        break;
      }
    }
  }

  const fits = WILDLIFE.filter((w) => after >= w.min && after <= w.max).map(
    (w) => w.species,
  );

  return {
    y0,
    grassNow,
    grassAfter,
    grassGainPerAcre: grassAfter - grassNow,
    acresPerAuNow,
    acresPerAuAfter,
    auNow: i.acres / acresPerAuNow,
    auAfter: i.acres / acresPerAuAfter,
    aumGainedPerYear,
    grazingValuePerYear: aumGainedPerYear * i.pricePerAum,
    npvPerAcre: npvTotal / i.acres,
    npvTotal,
    waitCostPerAcre: (npvTotal - npvNoSpread) / i.acres,
    rows,
    water: water({ ...i, coverAfter: after }),
    fireNow: fireTier(i.brush, i.coverNow),
    fireAfter: fireTier(i.brush, after),
    wildlifeFits: fits,
    wildlifeRanges: WILDLIFE,
    eqipRatePerAcre: eqip,
    netCostPerAcre,
    paybackYear,
    // TPWD Trans-Pecos: brush management counts toward wildlife valuation
    // at 10% of the plan area or 100 acres a year, whichever is smaller.
    wildlifeValuationAcres: Math.min(100, i.acres * 0.1),
  };
}

export interface Scenario {
  id: string;
  label: string;
  blurb: string;
  inputs: Partial<Inputs>;
}

export const SCENARIOS: Scenario[] = [
  {
    id: "mesquite-flat",
    label: "Mesquite flat, Jeff Davis County",
    blurb:
      "A section of loamy desert grassland at 16 inches, mesquite at a quarter cover, thinned to 5%.",
    inputs: {
      acres: 640,
      brush: "mesquite",
      coverNow: 25,
      coverAfter: 5,
      siteId: "loamy-dg",
      rainfall: 16,
      hydrology: "upland",
      plantsPerAcre: 120,
    },
  },
  {
    id: "juniper-slope",
    label: "Juniper on an igneous slope",
    blurb:
      "Davis Mountains hill country at 19 inches, one-seed juniper at 35% cover, kept at 10% for deer cover.",
    inputs: {
      acres: 1200,
      brush: "juniper",
      coverNow: 35,
      coverAfter: 10,
      siteId: "igneous-mp",
      rainfall: 19,
      hydrology: "upland",
      plantsPerAcre: 180,
    },
  },
  {
    id: "early",
    label: "Catch it early",
    blurb:
      "Clay loam prairie where mesquite is just getting started at 10%. Little grass lost yet; the case is what it would cost to wait.",
    inputs: {
      acres: 1000,
      brush: "mesquite",
      coverNow: 10,
      coverAfter: 2,
      siteId: "clayloam-mp",
      rainfall: 16,
      hydrology: "upland",
      plantsPerAcre: 60,
    },
  },
  {
    id: "hill-country",
    label: "Hill Country cedar (comparison)",
    blurb:
      "Dense juniper on Edwards Plateau karst at 26 inches, the kind of place the water studies were done.",
    inputs: {
      acres: 500,
      brush: "juniper",
      coverNow: 40,
      coverAfter: 10,
      siteId: "edwards",
      rainfall: 26,
      hydrology: "karst",
      plantsPerAcre: 300,
    },
  },
];

// The quick-start flow asks three things (acres, brush and how thick, what
// matters most) and fills in the rest from Jeff Davis County defaults.
export type Priority = "grass" | "water" | "wildlife" | "fire" | "valuation";

// Cover to keep for each goal. Grass, water and fire want most of it gone;
// wildlife and the tax valuation want TPWD's bands kept (mule deer 15–40%,
// scaled quail 10–35%), so we leave about 20% on heavy country.
export function keepFor(priority: Priority, cover: number): number {
  if (priority === "wildlife" || priority === "valuation") {
    return Math.min(cover, Math.round(clamp(cover * 0.6, 10, 20)));
  }
  return cover <= 5 ? 1 : 5;
}

const SITE_FOR_BRUSH: Record<Brush, string> = {
  mesquite: "loamy-dg",
  juniper: "igneous-mp",
  mixed: "gravelly-mp",
};

export function quickInputs(
  acres: number,
  brush: Brush,
  cover: number,
  priority: Priority,
): Inputs {
  return {
    ...DEFAULTS,
    acres,
    brush,
    coverNow: cover,
    coverAfter: keepFor(priority, cover),
    siteId: SITE_FOR_BRUSH[brush],
    rainfall: brush === "juniper" ? 18 : 16,
  };
}
