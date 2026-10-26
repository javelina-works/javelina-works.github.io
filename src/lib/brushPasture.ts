// Client-side drawing for /tools/brush-roi/: two top-down pastures, one left
// alone and one treated, run forward 20 years by the numbers in brushRoi.ts.
// The trees and cows are illustration; every figure shown comes from run().

import type { Brush } from "@/lib/brushRoi";

export interface Tree {
  x: number; // 0..1 across the window
  y: number;
  r: number; // radius, fraction of window width
  lobes: [number, number, number][]; // mesquite crowns are clumpy
  kind: "juniper" | "mesquite";
  keep: boolean;
  seed: number;
}

export interface Stand {
  base: Tree[]; // the brush there today
  pool: Tree[]; // seedlings that arrive as it spreads, in arrival order
  meanArea: number;
  cows: { x: number; y: number; h: number }[];
  draw: [number, number][]; // a dry wash across the window
}

// Small deterministic RNG so the same choices draw the same pasture.
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeTree(R: () => number, x: number, y: number, brush: Brush): Tree {
  const kind: Tree["kind"] =
    brush === "mixed" ? (R() < 0.5 ? "juniper" : "mesquite") : brush;
  const r = kind === "juniper" ? 0.022 + R() * 0.026 : 0.02 + R() * 0.024;
  const lobes: [number, number, number][] = [];
  const n = kind === "mesquite" ? 4 + Math.floor(R() * 3) : 2;
  for (let k = 0; k < n; k++) {
    const a = R() * Math.PI * 2;
    const d = r * (kind === "mesquite" ? 0.45 : 0.18) * R();
    lobes.push([
      Math.cos(a) * d,
      Math.sin(a) * d,
      r * (kind === "mesquite" ? 0.55 + R() * 0.25 : 0.85 + R() * 0.15),
    ]);
  }
  return { x, y, r, lobes, kind, keep: false, seed: R() };
}

// Distance from a point to the wash, used to keep trees along it (TPWD's
// draw buffers) and to keep cows out of the brush.
export function distToDraw(draw: [number, number][], x: number, y: number) {
  let best = Infinity;
  for (let i = 1; i < draw.length; i++) {
    const [x1, y1] = draw[i - 1];
    const [x2, y2] = draw[i];
    const dx = x2 - x1,
      dy = y2 - y1;
    const t = Math.max(
      0,
      Math.min(1, ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy)),
    );
    best = Math.min(best, Math.hypot(x - (x1 + t * dx), y - (y1 + t * dy)));
  }
  return best;
}

export function makeStand(
  brush: Brush,
  coverNow: number,
  maxCover: number,
): Stand {
  const R = rng(
    97 +
      Math.round(coverNow) * 13 +
      (brush === "juniper" ? 1 : brush === "mixed" ? 2 : 0) * 1009,
  );
  const draw: [number, number][] = [];
  for (let i = 0; i <= 24; i++) {
    const y = i / 24;
    draw.push([
      0.32 + 0.12 * Math.sin(y * 5.2 + 0.6) + 0.05 * Math.sin(y * 13),
      y * 1.04 - 0.02,
    ]);
  }

  // Brush tends to clump and to follow the wash, so bias placement there.
  const place = (): [number, number] => {
    for (let tries = 0; tries < 6; tries++) {
      const x = R(),
        y = R();
      const d = distToDraw(draw, x, y);
      if (R() < 0.35 + 0.65 * Math.exp(-d * 7)) return [x, y];
    }
    return [R(), R()];
  };

  const sample: Tree[] = [];
  for (let i = 0; i < 400; i++) {
    const [x, y] = place();
    sample.push(makeTree(R, x, y, brush));
  }
  const meanArea =
    sample.reduce((s, t) => s + Math.PI * t.r * t.r, 0) / sample.length;
  const countFor = (c: number) => Math.max(1, Math.round(c / 100 / meanArea));
  const n0 = countFor(coverNow);
  const nMax = Math.min(sample.length, countFor(Math.max(coverNow, maxCover)));
  const base = sample.slice(0, n0);
  // Seedlings land near the parents more often than not.
  const pool = sample.slice(n0, nMax).map((t) => {
    if (R() < 0.6 && base.length) {
      const p = base[Math.floor(R() * base.length)];
      const a = R() * Math.PI * 2;
      const d = p.r * (1.4 + R() * 2.2);
      t.x = Math.min(0.99, Math.max(0.01, p.x + Math.cos(a) * d));
      t.y = Math.min(0.99, Math.max(0.01, p.y + Math.sin(a) * d));
    }
    return t;
  });

  // Spots in the open for cattle to stand, away from today's brush.
  const cows: Stand["cows"] = [];
  for (let tries = 0; tries < 2000 && cows.length < 60; tries++) {
    const x = 0.04 + R() * 0.92,
      y = 0.04 + R() * 0.92;
    if (base.some((t) => Math.hypot(t.x - x, t.y - y) < t.r + 0.025)) continue;
    if (cows.some((c) => Math.hypot(c.x - x, c.y - y) < 0.04)) continue;
    if (distToDraw(draw, x, y) < 0.025) continue;
    cows.push({ x, y, h: R() * Math.PI * 2 });
  }
  return { base, pool, meanArea, cows, draw };
}

