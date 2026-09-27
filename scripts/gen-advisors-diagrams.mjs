/**
 * Generates the two explanatory diagrams on /advisors/.
 *
 * They are schematics, not survey data: the plant scatter is generated from a
 * fixed seed so the output is reproducible, and nothing in them depicts a real
 * property. Re-run with `node scripts/gen-advisors-diagrams.mjs` after editing.
 *
 * Text inside the SVGs is kept short and large so it survives being scaled down
 * on a phone; the explanation lives in the page copy next to each image.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const OUT_DIR = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../public/images/advisors",
);

const INK = "#322B2B";
const MUTED = "#7A716E";
const FAINT = "#E7E1DD";
const RANGE = "#F4F1EF";
const EDGE = "#CFC6C1";
const PRIMARY = "#C52C03";
const KEEP = "#2E6B4F";
const WATER = "#8FAEC4";

// mulberry32 — small deterministic PRNG, so the scatter never shifts between runs
function rng(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Distance from point to the draw (a quadratic curve through the pasture). */
function drawDistance(x, y) {
  // Sampled points along the same curve the SVG paints, in unit space.
  let best = Infinity;
  for (let t = 0; t <= 1.0001; t += 0.02) {
    const mt = 1 - t;
    const cx = mt * mt * 0.05 + 2 * mt * t * 0.45 + t * t * 0.95;
    const cy = mt * mt * 0.28 + 2 * mt * t * 0.62 + t * t * 0.46;
    best = Math.min(best, Math.hypot(x - cx, y - cy));
  }
  return best;
}

/**
 * One pasture's worth of woody plants, in unit space, thickest in the draw and
 * thinning out on the open flat — the distribution an acreage average hides.
 */
function plants() {
  const rand = rng(20260927);
  const out = [];
  const clusters = [
    [0.22, 0.34],
    [0.52, 0.52],
    [0.8, 0.44],
    [0.36, 0.2],
    [0.68, 0.74],
  ];

  while (out.length < 320) {
    let x, y;
    const roll = rand();
    if (roll < 0.55) {
      // clumped along the draw
      const c = clusters[Math.floor(rand() * clusters.length)];
      x = c[0] + (rand() - 0.5) * 0.34;
      y = c[1] + (rand() - 0.5) * 0.26;
    } else {
      // scattered across the open country
      x = rand();
      y = rand();
    }
    if (x < 0.03 || x > 0.97 || y < 0.03 || y > 0.94) continue;

    const near = drawDistance(x, y);
    // thin the scatter out as it gets away from the draw
    if (rand() > Math.max(0.12, 1 - near * 2.1)) continue;

    const big = rand() < 0.18;
    out.push({
      x,
      y,
      r: big ? 6 + rand() * 3 : 3 + rand() * 2.4,
      // roughly a third juniper, and it favours the rockier upper ground
      juniper: rand() < (y < 0.45 ? 0.45 : 0.18),
    });
  }
  return out;
}

const PLANTS = plants();

/** Is this plant inside what you can see from the truck on the road? */
function seenFromRoad(p) {
  // Triangle: apex at the truck on the road, opening into the near third.
  const apex = [0.42, 1.06];
  const left = [-0.12, 0.55];
  const right = [1.02, 0.62];
  const sign = (a, b, c) =>
    (a[0] - c[0]) * (b[1] - c[1]) - (b[0] - c[0]) * (a[1] - c[1]);
  const pt = [p.x, p.y];
  const d1 = sign(pt, apex, left);
  const d2 = sign(pt, left, right);
  const d3 = sign(pt, right, apex);
  const neg = d1 < 0 || d2 < 0 || d3 < 0;
  const pos = d1 > 0 || d2 > 0 || d3 > 0;
  return !(neg && pos);
}

const esc = (n) => Number(n.toFixed(1));

function plantMark(p, mx, my, mw, mh, { color, faint = false, scale = 1 }) {
  const cx = esc(mx + p.x * mw);
  const cy = esc(my + p.y * mh);
  const r = esc(p.r * scale);
  if (faint) {
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${FAINT}"/>`;
  }
  return p.juniper
    ? `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="1.6"/>`
    : `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}"/>`;
}

function drawPath(mx, my, mw, mh) {
  const p = (x, y) => `${esc(mx + x * mw)} ${esc(my + y * mh)}`;
  return `<path d="M ${p(0.05, 0.28)} Q ${p(0.45, 0.62)} ${p(0.95, 0.46)}" fill="none" stroke="${WATER}" stroke-width="7" stroke-linecap="round" opacity="0.55"/>`;
}

function pastureFrame(mx, my, mw, mh) {
  return `<rect x="${mx}" y="${my}" width="${mw}" height="${mh}" rx="10" fill="${RANGE}" stroke="${EDGE}" stroke-width="1.5"/>`;
}

