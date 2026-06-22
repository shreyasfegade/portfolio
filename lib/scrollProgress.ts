// DOM-only scroll-progress dispatcher.
//
// This is the scrollytelling layer's clock. It does NOT touch the particle
// engine or its sampler — it independently reads the SAME pinned sections'
// geometry and reports each one's local progress p ∈ [0,1] across its pin
// range, so DOM motion can be choreographed against the formation morph.
//
// Updates are coalesced to one rAF per scroll/resize burst and applied
// imperatively by subscribers (no React re-render per frame).

type Cb = (p: number) => void;

interface Sub {
  el: HTMLElement;
  cb: Cb;
}

const subs = new Set<Sub>();
let queued = false;

function compute() {
  queued = false;
  const vh = window.innerHeight;
  const scrollY = window.scrollY;
  for (const s of subs) {
    const top = s.el.offsetTop;
    const range = Math.max(1, s.el.offsetHeight - vh);
    let p = (scrollY - top) / range;
    p = p < 0 ? 0 : p > 1 ? 1 : p;
    s.cb(p);
  }
}

function onScroll() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(compute);
}

let bound = false;
function ensureBound() {
  if (bound || typeof window === "undefined") return;
  bound = true;
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
}

export function subscribeProgress(el: HTMLElement, cb: Cb): () => void {
  ensureBound();
  const sub: Sub = { el, cb };
  subs.add(sub);
  // prime once so the element is positioned correctly on mount
  requestAnimationFrame(compute);
  return () => {
    subs.delete(sub);
  };
}

/* ---- shared easing curves (no linear easing anywhere on this site) ---- */
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeInCubic = (t: number) => t * t * t;
export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
export const smootherstep = (t: number) => {
  const c = t < 0 ? 0 : t > 1 ? 1 : t;
  return c * c * c * (c * (c * 6 - 15) + 10);
};
export const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);