export const countForCover = (s: Stand, c: number) =>
  Math.max(0, c / 100 / s.meanArea);

export function keptCover(s: Stand, coverNow: number) {
  const all = s.base.reduce((a, t) => a + t.r * t.r, 0);
  const kept = s.base.reduce((a, t) => a + (t.keep ? t.r * t.r : 0), 0);
  return all ? (coverNow * kept) / all : 0;
}

// Choose which trees stay to reach a target cover. "shade" keeps the
// biggest scattered trees; "draw" keeps the brush along the wash first,
// the way TPWD asks for buffers on draws.
export function autoKeep(
  s: Stand,
  coverNow: number,
  target: number,
  mode: "shade" | "draw",
) {
  s.base.forEach((t) => (t.keep = false));
  if (target <= 0) return;
  const order = [...s.base].sort((a, b) =>
    mode === "draw"
      ? distToDraw(s.draw, a.x, a.y) - distToDraw(s.draw, b.x, b.y)
      : b.r - a.r,
  );
  const picked: Tree[] = [];
  for (const t of order) {
    if (keptCover(s, coverNow) >= target - 0.25) break;
    if (
      mode === "shade" &&
      picked.some((p) => Math.hypot(p.x - t.x, p.y - t.y) < 0.18)
    )
      continue;
    t.keep = true;
    picked.push(t);
  }
  if (keptCover(s, coverNow) < target - 1) {
    for (const t of order) {
      if (keptCover(s, coverNow) >= target - 0.25) break;
      t.keep = true;
    }
  }
}

// ---- Ground textures ---------------------------------------------------------

export function groundTextures(px: number) {
  const mk = (colors: string[], base: string, seed: number, n: number) => {
    const c = document.createElement("canvas");
    c.width = c.height = px;
    const g = c.getContext("2d")!;
    g.fillStyle = base;
    g.fillRect(0, 0, px, px);
    const R = rng(seed);
    for (let i = 0; i < n; i++) {
      g.strokeStyle = colors[Math.floor(R() * colors.length)];
      g.globalAlpha = 0.35 + R() * 0.5;
      g.lineWidth = Math.max(1, px / 380);
      const x = R() * px,
        y = R() * px,
        l = (px / 90) * (0.4 + R());
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x + (R() - 0.5) * l * 0.6, y - l);
      g.stroke();
    }
    return c;
  };
  return {
    dry: mk(
      ["#b39563", "#a5855a", "#c4ab7c", "#9b8058"],
      "#cbb48a",
      11,
      px * 9,
    ),
    lush: mk(
      ["#8a9a48", "#a3ad57", "#73843b", "#b9b56a", "#c2b878"],
      "#a7a861",
      23,
      px * 14,
    ),
  };
}

// ---- Drawing -----------------------------------------------------------------

export interface Frame {
  t: number; // years since treatment, fractional
  grass: number; // 0..1 of site potential
  cover: number; // brush cover % on this side at t
  treated: boolean; // the right-hand pasture
  cows: number; // cows to draw
  lens: "cattle" | "water" | "wildlife" | "fire";
  fire: number; // 0..1 progress of the fire demo, or -1
  clock: number; // ms, for idle motion
  hover: Tree | null;
}

const JUNIPER = ["#2d4a2c", "#34532f", "#294226"];
const MESQUITE = ["#5f7136", "#6b7c3d", "#55682f"];

