// Ranch Map engine: renders a map bundle from the tasks-ranchmap backend.
// Ported from the Ranch Map Studio prototype (artifact, 2026-10-05).
let DATA = null;
// grid size and cell size come from each ranch's data (set in load)
let W = 600,
  H = 450,
  CELL = 3;
const DX = [1, 1, 0, -1, -1, -1, 0, 1],
  DY = [0, 1, 1, 1, 0, -1, -1, -1];
const DD = [1, Math.SQRT2, 1, Math.SQRT2, 1, Math.SQRT2, 1, Math.SQRT2];

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const smooth = (a, b, x) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
const lerp = (a, b, t) => a + (b - a) * t;

function PQ(cap) {
  let ids = new Int32Array(cap),
    pr = new Float64Array(cap),
    n = 0;
  return {
    get size() {
      return n;
    },
    push(id, p) {
      if (n >= ids.length) {
        const a = new Int32Array(ids.length * 2),
          b = new Float64Array(ids.length * 2);
        a.set(ids);
        b.set(pr);
        ids = a;
        pr = b;
      }
      let j = n++;
      while (j > 0) {
        const q = (j - 1) >> 1;
        if (pr[q] <= p) break;
        ids[j] = ids[q];
        pr[j] = pr[q];
        j = q;
      }
      ids[j] = id;
      pr[j] = p;
    },
    pop() {
      const top = ids[0];
      n--;
      if (n > 0) {
        const id = ids[n],
          p = pr[n];
        let j = 0;
        for (;;) {
          let l = 2 * j + 1;
          if (l >= n) break;
          const r = l + 1;
          if (r < n && pr[r] < pr[l]) l = r;
          if (pr[l] >= p) break;
          ids[j] = ids[l];
          pr[j] = pr[l];
          j = l;
        }
        ids[j] = id;
        pr[j] = p;
      }
      return top;
    },
  };
}

function blur(src, w, h, r, passes) {
  let a = Float32Array.from(src),
    b = new Float32Array(a.length);
  for (let p = 0; p < passes; p++) {
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        let s = 0,
          c = 0;
        for (let k = -r; k <= r; k++) {
          const xx = x + k;
          if (xx >= 0 && xx < w) {
            s += a[y * w + xx];
            c++;
          }
        }
        b[y * w + x] = s / c;
      }
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        let s = 0,
          c = 0;
        for (let k = -r; k <= r; k++) {
          const yy = y + k;
          if (yy >= 0 && yy < h) {
            s += b[yy * w + x];
            c++;
          }
        }
        a[y * w + x] = s / c;
      }
  }
  return a;
}

function flowRoute(h) {
  const N = W * H,
    f = Float64Array.from(h),
    done = new Uint8Array(N),
    order = new Int32Array(N),
    pq = PQ(N);
  for (let x = 0; x < W; x++)
    for (const y of [0, H - 1]) {
      const i = y * W + x;
      if (!done[i]) {
        done[i] = 1;
        pq.push(i, f[i]);
      }
    }
  for (let y = 1; y < H - 1; y++)
    for (const x of [0, W - 1]) {
      const i = y * W + x;
      done[i] = 1;
      pq.push(i, f[i]);
    }
  const fp = new Int32Array(N).fill(-1);
  let k = 0;
  while (pq.size) {
    const c = pq.pop();
    order[k++] = c;
    const cx = c % W,
      cy = (c / W) | 0;
    for (let d = 0; d < 8; d++) {
      const nx = cx + DX[d],
        ny = cy + DY[d];
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const n = ny * W + nx;
      if (done[n]) continue;
      done[n] = 1;
      if (f[n] <= f[c]) {
        f[n] = f[c] + 1e-4;
        fp[n] = c;
      }
      pq.push(n, f[n]);
    }
  }
  const rec = new Int32Array(N).fill(-1);
  for (let c = 0; c < N; c++) {
    const cx = c % W,
      cy = (c / W) | 0;
    if (cx === 0 || cy === 0 || cx === W - 1 || cy === H - 1) continue;
    if (fp[c] >= 0) {
      rec[c] = fp[c];
      continue;
    }
    let best = -1,
      bs = 0;
    for (let d = 0; d < 8; d++) {
      const n = (cy + DY[d]) * W + cx + DX[d];
      const s = (f[c] - f[n]) / DD[d];
      if (s > bs) {
        bs = s;
        best = n;
      }
    }
    rec[c] = best;
  }
  const acc = new Float32Array(N).fill(1);
  for (let i = N - 1; i >= 0; i--) {
    const c = order[i],
      r = rec[c];
    if (r >= 0) acc[r] += acc[c];
  }
  return { f, rec, acc, order };
}

// Marching squares over a (gw x gh) corner grid; pad closes shapes at the border. Returns joined polylines in cell units.
function isoLines(field, gw, gh, level, offX, offY, pad) {
  const P = pad == null ? 0 : 1,
    GW = gw + 2 * P,
    GH = gh + 2 * P;
  const val = (i, j) => {
    i -= P;
    j -= P;
    if (i < 0 || j < 0 || i >= gw || j >= gh) return pad;
    return field[j * gw + i];
  };
  const pts = new Map(),
    ka = [],
    kb = [];
  const ept = (key, x0, y0, v0, x1, y1, v1) => {
    if (!pts.has(key)) {
      const t = (level - v0) / (v1 - v0);
      pts.set(key, [
        x0 + (x1 - x0) * t - P + offX + 0.5,
        y0 + (y1 - y0) * t - P + offY + 0.5,
      ]);
    }
    return key;
  };
  for (let j = 0; j < GH - 1; j++)
    for (let i = 0; i < GW - 1; i++) {
      const a = val(i, j),
        b = val(i + 1, j),
        c = val(i + 1, j + 1),
        d = val(i, j + 1);
      const cs =
        (a > level ? 1 : 0) |
        (b > level ? 2 : 0) |
        (c > level ? 4 : 0) |
        (d > level ? 8 : 0);
      if (cs === 0 || cs === 15) continue;
      const E = [
        () => ept((j * GW + i) * 2, i, j, a, i + 1, j, b),
        () => ept((j * GW + i + 1) * 2 + 1, i + 1, j, b, i + 1, j + 1, c),
        () => ept(((j + 1) * GW + i) * 2, i, j + 1, d, i + 1, j + 1, c),
        () => ept((j * GW + i) * 2 + 1, i, j, a, i, j + 1, d),
      ];
      const T = MS[cs];
      for (let s = 0; s < T.length; s += 2) {
        ka.push(E[T[s]]());
        kb.push(E[T[s + 1]]());
      }
    }
  const adj = new Map(),
    n = ka.length;
  const add = (k, s) => {
    const a = adj.get(k);
    if (a) a.push(s);
    else adj.set(k, [s]);
  };
  for (let s = 0; s < n; s++) {
    add(ka[s], s);
    add(kb[s], s);
  }
  const used = new Uint8Array(n),
    lines = [];
  const walk = (k, out) => {
    for (;;) {
      const a = adj.get(k);
      let nx = -1;
      for (const s of a)
        if (!used[s]) {
          nx = s;
          break;
        }
      if (nx < 0) return;
      used[nx] = 1;
      k = ka[nx] === k ? kb[nx] : ka[nx];
      out.push(k);
    }
  };
  for (let s0 = 0; s0 < n; s0++) {
    if (used[s0]) continue;
    used[s0] = 1;
    const fwd = [ka[s0], kb[s0]];
    walk(kb[s0], fwd);
    const back = [];
    walk(ka[s0], back);
    const chain = back.reverse().concat(fwd);
    lines.push({
      pts: chain.map((k) => pts.get(k)),
      closed: chain[0] === chain[chain.length - 1],
    });
  }
  return lines;
}
const MS = [
  [],
  [3, 0],
  [0, 1],
  [3, 1],
  [1, 2],
  [3, 0, 1, 2],
  [0, 2],
  [3, 2],
  [2, 3],
  [0, 2],
  [0, 1, 2, 3],
  [1, 2],
  [1, 3],
  [0, 1],
  [3, 0],
  [],
];

function chaikin(pts, it) {
  for (let k = 0; k < it; k++) {
    if (pts.length < 3) return pts;
    const o = [pts[0]];
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, y0] = pts[i],
        [x1, y1] = pts[i + 1];
      o.push(
        [x0 * 0.75 + x1 * 0.25, y0 * 0.75 + y1 * 0.25],
        [x0 * 0.25 + x1 * 0.75, y0 * 0.25 + y1 * 0.75],
      );
    }
    o.push(pts[pts.length - 1]);
    pts = o;
  }
  return pts;
}
function movAvg(pts) {
  if (pts.length < 4) return pts;
  const o = [pts[0]];
  for (let i = 1; i < pts.length - 1; i++)
    o.push([
      (pts[i - 1][0] + pts[i][0] * 2 + pts[i + 1][0]) / 4,
      (pts[i - 1][1] + pts[i][1] * 2 + pts[i + 1][1]) / 4,
    ]);
  o.push(pts[pts.length - 1]);
  return o;
}
const cxy = (c) => [(c % W) + 0.5, ((c / W) | 0) + 0.5];

