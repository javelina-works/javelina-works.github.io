/**
 * Generates the two explanatory diagrams on /advisors/.
 *
 * They are schematics, not survey data: the plant scatter is generated from a
 * fixed seed so the output is reproducible, and nothing in them depicts a real
 * property. Re-run with `node scripts/gen-advisors-diagrams.mjs` after editing.
 *
 * Text inside the SVGs is kept short and large so it survives being scaled down
 * on a phone; the explanation lives in the page copy next to each image.
 *
 * "Large" is measured, not assumed. On /advisors/ the drawing sits inside
 * `.container` and then the card's `p-8`, which leaves roughly a 294px column on
 * a 390px phone. Anything in the drawing therefore renders at
 * `units * 294 / viewBoxWidth` CSS pixels, so the viewBox width is deliberately
 * small: it is the divisor that decides whether the legend is readable in a
 * truck. checkDiagram() below enforces that on the finished SVG — for labels and
 * for the marks that carry the grammar — and refuses to write anything that
 * fails, so this is a build-time guarantee rather than a note to be remembered.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const OUT_DIR = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../public/images/advisors",
);

// Design canvas. Everything is laid out in these units; the width/height
// attributes scale the finished drawing up so it still fills a desktop column.
const VIEW_W = 640;
const RENDER_SCALE = 1.5;

// The narrowest column the page gives a drawing, and the smallest CSS pixel
// size a label may land at there. FS below is derived from the pair.
const PHONE_COLUMN = 294;
const MIN_LABEL_PX = 11;
// A hollow mark needs a full pixel of stroke to read as an outline instead of a
// faded blob, and a dash needs a few pixels of "on" run to read as a dash.
const MIN_MARK_PX = 1;
const MIN_DASH_PX = 3;
// Thickening a ring only helps up to the point where it eats the hole. An open
// mark says "juniper" because you can see through the middle of it, so the hole
// gets its own floor: below about 3px the centre greys over on a phone and the
// mark reads as a filled one, which is the exact inversion a thicker stroke was
// meant to prevent.
const MIN_HOLE_PX = 3;

const FS = {
  heading: 32, // ~14.7px on a phone
  panel: 28, // ~12.9px
  legend: 24, // ~11.0px — the floor
};

const INK = "#322B2B";
const MUTED = "#7A716E";
const FAINT = "#E7E1DD";
const RANGE = "#F4F1EF";
const EDGE = "#CFC6C1";
const PRIMARY = "#C52C03";
const KEEP = "#2E6B4F";
// A protected tree is drawn as three rings: the crown, a solid ring at +RING,
// and the dashed halo at +HALO that stands for the room left around it. The
// legend swatch and the clear-space test both read these, so a mark on the map
// cannot end up meaning something the legend does not show.
const KEEPER_RING = 9;
const KEEPER_HALO = 17;
const WATER = "#8FAEC4";

// Stroke weights for the marks that carry the grammar (filled = mesquite, open
// = juniper, dashed halo = the room left around a protected tree). These are
// measured, not chosen by eye: rasterised at PHONE_COLUMN, a 1.8 stroke lands
// at 0.83px and the open ring's darkest ink reads 77/255 against a 244
// background, so an open mark looks like a *faded* dot rather than an outlined
// one. At 2.4 the ring reaches 49/255 — the same ink weight as the filled mark
// — and the hole in the middle gets wider, not narrower. The dashed halo needs
// both a thicker stroke and a longer "on" dash, or it subsamples into specks.
const SW_OPEN = 2.4;
// The smallest an open mark may be drawn, so MIN_HOLE_PX of hole survives the
// phone column. Derived from the floor rather than picked: a canopy smaller
// than this is drawn at the floor instead, which costs a little size variation
// and buys the species distinction the legend promises. Nothing on the page
// claims mark size is canopy size.
const MIN_OPEN_R = (MIN_HOLE_PX * VIEW_W) / PHONE_COLUMN / 2 + SW_OPEN / 2;
const SW_KEEPER_RING = 3;
const SW_HALO = 2.2;
const DASH_HALO = "7 6";

// The one way out of the stroke floor below, and it has to be said in the
// markup rather than assumed in a comment. Trim only: a stroke this is put on
// must be one the drawing still reads correctly without — a panel edge that is
// already separated by its fill, a stripe painted on a road that is already a
// road. Anything a caption, a legend or the alt text points at is not trim.
const DECOR = 'data-decorative="true"';

// The lower panel of windshield-vs-flown is the one drawing on the page that
// makes a claim about *arrangement* rather than about what a reader can make
// out: the brush is piled up in the draw and thin on the open flat. Every rule
// below this line asks whether a mark can be seen. None of them asks whether
// the marks are where the page says they are, so a reseeded scatter could go
// uniform while three copies of the sentence — the SVG's own <desc>, the alt
// text and the caption in src/content/pages/english/advisors.md — went on
// claiming a pattern that is no longer in the picture.
//
// So the claim gets measured, in bands of unit distance from the draw:
const CLUMP_NEAR = 0.1; // ...this close counts as "in the draw"
const CLUMP_FAR = 0.3; // ...this far out counts as "the open flat"
// ...and held to a relation between the two densities, each expressed as a
// multiple of the panel's own average. One threshold alone is not the claim:
// "piled up in the draw" and "rather than spread evenly" are two statements,
// and a scatter can satisfy either one while failing the other.
const MIN_NEAR_DENSITY = 1.8;
const MAX_FAR_DENSITY = 0.5;
// Which diagrams the rule above actually reached, asserted after the run.
const MEASURED_CLAIMS = [];

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

/**
 * What you can see from the truck: a wedge with its apex at the road, opening
 * into the near part of the pasture. One definition, used both to shade the
 * wedge and to decide which plants are visible — if these ever drift apart the
 * drawing shades one area and greys out a different one.
 */
