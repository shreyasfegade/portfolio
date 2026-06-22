// Procedural target geometry for every formation.
//
// Each formation returns exactly N points (struct-of-arrays) so the engine can
// lerp particle i from one formation's point i to the next. Emblems are built in
// a local coordinate box (roughly [-1.3, 1.3]) and mapped into the viewport via
// the layout context, so a small set of weighted "strokes" expands to fill the
// whole particle pool. Every emblem is a callback to that project's own hand-built
// visualization — abstract, but never random.

import { C } from "./config";

export interface FormationData {
  x: Float32Array;
  y: Float32Array;
  color: Uint8Array;
  size: Float32Array; // 0..1 normalized; engine maps to px
  alpha: Float32Array;
}

export interface LayoutCtx {
  w: number;
  h: number;
  cx: number;
  cy: number;
  scale: number;
  mobile: boolean;
}

type Pt = [number, number];
type Rng = () => number;

export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---- local-coordinate primitive generators (each returns `n` points) ---- */

function lineN(ax: number, ay: number, bx: number, by: number, n: number, rng: Rng, j = 0): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0.5 : i / (n - 1);
    out.push([ax + (bx - ax) * t + (rng() - 0.5) * j, ay + (by - ay) * t + (rng() - 0.5) * j]);
  }
  return out;
}

function polylineN(pts: Pt[], n: number, rng: Rng, j = 0): Pt[] {
  const segs: number[] = [];
  let total = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const d = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
    segs.push(d);
    total += d;
  }
  const out: Pt[] = [];
  for (let i = 0; i < n; i++) {
    let d = (i / Math.max(1, n - 1)) * total;
    let s = 0;
    while (s < segs.length - 1 && d > segs[s]) {
      d -= segs[s];
      s++;
    }
    const t = segs[s] > 0 ? d / segs[s] : 0;
    const a = pts[s];
    const b = pts[s + 1];
    out.push([a[0] + (b[0] - a[0]) * t + (rng() - 0.5) * j, a[1] + (b[1] - a[1]) * t + (rng() - 0.5) * j]);
  }
  return out;
}

function circleN(cx: number, cy: number, r: number, n: number, rng: Rng, a0 = 0, a1 = Math.PI * 2, j = 0): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = a0 + (a1 - a0) * (i / n);
    out.push([cx + Math.cos(a) * r + (rng() - 0.5) * j, cy + Math.sin(a) * r + (rng() - 0.5) * j]);
  }
  return out;
}

function discN(cx: number, cy: number, r: number, n: number, rng: Rng, bias = 0.5): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = rng() * Math.PI * 2;
    const rr = r * Math.pow(rng(), bias);
    out.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  return out;
}

function rectOutlineN(x: number, y: number, w: number, h: number, n: number, rng: Rng, j = 0): Pt[] {
  return polylineN([[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]], n, rng, j);
}

function triFillN(a: Pt, b: Pt, c: Pt, n: number, rng: Rng): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < n; i++) {
    let u = rng();
    let v = rng();
    if (u + v > 1) {
      u = 1 - u;
      v = 1 - v;
    }
    out.push([a[0] + u * (b[0] - a[0]) + v * (c[0] - a[0]), a[1] + u * (b[1] - a[1]) + v * (c[1] - a[1])]);
  }
  return out;
}

/* ---- packer: weighted strokes + ambient filler → exactly N points ---- */

interface Stroke {
  gen: (n: number) => Pt[];
  color: number;
  size: number; // 0..1
  alpha: number;
  weight: number;
}