function buildWorld() {
  const N = W * H,
    raw = atob(DATA.dem),
    h = new Float32Array(N),
    R = mulberry32(17);
  for (let i = 0; i < N; i++)
    h[i] =
      DATA.demMin +
      (raw.charCodeAt(2 * i) | (raw.charCodeAt(2 * i + 1) << 8)) /
        (DATA.demScale || 100);
  const hr = Float32Array.from(h);
  for (let i = 0; i < N; i++) hr[i] += (R() - 0.5) * 0.01;
  const { rec, acc, order } = flowRoute(hr);
  const hc = blur(h, W, H, 1, 2);
  const slope = new Float32Array(W * H);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const xl = Math.max(0, x - 1),
        xr = Math.min(W - 1, x + 1),
        yu = Math.max(0, y - 1),
        yd = Math.min(H - 1, y + 1);
      slope[y * W + x] = Math.hypot(
        (h[y * W + xr] - h[y * W + xl]) / ((xr - xl) * CELL),
        (h[yd * W + x] - h[yu * W + x]) / ((yd - yu) * CELL),
      );
    }
  // steepest raw slope in each 5x5 neighborhood, so contour thinning catches cliff faces the smoothed surface softens
  const sMax = new Float32Array(W * H);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      let m = 0;
      for (let dy = -2; dy <= 2; dy++)
        for (let dx = -2; dx <= 2; dx++) {
          const yy = y + dy,
            xx = x + dx;
          if (yy >= 0 && yy < H && xx >= 0 && xx < W && slope[yy * W + xx] > m)
            m = slope[yy * W + xx];
        }
      sMax[y * W + x] = m;
    }
  slope.set(sMax);
  let hmin = Infinity,
    hmax = -Infinity;
  for (const z of h) {
    if (z < hmin) hmin = z;
    if (z > hmax) hmax = z;
  }
  const bs = atob(DATA.brush),
    brush = new Float32Array(N);
  for (let i = 0; i < N; i++) brush[i] = bs.charCodeAt(i) / 255;
  const brushSoft = blur(brush, W, H, 2, 1);
  const canopy = [];
  const inP = new Uint8Array(N);
  let rings;
  if (DATA.mask) {
    const ms = atob(DATA.mask),
      mf = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      mf[i] = ms.charCodeAt(i) / 255;
      inP[i] = mf[i] >= 0.5 ? 1 : 0;
    }
    rings = isoLines(mf, W, H, 0.5, 0, 0, 0)
      .filter((l) => l.closed && l.pts.length > 12)
      .map((l) => chaikin(l.pts, 1));
  } else {
    // even-odd scanline fill, so multi-parcel ranches with holes work
    rings = DATA.boundary
      ? DATA.boundary.concat(DATA.holes || [])
      : [DATA.parcel];
    for (let y = 0; y < H; y++) {
      const yc = y + 0.5,
        xs = [];
      for (const r of rings)
        for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
          const [x1, y1] = r[j],
            [x2, y2] = r[i];
          if (y1 > yc !== y2 > yc)
            xs.push(x1 + ((yc - y1) * (x2 - x1)) / (y2 - y1));
        }
      xs.sort((a, b) => a - b);
      for (let k = 0; k + 1 < xs.length; k += 2)
        for (
          let x = Math.max(0, Math.ceil(xs[k] - 0.5));
          x < Math.min(W, Math.floor(xs[k + 1] - 0.5) + 1);
          x++
        )
          inP[y * W + x] = 1;
    }
  }
  let inCount = 0;
  for (let i = 0; i < N; i++) inCount += inP[i];
  let pk = -1;
  for (let i = 0; i < N; i++) if (inP[i] && (pk < 0 || h[i] > h[pk])) pk = i;

  // watersheds by outlet
  const lab = new Int32Array(N).fill(-1);
  let nl = 0;
  const outlet = [];
  for (let k = 0; k < N; k++) {
    const c = order[k];
    if (rec[c] < 0) {
      lab[c] = nl++;
      outlet.push(c);
    } else lab[c] = lab[rec[c]];
  }
  const area = new Map();
  let pc = 0;
  for (let i = 0; i < N; i++)
    if (inP[i]) {
      pc++;
      area.set(lab[i], (area.get(lab[i]) || 0) + 1);
    }
  const top = [...area.entries()]
    .filter(([, a]) => a > pc * 0.035)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const sheds = top.map(([l, a]) => {
    const ind = new Float32Array(N);
    let sx = 0,
      sy = 0,
      tot = 0;
    for (let i = 0; i < N; i++)
      if (lab[i] === l) {
        ind[i] = 1;
        tot++;
        if (inP[i]) {
          sx += i % W;
          sy += (i / W) | 0;
        }
      }
    const b = blur(ind, W, H, 2, 2),
      o = outlet[l],
      ox = o % W,
      oy = (o / W) | 0;
    const dir =
      oy >= H - 1 ? "south" : oy <= 0 ? "north" : ox >= W - 1 ? "east" : "west";
    return {
      lines: isoLines(b, W, H, 0.5, 0, 0, 0),
      acres: (a * CELL * CELL) / 4046.86,
      at: [sx / a, sy / a],
      dir,
    };
  });
  const all = rings.flat(),
    xs = all.map((p) => p[0]),
    ys = all.map((p) => p[1]),
    x0 = Math.min(...xs),
    x1 = Math.max(...xs),
    y0 = Math.min(...ys),
    y1 = Math.max(...ys);
  const q = (fx, fy) => [lerp(x0, x1, fx), lerp(y0, y1, fy)];
  return {
    h,
    hc,
    slope,
    hmin,
    hmax,
    rec,
    acc,
    inP,
    brush,
    brushSoft,
    canopy,
    rings,
    canopyBits: DATA.canopyMask
      ? Uint8Array.from(atob(DATA.canopyMask), (c) => c.charCodeAt(0))
      : null,
    canopySize: DATA.canopyMaskSize || [W, H],
    bigTrees: (() => {
      const t = DATA.bigTrees || [],
        o = [],
        rmin = Math.sqrt(40 / Math.PI) / CELL;
      for (let i = 0; i < t.length; i += 3)
        if (t[i + 2] >= rmin) o.push([t[i], t[i + 1], t[i + 2]]);
      return o;
    })(),
    parcelAcres: (inCount * CELL * CELL) / 4046.86,
    peak: cxy(pk),
    peakFt: h[pk] * 3.28084,
    sheds,
    ponds: DATA.ponds.map((p) => chaikin(p, 1)),
    roads: DATA.roads.map((r) => ({ name: r.name, pts: chaikin(r.pts, 2) })),
    trails: DATA.trails.map((p) => chaikin(p, 2)),
    fences: DATA.fences,
    walls: DATA.walls,
    trees: DATA.trees,
    marks: DATA.marks,
    buildings: DATA.buildings,
    cliffs: DATA.cliffs,
    propLines: DATA.propLines || [],
    pastures: (DATA.pastures || []).map((name, k) => ({
      name,
      at: q([0.26, 0.74, 0.26, 0.74][k], [0.2, 0.2, 0.8, 0.8][k]),
    })),
  };
}

function streams(world, thr) {
  const { rec, acc } = world,
    N = W * H;
  const isC = new Uint8Array(N),
    cnt = new Uint8Array(N);
  for (let i = 0; i < N; i++) if (acc[i] >= thr) isC[i] = 1;
  for (let i = 0; i < N; i++)
    if (isC[i] && rec[i] >= 0 && isC[rec[i]]) cnt[rec[i]]++;
  const vis = new Uint8Array(N),
    out = [];
  const cls = (a) =>
    a < thr * 4 ? 0 : a < thr * 16 ? 1 : a < thr * 64 ? 2 : 3;
  for (let s = 0; s < N; s++) {
    if (!isC[s] || cnt[s]) continue;
    const path = [s];
    vis[s] = 1;
    let c = s;
    for (;;) {
      const r = rec[c];
      if (r < 0) break;
      path.push(r);
      if (vis[r]) break;
      vis[r] = 1;
      c = r;
    }
    let start = 0;
    for (let k = 1; k <= path.length; k++) {
      if (k === path.length || cls(acc[path[k]]) !== cls(acc[path[start]])) {
        const seg = path.slice(start, Math.min(k + 1, path.length));
        if (seg.length > 1)
          out.push({
            cls: cls(acc[path[start]]),
            acc: acc[path[start]],
            pts: chaikin(movAvg(movAvg(seg.map(cxy))), 2),
          });
        start = k;
      }
    }
  }
  return out;
}

// ------------------------------------------------------------------ rendering
const LOGO = "/images/tools/ranch-map-mark.png";
document
  .getElementById("rmStudio")
  .style.setProperty("--logo", `url("${LOGO}")`);

let M = 44,
  S0,
  FW,
  FH,
  CW,
  CH,
  PR = 1;
function setGeom() {
  S0 = 1600 / W;
  FW = W * S0;
  FH = H * S0;
  CW = FW + 2 * M;
  CH = FH + 2 * M;
  canvas.width = CW;
  canvas.height = CH;
}
// view: zoom factor and the map cell at the frame's top-left; S is pixels per cell at the current zoom
const view = { z: 1, x0: 0, y0: 0 };
let S = S0;
const X = (x) => M + (x - view.x0) * S,
  Y = (y) => M + (y - view.y0) * S;