function crown(
  g: CanvasRenderingContext2D,
  t: Tree,
  W: number,
  scale: number,
  fill: string,
  alpha = 1,
) {
  const cx = t.x * W,
    cy = t.y * W;
  g.globalAlpha = alpha * 0.35;
  g.fillStyle = "#3b2f1f";
  for (const [dx, dy, rr] of t.lobes) {
    g.beginPath();
    g.arc(
      cx + (dx + t.r * 0.28) * W * scale,
      cy + (dy + t.r * 0.32) * W * scale,
      rr * W * scale,
      0,
      Math.PI * 2,
    );
    g.fill();
  }
  g.globalAlpha = alpha;
  g.fillStyle = fill;
  for (const [dx, dy, rr] of t.lobes) {
    g.beginPath();
    g.arc(
      cx + dx * W * scale,
      cy + dy * W * scale,
      rr * W * scale,
      0,
      Math.PI * 2,
    );
    g.fill();
  }
  // Sun from the northwest.
  g.globalAlpha = alpha * 0.18;
  g.fillStyle = "#e9f0c8";
  const [dx, dy, rr] = t.lobes[0];
  g.beginPath();
  g.arc(
    cx + (dx - t.r * 0.25) * W * scale,
    cy + (dy - t.r * 0.25) * W * scale,
    rr * W * scale * 0.45,
    0,
    Math.PI * 2,
  );
  g.fill();
  g.globalAlpha = 1;
}

function snag(g: CanvasRenderingContext2D, t: Tree, W: number, alpha: number) {
  const cx = t.x * W,
    cy = t.y * W;
  g.globalAlpha = alpha;
  g.strokeStyle = "#7a6a58";
  g.lineWidth = Math.max(1, W / 320);
  const R = rng(Math.floor(t.seed * 1e6));
  for (let k = 0; k < 7; k++) {
    const a = R() * Math.PI * 2,
      l = t.r * W * (0.5 + R() * 0.5);
    g.beginPath();
    g.moveTo(cx, cy);
    g.lineTo(cx + Math.cos(a) * l, cy + Math.sin(a) * l);
    g.stroke();
  }
  g.globalAlpha = 1;
}