function pack(
  N: number,
  ctx: LayoutCtx,
  structuralFrac: number,
  strokes: Stroke[],
  rng: Rng,
  fillerColor = C.SMOKE,
  fillerAlpha = 0.2,
): FormationData {
  const x = new Float32Array(N);
  const y = new Float32Array(N);
  const color = new Uint8Array(N);
  const size = new Float32Array(N);
  const alpha = new Float32Array(N);

  const Ns = Math.min(N, Math.floor(N * structuralFrac));
  const totalW = strokes.reduce((s, k) => s + k.weight, 0) || 1;

  let idx = 0;
  for (let k = 0; k < strokes.length; k++) {
    const stroke = strokes[k];
    const count =
      k === strokes.length - 1 ? Ns - idx : Math.min(Ns - idx, Math.round((Ns * stroke.weight) / totalW));
    if (count <= 0) continue;
    const pts = stroke.gen(count);
    for (let i = 0; i < pts.length && idx < Ns; i++, idx++) {
      x[idx] = ctx.cx + pts[i][0] * ctx.scale;
      y[idx] = ctx.cy + pts[i][1] * ctx.scale;
      color[idx] = stroke.color;
      size[idx] = stroke.size;
      alpha[idx] = stroke.alpha;
    }
  }

  // Remaining particles drift as a faint full-screen field so the void is never
  // empty around the emblem.
  const maxR = Math.hypot(ctx.w, ctx.h) * 0.55;
  for (let i = idx; i < N; i++) {
    const a = rng() * Math.PI * 2;
    const rr = Math.pow(rng(), 0.62) * maxR;
    x[i] = ctx.w / 2 + Math.cos(a) * rr;
    y[i] = ctx.h / 2 + Math.sin(a) * rr * 0.82;
    color[i] = rng() < 0.12 ? C.BONE : fillerColor;
    size[i] = 0.14 + rng() * 0.22;
    alpha[i] = fillerAlpha * (0.5 + rng() * 0.7);
  }
  return { x, y, color, size, alpha };
}

/* ====================================================================== */
/*  Formations                                                             */
/* ====================================================================== */

function ambient(N: number, ctx: LayoutCtx, rng: Rng): FormationData {
  const x = new Float32Array(N);
  const y = new Float32Array(N);
  const color = new Uint8Array(N);
  const size = new Float32Array(N);
  const alpha = new Float32Array(N);
  const maxR = Math.hypot(ctx.w, ctx.h) * 0.6;
  for (let i = 0; i < N; i++) {
    const a = rng() * Math.PI * 2;
    const rr = Math.pow(rng(), 0.58) * maxR; // denser toward center
    x[i] = ctx.w / 2 + Math.cos(a) * rr;
    y[i] = ctx.h / 2 + Math.sin(a) * rr * 0.9;
    const roll = rng();
    color[i] = roll < 0.06 ? C.PLUM : roll < 0.5 ? C.BONE : C.SMOKE;
    size[i] = 0.18 + rng() * 0.4;
    alpha[i] = 0.22 + rng() * 0.5;
  }
  return { x, y, color, size, alpha };
}

// 01 Cortex — a workspace window resolving into a connected context cluster.
function cortex(N: number, ctx: LayoutCtx, rng: Rng): FormationData {
  const W = 1.22,
    H = 0.84;
  // node-brain cluster (the context engine) sitting in the main panel
  const nodes: Pt[] = [];
  for (let i = 0; i < 9; i++) nodes.push([0.18 + (rng() - 0.5) * 0.9, 0.05 + (rng() - 0.5) * 0.78]);
  const connectors: Pt[][] = [];
  for (let i = 0; i < 7; i++) {
    const a = nodes[Math.floor(rng() * nodes.length)];
    const b = nodes[Math.floor(rng() * nodes.length)];
    connectors.push([a, b]);
  }
  return pack(
    N,
    ctx,
    0.84,
    [
      // window frame
      { gen: (n) => rectOutlineN(-W, -H, W * 2, H * 2, n, rng, 0.012), color: C.BONE, size: 0.42, alpha: 0.85, weight: 26 },
      // title bar + traffic lights
      { gen: (n) => lineN(-W, -H + 0.26, W, -H + 0.26, n, rng, 0.01), color: C.BONE, size: 0.36, alpha: 0.7, weight: 8 },
      { gen: (n) => [...discN(-W + 0.12, -H + 0.13, 0.035, n, rng)], color: C.PLUM, size: 0.5, alpha: 0.95, weight: 3 },
      // sidebar + split dividers
      { gen: (n) => lineN(-0.5, -H + 0.26, -0.5, H, n, rng, 0.01), color: C.SMOKE, size: 0.34, alpha: 0.55, weight: 8 },
      { gen: (n) => lineN(0.62, -H + 0.26, 0.62, H, n, rng, 0.01), color: C.SMOKE, size: 0.34, alpha: 0.55, weight: 7 },
      // sidebar file rows
      { gen: (n) => polylineN([[-0.9, -0.2], [-0.62, -0.2]], n, rng, 0.02), color: C.SMOKE, size: 0.3, alpha: 0.5, weight: 4 },
      { gen: (n) => polylineN([[-0.9, 0.02], [-0.62, 0.02]], n, rng, 0.02), color: C.SMOKE, size: 0.3, alpha: 0.5, weight: 4 },
      { gen: (n) => polylineN([[-0.9, 0.24], [-0.62, 0.24]], n, rng, 0.02), color: C.SMOKE, size: 0.3, alpha: 0.5, weight: 4 },
      // connectors between context nodes
      {
        gen: (n) => {
          const per = Math.max(1, Math.floor(n / connectors.length));
          let out: Pt[] = [];
          for (const [a, b] of connectors) out = out.concat(lineN(a[0], a[1], b[0], b[1], per, rng, 0.006));
          return out;
        },
        color: C.BONE,
        size: 0.24,
        alpha: 0.4,
        weight: 14,
      },
      // context nodes
      {
        gen: (n) => {
          const per = Math.max(1, Math.floor(n / nodes.length));
          let out: Pt[] = [];
          for (const nd of nodes) out = out.concat(discN(nd[0], nd[1], 0.05, per, rng, 0.7));
          return out;
        },
        color: C.PLUM,
        size: 0.6,
        alpha: 0.95,
        weight: 18,
      },
    ],
    rng,
  );
}