const STYLES = {
  survey: {
    paper: [238, 229, 203],
    ink: "#2a2119",
    reliefK: 0.42,
    ramp: [
      [0, [222, 226, 196]],
      [0.5, [240, 228, 196]],
      [1, [232, 206, 168]],
    ],
    tintK: 0.7,
    wood: [196, 214, 152],
    woodK: 0.9,
    canopy: null,
    contour: "#a8642c",
    cW: 0.9,
    iW: 2.1,
    cLabel: "#8a4f20",
    water: "#3c78b0",
    pond: "#a9cbe2",
    wLabel: "#2d679e",
    creekW: [1.2, 1.8, 2.6, 3.6],
    creekDash: [[7, 3, 1.5, 3], [9, 3, 1.5, 3], null, null],
    road: ["#1f1a15", "#d8452b", 8, 5],
    ranch: ["#1f1a15", null, 6, 3.4, [12, 5]],
    trail: "#1f1a15",
    trailW: 2.6,
    fence: "#1f1a15",
    fenceDash: [8, 4],
    bound: "rgba(170,60,40,.28)",
    shedC: ["#8a5a9e", "#4f8a6b", "#b07a2a", "#3f6fa0", "#a04848", "#6b7f2a"],
    shedA: 0.16,
    label: '"Old Standard TT", Georgia, serif',
    pasture: "rgba(42,33,25,.72)",
    fade: 0.55,
    grain: 0.085,
    glow: 0,
    frame: "survey",
  },
  modern: {
    paper: [248, 247, 243],
    ink: "#2a2e31",
    reliefK: 0.3,
    shadowFloor: 0.84,
    ramp: [
      [0, [210, 226, 204]],
      [0.45, [238, 236, 220]],
      [0.75, [229, 217, 194]],
      [1, [212, 196, 176]],
    ],
    tintK: 1,
    wood: null,
    canopy: {
      cover: [214, 224, 203],
      fill: [176, 192, 162],
      a: 0.7,
      core: "rgba(132,152,118,.45)",
    },
    contour: "rgba(84,74,64,.22)",
    cW: 0.9,
    iW: 1.5,
    cLabel: "rgba(84,74,64,.65)",
    water: "#5b93bf",
    pond: "#a9cbe4",
    wLabel: "#3f74a0",
    creekW: [1, 1.6, 2.5, 3.5],
    creekDash: [null, null, null, null],
    road: ["#9aa0a4", "#ffffff", 9, 6],
    ranch: ["#b9a27f", "#fffdf6", 6.5, 4],
    trail: "#b98a5e",
    trailW: 2.8,
    fence: "#62676b",
    fenceDash: [6, 4],
    bound: "rgba(197,44,3,.18)",
    shedC: ["#7d5ba6", "#2f9e77", "#d08a1e", "#3a78c2", "#c4485a", "#7a8f1e"],
    shedA: 0.14,
    label: '"Figtree", system-ui, sans-serif',
    pasture: "rgba(31,35,38,.6)",
    fade: 0.7,
    grain: 0,
    glow: 0,
    frame: "modern",
  },
  blueprint: {
    paper: [29, 76, 140],
    ink: "#f2f7ff",
    reliefK: 0.32,
    shadowFloor: 0.8,
    ramp: [
      [0, [24, 66, 128]],
      [1, [44, 96, 164]],
    ],
    tintK: 1,
    wood: null,
    canopy: {
      cover: [50, 98, 160],
      fill: [242, 247, 255],
      a: 0.16,
      core: "rgba(242,247,255,.4)",
      open: true,
    },
    contour: "rgba(242,247,255,.26)",
    cW: 0.9,
    iW: 1.6,
    cLabel: "rgba(242,247,255,.7)",
    water: "#bfe6ff",
    pond: "rgba(191,230,255,.35)",
    wLabel: "#d9f1ff",
    creekW: [1.1, 1.7, 2.5, 3.4],
    creekDash: [[6, 4], [8, 4], null, null],
    road: ["#f2f7ff", "#1d4c8c", 8, 4.5],
    ranch: ["#f2f7ff", "#1d4c8c", 6, 3.2],
    trail: "#f2f7ff",
    trailW: 2.6,
    fence: "rgba(242,247,255,.85)",
    fenceDash: [10, 4, 2, 4],
    bound: "rgba(242,247,255,.12)",
    shedC: ["#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff"],
    shedA: 0.07,
    label: '"IBM Plex Mono", Menlo, monospace',
    pasture: "rgba(242,247,255,.75)",
    fade: 0.55,
    grain: 0,
    glow: 0,
    frame: "blueprint",
  },
  night: {
    paper: [24, 26, 28],
    ink: "#d6cfc3",
    reliefK: 0.7,
    shadowFloor: 0.8,
    ramp: [
      [0, [30, 46, 42]],
      [0.5, [56, 60, 48]],
      [1, [108, 92, 68]],
    ],
    tintK: 1,
    wood: null,
    canopy: {
      cover: [42, 50, 42],
      fill: [58, 70, 56],
      a: 0.9,
      core: "rgba(92,108,86,.5)",
    },
    contour: "rgba(230,215,190,.13)",
    cW: 0.9,
    iW: 1.5,
    cLabel: "rgba(230,215,190,.55)",
    water: "#6c93a8",
    pond: "rgba(108,147,168,.45)",
    wLabel: "#98b3c1",
    creekW: [1, 1.5, 2.3, 3.2],
    creekDash: [null, null, null, null],
    road: ["rgba(0,0,0,.4)", "#b8b0a3", 7.5, 4.5],
    ranch: ["rgba(0,0,0,.35)", "#9f978a", 6, 3.4],
    trail: "#b89a6e",
    trailW: 2.8,
    fence: "rgba(230,222,210,.45)",
    fenceDash: [6, 5],
    bound: "rgba(220,190,160,.16)",
    shedC: ["#b48cff", "#6fe0b0", "#ffc266", "#6fb6ff", "#ff7a8a", "#c8e06f"],
    shedA: 0.12,
    label: '"IBM Plex Mono", Menlo, monospace',
    pasture: "rgba(230,222,210,.55)",
    fade: 0.74,
    grain: 0,
    glow: 0,
    frame: "night",
  },
};

const $ = (id) => document.getElementById(id);
const canvas = $("map");
let ctx = canvas.getContext("2d");
const LAYERS = [
  "relief",
  "tint",
  "contours",
  "brush",
  "creeks",
  "sheds",
  "tanks",
  "roads",
  "trails",
  "fences",
  "walls",
  "bldg",
  "pastures",
  "hq",
  "prop",
  "grid",
  "fade",
];
let world = null,
  streamCache = {},
  contourCache = {},
  baseCache = {};

const state = () => {
  const L = {};
  LAYERS.forEach((k) => (L[k] = $("L-" + k).checked));
  return {
    style: document.querySelector("input[name=style]:checked").value,
    L,
    ci: +$("ci").value,
    detail: +$("detail").value,
  };
};
const thrFor = (d) =>
  Math.max(4, Math.round((80000 * Math.pow(0.03125, d / 100)) / (CELL * CELL))); // 8 ha down to 0.25 ha of upslope area

function rampAt(ramp, t) {
  for (let i = 1; i < ramp.length; i++)
    if (t <= ramp[i][0]) {
      const [a, ca] = ramp[i - 1],
        [b, cb] = ramp[i];
      const u = (t - a) / (b - a);
      return [0, 1, 2].map((k) => ca[k] + (cb[k] - ca[k]) * u);
    }
  return ramp[ramp.length - 1][1];
}

function baseRaster(st, sKey) {
  const key = sKey + st.L.relief + st.L.tint + st.L.brush;
  if (baseCache[key]) return baseCache[key];
  const T = STYLES[sKey],
    oc = document.createElement("canvas");
  oc.width = W;
  oc.height = H;
  const oct = oc.getContext("2d"),
    img = oct.createImageData(W, H),
    d = img.data,
    h = world.h;
  const az = (315 * Math.PI) / 180,
    alt = (45 * Math.PI) / 180,
    z = 1.3,
    bw = world.brushSoft;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      let c = T.paper.slice();
      if (st.L.tint) {
        const r = rampAt(
          T.ramp,
          (h[i] - world.hmin) / (world.hmax - world.hmin),
        );
        c = c.map((v, k) => lerp(v, r[k], T.tintK));
      }
      if (st.L.brush && T.wood) {
        const w = smooth(0.1, 0.3, bw[i]) * T.woodK;
        c = c.map((v, k) => lerp(v, T.wood[k], w));
      }
      if (st.L.relief) {
        const xl = Math.max(0, x - 1),
          xr = Math.min(W - 1, x + 1),
          yu = Math.max(0, y - 1),
          yd = Math.min(H - 1, y + 1);
        const gx = (z * (h[y * W + xr] - h[y * W + xl])) / ((xr - xl) * CELL),
          gy = (z * (h[yd * W + x] - h[yu * W + x])) / ((yd - yu) * CELL);
        const sl = Math.atan(Math.hypot(gx, gy)),
          asp = Math.atan2(gy, -gx);
        let s =
          Math.cos(Math.PI / 2 - alt) * Math.cos(sl) +
          Math.sin(Math.PI / 2 - alt) *
            Math.sin(sl) *
            Math.cos(az - Math.PI / 2 - asp);
        s = clamp(s, 0, 1);
        const f = Math.max(T.shadowFloor || 0, 1 + T.reliefK * 2 * (s - 0.707));
        c = c.map((v) => v * f);
      }
      d[i * 4] = clamp(c[0], 0, 255);
      d[i * 4 + 1] = clamp(c[1], 0, 255);
      d[i * 4 + 2] = clamp(c[2], 0, 255);
      d[i * 4 + 3] = 255;
    }
  oct.putImageData(img, 0, 0);
  baseCache = { [key]: oc };
  return oc;
}

let canopyCache = {};
function canopyCanvas(sKey, C) {
  const key = DATA.id + sKey;
  if (canopyCache[key]) return canopyCache[key];
  const [cw, ch] = world.canopySize,
    bits = world.canopyBits,
    oc = document.createElement("canvas");
  oc.width = cw;
  oc.height = ch;
  const g = oc.getContext("2d"),
    im = g.createImageData(cw, ch),
    d = im.data,
    a = Math.round(C.a * 255);
  for (let i = 0, n = cw * ch; i < n; i++)
    if (bits[i >> 3] & (128 >> (i & 7))) {
      d[i * 4] = C.fill[0];
      d[i * 4 + 1] = C.fill[1];
      d[i * 4 + 2] = C.fill[2];
      d[i * 4 + 3] = a;
    }
  g.putImageData(im, 0, 0);
  // soften edges: draw through a slight blur where the browser supports canvas filters
  const out = document.createElement("canvas");
  out.width = cw;
  out.height = ch;
  const go = out.getContext("2d");
  go.filter = "blur(0.7px)";
  go.drawImage(oc, 0, 0);
  canopyCache = { [key]: out };
  return out;
}
let coverCache = {};
function coverCanvas(sKey, C) {
  const key = DATA.id + sKey;
  if (coverCache[key]) return coverCache[key];
  const oc = document.createElement("canvas");
  oc.width = W;
  oc.height = H;
  const g = oc.getContext("2d"),
    im = g.createImageData(W, H),
    d = im.data,
    b = world.coverField || (world.coverField = blur(world.brush, W, H, 2, 3)),
    cc = C.cover || C.fill;
  for (let i = 0; i < W * H; i++) {
    const a = smooth(0.03, 0.5, b[i]) * 255;
    d[i * 4] = cc[0];
    d[i * 4 + 1] = cc[1];
    d[i * 4 + 2] = cc[2];
    d[i * 4 + 3] = a;
  }
  g.putImageData(im, 0, 0);
  coverCache = { [key]: oc };
  return oc;
}
let grainPat = null;
function grain() {
  if (grainPat) return grainPat;
  const g = document.createElement("canvas");
  g.width = g.height = 256;
  const gc = g.getContext("2d"),
    im = gc.createImageData(256, 256),
    R = mulberry32(7);
  for (let i = 0; i < im.data.length; i += 4) {
    const v = R() * 255;
    im.data[i] = im.data[i + 1] = im.data[i + 2] = v;
    im.data[i + 3] = 255;
  }
  gc.putImageData(im, 0, 0);
  grainPat = ctx.createPattern(g, "repeat");
  return grainPat;
}