const SIGHT_WEDGE = [
  [0.42, 1.06],
  [0.1, 0.46],
  [0.76, 0.53],
];

/** Is this plant inside what you can see from the truck on the road? */
function seenFromRoad(p) {
  const [apex, left, right] = SIGHT_WEDGE;
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
  if (faint) {
    return `<circle cx="${cx}" cy="${cy}" r="${esc(p.r * scale)}" fill="${FAINT}"/>`;
  }
  return p.juniper
    ? `<circle cx="${cx}" cy="${cy}" r="${esc(Math.max(p.r * scale, MIN_OPEN_R))}" fill="none" stroke="${color}" stroke-width="${SW_OPEN}"/>`
    : `<circle cx="${cx}" cy="${cy}" r="${esc(p.r * scale)}" fill="${color}"/>`;
}

function drawPath(mx, my, mw, mh) {
  const p = (x, y) => `${esc(mx + x * mw)} ${esc(my + y * mh)}`;
  return `<path d="M ${p(0.05, 0.28)} Q ${p(0.45, 0.62)} ${p(0.95, 0.46)}" fill="none" stroke="${WATER}" stroke-width="7" stroke-linecap="round" opacity="0.55"/>`;
}

function pastureFrame(mx, my, mw, mh) {
  return `<rect x="${mx}" y="${my}" width="${mw}" height="${mh}" rx="10" fill="${RANGE}" stroke="${EDGE}" stroke-width="1.5" ${DECOR}/>`;
}

