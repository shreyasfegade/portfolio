// Single shared pointer signal — one window listener feeds both the particle
// engine (raw client px, for the magnetic field) and the DOM parallax layers
// (normalized -1..1 from viewport center). Keeping it in one place avoids a
// listener per section and keeps every layer reacting to the same source.

let cx = 0;
let cy = 0;
let nx = 0;
let ny = 0;
let active = false;

const subs = new Set<() => void>();

function notify() {
  for (const cb of subs) cb();
}

function onMove(e: PointerEvent) {
  cx = e.clientX;
  cy = e.clientY;
  nx = (cx / window.innerWidth) * 2 - 1;
  ny = (cy / window.innerHeight) * 2 - 1;
  active = true;
  notify();
}

function onLeave() {
  active = false;
  nx = 0;
  ny = 0;
  notify();
}

let bound = false;
function ensureBound() {
  if (bound || typeof window === "undefined") return;
  bound = true;
  window.addEventListener("pointermove", onMove, { passive: true });
  document.addEventListener("pointerleave", onLeave);
  window.addEventListener("blur", onLeave);
}

export interface Pointer {
  cx: number;
  cy: number;
  nx: number;
  ny: number;
  active: boolean;
}

export function pointer(): Pointer {
  return { cx, cy, nx, ny, active };
}

export function subscribePointer(cb: () => void): () => void {
  ensureBound();
  subs.add(cb);
  return () => {
    subs.delete(cb);
  };
}