const rgb = (a) => `rgb(${a[0]},${a[1]},${a[2]})`;
const rgba = (a, al) => `rgba(${a[0]},${a[1]},${a[2]},${al})`;
function poly(pts, close) {
  ctx.beginPath();
  pts.forEach(([x, y], k) =>
    k ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y)),
  );
  if (close) ctx.closePath();
}
function halo(text, x, y, font, fill, haloCol, ang, align) {
  ctx.save();
  ctx.translate(x, y);
  if (ang) ctx.rotate(ang);
  ctx.font = font;
  ctx.textAlign = align || "center";
  ctx.textBaseline = "middle";
  ctx.lineJoin = "round";
  ctx.strokeStyle = haloCol;
  ctx.lineWidth = 5;
  ctx.strokeText(text, 0, 0);
  ctx.fillStyle = fill;
  ctx.fillText(text, 0, 0);
  ctx.restore();
}
function spaced(t, n) {
  return t
    .toUpperCase()
    .split("")
    .join(n ? " ".repeat(n) : " ");
}

function render(opts = {}) {
  if (!world) return;
  S = S0 * view.z;
  const st = state();
  if (opts.ci) st.ci = opts.ci;
  if (opts.detail != null) st.detail = opts.detail;
  const sKey = st.style,
    T = STYLES[sKey],
    L = st.L,
    paper = rgb(T.paper),
    haloC = rgba(T.paper, 0.85);
  if (!opts.print) $("sheet").dataset.style = sKey;
  ctx.setTransform(PR, 0, 0, PR, 0, 0);
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, CW, CH);
  ctx.save();
  ctx.beginPath();
  ctx.rect(M, M, FW, FH);
  ctx.clip();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(baseRaster(st, sKey), X(0), Y(0), W * S, H * S);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (T.gridLines) {
    ctx.strokeStyle = "rgba(242,247,255,.07)";
    ctx.lineWidth = 1;
    for (let x = M; x < M + FW; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, M);
      ctx.lineTo(x, M + FH);
      ctx.stroke();
    }
    for (let y = M; y < M + FH; y += 40) {
      ctx.beginPath();
      ctx.moveTo(M, y);
      ctx.lineTo(M + FW, y);
      ctx.stroke();
    }
  }

  // watersheds
  if (L.sheds) {
    world.sheds.forEach((sh, k) => {
      const col = T.shedC[k % T.shedC.length];
      ctx.fillStyle = col;
      ctx.globalAlpha = T.shedA;
      sh.lines.forEach((l) => {
        poly(l.pts, true);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      ctx.strokeStyle = col;
      ctx.lineWidth = 2.2;
      ctx.setLineDash([14, 5, 3, 5]);
      sh.lines.forEach((l) => {
        poly(l.pts, l.closed);
        ctx.stroke();
      });
      ctx.setLineDash([]);
    });
  }

  // contours
  if (L.contours) {
    const ck = "c" + st.ci;
    if (!contourCache[ck]) {
      const ft = world.hc.map((v) => v * 3.28084),
        lo = Math.ceil((world.hmin * 3.28084) / st.ci) * st.ci,
        hi = world.hmax * 3.28084,
        out = [];
      for (let lv = lo; lv < hi; lv += st.ci)
        out.push({
          lv,
          idx: lv % (st.ci * 5) === 0,
          lines: isoLines(ft, W, H, lv, 0, 0),
        });
      contourCache = { [ck]: out };
    }
    const cs = contourCache[ck];
    ctx.strokeStyle = T.contour;
    for (const pass of [false, true]) {
      ctx.lineWidth = pass ? T.iW : T.cW;
      ctx.beginPath();
      // break contours where they would crowd closer than ~2.5 px (index lines: ~1.2 px), as on USGS sheets at cliffs
      const minPx = pass ? 2 : 3,
        rise = st.ci * 0.3048 * (pass ? 5 : 1),
        sl = world.slope;
      cs.forEach((c) => {
        if (c.idx !== pass) return;
        c.lines.forEach((l) => {
          let pen = false;
          for (const [x, y] of l.pts) {
            const i =
                Math.min(H - 1, Math.max(0, y | 0)) * W +
                Math.min(W - 1, Math.max(0, x | 0)),
              ok = (rise / Math.max(sl[i], 1e-3) / CELL) * S >= minPx;
            if (ok) {
              if (pen) ctx.lineTo(X(x), Y(y));
              else ctx.moveTo(X(x), Y(y));
            }
            pen = ok;
          }
        });
      });
      ctx.stroke();
    }
    contourLabels = cs;
  }

  // brush: a smooth cover tint when zoomed out, crossfading to the real 1.2 m canopy shapes and large crowns as you zoom in
  if (L.brush && T.canopy) {
    const mpp = CELL / S,
      maskPx = (W * CELL) / world.canopySize[0],
      detail = 1 - smooth(maskPx * 0.28, maskPx * 0.52, mpp);
    if (detail < 1) {
      ctx.globalAlpha = 1 - detail;
      ctx.drawImage(coverCanvas(sKey, T.canopy), X(0), Y(0), W * S, H * S);
    }
    if (detail > 0 && world.canopyBits) {
      ctx.globalAlpha = detail;
      ctx.drawImage(canopyCanvas(sKey, T.canopy), X(0), Y(0), W * S, H * S);
      world.bigTrees.forEach(([x, y, r]) => {
        ctx.beginPath();
        ctx.arc(X(x), Y(y), Math.max(2, r * S * 0.45), 0, Math.PI * 2);
        if (T.canopy.open) {
          ctx.strokeStyle = T.canopy.core;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        } else {
          ctx.fillStyle = T.canopy.core;
          ctx.fill();
        }
      });
    }
    ctx.globalAlpha = 1;
  }

  // creeks
  let creeks = [];
  if (L.creeks) {
    const thr = thrFor(st.detail);
    const sk = "s" + thr;
    if (!streamCache[sk]) streamCache = { [sk]: streams(world, thr) };
    creeks = streamCache[sk];
    if (T.glow) {
      ctx.shadowColor = T.water;
      ctx.shadowBlur = T.glow;
    }
    for (let c = 0; c < 4; c++) {
      ctx.strokeStyle = T.water;
      ctx.lineWidth = T.creekW[c];
      ctx.setLineDash(T.creekDash[c] || []);
      ctx.globalAlpha = sKey === "survey" ? 1 : [0.5, 0.7, 0.9, 1][c];
      ctx.beginPath();
      creeks.forEach((s) => {
        if (s.cls === c)
          s.pts.forEach(([x, y], k) =>
            k ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y)),
          );
      });
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }

  // tanks
  if (L.tanks) {
    world.ponds.forEach((p) => {
      poly(p, true);
      ctx.fillStyle = T.pond;
      ctx.fill();
      ctx.strokeStyle = T.water;
      ctx.lineWidth = 1.6;
      ctx.stroke();
    });
  }

  if (L.prop) {
    ctx.strokeStyle = T.ink;
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = 1.3;
    ctx.setLineDash([16, 4, 3, 4]);
    world.propLines.forEach((r) => {
      poly(r, true);
      ctx.stroke();
    });
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
  }
  // fences
  if (L.fences) {
    ctx.strokeStyle = T.fence;
    ctx.lineWidth = 1.8;
    ctx.setLineDash(T.fenceDash);
    world.fences.forEach((f) => {
      poly(f);
      ctx.stroke();
    });
    ctx.setLineDash([]);
  }
  if (L.walls) {
    ctx.strokeStyle = T.fence;
    world.walls.forEach((f) => {
      poly(f);
      ctx.lineWidth = 2.4;
      ctx.stroke();
      ctx.fillStyle = T.fence;
      for (let k = 1; k < f.length; k++) {
        const ax = X(f[k - 1][0]),
          ay = Y(f[k - 1][1]),
          bx = X(f[k][0]),
          by = Y(f[k][1]),
          L = Math.hypot(bx - ax, by - ay) || 1,
          nx = (by - ay) / L,
          ny = -(bx - ax) / L;
        for (let t = 6; t < L; t += 12) {
          ctx.beginPath();
          ctx.arc(
            ax + ((bx - ax) * t) / L + nx * 3,
            ay + ((by - ay) * t) / L + ny * 3,
            1.8,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        }
      }
    });
  }

  // trails (dotted)
  if (L.trails) {
    ctx.strokeStyle = T.trail;
    ctx.lineWidth = T.trailW;
    ctx.setLineDash([0.1, T.trailW * 2.6]);
    world.trails.forEach((p) => {
      poly(p);
      ctx.stroke();
    });
    ctx.setLineDash([]);
  }

  // roads: all casings, then all fills
  if (L.roads) {
    const [rc, rf, rw, ri, rdash] = T.ranch;
    ctx.strokeStyle = rc;
    ctx.lineWidth = rw;
    ctx.setLineDash(rdash || []);
    world.roads.forEach((r) => {
      poly(r.pts);
      ctx.stroke();
    });
    ctx.setLineDash([]);
    ctx.strokeStyle = rf || paper;
    ctx.lineWidth = ri;
    world.roads.forEach((r) => {
      poly(r.pts);
      ctx.stroke();
    });
  }

  // fade the neighbors
  if (L.fade) {
    ctx.beginPath();
    ctx.rect(M, M, FW, FH);
    world.rings.forEach((r) => {
      r.forEach(([x, y], k) =>
        k ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y)),
      );
      ctx.closePath();
    });
    ctx.fillStyle = rgba(T.paper, T.fade);
    ctx.fill("evenodd");
  }
  // boundary band
  const ringPath = () => {
    ctx.beginPath();
    world.rings.forEach((r) => {
      r.forEach(([x, y], k) =>
        k ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y)),
      );
      ctx.closePath();
    });
  };
  ctx.save();
  ringPath();
  ctx.clip("evenodd");
  ctx.strokeStyle = T.bound;
  ctx.lineWidth = 16;
  ringPath();
  ctx.stroke();
  ctx.restore();

  // buildings sit above the fade so they read
  if (L.bldg)
    world.buildings.forEach((b) => {
      poly(b.pts, true);
      ctx.fillStyle = T.ink;
      ctx.fill();
    });

  // grid
  if (L.grid) drawGraticule(T, true);

  // symbols
  const lf = (sz, w, it) =>
    `${it ? "italic " : ""}${w || 400} ${sz}px ${T.label}`;
  if (L.hq) {
    ctx.strokeStyle = T.ink;
    ctx.lineWidth = 1.4;
    world.trees.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(X(x), Y(y), 3.4, 0, Math.PI * 2);
      ctx.stroke();
    });
    // cliffs: light hairline with short ticks, so big canyon country doesn't turn into black hatching
    ctx.strokeStyle = T.ink;
    ctx.globalAlpha = 0.4;
    ctx.lineWidth = 1;
    world.cliffs.forEach((c) => {
      poly(c);
      ctx.stroke();
      for (let k = 1; k < c.length; k++) {
        const ax = X(c[k - 1][0]),
          ay = Y(c[k - 1][1]),
          bx = X(c[k][0]),
          by = Y(c[k][1]),
          L2 = Math.hypot(bx - ax, by - ay) || 1;
        for (let t = 3; t < L2; t += 9) {
          const px = ax + ((bx - ax) * t) / L2,
            py = ay + ((by - ay) * t) / L2;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px + ((by - ay) / L2) * 3.5, py - ((bx - ax) / L2) * 3.5);
          ctx.stroke();
        }
      }
    });
    ctx.globalAlpha = 1;
    world.marks.forEach((m) => {
      if (m.kind === "gate") {
        const gx = X(m.at[0]),
          gy = Y(m.at[1]);
        ctx.fillStyle = T.paper ? rgb(T.paper) : "#fff";
        ctx.strokeStyle = T.ink;
        ctx.lineWidth = 1.6;
        ctx.fillRect(gx - 4, gy - 4, 8, 8);
        ctx.strokeRect(gx - 4, gy - 4, 8, 8);
        return;
      }
      if (m.kind === "water") {
        halo(
          m.name,
          X(m.at[0]) + 8,
          Y(m.at[1]),
          lf(14, 400, true),
          T.wLabel,
          haloC,
          0,
          "left",
        );
        return;
      }
      if (m.kind === "well") {
        const wx = X(m.at[0]),
          wy = Y(m.at[1]);
        ctx.strokeStyle = T.water;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(wx, wy, 5, 0, Math.PI * 2);
        ctx.stroke();
        halo("Well", wx + 9, wy, lf(14, 500), T.ink, haloC, 0, "left");
        return;
      }
      const mx = X(m.at[0]),
        my = Y(m.at[1]);
      ctx.strokeStyle = T.ink;
      ctx.fillStyle = T.ink;
      ctx.lineWidth = 1.8;
      if (m.kind === "benchmark") {
        ctx.beginPath();
        ctx.moveTo(mx, my - 8);
        ctx.lineTo(mx + 8, my + 6);
        ctx.lineTo(mx - 8, my + 6);
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(mx, my + 1, 1.8, 0, Math.PI * 2);
        ctx.fill();
        halo(m.name, mx + 12, my, lf(15, 500), T.ink, haloC, 0, "left");
      } else {
        ctx.beginPath();
        ctx.moveTo(mx, my - 12);
        ctx.lineTo(mx - 5, my + 5);
        ctx.moveTo(mx, my - 12);
        ctx.lineTo(mx + 5, my + 5);
        ctx.moveTo(mx - 3, my - 2);
        ctx.lineTo(mx + 3, my - 2);
        ctx.stroke();
        halo("Mast", mx + 10, my - 4, lf(14, 500), T.ink, haloC, 0, "left");
      }
    });
  }
  if (L.hq) {
    const [px, py] = world.peak,
      sx = X(px),
      sy = Y(py),
      ft = Math.round(world.peakFt).toLocaleString("en-US");
    if (sKey === "survey")
      halo(
        "×" + Math.round(world.peakFt),
        sx,
        sy,
        lf(17),
        T.cLabel,
        haloC,
        0,
        "left",
      );
    else {
      ctx.fillStyle = T.ink;
      ctx.beginPath();
      ctx.moveTo(sx, sy - 8);
      ctx.lineTo(sx + 7, sy + 5);
      ctx.lineTo(sx - 7, sy + 5);
      ctx.closePath();
      ctx.fill();
      halo(ft + " ft", sx + 12, sy, lf(16, 500), T.ink, haloC, 0, "left");
    }
  }

  // labels
  if (L.contours && contourLabels) labelContours(T);
  if (L.tanks)
    world.ponds.forEach((p) => {
      const cx = p.reduce((a, q) => a + q[0], 0) / p.length,
        cy = p.reduce((a, q) => a + q[1], 0) / p.length,
        r = Math.max(...p.map((q) => q[0])) - cx;
      if (cx > 2 && cy > 2 && cx < W - 2 && cy < H - 2)
        halo(
          "Tank",
          X(cx + r) + 8,
          Y(cy),
          lf(16, 400, true),
          T.wLabel,
          haloC,
          0,
          "left",
        );
    });
  if (L.sheds)
    world.sheds.forEach((sh) =>
      halo(
        `${Math.round(sh.acres)} ac · drains ${sh.dir}`,
        X(sh.at[0]),
        Y(sh.at[1]) + 30,
        lf(14, 500),
        T.ink,
        haloC,
      ),
    );
  if (L.pastures)
    world.pastures.forEach((p) =>
      halo(
        spaced(p.name, 0),
        X(p.at[0]),
        Y(p.at[1]),
        lf(sKey === "survey" ? 18 : 16, sKey === "modern" ? 700 : 400),
        T.pasture,
        haloC,
      ),
    );
  if (L.roads) {
    const named = world.roads
      .filter((r) => r.name)
      .sort((a, b) => b.pts.length - a.pts.length)[0];
    if (named && named.pts.length > 12) {
      const p = named.pts,
        m = Math.floor(p.length / 2),
        a = p[m - 5],
        b = p[m + 5];
      let ang = Math.atan2(Y(b[1]) - Y(a[1]), X(b[0]) - X(a[0]));
      if (ang > Math.PI / 2) ang -= Math.PI;
      if (ang < -Math.PI / 2) ang += Math.PI;
      halo(
        named.name,
        X(p[m][0]) + Math.sin(ang) * 16,
        Y(p[m][1]) - Math.cos(ang) * 16,
        lf(15, 500),
        T.ink,
        haloC,
        ang,
      );
    }
  }

  if (T.grain) {
    ctx.globalAlpha = T.grain;
    ctx.globalCompositeOperation = sKey === "survey" ? "multiply" : "overlay";
    ctx.fillStyle = grain();
    ctx.fillRect(M, M, FW, FH);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }
  if (opts.print) {
    // paper beyond the data we fetched; production fetches the whole frame
    ctx.beginPath();
    ctx.rect(0, 0, CW, CH);
    ctx.rect(X(0), Y(0), W * S, H * S);
    ctx.fillStyle = paper;
    ctx.fill("evenodd");
  }
  if (!opts.print) scaleBar(T, haloC);
  ctx.restore();
  drawFrame(T);
  if (!opts.print) {
    drawGraticule(T, false);
    updateSheet(st, T);
  }
}
let contourLabels = null;