// 02 REGIME — a four-state HMM lattice over a candlestick stream.
function regime(N: number, ctx: LayoutCtx, rng: Rng): FormationData {
  const states: Pt[] = [
    [-0.72, -0.34],
    [0.0, -0.62],
    [0.72, -0.34],
    [0.0, 0.06],
  ];
  const arcs: Pt[][] = [
    [states[0], states[1]],
    [states[1], states[2]],
    [states[2], states[3]],
    [states[3], states[0]],
    [states[0], states[2]],
    [states[1], states[3]],
  ];
  // candlestick stream below the lattice
  const candles: Stroke[] = [];
  const nC = 18;
  for (let i = 0; i < nC; i++) {
    const cxp = -1.05 + (i / (nC - 1)) * 2.1;
    const base = 0.62;
    const hi = base - (0.06 + rng() * 0.22);
    const lo = base + (0.04 + rng() * 0.14);
    const up = rng() > 0.45;
    candles.push({
      gen: (n) => lineN(cxp, hi, cxp, lo, n, rng, 0.004),
      color: up ? C.AMBER : C.SMOKE,
      size: 0.3,
      alpha: 0.7,
      weight: 2.2,
    });
  }
  return pack(
    N,
    ctx,
    0.85,
    [
      // transition arcs
      {
        gen: (n) => {
          const per = Math.max(1, Math.floor(n / arcs.length));
          let out: Pt[] = [];
          for (const [a, b] of arcs) {
            const mx = (a[0] + b[0]) / 2 + (a[1] - b[1]) * 0.18;
            const my = (a[1] + b[1]) / 2 + (b[0] - a[0]) * 0.18;
            out = out.concat(polylineN([a, [mx, my], b], per, rng, 0.005));
          }
          return out;
        },
        color: C.BONE,
        size: 0.24,
        alpha: 0.42,
        weight: 22,
      },
      // four state nodes
      {
        gen: (n) => {
          const per = Math.max(1, Math.floor(n / states.length));
          let out: Pt[] = [];
          for (const s of states) out = out.concat(discN(s[0], s[1], 0.085, per, rng, 0.65));
          return out;
        },
        color: C.AMBER,
        size: 0.62,
        alpha: 0.95,
        weight: 26,
      },
      ...candles,
    ],
    rng,
  );
}

