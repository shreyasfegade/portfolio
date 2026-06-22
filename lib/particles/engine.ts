// The particle field render engine.
//
// Owns one full-viewport canvas, a pool of triangle particles, pre-rendered
// rotation sprites per palette color, and a single requestAnimationFrame loop.
// Each frame it asks the scroll sampler where the page is, computes a staggered
// eased target per particle, and eases the particle toward it — so the field
// continuously assembles, holds, and re-assembles as the user scrolls.

import {
  COUNT_DESKTOP,
  COUNT_MOBILE,
  DRIFT_AMP,
  DRIFT_SPEED,
  LERP,
  MOBILE_BREAKPOINT,
  PALETTE,
  ROTATION_FRAMES,
  SIZE_MAX,
  SIZE_MIN,
  SPRITE_BASE,
  STAGGER,
  layout,
} from "./config";
import { BUILDERS, FormationData, FormationKey, mulberry32 } from "./formations";
import type { MorphState } from "./scroll";

type Sampler = () => MorphState;

export class ParticleEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private dpr = 1;
  private w = 0;
  private h = 0;
  private n = 0;

  private px!: Float32Array;
  private py!: Float32Array;
  private seed!: Float32Array;
  private stagger!: Float32Array;
  private rotPhase!: Float32Array;
  private rotSpeed!: Float32Array;

  private formations: Record<string, FormationData> = {};
  private sprites: HTMLCanvasElement[][] = [];

  private sampler: Sampler = () => ({ from: "ambient", to: "ambient", t: 0 });
  private raf = 0;
  private running = false;
  private reduced = false;
  private startTime = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) throw new Error("2D canvas context unavailable");
    this.ctx = ctx;
    this.reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  }

  setSampler(s: Sampler) {
    this.sampler = s;
  }

  /* ---- sprites: ROTATION_FRAMES triangle bitmaps per palette color ---- */
  private buildSprites() {
    this.sprites = PALETTE.map((hex) => {
      const frames: HTMLCanvasElement[] = [];
      const dim = Math.ceil(SPRITE_BASE * this.dpr);
      for (let r = 0; r < ROTATION_FRAMES; r++) {
        const c = document.createElement("canvas");
        c.width = dim;
        c.height = dim;
        const g = c.getContext("2d")!;
        const cx = dim / 2;
        const cy = dim / 2;
        const rad = (SPRITE_BASE * this.dpr) / 2.3;
        const ang = (r / ROTATION_FRAMES) * Math.PI * 2;
        g.translate(cx, cy);
        g.rotate(ang);
        g.beginPath();
        for (let k = 0; k < 3; k++) {
          const a = ang * 0 + (k / 3) * Math.PI * 2 - Math.PI / 2;
          const x = Math.cos(a) * rad;
          const y = Math.sin(a) * rad;
          if (k === 0) g.moveTo(x, y);
          else g.lineTo(x, y);
        }
        g.closePath();
        g.fillStyle = hex;
        g.fill();
        frames.push(c);
      }
      return frames;
    });
  }

  /* ---- (re)build all formations for the current viewport ---- */
  private buildFormations() {
    const ctx = layout(this.w, this.h);
    const targetN = ctx.mobile ? COUNT_MOBILE : COUNT_DESKTOP;
    const reinit = targetN !== this.n;
    this.n = targetN;

    const keys = Object.keys(BUILDERS) as FormationKey[];
    for (const k of keys) {
      // Deterministic seed per formation → stable geometry across rebuilds.
      const rng = mulberry32(0x9e37 + k.length * 131 + keys.indexOf(k) * 2654435);
      this.formations[k] = BUILDERS[k](this.n, ctx, rng);
    }

    if (reinit || !this.px) {
      this.px = new Float32Array(this.n);
      this.py = new Float32Array(this.n);
      this.seed = new Float32Array(this.n);
      this.stagger = new Float32Array(this.n);
      this.rotPhase = new Float32Array(this.n);
      this.rotSpeed = new Float32Array(this.n);
      const rng = mulberry32(1337);
      const amb = this.formations["ambient"];
      for (let i = 0; i < this.n; i++) {
        this.px[i] = amb.x[i];
        this.py[i] = amb.y[i];
        this.seed[i] = rng() * Math.PI * 2;
        this.stagger[i] = rng() * STAGGER;
        this.rotPhase[i] = rng() * ROTATION_FRAMES;
        this.rotSpeed[i] = (rng() - 0.5) * 0.08; // slow, both directions
      }
    }
  }

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = w;
    this.h = h;
    this.canvas.width = Math.floor(w * this.dpr);
    this.canvas.height = Math.floor(h * this.dpr);
    this.canvas.style.width = w + "px";
    this.canvas.style.height = h + "px";
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.buildSprites();
    this.buildFormations();
    if (this.reduced) this.renderStatic();
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.startTime = performance.now();
    if (this.reduced) {
      this.renderStatic();
      window.addEventListener("scroll", this.onScrollStatic, { passive: true });
    } else {
      this.loop();
    }
  }

  private onScrollStatic = () => {
    if (this.staticQueued) return;
    this.staticQueued = true;
    requestAnimationFrame(() => {
      this.staticQueued = false;
      this.renderStatic();
    });
  };
  private staticQueued = false;

  /* ---- reduced-motion: snap to the active formation, no tween, no drift ---- */
  private renderStatic() {
    const m = this.sampler();
    const fromF = this.formations[m.from];
    const toF = this.formations[m.to];
    const te = m.t;
    this.ctx.clearRect(0, 0, this.w, this.h);
    for (let i = 0; i < this.n; i++) {
      const x = fromF.x[i] + (toF.x[i] - fromF.x[i]) * te;
      const y = fromF.y[i] + (toF.y[i] - fromF.y[i]) * te;
      this.px[i] = x;
      this.py[i] = y;
      this.draw(i, fromF, toF, te);
    }
    this.ctx.globalAlpha = 1;
  }

  private loop = () => {
    if (!this.running) return;
    const time = performance.now() - this.startTime;
    const m = this.sampler();
    const fromF = this.formations[m.from];
    const toF = this.formations[m.to];
    const denom = 1 - STAGGER;
    const settled = m.t > 0.999;

    this.ctx.clearRect(0, 0, this.w, this.h);

    for (let i = 0; i < this.n; i++) {
      // staggered, eased local progress → choreographed arrival
      let te = (m.t - this.stagger[i]) / denom;
      te = te < 0 ? 0 : te > 1 ? 1 : te;
      te = te * te * (3 - 2 * te);

      let targetX = fromF.x[i] + (toF.x[i] - fromF.x[i]) * te;
      let targetY = fromF.y[i] + (toF.y[i] - fromF.y[i]) * te;

      if (settled) {
        const ph = this.seed[i];
        targetX += Math.sin(time * DRIFT_SPEED + ph) * DRIFT_AMP;
        targetY += Math.cos(time * DRIFT_SPEED * 1.1 + ph) * DRIFT_AMP;
      }

      this.px[i] += (targetX - this.px[i]) * LERP;
      this.py[i] += (targetY - this.py[i]) * LERP;
      this.draw(i, fromF, toF, te);
    }
    this.ctx.globalAlpha = 1;
    this.raf = requestAnimationFrame(this.loop);
  };

  private draw(i: number, fromF: FormationData, toF: FormationData, te: number) {
    const ci = te >= 0.5 ? toF.color[i] : fromF.color[i];
    const sn = fromF.size[i] + (toF.size[i] - fromF.size[i]) * te;
    const al = fromF.alpha[i] + (toF.alpha[i] - fromF.alpha[i]) * te;
    const snC = sn < 0 ? 0 : sn > 1 ? 1 : sn;
    const sPx = SIZE_MIN + snC * (SIZE_MAX - SIZE_MIN);

    this.rotPhase[i] += this.rotSpeed[i];
    let rot = this.rotPhase[i] % ROTATION_FRAMES | 0;
    if (rot < 0) rot += ROTATION_FRAMES;

    this.ctx.globalAlpha = al < 0 ? 0 : al > 1 ? 1 : al;
    const spr = this.sprites[ci][rot];
    this.ctx.drawImage(spr, this.px[i] - sPx / 2, this.py[i] - sPx / 2, sPx, sPx);
  }

  destroy() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    window.removeEventListener("scroll", this.onScrollStatic);
  }
}

export { MOBILE_BREAKPOINT };