function labelContours(T) {
  const occ = new Set(),
    font = `400 15px ${T.label}`;
  let n = 0;
  for (const c of contourLabels) {
    if (!c.idx) continue;
    for (const l of c.lines) {
      if (l.pts.length < 60) continue;
      for (let k = 30; k < l.pts.length - 30 && n < 22; k += 140) {
        const [x, y] = l.pts[k];
        if (!world.inP[(y | 0) * W + (x | 0)]) continue;
        const gk = ((X(x) / 150) | 0) + "," + ((Y(y) / 120) | 0);
        if (occ.has(gk)) continue;
        const a = l.pts[k - 4],
          b = l.pts[k + 4];
        let ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
        if (ang > Math.PI / 2) ang -= Math.PI;
        if (ang < -Math.PI / 2) ang += Math.PI;
        occ.add(gk);
        n++;
        halo(
          c.lv.toLocaleString("en-US"),
          X(x),
          Y(y),
          font,
          T.cLabel,
          rgba(T.paper, 0.9),
          ang,
        );
      }
    }
  }
}

function scaleBar(T, haloC) {
  // pick the longest round length that fits, so the bar stays readable at every zoom
  const pxFt = (0.3048 / CELL) * S,
    opts = [
      [100, "100 ft", "50"],
      [200, "200 ft", "100"],
      [500, "500 ft", "250"],
      [1000, "1,000 ft", "500"],
      [1320, "¼ mile", "⅛"],
      [2640, "½ mile", "¼"],
      [5280, "1 mile", "½"],
      [10560, "2 miles", "1"],
    ];
  const [ft, label, half] =
      opts.filter((o) => o[0] * pxFt <= 720).pop() || opts[0],
    L = ft * pxFt,
    x0 = M + 28,
    y0 = M + FH - 40;
  const mOpts = [10, 25, 50, 100, 200, 400, 1000, 2000],
    mm = mOpts.filter((v) => (v / CELL) * S <= L).pop() || 10;
  ctx.fillStyle = haloC;
  ctx.fillRect(x0 - 16, y0 - 44, L + 210, 72);
  ctx.strokeStyle = T.ink;
  ctx.fillStyle = T.ink;
  ctx.lineWidth = 1.5;
  const q = L / 4;
  for (let i = 0; i < 4; i++) {
    if (i % 2 === 0) ctx.fillRect(x0 + i * q, y0, q, 7);
    ctx.strokeRect(x0 + i * q, y0, q, 7);
  }
  ctx.font = `500 14px ${T.label}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText("0", x0, y0 - 4);
  ctx.fillText(half, x0 + L / 2, y0 - 4);
  ctx.textAlign = "left";
  ctx.fillText(label, x0 + L - 8, y0 - 4);
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillStyle = T.cLabel;
  ctx.fillText(mm + " m", x0 + (mm / CELL) * S, y0 + 10);
  ctx.fillRect(x0 + (mm / CELL) * S - 0.75, y0 + 7, 1.5, 4);
  // north arrow with magnetic declination
  const nx = x0 + L + 110,
    ny = y0 + 6;
  ctx.fillStyle = T.ink;
  ctx.beginPath();
  ctx.moveTo(nx, ny - 40);
  ctx.lineTo(nx + 8, ny);
  ctx.lineTo(nx, ny - 8);
  ctx.lineTo(nx - 8, ny);
  ctx.closePath();
  ctx.fill();
  ctx.font = `700 14px ${T.label}`;
  ctx.textBaseline = "bottom";
  ctx.fillText("N", nx, ny - 42);
  ctx.save();
  ctx.translate(nx + 34, ny);
  ctx.rotate((6.5 * Math.PI) / 180);
  ctx.strokeStyle = T.ink;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -36);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, -36);
  ctx.lineTo(5, -26);
  ctx.lineTo(0, -28);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  ctx.font = `400 12px ${T.label}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("MN 6.5°E", nx + 44, ny - 14);
}