// 03 Knowledge Mapper — a force-directed concept graph settling into a galaxy.
function knowledge(N: number, ctx: LayoutCtx, rng: Rng): FormationData {
  const domains: Pt[] = [];
  const D = 6;
  for (let i = 0; i < D; i++) {
    const a = (i / D) * Math.PI * 2 + 0.3;
    const r = 0.78 + (rng() - 0.5) * 0.16;
    domains.push([Math.cos(a) * r, Math.sin(a) * r * 0.92]);
  }
  return pack(
    N,
    ctx,
    0.86,
    [
      // hub → domain edges
      {
        gen: (n) => {
          const per = Math.max(1, Math.floor(n / domains.length));
          let out: Pt[] = [];
          for (const d of domains) out = out.concat(lineN(0, 0, d[0], d[1], per, rng, 0.006));
          return out;
        },
        color: C.SMOKE,
        size: 0.22,
        alpha: 0.4,
        weight: 16,
      },
      // domain → leaf edges (star within each arm)
      {
        gen: (n) => {
          const per = Math.max(1, Math.floor(n / (domains.length * 3)));
          let out: Pt[] = [];
          for (const d of domains)
            for (let j = 0; j < 3; j++) {
              const lx = d[0] + (rng() - 0.5) * 0.5;
              const ly = d[1] + (rng() - 0.5) * 0.5;
              out = out.concat(lineN(d[0], d[1], lx, ly, per, rng, 0.005));
            }
          return out;
        },
        color: C.LICHEN,
        size: 0.22,
        alpha: 0.45,
        weight: 14,
      },
      // central hub
      { gen: (n) => discN(0, 0, 0.12, n, rng, 0.7), color: C.BONE, size: 0.6, alpha: 0.95, weight: 14 },
      // domain hubs
      {
        gen: (n) => {
          const per = Math.max(1, Math.floor(n / domains.length));
          let out: Pt[] = [];
          for (const d of domains) out = out.concat(discN(d[0], d[1], 0.07, per, rng, 0.7));
          return out;
        },
        color: C.LICHEN,
        size: 0.5,
        alpha: 0.92,
        weight: 18,
      },
      // scattered leaf concepts
      {
        gen: (n) => {
          const per = Math.max(1, Math.floor(n / domains.length));
          let out: Pt[] = [];
          for (const d of domains) out = out.concat(discN(d[0], d[1], 0.34, per, rng, 0.45));
          return out;
        },
        color: C.BONE,
        size: 0.32,
        alpha: 0.6,
        weight: 22,
      },
    ],
    rng,
  );
}

// 04 Forensics — a 256-bar Shannon-entropy histogram beneath a scanning reticle.
function forensics(N: number, ctx: LayoutCtx, rng: Rng): FormationData {
  const bars: Stroke[] = [];
  const nB = 56;
  for (let i = 0; i < nB; i++) {
    const t = i / (nB - 1);
    const bx = -1.18 + t * 2.36;
    const base = 0.86;
    // entropy-like profile: structured low ends, noisy high middle
    const env = Math.sin(t * Math.PI);
    const hgt = 0.12 + env * (0.55 + (rng() - 0.5) * 0.4);
    const high = hgt > 0.5;
    bars.push({
      gen: (n) => lineN(bx, base, bx, base - hgt, n, rng, 0.004),
      color: high ? C.AMBER : C.BONE,
      size: 0.3,
      alpha: 0.78,
      weight: 1.1 + hgt,
    });
  }
  return pack(
    N,
    ctx,
    0.88,
    [
      ...bars,
      // baseline
      { gen: (n) => lineN(-1.2, 0.88, 1.2, 0.88, n, rng, 0.004), color: C.SMOKE, size: 0.28, alpha: 0.5, weight: 6 },
      // scanning reticle ring
      { gen: (n) => circleN(0.0, -0.34, 0.42, n, rng, 0, Math.PI * 2, 0.006), color: C.AMBER, size: 0.34, alpha: 0.8, weight: 16 },
      { gen: (n) => circleN(0.0, -0.34, 0.27, n, rng, 0, Math.PI * 2, 0.006), color: C.AMBER, size: 0.26, alpha: 0.5, weight: 9 },
      // crosshair
      { gen: (n) => lineN(-0.6, -0.34, 0.6, -0.34, n, rng, 0.004), color: C.AMBER, size: 0.26, alpha: 0.6, weight: 6 },
      { gen: (n) => lineN(0.0, -0.84, 0.0, 0.16, n, rng, 0.004), color: C.AMBER, size: 0.26, alpha: 0.6, weight: 6 },
    ],
    rng,
  );
}