function road(mx, my, mw, mh) {
  const y = esc(my + mh - 20);
  return [
    `<line x1="${mx + 14}" y1="${y}" x2="${mx + mw - 14}" y2="${y}" stroke="${EDGE}" stroke-width="10" stroke-linecap="round"/>`,
    `<line x1="${mx + 14}" y1="${y}" x2="${mx + mw - 14}" y2="${y}" stroke="#FFFFFF" stroke-width="2" stroke-dasharray="10 12" stroke-linecap="round"/>`,
  ].join("");
}

function truck(cx, cy) {
  return `<g transform="translate(${cx} ${cy})">
      <rect x="-26" y="-13" width="38" height="16" rx="3" fill="${INK}"/>
      <path d="M 12 3 L 12 -9 L 22 -9 L 29 3 Z" fill="${INK}"/>
      <circle cx="-15" cy="4" r="5.5" fill="${INK}"/>
      <circle cx="19" cy="4" r="5.5" fill="${INK}"/>
    </g>`;
}

/* ------------------------------------------------------------------ */
/* Diagram 1: the windshield survey against the flown survey           */
/* ------------------------------------------------------------------ */
function windshieldVsFlown() {
  const W = 960;
  const H = 470;
  const MW = 440;
  const MH = 360;
  const MY = 62;
  const LX = 10;
  const RX = 510;

  const wedge = (mx, my) => {
    const pt = (x, y) => `${esc(mx + x * MW)},${esc(my + y * MH)}`;
    return `<polygon points="${pt(0.42, 1.06)} ${pt(-0.12, 0.55)} ${pt(1.02, 0.62)}" fill="#FFFFFF" opacity="0.75"/>`;
  };

  const left = [
    pastureFrame(LX, MY, MW, MH),
    `<g clip-path="url(#pastureL)">`,
    drawPath(LX, MY, MW, MH),
    wedge(LX, MY),
    PLANTS.map((p) =>
      plantMark(p, LX, MY, MW, MH, {
        color: INK,
        faint: !seenFromRoad(p),
      }),
    ).join(""),
    `</g>`,
    road(LX, MY, MW, MH),
    truck(LX + MW * 0.42, MY + MH - 20),
    // sits on a pill so the label stays readable over the scatter
    `<rect x="${LX + MW / 2 - 160}" y="${MY + 48}" width="320" height="40" rx="20" fill="#FFFFFF" opacity="0.92"/>`,
    `<text x="${LX + MW / 2}" y="${MY + 76}" text-anchor="middle" font-size="27" fill="${MUTED}" font-style="italic">the rest is estimated</text>`,
  ].join("");

  const right = [
    pastureFrame(RX, MY, MW, MH),
    `<g clip-path="url(#pastureR)">`,
    drawPath(RX, MY, MW, MH),
    PLANTS.map((p) => plantMark(p, RX, MY, MW, MH, { color: INK })).join(""),
    `</g>`,
    road(RX, MY, MW, MH),
  ].join("");

  const legend = `
    <g transform="translate(${RX} ${MY + MH + 34})">
      <circle cx="9" cy="-6" r="6" fill="${INK}"/>
      <text x="26" y="1" font-size="23" fill="${INK}">mesquite</text>
      <circle cx="166" cy="-6" r="6" fill="none" stroke="${INK}" stroke-width="1.8"/>
      <text x="183" y="1" font-size="23" fill="${INK}">juniper (cedar)</text>
    </g>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="wvfTitle wvfDesc" font-family="system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif">
  <title id="wvfTitle">The same pasture seen from the road and from the air</title>
  <desc id="wvfDesc">Two panels of one pasture. On the left, only the brush near the road is visible and the far side of the pasture is greyed out and estimated. On the right, every woody plant is marked individually, filled circles for mesquite and open circles for juniper, showing the brush clumped along the draw and thin on the open flat.</desc>
  <defs>
    <clipPath id="pastureL"><rect x="${LX}" y="${MY}" width="${MW}" height="${MH}" rx="10"/></clipPath>
    <clipPath id="pastureR"><rect x="${RX}" y="${MY}" width="${MW}" height="${MH}" rx="10"/></clipPath>
  </defs>
  <rect width="${W}" height="${H}" fill="#FFFFFF"/>
  <text x="${LX}" y="34" font-size="34" font-weight="600" fill="${INK}">From the fence line</text>
  <text x="${RX}" y="34" font-size="34" font-weight="600" fill="${PRIMARY}">From the air</text>
  ${left}
  ${right}
  ${legend}
</svg>
`;
}