function dms(v) {
  const t = Math.round(Math.abs(v) * 3600),
    d = Math.floor(t / 3600),
    m = Math.floor(t / 60) % 60,
    s = t % 60;
  return `${d}°${String(m).padStart(2, "0")}′${String(s).padStart(2, "0")}″`;
}
function drawFrame(T) {
  ctx.strokeStyle = T.ink;
  if (T.frame === "survey") {
    ctx.lineWidth = 2.5;
    ctx.strokeRect(M, M, FW, FH);
    ctx.lineWidth = 1;
    ctx.strokeRect(M - 7, M - 7, FW + 14, FH + 14);
  } else if (T.frame === "blueprint") {
    ctx.lineWidth = 2;
    ctx.strokeRect(M, M, FW, FH);
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(M - 8, M - 8, FW + 16, FH + 16);
    ctx.setLineDash([]);
  } else if (T.frame === "night") {
    ctx.strokeStyle = "rgba(239,231,218,.35)";
    ctx.lineWidth = 1;
    ctx.strokeRect(M, M, FW, FH);
  } else {
    ctx.lineWidth = 1.5;
    ctx.strokeRect(M, M, FW, FH);
  }
}
function drawGraticule(T, inside) {
  const dLon = DATA.ll.e - DATA.ll.w,
    dLat = DATA.ll.n - DATA.ll.s;
  const lonW = DATA.ll.w,
    latN = DATA.ll.n,
    step = (dLat / view.z > 0.04 ? 60 : 15) / 3600;
  const xs = [],
    ys = [];
  for (let lo = Math.ceil(lonW / step) * step; lo < lonW + dLon; lo += step)
    xs.push([lo, X(((lo - lonW) / dLon) * W)]);
  for (let la = Math.floor(latN / step) * step; la > latN - dLat; la -= step)
    ys.push([la, Y(((latN - la) / dLat) * H)]);
  const vis = ([, v], lo, hi) => v >= lo && v <= hi;
  for (const [arr, hi] of [
    [xs, M + FW],
    [ys, M + FH],
  ]) {
    const keep = arr.filter((a) => vis(a, M, hi));
    arr.length = 0;
    arr.push(...keep);
  }
  ctx.strokeStyle = T.frame === "night" ? "rgba(239,231,218,.5)" : T.ink;
  ctx.fillStyle = ctx.strokeStyle;
  if (inside) {
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.45;
    ctx.setLineDash([2, 6]);
    xs.forEach(([, x]) => {
      ctx.beginPath();
      ctx.moveTo(x, M);
      ctx.lineTo(x, M + FH);
      ctx.stroke();
    });
    ys.forEach(([, y]) => {
      ctx.beginPath();
      ctx.moveTo(M, y);
      ctx.lineTo(M + FW, y);
      ctx.stroke();
    });
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
    return;
  }
  ctx.lineWidth = 1.5;
  ctx.font = `400 13px ${T.label}`;
  xs.forEach(([lo, x], k) => {
    ctx.beginPath();
    ctx.moveTo(x, M);
    ctx.lineTo(x, M + 10);
    ctx.moveTo(x, M + FH);
    ctx.lineTo(x, M + FH - 10);
    ctx.stroke();
    if (k % 2 === 0) {
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText(dms(lo) + " W", x, M - 12);
    }
  });
  ys.forEach(([la, y], k) => {
    ctx.beginPath();
    ctx.moveTo(M, y);
    ctx.lineTo(M + 10, y);
    ctx.moveTo(M + FW, y);
    ctx.lineTo(M + FW - 10, y);
    ctx.stroke();
    if (k % 2 === 0) {
      ctx.save();
      ctx.translate(M - 14, y);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText(dms(la) + " N", 0, 0);
      ctx.restore();
    }
  });
}

function sw(svg) {
  return `<svg width="30" height="14" viewBox="0 0 30 14" aria-hidden="true">${svg}</svg>`;
}
function legendItems(st, T) {
  const L = st.L,
    paper = rgb(T.paper),
    items = [];
  if (L.contours)
    items.push([
      sw(
        `<path d="M1 9 C8 3, 20 13, 29 6" fill="none" stroke="${T.contour}" stroke-width="${T.iW * 0.7}"/>`,
      ),
      `Contour, every ${st.ci} ft`,
    ]);
  if (L.brush) {
    if (T.wood)
      items.push([
        sw(`<rect x="1" y="2" width="28" height="10" fill="${rgb(T.wood)}"/>`),
        "Brush and trees",
      ]);
    else {
      const f = T.canopy.cover
        ? rgb(T.canopy.cover)
        : rgba(T.canopy.fill, T.canopy.a);
      items.push([
        sw(
          `<path d="M3 9c0-4 5-6 8-4 2-3 7-2 7 1 3-1 6 1 5 4-1 3-6 3-8 2-3 2-9 1-12-3z" fill="${f}"/><circle cx="26" cy="5" r="2.2" fill="${f}"/>`,
        ),
        "Brush cover, from infrared",
      ]);
      items.push([
        sw(
          `<circle cx="15" cy="7" r="5.5" fill="${f}"/><circle cx="15" cy="7" r="2.6" fill="${T.canopy.open ? "none" : T.canopy.core}" stroke="${T.canopy.open ? T.canopy.core : "none"}"/>`,
        ),
        "Large tree, 7 m+ crown (zoom in)",
      ]);
    }
  }
  if (L.creeks) {
    items.push([
      sw(
        `<path d="M1 7 H29" stroke="${T.water}" stroke-width="1.6" ${T.creekDash[0] ? `stroke-dasharray="${T.creekDash[0].map((v) => v * 0.7).join(" ")}"` : ""}/>`,
      ),
      "Draw, runs after rain",
    ]);
    items.push([
      sw(`<path d="M1 7 H29" stroke="${T.water}" stroke-width="3"/>`),
      "Main creek",
    ]);
  }
  if (L.tanks && world.ponds.length)
    items.push([
      sw(
        `<ellipse cx="13" cy="7" rx="10" ry="5" fill="${T.pond}" stroke="${T.water}"/>`,
      ),
      "Stock tank or pond",
    ]);
  if (L.sheds)
    items.push([
      sw(
        `<path d="M1 7 H29" stroke="${T.shedC[0]}" stroke-width="2" stroke-dasharray="7 3 2 3"/>`,
      ),
      "Watershed divide",
    ]);
  if (L.roads) {
    if (world.roads.length)
      items.push([
        sw(
          `<path d="M1 7 H29" stroke="${T.ranch[0]}" stroke-width="5" ${T.ranch[4] ? `stroke-dasharray="7 3"` : ""}/><path d="M1 7 H29" stroke="${T.ranch[1] || paper}" stroke-width="2.6"/>`,
        ),
        "Ranch road",
      ]);
  }
  if (L.trails && world.trails.length)
    items.push([
      sw(
        `<path d="M2 7 H29" stroke="${T.trail}" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="0.1 5.5"/>`,
      ),
      "Trail",
    ]);
  if (L.fences && world.fences.length)
    items.push([
      sw(
        `<path d="M1 7 H29" stroke="${T.fence}" stroke-width="1.4" stroke-dasharray="${T.fenceDash.map((v) => v * 0.7).join(" ")}"/>`,
      ),
      "Fence",
    ]);
  if (L.walls && world.walls.length) {
    items.push([
      sw(
        `<path d="M1 7 H29" stroke="${T.fence}" stroke-width="2"/>` +
          [5, 12, 19, 26]
            .map((x) => `<circle cx="${x}" cy="4" r="1.4" fill="${T.fence}"/>`)
            .join(""),
      ),
      "Rock wall",
    ]);
  }
  if (L.prop && world.propLines.length)
    items.push([
      sw(
        `<path d="M1 7 H29" stroke="${T.ink}" stroke-opacity=".6" stroke-width="1.2" stroke-dasharray="9 3 2 3"/>`,
      ),
      "Property line",
    ]);
  if (L.bldg && world.buildings.length)
    items.push([
      sw(`<rect x="9" y="3" width="12" height="8" fill="${T.ink}"/>`),
      "Building",
    ]);
  items.push([
    sw(
      `<rect x="2" y="2" width="26" height="10" fill="none" stroke="${T.bound}" stroke-width="4"/>`,
    ),
    DATA.boundaryLabel || "Ranch boundary",
  ]);
  return items;
}
function updateSheet(st, T) {
  const items = legendItems(st, T);
  $("legend").innerHTML =
    `<div class="lh">Legend</div>` +
    items
      .map(([s, t]) => `<div class="li">${s}<span>${t}</span></div>`)
      .join("");
  $("sTitle").textContent = $("tTitle").value || "Your Ranch";
  $("sSub").textContent = $("tSub").value;
  $("sMeta").textContent =
    `${Math.round(world.parcelAcres).toLocaleString("en-US")} acres · ${((DATA.ll.s + DATA.ll.n) / 2).toFixed(4)}°N ${Math.abs((DATA.ll.w + DATA.ll.e) / 2).toFixed(4)}°W`;
  const paperName = {
    letter: "Letter",
    tabloid: "Tabloid",
    poster: "36 × 24 poster",
  }[$("paper").value];
  const osmN =
    world.roads.length +
    world.fences.length +
    world.walls.length +
    world.buildings.length +
    world.trails.length;
  $("sNotes").innerHTML =
    `<b>Contour interval ${st.ci} feet.</b> Elevation from USGS 3DEP lidar. Brush from ${DATA.naipYear} NAIP infrared imagery. Creeks, watersheds and possible tanks computed from the terrain.${osmN ? " Roads, trails, fences and buildings © OpenStreetMap contributors." : ""} Property lines from TxGIO.${world.pastures.length ? " Pasture names are examples." : ""}<br>Compiled 5 October 2026 · ${paperName} sheet · javelinaworks.com`;
  $("pageNote").textContent = DATA.note || "";
}