// 05 Chronicle — the Focus Stream ribbon, fraying from calm into turbulence.
function chronicle(N: number, ctx: LayoutCtx, rng: Rng): FormationData {
  const SAMPLES = 90;
  const topEdge: Pt[] = [];
  const botEdge: Pt[] = [];
  for (let i = 0; i < SAMPLES; i++) {
    const t = i / (SAMPLES - 1);
    const x = -1.2 + t * 2.4;
    const turb = Math.pow(t, 1.7); // turbulence grows to the right (entropy rising)
    const amp = 0.16 + turb * 0.34;
    const calm = Math.sin(t * 6.0) * 0.05 * (1 - turb);
    const noiseT = (rng() - 0.5) * amp * turb;
    const noiseB = (rng() - 0.5) * amp * turb;
    topEdge.push([x, -amp * 0.5 + calm + noiseT]);
    botEdge.push([x, amp * 0.5 + calm + noiseB]);
  }
  return pack(
    N,
    ctx,
    0.82,
    [
      { gen: (n) => polylineN(topEdge, n, rng, 0.006), color: C.LICHEN, size: 0.4, alpha: 0.85, weight: 24 },
      { gen: (n) => polylineN(botEdge, n, rng, 0.006), color: C.LICHEN, size: 0.4, alpha: 0.85, weight: 24 },
      // turbulent fray sparks on the right
      {
        gen: (n) => {
          const out: Pt[] = [];
          for (let i = 0; i < n; i++) {
            const t = 0.5 + rng() * 0.5;
            const x = -1.2 + t * 2.4;
            const amp = 0.16 + Math.pow(t, 1.7) * 0.46;
            out.push([x, (rng() - 0.5) * amp * 1.6]);
          }
          return out;
        },
        color: C.AMBER,
        size: 0.3,
        alpha: 0.6,
        weight: 16,
      },
      // calm body fill on the left
      {
        gen: (n) => {
          const out: Pt[] = [];
          for (let i = 0; i < n; i++) {
            const t = rng() * 0.5;
            const x = -1.2 + t * 2.4;
            const amp = 0.16 + Math.pow(t, 1.7) * 0.34;
            out.push([x, (rng() - 0.5) * amp]);
          }
          return out;
        },
        color: C.BONE,
        size: 0.26,
        alpha: 0.45,
        weight: 12,
      },
    ],
    rng,
  );
}

// 06 Unbored — a field of candidates collapsing to one confident pick.
function unbored(N: number, ctx: LayoutCtx, rng: Rng): FormationData {
  // candidate points fanning out, converging arrows, and a bright central pick.
  return pack(
    N,
    ctx,
    0.8,
    [
      // dim candidate cloud
      {
        gen: (n) => discN(0, 0, 1.15, n, rng, 0.42),
        color: C.SMOKE,
        size: 0.22,
        alpha: 0.32,
        weight: 26,
      },
      // convergence lines pointing inward
      {
        gen: (n) => {
          const spokes = 10;
          const per = Math.max(1, Math.floor(n / spokes));
          let out: Pt[] = [];
          for (let i = 0; i < spokes; i++) {
            const a = (i / spokes) * Math.PI * 2;
            const r0 = 1.0;
            out = out.concat(lineN(Math.cos(a) * r0, Math.sin(a) * r0, Math.cos(a) * 0.4, Math.sin(a) * 0.4, per, rng, 0.006));
          }
          return out;
        },
        color: C.BONE,
        size: 0.22,
        alpha: 0.4,
        weight: 14,
      },
      // confidence ring around the pick
      { gen: (n) => circleN(0, 0, 0.34, n, rng, 0, Math.PI * 2, 0.005), color: C.BONE, size: 0.34, alpha: 0.75, weight: 12 },
      // the one confident pick — a play triangle
      {
        gen: (n) => triFillN([-0.12, -0.18], [-0.12, 0.18], [0.2, 0], n, rng),
        color: C.PLUM,
        size: 0.62,
        alpha: 0.98,
        weight: 24,
      },
    ],
    rng,
  );
}

export const BUILDERS = {
  ambient,
  cortex,
  regime,
  knowledge,
  forensics,
  chronicle,
  unbored,
} as const;

export type FormationKey = keyof typeof BUILDERS;