function mix(a: string, b: string, k: number) {
  const p = (h: string) =>
    [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [r1, g1, b1] = p(a),
    [r2, g2, b2] = p(b);
  const m = (x: number, y: number) => Math.round(x + (y - x) * k);
  return `rgb(${m(r1, r2)},${m(g1, g2)},${m(b1, b2)})`;
}

function cow(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  h: number,
  s: number,
) {
  g.save();
  g.translate(x, y);
  g.rotate(h);
  g.fillStyle = "rgba(40,25,10,.28)";
  g.beginPath();
  g.ellipse(s * 0.18, s * 0.22, s * 0.62, s * 0.32, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#7b3a1e";
  g.beginPath();
  g.ellipse(0, 0, s * 0.6, s * 0.3, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#f3ece0";
  g.beginPath();
  g.ellipse(s * 0.66, 0, s * 0.2, s * 0.16, 0, 0, Math.PI * 2);
  g.fill();
  g.restore();
}

export interface FireParticle {
  x: number;
  y: number;
  tx: number;
  ty: number;
  born: number;
}

export function drawPasture(
  g: CanvasRenderingContext2D,
  W: number,
  s: Stand,
  tex: { dry: HTMLCanvasElement; lush: HTMLCanvasElement },
  f: Frame,
  embers: FireParticle[],
) {
  // Ground: dry soil under, grass over it in proportion to production.
  g.globalAlpha = 1;
  g.drawImage(tex.dry, 0, 0, W, W);
  g.globalAlpha = Math.max(0, Math.min(1, Math.pow(f.grass, 1.4)));
  g.drawImage(tex.lush, 0, 0, W, W);
  g.globalAlpha = 1;

  // The wash.
  g.strokeStyle = "rgba(226,206,160,.85)";
  g.lineWidth = W * 0.026;
  g.lineCap = "round";
  g.lineJoin = "round";
  g.beginPath();
  s.draw.forEach(([x, y], i) =>
    i ? g.lineTo(x * W, y * W) : g.moveTo(x * W, y * W),
  );
  g.stroke();
  g.strokeStyle = "rgba(160,135,95,.35)";
  g.lineWidth = W * 0.006;
  g.stroke();

  const visibleTrees: {
    t: Tree;
    scale: number;
    state: "live" | "dying" | "snag" | "kept";
    k: number;
  }[] = [];
  if (!f.treated) {
    for (const t of s.base)
      visibleTrees.push({ t, scale: 1, state: "live", k: 0 });
    const need = countForCover(s, f.cover) - s.base.length;
    for (let i = 0; i < s.pool.length && i < need; i++) {
      visibleTrees.push({
        t: s.pool[i],
        scale: Math.min(1, need - i),
        state: "live",
        k: 0,
      });
    }
  } else {
    for (const t of s.base) {
      if (t.keep) visibleTrees.push({ t, scale: 1, state: "kept", k: 0 });
      else if (f.t < 2.2)
        visibleTrees.push({
          t,
          scale: 1,
          state: "dying",
          k: Math.max(0, f.t - 0.15) / 2,
        });
      else if (f.t < 9)
        visibleTrees.push({ t, scale: 1, state: "snag", k: (f.t - 2.2) / 6.8 });
    }
    // Regrowth once the treatment's life runs out.
    const keptCount = s.base.filter((t) => t.keep).length;
    const need = countForCover(s, f.cover) - keptCount;
    for (let i = 0; i < s.pool.length && i < need - 0.01; i++) {
      visibleTrees.push({
        t: s.pool[i],
        scale: Math.min(1, need - i),
        state: "live",
        k: 0,
      });
    }
  }

  // Water lens: the dry halo where brush roots pull soil water.
  if (f.lens === "water") {
    for (const v of visibleTrees) {
      if (v.state === "snag") continue;
      const alive = v.state === "dying" ? 1 - v.k : 1;
      const cx = v.t.x * W,
        cy = v.t.y * W,
        rr = v.t.r * W * v.scale * 2.6;
      const grd = g.createRadialGradient(cx, cy, rr * 0.3, cx, cy, rr);
      grd.addColorStop(0, `rgba(120,80,40,${0.38 * alive})`);
      grd.addColorStop(1, "rgba(120,80,40,0)");
      g.fillStyle = grd;
      g.beginPath();
      g.arc(cx, cy, rr, 0, Math.PI * 2);
      g.fill();
    }
    g.fillStyle = `rgba(60,130,190,${0.1 + 0.16 * f.grass})`;
    g.fillRect(0, 0, W, W);
  }

  // Cattle in the open.
  if (f.lens === "cattle") {
    const n = Math.min(s.cows.length, Math.round(f.cows));
    for (let i = 0; i < n; i++) {
      const c = s.cows[i];
      const wob = Math.sin(f.clock / 1400 + i * 1.7) * 0.004;
      cow(
        g,
        (c.x + wob) * W,
        (c.y + wob * 0.6) * W,
        c.h + Math.sin(f.clock / 2600 + i) * 0.25,
        W * 0.022,
      );
    }
  }

  for (const v of visibleTrees) {
    const palette = v.t.kind === "juniper" ? JUNIPER : MESQUITE;
    const live = palette[Math.floor(v.t.seed * palette.length)];
    if (v.state === "live" || v.state === "kept")
      crown(g, v.t, W, v.scale, live);
    else if (v.state === "dying")
      crown(
        g,
        v.t,
        W,
        1,
        mix(live, "#8c7a5e", Math.min(1, v.k)),
        1 - v.k * 0.25,
      );
    else snag(g, v.t, W, 0.85 * (1 - v.k));

    // Before anything happens, show what gets treated and what stays.
    if (f.treated && f.t < 0.15 && f.fire < 0) {
      const cx = v.t.x * W,
        cy = v.t.y * W,
        rr = v.t.r * W + W * 0.008;
      g.lineWidth = Math.max(1.5, W / 260);
      if (v.state === "kept") {
        g.strokeStyle = "#f4f1e6";
        g.setLineDash([]);
        g.beginPath();
        g.arc(cx, cy, rr, 0, Math.PI * 2);
        g.stroke();
      } else if (v.state === "dying") {
        const pulse = 0.6 + 0.4 * Math.sin(f.clock / 260 + v.t.seed * 9);
        g.strokeStyle = `rgba(214,58,24,${pulse})`;
        g.beginPath();
        g.arc(cx, cy, rr, 0, Math.PI * 2);
        g.moveTo(cx - rr * 1.35, cy);
        g.lineTo(cx - rr * 0.55, cy);
        g.moveTo(cx + rr * 0.55, cy);
        g.lineTo(cx + rr * 1.35, cy);
        g.moveTo(cx, cy - rr * 1.35);
        g.lineTo(cx, cy - rr * 0.55);
        g.moveTo(cx, cy + rr * 0.55);
        g.lineTo(cx, cy + rr * 1.35);
        g.stroke();
      }
    }
    if (f.hover === v.t) {
      g.strokeStyle = "#fff";
      g.lineWidth = 2;
      g.beginPath();
      g.arc(v.t.x * W, v.t.y * W, v.t.r * W + 6, 0, Math.PI * 2);
      g.stroke();
    }
  }

  // Fire demo: a front moving east with the wind. Flames stand tall where
  // there is woody fuel; burning crowns throw embers ahead of the front.
  if (f.fire >= 0) {
    const front = f.fire * 1.25 - 0.05;
    g.fillStyle = "rgba(30,24,20,.55)";
    g.fillRect(0, 0, Math.max(0, front - 0.03) * W, W);
    for (let yy = 0; yy <= 1; yy += 0.012) {
      const wav = Math.sin(yy * 40 + f.clock / 90) * 0.006;
      const x = (front + wav) * W;
      const h = (0.01 + 0.012 * f.grass) * W;
      g.fillStyle = `rgba(255,${150 + Math.round(Math.random() * 60)},40,.85)`;
      g.beginPath();
      g.ellipse(x, yy * W, h * 0.45, h, 0, 0, Math.PI * 2);
      g.fill();
    }
    for (const v of visibleTrees) {
      const fuel =
        v.state === "snag" ? 0.45 * (1 - v.k) : v.state === "dying" ? 0.8 : 1;
      if (fuel <= 0.05) continue;
      const d = front - v.t.x;
      if (d < -0.02 || d > 0.12) continue;
      const k = 1 - Math.abs(d - 0.03) / 0.09;
      if (k <= 0) continue;
      const rr =
        v.t.r * W * (1.6 + (v.t.kind === "juniper" ? 1.6 : 0.7)) * fuel * k;
      const grd = g.createRadialGradient(
        v.t.x * W,
        v.t.y * W,
        0,
        v.t.x * W,
        v.t.y * W,
        rr,
      );
      grd.addColorStop(0, "rgba(255,240,170,.95)");
      grd.addColorStop(0.45, "rgba(255,140,30,.75)");
      grd.addColorStop(1, "rgba(200,40,10,0)");
      g.fillStyle = grd;
      g.beginPath();
      g.arc(v.t.x * W, v.t.y * W, rr, 0, Math.PI * 2);
      g.fill();
    }
    for (const e of embers) {
      const age = (f.fire - e.born) / 0.18;
      if (age < 0) continue;
      const k = Math.min(1, age);
      const x = e.x + (e.tx - e.x) * k,
        y = e.y + (e.ty - e.y) * k - Math.sin(k * Math.PI) * 0.05;
      g.fillStyle = k < 1 ? "rgba(255,200,80,.95)" : "rgba(255,120,30,.8)";
      g.beginPath();
      g.arc(
        x * W,
        y * W,
        (k < 1 ? 1.6 : 3 + 2 * Math.sin(f.clock / 120 + e.tx * 50)) * (W / 420),
        0,
        Math.PI * 2,
      );
      g.fill();
    }
  }
}

// Embers leave each crown as the front reaches it. Juniper throws more and
// farther (Donovan et al. 2023); grass alone throws almost none.
export function embersFor(
  s: Stand,
  treated: boolean,
  t: number,
): FireParticle[] {
  const R = rng(4242 + (treated ? 1 : 0));
  const out: FireParticle[] = [];
  const trees: { tree: Tree; fuel: number }[] = [];
  if (!treated) s.base.forEach((tree) => trees.push({ tree, fuel: 1 }));
  else
    s.base.forEach((tree) => {
      if (tree.keep) trees.push({ tree, fuel: 1 });
      else if (t < 2.2) trees.push({ tree, fuel: 0.8 });
      else if (t < 9) trees.push({ tree, fuel: 0.4 * (1 - (t - 2.2) / 6.8) });
    });
  for (const { tree, fuel } of trees) {
    const n = Math.round(
      (tree.kind === "juniper" ? 3 : 1) * fuel * (0.5 + R()),
    );
    for (let i = 0; i < n; i++) {
      const dist =
        (tree.kind === "juniper" ? 0.12 + R() * 0.38 : 0.05 + R() * 0.12) *
        fuel;
      out.push({
        x: tree.x,
        y: tree.y,
        tx: Math.min(1.05, tree.x + dist),
        ty: tree.y + (R() - 0.5) * 0.12,
        born: (tree.x + 0.05) / 1.25,
      });
    }
  }
  return out;
}