// ------------------------------------------------------------------ print layout
// Sheet furniture is fixed in inches and points per paper size; the map frame takes what's left,
// and the map scale is computed so the ranch fits, rounded to a standard map scale.
const DES = 150; // design density: canvas pixels per printed inch
const PAPERS = {
  letter: {
    w: 11,
    h: 8.5,
    m: 0.35,
    foot: 1.3,
    name: "Letter",
    fs: { title: 20, body: 8.5, small: 7, tiny: 6 },
    logo: 0.62,
  },
  tabloid: {
    w: 17,
    h: 11,
    m: 0.45,
    foot: 1.6,
    name: "Tabloid",
    fs: { title: 28, body: 10, small: 8, tiny: 6.5 },
    logo: 0.8,
  },
  poster: {
    w: 36,
    h: 24,
    m: 0.8,
    foot: 2.8,
    name: "36 × 24 poster",
    fs: { title: 54, body: 16, small: 12.5, tiny: 10 },
    logo: 1.45,
  },
};
const SCALES = [
  2400, 3600, 4800, 6000, 7200, 9600, 12000, 15840, 24000, 31680, 48000, 63360,
  100000, 125000, 250000,
];
const scaleWords = (d) => {
  const ftPerIn = d / 12;
  return d === 63360
    ? "1 inch = 1 mile"
    : d === 31680
      ? "1 inch = ½ mile"
      : d === 15840
        ? "1 inch = ¼ mile"
        : `1 inch = ${Math.round(ftPerIn).toLocaleString("en-US")} feet`;
};
function planPrint(paperKey, orient) {
  const P = PAPERS[paperKey],
    pts = world.rings.flat(),
    xs = pts.map((p) => p[0]),
    ys = pts.map((p) => p[1]);
  const x0 = Math.min(...xs),
    x1 = Math.max(...xs),
    y0 = Math.min(...ys),
    y1 = Math.max(...ys),
    pad = 0.07;
  const gw = (x1 - x0) * CELL * (1 + 2 * pad),
    gh = (y1 - y0) * CELL * (1 + 2 * pad);
  const lay = (o) => {
    const pw = o === "portrait" ? Math.min(P.w, P.h) : Math.max(P.w, P.h),
      ph = o === "portrait" ? Math.max(P.w, P.h) : Math.min(P.w, P.h);
    const fw = pw - 2 * P.m,
      fh = ph - 2 * P.m - P.foot - 0.12;
    const need = Math.max(gw / (fw * 0.0254), gh / (fh * 0.0254));
    return {
      o,
      pw,
      ph,
      fw,
      fh,
      need,
      denom: SCALES.find((v) => v >= need) || Math.ceil(need / 1000) * 1000,
    };
  };
  const c = (
    orient === "auto" ? [lay("portrait"), lay("landscape")] : [lay(orient)]
  ).sort((a, b) => a.need - b.need)[0];
  const d = c.denom;
  c.P = P;
  c.key = paperKey;
  c.cx = (x0 + x1) / 2;
  c.cy = (y0 + y1) / 2;
  c.ci =
    d <= 6000 ? 10 : d <= 12000 ? 20 : d <= 24000 ? 40 : d <= 63360 ? 100 : 200;
  c.detail =
    d <= 6000 ? 60 : d <= 12000 ? 50 : d <= 24000 ? 38 : d <= 48000 ? 25 : 15;
  // pages needed at 1:24,000 on this paper, for a map book suggestion
  const at24 = (len, frame) =>
    Math.max(1, Math.ceil(len / (frame * 0.0254 * 24000)));
  c.book = at24(gw, c.fw) * at24(gh, c.fh);
  c.bigger = Object.keys(PAPERS).find((k) => {
    const q = PAPERS[k];
    const L = Math.max(q.w, q.h),
      Sx = Math.min(q.w, q.h);
    const fit = (o) =>
      Math.max(
        gw / ((o ? L : Sx) - 2 * q.m) / 0.0254,
        gh / ((o ? Sx : L) - 2 * q.m - q.foot - 0.12) / 0.0254,
      );
    return Math.min(fit(0), fit(1)) <= 24000;
  });
  return c;
}
function renderPrint(plan) {
  const save = {
    ctx,
    M,
    S0,
    FW,
    FH,
    CW,
    CH,
    PR,
    z: view.z,
    x0: view.x0,
    y0: view.y0,
  };
  const pc = $("pcanvas");
  try {
    M = 0;
    FW = plan.fw * DES;
    FH = plan.fh * DES;
    CW = FW;
    CH = FH;
    S0 = (CELL / plan.denom / 0.0254) * DES;
    view.z = 1;
    view.x0 = plan.cx - FW / (2 * S0);
    view.y0 = plan.cy - FH / (2 * S0);
    PR = PR_PRINT || Math.min(2, 2600 / FW); // preview resolution, or up to 300 dpi when printing
    pc.width = Math.round(FW * PR);
    pc.height = Math.round(FH * PR);
    ctx = pc.getContext("2d");
    render({ print: true, ci: plan.ci, detail: plan.detail });
  } finally {
    ({ ctx, M, S0, FW, FH, CW, CH, PR } = save);
    view.z = save.z;
    view.x0 = save.x0;
    view.y0 = save.y0;
  }
}
function scaleBarSVG(plan) {
  const ftPerIn = plan.denom / 12,
    maxIn = plan.key === "poster" ? 6 : plan.key === "tabloid" ? 3.6 : 2.6;
  const opts = [
    [100, "100 ft"],
    [250, "250 ft"],
    [500, "500 ft"],
    [1000, "1,000 ft"],
    [2000, "2,000 ft"],
    [2640, "½ mile"],
    [5280, "1 mile"],
    [10560, "2 miles"],
    [26400, "5 miles"],
  ];
  const [ft, label] =
    opts.filter((o) => o[0] / ftPerIn <= maxIn).pop() || opts[0];
  const L = ft / ftPerIn,
    fs = plan.P.fs.small,
    h = (fs * 0.55) / 72,
    ink =
      getComputedStyle($("page")).getPropertyValue("--s-ink").trim() || "#222";
  const seg = [0, 1, 2, 3]
    .map(
      (i) =>
        `<rect x="${(i * L) / 4}" y="0" width="${L / 4}" height="${h}" fill="${i % 2 ? "none" : ink}" stroke="${ink}" stroke-width="${0.6 / 72}"/>`,
    )
    .join("");
  return `<svg width="${L + 0.9}in" height="${h * 3.4}in" viewBox="0 ${-h * 1.6} ${L + 0.9} ${h * 3.4}" style="font-size:${fs / 72}px">${seg}
    <text x="0" y="${-h * 0.5}" fill="${ink}" font-size="${(fs * 0.9) / 72}">0</text><text x="${L}" y="${-h * 0.5}" fill="${ink}" font-size="${(fs * 0.9) / 72}" text-anchor="middle">${label}</text>
    <g transform="translate(${L + 0.55} ${h * 0.9})"><path d="M0 ${-h * 2.4} L${h * 0.55} ${h * 0.2} L0 ${-h * 0.3} L${-h * 0.55} ${h * 0.2} Z" fill="${ink}"/><text x="0" y="${-h * 2.7}" fill="${ink}" font-size="${(fs * 0.9) / 72}" text-anchor="middle">N</text></g></svg>`;
}
function renderPrintPreview() {
  if (!world) return;
  const st = state(),
    T = STYLES[st.style],
    plan = planPrint($("paper").value, $("orient").value),
    P = plan.P,
    pg = $("page");
  pg.dataset.style = st.style;
  Object.assign(pg.style, { width: plan.pw + "in", height: plan.ph + "in" });
  pg.style.setProperty("--fs-title", P.fs.title + "pt");
  pg.style.setProperty("--fs-body", P.fs.body + "pt");
  pg.style.setProperty("--fs-small", P.fs.small + "pt");
  pg.style.setProperty("--fs-tiny", P.fs.tiny + "pt");
  pg.style.setProperty("--logo", P.logo + "in");
  pg.style.setProperty("--logo-img", `url("${LOGO}")`);
  const pc = $("pcanvas");
  Object.assign(pc.style, {
    left: P.m + "in",
    top: P.m + "in",
    width: plan.fw + "in",
    height: plan.fh + "in",
  });
  const ft = pg.querySelector(".pfoot");
  Object.assign(ft.style, {
    left: P.m + "in",
    bottom: P.m + "in",
    width: plan.pw - 2 * P.m + "in",
    height: P.foot + "in",
    paddingTop: P.foot * 0.1 + "in",
  });
  renderPrint(plan);
  const pst = { ...st, ci: plan.ci };
  $("pLegend").innerHTML = legendItems(pst, T)
    .map(([sv, t]) => `<div class="li">${sv}<span>${t}</span></div>`)
    .join("");
  $("pTitle").textContent = $("tTitle").value || "Your Ranch";
  $("pSub").textContent = $("tSub").value;
  $("pMeta").textContent =
    `${Math.round(world.parcelAcres).toLocaleString("en-US")} acres`;
  $("pBar").innerHTML = scaleBarSVG(plan);
  $("pScale").textContent =
    `Scale 1:${plan.denom.toLocaleString("en-US")} · ${scaleWords(plan.denom)} · contours every ${plan.ci} ft`;
  $("pNotes").innerHTML =
    `Elevation: USGS 3DEP lidar. Brush: ${DATA.naipYear} NAIP infrared. Creeks computed from terrain. Roads, fences and buildings © OpenStreetMap contributors. Parcels: TxGIO. Compiled 5 October 2026.`;
  // fit the real-size page to the screen
  const k = Math.min(1, $("pgwrap").clientWidth / (plan.pw * 96));
  pg.style.transform = `scale(${k})`;
  $("pgwrap").style.height = plan.ph * 96 * k + "px";
  const warn =
    plan.denom > 31680
      ? `<span class="warn">This ranch is large for ${P.name}, so detail is generalized. ${plan.bigger && plan.bigger !== plan.key ? `It fits on a ${PAPERS[plan.bigger].name} at 1:24,000, or ` : ""}a map book of ${plan.book} ${P.name} pages would show it at 1:24,000.</span>`
      : "";
  $("plan").innerHTML =
    `<b>${P.name}, ${plan.o}</b> · scale 1:${plan.denom.toLocaleString("en-US")} (${scaleWords(plan.denom)}) · ${plan.ci} ft contours${warn}`;
}
let mode = "explore";
function refresh() {
  if (mode === "print") renderPrintPreview();
  else render();
}
function setMode(m) {
  mode = m;
  $("mExplore").setAttribute("aria-selected", m === "explore");
  $("mPrint").setAttribute("aria-selected", m === "print");
  $("sheet").hidden = m !== "explore";
  $("pgwrap").hidden = m !== "print";
  document.querySelector(".stage .note").hidden = m !== "explore";
  refresh();
}
$("mExplore").addEventListener("click", () => setMode("explore"));
$("mPrint").addEventListener("click", () => setMode("print"));
window.addEventListener("resize", () => {
  if (mode === "print") renderPrintPreview();
});