function road(mx, my, mw, mh) {
  const y = esc(my + mh - 20);
  return [
    `<line x1="${mx + 14}" y1="${y}" x2="${mx + mw - 14}" y2="${y}" stroke="${EDGE}" stroke-width="10" stroke-linecap="round"/>`,
    `<line x1="${mx + 14}" y1="${y}" x2="${mx + mw - 14}" y2="${y}" stroke="#FFFFFF" stroke-width="2" stroke-dasharray="10 12" stroke-linecap="round" ${DECOR}/>`,
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
  // Stacked, not side by side: two half-width panels shrink to about 135px on a
  // phone, at which point the individual plant marks — the entire point of the
  // right-hand panel — turn to noise. Full width apiece is worth the height.
  const W = VIEW_W;
  const MX = 10;
  const MW = W - 2 * MX;
  const MH = 250;
  const TOP_Y = 42;
  const BOT_Y = 350;
  const H = 654;

  const wedge = (mx, my) => {
    const pt = ([x, y]) => `${esc(mx + x * MW)},${esc(my + y * MH)}`;
    return `<polygon points="${SIGHT_WEDGE.map(pt).join(" ")}" fill="#FFFFFF" opacity="0.75"/>`;
  };

  // Marks are drawn larger, and the scatter thinned, so that individual plants
  // stay individual once the drawing is scaled into a phone column. At the full
  // 320 the panel reads as one dark smear, which argues the opposite of the
  // point: that a survey resolves single plants.
  const MARK = 1.5;
  const SPARSE = PLANTS.filter((_, i) => i % 3 === 0);

  const top = [
    pastureFrame(MX, TOP_Y, MW, MH),
    `<g clip-path="url(#pastureTop)">`,
    drawPath(MX, TOP_Y, MW, MH),
    wedge(MX, TOP_Y),
    SPARSE.map((p) =>
      plantMark(p, MX, TOP_Y, MW, MH, {
        color: INK,
        faint: !seenFromRoad(p),
        scale: MARK,
      }),
    ).join(""),
    `</g>`,
    road(MX, TOP_Y, MW, MH),
    truck(MX + MW * 0.42, TOP_Y + MH - 20),
    // sits on a pill so the label stays readable over the scatter
    `<rect x="${MX + MW / 2 - 150}" y="${TOP_Y + 40}" width="300" height="42" rx="21" fill="#FFFFFF" opacity="0.92"/>`,
    `<text x="${MX + MW / 2}" y="${TOP_Y + 70}" text-anchor="middle" font-size="${FS.panel}" fill="${MUTED}" font-style="italic">the rest is estimated</text>`,
  ].join("");

  const bottom = [
    pastureFrame(MX, BOT_Y, MW, MH),
    `<g clip-path="url(#pastureBot)">`,
    drawPath(MX, BOT_Y, MW, MH),
    SPARSE.map((p) =>
      plantMark(p, MX, BOT_Y, MW, MH, { color: INK, scale: MARK }),
    ).join(""),
    `</g>`,
    road(MX, BOT_Y, MW, MH),
  ].join("");

  const legend = `
    <g transform="translate(${MX} 634)" font-size="${FS.legend}" fill="${INK}">
      <circle cx="10" cy="-7" r="8" fill="${INK}"/>
      <text x="28" y="0">mesquite</text>
      <circle cx="210" cy="-7" r="8" fill="none" stroke="${INK}" stroke-width="${SW_OPEN}"/>
      <text x="228" y="0">juniper (cedar)</text>
    </g>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${esc(W * RENDER_SCALE)}" height="${esc(H * RENDER_SCALE)}" role="img" aria-labelledby="wvfTitle wvfDesc" font-family="system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif">
  <title id="wvfTitle">The same pasture seen from the road and from the air</title>
  <desc id="wvfDesc">One pasture drawn twice, one panel above the other. In the top panel, only the brush in a wedge near the road is visible and the rest of the pasture is greyed out and labelled as estimated. In the bottom panel, every woody plant is marked individually, filled circles for mesquite and open circles for juniper, showing the brush clumped along the draw and thin on the open flat.</desc>
  <defs>
    <clipPath id="pastureTop"><rect x="${MX}" y="${TOP_Y}" width="${MW}" height="${MH}" rx="10"/></clipPath>
    <clipPath id="pastureBot"><rect x="${MX}" y="${BOT_Y}" width="${MW}" height="${MH}" rx="10"/></clipPath>
  </defs>
  <rect width="${W}" height="${H}" fill="#FFFFFF"/>
  <text x="${MX}" y="30" font-size="${FS.heading}" font-weight="600" fill="${INK}">From the fence line</text>
  <text x="${MX}" y="338" font-size="${FS.heading}" font-weight="600" fill="${PRIMARY}">From the air</text>
  ${top}
  ${bottom}
  ${legend}
</svg>
`;
}

/* ------------------------------------------------------------------ */
/* Diagram 2: what gets left alone                                     */
/* ------------------------------------------------------------------ */
function treesThatStay() {
  const W = VIEW_W;
  const H = 396;
  const MX = 10;
  const MY = 44;
  const MW = W - 2 * MX;
  const MH = 250;

  // A closer look at one corner of the same country: fewer, larger plants.
  const rand = rng(31415);
  const targets = PLANTS.filter((p) => p.x > 0.35 && p.y > 0.25)
    .slice(0, 64)
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

  const px = (x) => esc(MX + x * MW);
  const py = (y) => esc(MY + y * MH);

  // The legend promises room around a protected tree, so no target may be drawn
  // inside one. Measured in drawn pixels against the outer dashed halo, rather
  // than as a fudge factor in unit space — a unit-space radius silently stops
  // being a circle the moment the panel's aspect ratio changes.
  const HALO = (k) => k.r + KEEPER_HALO;
  const near = (p) =>
    keepers.some(
      (k) => Math.hypot((p.x - k.x) * MW, (p.y - k.y) * MH) < HALO(k) + p.r + 6,
    );

  const creek = `<path d="M ${px(0.02)} ${py(0.86)} Q ${px(0.3)} ${py(0.7)} ${px(0.55)} ${py(0.92)} T ${px(0.98)} ${py(0.8)}" fill="none" stroke="${WATER}" stroke-width="9" stroke-linecap="round" opacity="0.7"/>`;
  const buffer = `<path d="M ${px(0.02)} ${py(0.86)} Q ${px(0.3)} ${py(0.7)} ${px(0.55)} ${py(0.92)} T ${px(0.98)} ${py(0.8)}" fill="none" stroke="${WATER}" stroke-width="44" stroke-linecap="round" opacity="0.16"/>`;

  const marks = targets
    .filter((p) => !near(p))
    .map((p) =>
      p.juniper
        ? `<circle cx="${px(p.x)}" cy="${py(p.y)}" r="${esc(Math.max(p.r, MIN_OPEN_R))}" fill="none" stroke="${INK}" stroke-width="${SW_OPEN}"/>`
        : `<circle cx="${px(p.x)}" cy="${py(p.y)}" r="${esc(p.r)}" fill="${INK}"/>`,
    )
    .join("");

  const kept = keepers
    .map(
      (k) => `<g>
        <circle cx="${px(k.x)}" cy="${py(k.y)}" r="${esc(k.r)}" fill="${KEEP}" opacity="0.85"/>
        <circle cx="${px(k.x)}" cy="${py(k.y)}" r="${esc(k.r + KEEPER_RING)}" fill="none" stroke="${KEEP}" stroke-width="${SW_KEEPER_RING}"/>
        <circle cx="${px(k.x)}" cy="${py(k.y)}" r="${esc(k.r + KEEPER_HALO)}" fill="none" stroke="${KEEP}" stroke-width="${SW_HALO}" stroke-dasharray="${DASH_HALO}"/>
      </g>`,
    )
    .join("");

  // Two rows, because one row of three at a legible size does not fit the
  // phone column. The keeper swatch carries all three rings the map uses —
  // fill, solid ring and dashed halo — so no mark on the map is unexplained.
  const legend = `
    <g transform="translate(${MX} ${MY + MH + 44})" font-size="${FS.legend}" fill="${INK}">
      <circle cx="11" cy="-7" r="8" fill="${INK}"/>
      <circle cx="37" cy="-7" r="8" fill="none" stroke="${INK}" stroke-width="${SW_OPEN}"/>
      <text x="58" y="0">to treat (mesquite, juniper)</text>
      <g transform="translate(0 42)">
        <circle cx="20" cy="-7" r="8" fill="${KEEP}" opacity="0.85"/>
        <circle cx="20" cy="-7" r="13" fill="none" stroke="${KEEP}" stroke-width="${SW_KEEPER_RING}"/>
        <circle cx="20" cy="-7" r="18" fill="none" stroke="${KEEP}" stroke-width="${SW_HALO}" stroke-dasharray="${DASH_HALO}"/>
        <text x="58" y="0">left standing, with room around it</text>
      </g>
      <g transform="translate(400 42)">
        <rect x="0" y="-19" width="28" height="24" rx="4" fill="${WATER}" opacity="0.28"/>
        <line x1="4" y1="-7" x2="24" y2="-7" stroke="${WATER}" stroke-width="5" stroke-linecap="round"/>
        <text x="40" y="0">waterway</text>
      </g>
    </g>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${esc(W * RENDER_SCALE)}" height="${esc(H * RENDER_SCALE)}" role="img" aria-labelledby="ttsTitle ttsDesc" font-family="system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif">
  <title id="ttsTitle">Protected trees marked on the same map as the targets</title>
  <desc id="ttsDesc">A close view of brush country. Most plants are marked as targets for treatment, filled circles for mesquite and open circles for juniper, the same marks used in the earlier drawing. Five larger trees are ringed and marked to be left standing, each with a clear space around it, and a waterway running through the scene is flagged for review before any treatment.</desc>
  <rect width="${W}" height="${H}" fill="#FFFFFF"/>
  <text x="${MX}" y="30" font-size="${FS.heading}" font-weight="600" fill="${INK}">One map, two kinds of mark</text>
  <rect x="${MX}" y="${MY}" width="${MW}" height="${MH}" rx="10" fill="${RANGE}" stroke="${EDGE}" stroke-width="1.5" ${DECOR}/>
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

/**
 * Does the lower panel actually show the distribution the page says it shows?
 *
 * Everything here is read back out of the finished SVG — the panel rectangle
 * from its clipPath, the draw from the <path> the panel paints, the plants from
 * the circles inside it. Nothing is taken from PLANTS or from the layout
 * constants above. Measuring the model would only prove the model agrees with
 * itself; the claim is about the picture, so the picture is what gets measured,
 * and moving the draw without moving the plants has to fail.
 *
 * Returns null for a diagram that makes no such claim, and throws for one that
 * looks like it does but cannot be measured — an empty slice quietly averaging
 * to nothing is the failure mode this is written against.
 */
function measureClumping(svg) {
  const panel = svg.match(
    /<clipPath id="pastureBot"><rect x="([-\d.]+)" y="([-\d.]+)" width="([\d.]+)" height="([\d.]+)"/,
  );
  if (!panel) return null;
  const [mx, my, mw, mh] = panel.slice(1, 5).map(Number);

  const open = svg.indexOf('<g clip-path="url(#pastureBot)">');
  const close = svg.indexOf("</g>", open);
  if (open < 0 || !(close > open)) {
    throw new Error("pastureBot panel has a clipPath but no drawn region");
  }
  const region = svg.slice(open, close);

  // The draw, in the same unit space the plants get converted into.
  const curve = region.match(
    /<path d="M ([-\d.]+) ([-\d.]+) Q ([-\d.]+) ([-\d.]+) ([-\d.]+) ([-\d.]+)"/,
  );
  if (!curve) throw new Error("no draw painted in the pastureBot panel");
  const [p0, c, p1] = [
    [curve[1], curve[2]],
    [curve[3], curve[4]],
    [curve[5], curve[6]],
  ].map(([x, y]) => [(Number(x) - mx) / mw, (Number(y) - my) / mh]);
  const distance = (x, y) => {
    let best = Infinity;
    for (let t = 0; t <= 1.0001; t += 0.005) {
      const mt = 1 - t;
      const cx = mt * mt * p0[0] + 2 * mt * t * c[0] + t * t * p1[0];
      const cy = mt * mt * p0[1] + 2 * mt * t * c[1] + t * t * p1[1];
      best = Math.min(best, Math.hypot(x - cx, y - cy));
    }
    return best;
  };

  const plants = [
    ...region.matchAll(/<circle cx="([-\d.]+)" cy="([-\d.]+)"/g),
  ].map((m) => [(Number(m[1]) - mx) / mw, (Number(m[2]) - my) / mh]);
  // A region that parsed but holds no pasture is a broken measurement, not a
  // pasture with no brush in it.
  if (plants.length < 50) {
    throw new Error(
      `only ${plants.length} plants found in the pastureBot panel — the slice is wrong`,
    );
  }

  // Share of the panel each band covers, so a band is scored on plants per unit
  // area rather than on a raw count. The near band is the smaller of the two;
  // counting heads alone would flatter it.
  const N = 400;
  let nearArea = 0;
  let farArea = 0;
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      const d = distance((i + 0.5) / N, (j + 0.5) / N);
      if (d < CLUMP_NEAR) nearArea++;
      else if (d >= CLUMP_FAR) farArea++;
    }
  }
  const nearCount = plants.filter(
    ([x, y]) => distance(x, y) < CLUMP_NEAR,
  ).length;
  const farCount = plants.filter(
    ([x, y]) => distance(x, y) >= CLUMP_FAR,
  ).length;

  return {
    plants: plants.length,
    near: nearCount / (nearArea / (N * N)) / plants.length,
    far: farCount / (farArea / (N * N)) / plants.length,
  };
}

/**
 * Everything in the finished SVG that carries meaning has to survive the phone
 * column. Run against the string that actually gets written, not against the FS
 * table, so that a hand-written value somewhere in the markup cannot slip past.
 *
 * Three things are checked, because the drawings say things three ways:
 *
 *   - Labels. A <text> whose size we cannot resolve is a failure, not a skip:
 *     silently passing over the one label we can't measure is how an unreadable
 *     label ships.
 *   - Marks. Every hollow circle (`fill="none"`) is grammar in these drawings —
 *     an open plant mark, a keeper ring, a dashed halo, or the legend swatch
 *     that explains one of those. A hollow circle whose stroke lands below a
 *     pixel reads as a faded blob rather than an outline, which quietly breaks
 *     the filled-vs-open distinction the whole page leans on. The hole gets a
 *     floor of its own, because a stroke thick enough to pass the first test
 *     can close the middle of a small mark and break the same distinction from
 *     the other side. Dashes get their own floor too: an "on" run shorter than
 *     a few pixels subsamples into specks.
 *   - Every other stroke. Whether a stroke carries meaning has nothing to do
 *     with whether it was drawn as a circle: the waterway is a <path> and it
 *     has a legend entry. So every stroked element is measured, and the only
 *     way out is DECOR — written on the element, counted by tag name next to
 *     the PASS line, so an excuse has to be made in the markup where the next
 *     person editing the drawing will see it.
 *
 * The divisor is the viewBox width parsed out of this SVG, not the VIEW_W
 * constant — otherwise a diagram drawn on a different canvas would be measured
 * against the wrong column and pass too generously.
 */
function checkDiagram(name, svg) {
  const viewBox = svg.match(/viewBox="0 0 (\d+(?:\.\d+)?) /);
  if (!viewBox) {
    console.error(`${name}: no parseable viewBox, cannot measure anything`);
    return false;
  }
  const vbWidth = Number(viewBox[1]);
  const toPhonePx = (units) => (units * PHONE_COLUMN) / vbWidth;

  const problems = [];
  const rootSize = svg.match(/<svg[^>]*\sfont-size="(\d+(?:\.\d+)?)"/);
  let inherited = rootSize ? Number(rootSize[1]) : null;
  const stack = [];
  let labels = 0;
  let smallestLabel = Infinity;

  const tokens = svg.match(/<\/?(?:g|text)\b[^>]*>|<\/text>/g) || [];
  for (const tok of tokens) {
    if (tok.startsWith("</g")) {
      inherited = stack.pop() ?? null;
      continue;
    }
    const own = tok.match(/\sfont-size="(\d+(?:\.\d+)?)"/);
    if (tok.startsWith("<g")) {
      stack.push(inherited);
      if (own) inherited = Number(own[1]);
      continue;
    }
    if (tok.startsWith("<text")) {
      labels++;
      const size = own ? Number(own[1]) : inherited;
      if (size == null) {
        problems.push(`a <text> with no resolvable font-size: ${tok}`);
        continue;
      }
      const px = toPhonePx(size);
      if (px < smallestLabel) smallestLabel = px;
      if (px < MIN_LABEL_PX) {
        problems.push(
          `font-size ${size} renders at ${px.toFixed(1)}px on a ${PHONE_COLUMN}px column (floor ${MIN_LABEL_PX}px)`,
        );
      }
    }
  }

  let marks = 0;
  let thinnestMark = Infinity;
  let shortestDash = Infinity;
  let smallestHole = Infinity;
  for (const tok of svg.match(/<circle\b[^>]*>/g) || []) {
    if (!/\sfill="none"/.test(tok)) continue;
    marks++;
    const sw = tok.match(/\sstroke-width="(\d+(?:\.\d+)?)"/);
    if (!sw) {
      problems.push(`a hollow <circle> with no stroke-width: ${tok}`);
      continue;
    }
    const px = toPhonePx(Number(sw[1]));
    if (px < thinnestMark) thinnestMark = px;
    if (px < MIN_MARK_PX) {
      problems.push(
        `hollow circle stroke ${sw[1]} renders at ${px.toFixed(2)}px on a ${PHONE_COLUMN}px column (floor ${MIN_MARK_PX}px)`,
      );
    }
    // A ring thick enough to see is not the same as a ring you can see
    // *through*. Measure the hole the stroke leaves, or a fat stroke on a
    // small mark passes the check above while rendering as a filled dot.
    const rAttr = tok.match(/\sr="(\d+(?:\.\d+)?)"/);
    if (!rAttr) {
      problems.push(`a hollow <circle> with no radius: ${tok}`);
      continue;
    }
    const holePx = toPhonePx(
      Math.max(0, Number(rAttr[1]) - Number(sw[1]) / 2) * 2,
    );
    if (holePx < smallestHole) smallestHole = holePx;
    if (holePx < MIN_HOLE_PX) {
      problems.push(
        `hollow circle r=${rAttr[1]} stroke ${sw[1]} leaves a ${holePx.toFixed(2)}px hole on a ${PHONE_COLUMN}px column (floor ${MIN_HOLE_PX}px) — reads as filled`,
      );
    }
    const dash = tok.match(/\sstroke-dasharray="(\d+(?:\.\d+)?)[ ,]/);
    if (dash) {
      const onPx = toPhonePx(Number(dash[1]));
      if (onPx < shortestDash) shortestDash = onPx;
      if (onPx < MIN_DASH_PX) {
        problems.push(
          `dash run ${dash[1]} renders at ${onPx.toFixed(2)}px on a ${PHONE_COLUMN}px column (floor ${MIN_DASH_PX}px)`,
        );
      }
    }
  }

  // Everything else that is drawn as a stroke. This used to be waved through
  // with a sentence calling it decoration, and the sentence was wrong: the
  // waterway on trees-that-stay is a stroked <path> with its own legend entry,
  // and it was never measured. Grammar is not a property of the tag name, so
  // measure every stroke and make the exception something the markup has to
  // declare — see DECOR above.
  let strokes = 0;
  let thinnestStroke = Infinity;
  const excused = [];
  for (const tok of svg.match(
    /<(?:line|path|rect|polygon|polyline)\b[^>]*>/g,
  ) || []) {
    if (!/\sstroke="(?!none")/.test(tok)) continue;
    const what = tok.match(/^<([a-z]+)/)[1];
    if (tok.includes(DECOR)) {
      excused.push(what);
      continue;
    }
    strokes++;
    const sw = tok.match(/\sstroke-width="(\d+(?:\.\d+)?)"/);
    if (!sw) {
      problems.push(`a stroked <${what}> with no stroke-width: ${tok}`);
      continue;
    }
    const px = toPhonePx(Number(sw[1]));
    if (px < thinnestStroke) thinnestStroke = px;
    if (px < MIN_MARK_PX) {
      problems.push(
        `<${what}> stroke ${sw[1]} renders at ${px.toFixed(2)}px on a ${PHONE_COLUMN}px column (floor ${MIN_MARK_PX}px)`,
      );
    }
    const dash = tok.match(
      /\sstroke-dasharray="(\d+(?:\.\d+)?)[ ,]+(\d+(?:\.\d+)?)/,
    );
    // A zero gap is a solid line wearing a dash attribute; measuring its "on"
    // run would fail a line that has no dashes in it.
    if (dash && Number(dash[2]) > 0) {
      const onPx = toPhonePx(Number(dash[1]));
      if (onPx < shortestDash) shortestDash = onPx;
      if (onPx < MIN_DASH_PX) {
        problems.push(
          `<${what}> dash run ${dash[1]} renders at ${onPx.toFixed(2)}px on a ${PHONE_COLUMN}px column (floor ${MIN_DASH_PX}px)`,
        );
      }
    }
  }

  // Does the picture show what it says it shows?
  let clump = null;
  try {
    clump = measureClumping(svg);
  } catch (err) {
    problems.push(`distribution not measurable: ${err.message}`);
  }
  if (clump) {
    MEASURED_CLAIMS.push(name);
    // The drawing's own description is the copy nearest the geometry, so it is
    // the copy held to it. If the scatter is ever deliberately made even, this
    // fails until the sentence is rewritten too.
    const desc = svg.match(/<desc[^>]*>([\s\S]*?)<\/desc>/);
    if (!desc) {
      problems.push("a panel claims a distribution but the SVG has no <desc>");
    } else if (!/clumped along the draw/.test(desc[1])) {
      problems.push(
        "the <desc> no longer says the brush is clumped along the draw, but the geometry is still being held to it",
      );
    }
    if (clump.near < MIN_NEAR_DENSITY) {
      problems.push(
        `brush in the draw runs ${clump.near.toFixed(2)}x the panel average (floor ${MIN_NEAR_DENSITY}x) — the drawing does not show the pile-up its caption, alt text and <desc> all claim`,
      );
    }
    if (clump.far > MAX_FAR_DENSITY) {
      problems.push(
        `brush on the open flat runs ${clump.far.toFixed(2)}x the panel average (ceiling ${MAX_FAR_DENSITY}x) — the scatter reads as spread evenly, which is the thing the panel is drawn to argue against`,
      );
    }
  }

  if (problems.length) {
    console.error(
      `${name}: ${problems.length} problem(s) at ${PHONE_COLUMN}px`,
    );
    for (const p of problems) console.error(`  - ${p}`);
    return false;
  }

  // Report what was actually measured, not what the constants say it should be.
  console.log(
    `${name}: viewBox ${vbWidth} wide; ${labels} labels (smallest ` +
      `${smallestLabel.toFixed(1)}px, floor ${MIN_LABEL_PX}px), ${marks} hollow marks ` +
      `(thinnest stroke ${thinnestMark.toFixed(2)}px, floor ${MIN_MARK_PX}px` +
      (smallestHole === Infinity
        ? ""
        : `; smallest hole ${smallestHole.toFixed(2)}px, floor ${MIN_HOLE_PX}px`) +
      (shortestDash === Infinity
        ? ""
        : `; shortest dash ${shortestDash.toFixed(2)}px, floor ${MIN_DASH_PX}px`) +
      `), ${strokes} other stroked element(s) (thinnest ` +
      `${thinnestStroke === Infinity ? "n/a" : thinnestStroke.toFixed(2) + "px"}) ` +
      `on a ${PHONE_COLUMN}px column; ` +
      (excused.length
        ? `excused as trim: ${excused.sort().join(", ")}`
        : "nothing excused") +
      // Printed as the measured numbers, not as the word "ok", so the margin
      // above the floors is visible on a passing run.
      (clump
        ? `; ${clump.plants} plants in the lower panel, ${clump.near.toFixed(2)}x the panel average within ${CLUMP_NEAR} of the draw (floor ${MIN_NEAR_DENSITY}x) and ${clump.far.toFixed(2)}x beyond ${CLUMP_FAR} (ceiling ${MAX_FAR_DENSITY}x)`
        : "; no distribution claimed"),
  );
  return true;
}

const diagrams = [
  ["windshield-vs-flown.svg", windshieldVsFlown()],
  ["trees-that-stay.svg", treesThatStay()],
];

// Check every diagram before writing any of them, so a failure leaves the
// committed SVGs alone instead of replacing them with unreadable ones.
const ok = diagrams
  .map(([file, svg]) => checkDiagram(file, svg))
  .every(Boolean);

// A rule that matches nothing passes everything. The distribution rule keys off
// markup it has to find, so say out loud how many diagrams it actually reached
// — one — rather than trusting that it did.
if (MEASURED_CLAIMS.length !== 1) {
  console.error(
    `the distribution rule measured ${MEASURED_CLAIMS.length} diagram(s) (${MEASURED_CLAIMS.join(", ") || "none"}), expected exactly 1 — it is keyed off markup that has moved`,
  );
  process.exit(1);
}

if (!ok) {
  console.error("no diagrams written");
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });
for (const [file, svg] of diagrams) {
  writeFileSync(resolve(OUT_DIR, file), svg);
}
console.log(`wrote ${diagrams.length} diagrams to`, OUT_DIR);