/* ------------------------------------------------------------------ */
/* Diagram 2: what gets left alone                                     */
/* ------------------------------------------------------------------ */
function treesThatStay() {
  const W = 960;
  const H = 430;
  const MX = 10;
  const MY = 58;
  const MW = 940;
  const MH = 288;

  // A closer look at one corner of the same country: fewer, larger plants.
  const rand = rng(31415);
  const targets = PLANTS.filter((p) => p.x > 0.35 && p.y > 0.25)
    .slice(0, 96)
    .map((p) => ({
      x: (p.x - 0.35) / 0.65,
      y: (p.y - 0.25) / 0.69,
      r: p.r * 1.25,
      juniper: p.juniper,
    }))
    .filter((p) => p.x > 0.02 && p.x < 0.98 && p.y > 0.05 && p.y < 0.95);

  // A handful of big trees the owner wants kept.
  const keepers = [
    [0.17, 0.3],
    [0.35, 0.68],
    [0.58, 0.26],
    [0.74, 0.62],
    [0.89, 0.36],
  ].map(([x, y]) => ({ x, y, r: 15 + rand() * 4 }));

  // keep clear air around each protected tree so the ring reads at a glance
  const near = (p) =>
    keepers.some((k) => Math.hypot((p.x - k.x) * 3.2, p.y - k.y) < 0.14);

  const px = (x) => esc(MX + x * MW);
  const py = (y) => esc(MY + y * MH);

  const creek = `<path d="M ${px(0.02)} ${py(0.86)} Q ${px(0.3)} ${py(0.7)} ${px(0.55)} ${py(0.92)} T ${px(0.98)} ${py(0.8)}" fill="none" stroke="${WATER}" stroke-width="9" stroke-linecap="round" opacity="0.7"/>`;
  const buffer = `<path d="M ${px(0.02)} ${py(0.86)} Q ${px(0.3)} ${py(0.7)} ${px(0.55)} ${py(0.92)} T ${px(0.98)} ${py(0.8)}" fill="none" stroke="${WATER}" stroke-width="44" stroke-linecap="round" opacity="0.16" stroke-dasharray="1 0"/>`;

  const marks = targets
    .filter((p) => !near(p))
    .map((p) =>
      p.juniper
        ? `<circle cx="${px(p.x)}" cy="${py(p.y)}" r="${esc(p.r)}" fill="none" stroke="${INK}" stroke-width="1.8"/>`
        : `<circle cx="${px(p.x)}" cy="${py(p.y)}" r="${esc(p.r)}" fill="${INK}"/>`,
    )
    .join("");

  const kept = keepers
    .map(
      (k) => `<g>
        <circle cx="${px(k.x)}" cy="${py(k.y)}" r="${esc(k.r)}" fill="${KEEP}" opacity="0.85"/>
        <circle cx="${px(k.x)}" cy="${py(k.y)}" r="${esc(k.r + 9)}" fill="none" stroke="${KEEP}" stroke-width="3"/>
        <circle cx="${px(k.x)}" cy="${py(k.y)}" r="${esc(k.r + 17)}" fill="none" stroke="${KEEP}" stroke-width="1.5" stroke-dasharray="5 6"/>
      </g>`,
    )
    .join("");

  const legend = `
    <g transform="translate(${MX} ${MY + MH + 42})" font-size="23" fill="${INK}">
      <circle cx="10" cy="-7" r="7" fill="${INK}"/>
      <text x="30" y="0">to treat</text>
      <g transform="translate(180 0)">
        <circle cx="12" cy="-7" r="8" fill="${KEEP}" opacity="0.85"/>
        <circle cx="12" cy="-7" r="13" fill="none" stroke="${KEEP}" stroke-width="2.5"/>
        <text x="36" y="0">left standing</text>
      </g>
      <g transform="translate(430 0)">
        <rect x="0" y="-18" width="26" height="22" rx="4" fill="${WATER}" opacity="0.28"/>
        <line x1="4" y1="-7" x2="22" y2="-7" stroke="${WATER}" stroke-width="5" stroke-linecap="round"/>
        <text x="40" y="0">waterway, flagged for review</text>
      </g>
    </g>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="ttsTitle ttsDesc" font-family="system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif">
  <title id="ttsTitle">Protected trees marked on the same map as the targets</title>
  <desc id="ttsDesc">A close view of brush country. Most plants are marked as targets for treatment. Five larger trees are ringed and marked to be left standing, each with a clear space around it, and a waterway running through the scene is flagged for review before any treatment.</desc>
  <rect width="${W}" height="${H}" fill="#FFFFFF"/>
  <text x="${MX}" y="34" font-size="34" font-weight="600" fill="${INK}">One map, two kinds of mark</text>
  <rect x="${MX}" y="${MY}" width="${MW}" height="${MH}" rx="10" fill="${RANGE}" stroke="${EDGE}" stroke-width="1.5"/>
  <g clip-path="url(#patch)">
    ${buffer}
    ${creek}
    ${marks}
    ${kept}
  </g>
  <defs>
    <clipPath id="patch"><rect x="${MX}" y="${MY}" width="${MW}" height="${MH}" rx="10"/></clipPath>
  </defs>
  ${legend}
</svg>
`;
}

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(resolve(OUT_DIR, "windshield-vs-flown.svg"), windshieldVsFlown());
writeFileSync(resolve(OUT_DIR, "trees-that-stay.svg"), treesThatStay());
console.log("wrote 2 diagrams to", OUT_DIR);