// ------------------------------------------------------------------ zoom and pan
let frameReq = 0;
const redraw = () => {
  if (!frameReq)
    frameReq = requestAnimationFrame(() => {
      frameReq = 0;
      render();
    });
};
function clampView() {
  view.z = clamp(view.z, 1, 8);
  view.x0 = clamp(view.x0, 0, W - W / view.z);
  view.y0 = clamp(view.y0, 0, H - H / view.z);
}
function toCanvas(e) {
  const r = canvas.getBoundingClientRect();
  return [
    ((e.clientX - r.left) * CW) / r.width,
    ((e.clientY - r.top) * CH) / r.height,
  ];
}
function zoomAt(px, py, f) {
  const cx = view.x0 + (px - M) / (S0 * view.z),
    cy = view.y0 + (py - M) / (S0 * view.z);
  view.z *= f;
  clampView();
  view.x0 = cx - (px - M) / (S0 * view.z);
  view.y0 = cy - (py - M) / (S0 * view.z);
  clampView();
  redraw();
  $("zHint").style.opacity = 0;
}
canvas.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();
    const [px, py] = toCanvas(e);
    zoomAt(px, py, Math.exp(-e.deltaY * 0.0022));
  },
  { passive: false },
);
canvas.addEventListener("dblclick", (e) => {
  const [px, py] = toCanvas(e);
  zoomAt(px, py, e.shiftKey ? 0.5 : 2);
});
const ptrs = new Map();
let pinch0 = null;
canvas.addEventListener("pointerdown", (e) => {
  canvas.setPointerCapture(e.pointerId);
  ptrs.set(e.pointerId, toCanvas(e));
  canvas.classList.add("dragging");
});
canvas.addEventListener("pointermove", (e) => {
  if (!ptrs.has(e.pointerId)) return;
  const prev = ptrs.get(e.pointerId),
    cur = toCanvas(e);
  ptrs.set(e.pointerId, cur);
  if (ptrs.size === 1) {
    view.x0 -= (cur[0] - prev[0]) / S;
    view.y0 -= (cur[1] - prev[1]) / S;
    clampView();
    redraw();
    $("zHint").style.opacity = 0;
  } else if (ptrs.size === 2) {
    const [a, b] = [...ptrs.values()],
      d = Math.hypot(a[0] - b[0], a[1] - b[1]);
    if (pinch0) zoomAt((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, d / pinch0);
    pinch0 = d;
  }
});
const endPtr = (e) => {
  ptrs.delete(e.pointerId);
  if (ptrs.size < 2) pinch0 = null;
  if (!ptrs.size) canvas.classList.remove("dragging");
};
canvas.addEventListener("pointerup", endPtr);
canvas.addEventListener("pointercancel", endPtr);
$("zIn").addEventListener("click", () => zoomAt(M + FW / 2, M + FH / 2, 1.6));
$("zOut").addEventListener("click", () =>
  zoomAt(M + FW / 2, M + FH / 2, 1 / 1.6),
);
$("zReset").addEventListener("click", () => {
  view.z = 1;
  view.x0 = view.y0 = 0;
  redraw();
});

// ------------------------------------------------------------------ public API
// The page's lookup script calls showRanch() with a bundle from
// GET /api/ranch-map/{run_id}/bundle (or the bundled Fox Canyon sample).
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let building = false;

export async function showRanch(bundle, meta = {}) {
  if (building) return;
  building = true;
  DATA = {
    ...bundle,
    id: meta.id || "ranch",
    title: meta.title || "Your Ranch",
    county: meta.county || "",
    boundaryLabel: meta.boundaryLabel || "Ranch boundary",
    note: meta.note || "",
  };
  $("rmStudio").hidden = false;
  $("tTitle").value = DATA.title;
  $("tSub").value = DATA.county;
  const steps = [
    "Reading the elevation",
    "Tracing creeks and draws",
    "Measuring brush from infrared",
    "Laying out the sheet",
  ];
  $("steps").innerHTML = steps.map((s) => `<li>${s}</li>`).join("");
  $("loading").hidden = false;
  const li = [...$("steps").children];
  const mark = (k) =>
    li.forEach((e, i) => {
      e.className = i < k ? "done" : i === k ? "on" : "";
    });
  mark(0);
  await sleep(60);
  try {
    view.z = 1;
    view.x0 = view.y0 = 0;
    W = DATA.W;
    H = DATA.H;
    CELL = DATA.cell;
    setGeom();
    $("ci").value = String(DATA.ci || (DATA.cell >= 10 ? 40 : 20));
    world = buildWorld();
    streamCache = {};
    contourCache = {};
    baseCache = {};
    canopyCache = {};
    coverCache = {};
    for (let k = 1; k < steps.length; k++) {
      mark(k);
      await sleep(120);
    }
    refresh();
  } finally {
    $("loading").hidden = true;
    building = false;
  }
  return { acres: world.parcelAcres };
}

// ------------------------------------------------------------------ controls
$("rmStudio")
  .querySelector(".rail")
  .addEventListener("change", () => {
    if (world) refresh();
  });
$("detail").addEventListener("input", () => {
  if (!world) return;
  if (!$("L-creeks").checked) $("L-creeks").checked = true;
  refresh();
});
["tTitle", "tSub"].forEach((id) =>
  $(id).addEventListener("input", () => {
    if (!world) return;
    if (mode === "print") renderPrintPreview();
    else updateSheet(state(), STYLES[state().style]);
  }),
);

// ------------------------------------------------------------------ print
// The print page is laid out in real inches; the browser prints it at true
// size through an @page rule, so "Save as PDF" gives a sheet-sized PDF.
function setPageRule(plan) {
  let s = document.getElementById("rmPageRule");
  if (!s) {
    s = document.createElement("style");
    s.id = "rmPageRule";
    document.head.appendChild(s);
  }
  s.textContent = `@page { size: ${plan.pw}in ${plan.ph}in; margin: 0; }`;
}
let printing = false;
function prepareForPrint() {
  if (!world || printing) return;
  printing = true;
  if (mode !== "print") setMode("print");
  const plan = planPrint($("paper").value, $("orient").value);
  setPageRule(plan);
  // re-render the map frame at up to 300 dpi (DES is 150 px/in), capped for memory
  const maxPx = 40e6,
    want = 2;
  const pr = Math.min(want, Math.sqrt(maxPx / (plan.fw * DES * plan.fh * DES)));
  const save = renderPrint;
  PR_PRINT = pr;
  renderPrintPreview();
  PR_PRINT = 0;
  return save;
}
let PR_PRINT = 0;
window.addEventListener("beforeprint", () => {
  prepareForPrint();
  document.documentElement.classList.add("rm-printing");
});
window.addEventListener("afterprint", () => {
  printing = false;
  document.documentElement.classList.remove("rm-printing");
  if (world) renderPrintPreview();
});
$("printBtn").addEventListener("click", () => {
  prepareForPrint();
  document.documentElement.classList.add("rm-printing");
  try {
    if (window.posthog)
      window.posthog.capture("ranchmap_print", {
        paper: $("paper").value,
        style: state().style,
        acres: Math.round(world.parcelAcres),
      });
  } catch (e) {
    /* analytics never breaks the page */
  }
  window.print();
});

const fontsWanted = [
  '400 16px "Old Standard TT"',
  'italic 400 16px "Old Standard TT"',
  '700 16px "Old Standard TT"',
  '400 16px "Figtree"',
  '600 16px "Figtree"',
  '700 16px "Figtree"',
  '400 16px "IBM Plex Mono"',
  '500 16px "IBM Plex Mono"',
  'italic 400 16px "IBM Plex Mono"',
];
Promise.race([
  Promise.all(fontsWanted.map((f) => document.fonts.load(f))),
  sleep(2500),
]).catch(() => {});
document.fonts.ready.then(() => world && refresh());

window.RanchMapEngine = { showRanch };
