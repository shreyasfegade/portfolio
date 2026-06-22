// Maps native scroll position onto {from, to, t} for the particle engine.
//
// Each project section is a tall block whose inner content is `position: sticky`.
// While the block is pinned, its progress p ∈ [0,1] drives the morph: the first
// MORPH_IN fraction assembles this formation from the previous one, the rest holds.
// No scroll-jacking — the wheel stays native; we only read where it landed.

import { MORPH_IN } from "./config";
import type { FormationKey } from "./formations";

export interface MorphSection {
  el: HTMLElement;
  from: FormationKey;
  to: FormationKey;
}

export interface MorphState {
  from: FormationKey;
  to: FormationKey;
  t: number; // 0..1 (already raw; engine applies easing/stagger)
}

// smootherstep for a calmer scrub
function ease(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return c * c * c * (c * (c * 6 - 15) + 10);
}

export function createScrollSampler(sections: MorphSection[]) {
  return (): MorphState => {
    const scrollY = window.scrollY;
    const vh = window.innerHeight;

    // Before the first pinned section: pure ambient.
    const first = sections[0];
    if (!first) return { from: "ambient", to: "ambient", t: 0 };
    const firstTop = first.el.offsetTop;
    if (scrollY < firstTop) return { from: "ambient", to: "ambient", t: 0 };

    for (const s of sections) {
      const top = s.el.offsetTop;
      const pinRange = Math.max(1, s.el.offsetHeight - vh);
      if (scrollY >= top && scrollY < top + pinRange) {
        const p = (scrollY - top) / pinRange;
        const t = p < MORPH_IN ? ease(p / MORPH_IN) : 1;
        return { from: s.from, to: s.to, t };
      }
    }

    // Past the last pinned section: hold the final formation.
    const last = sections[sections.length - 1];
    return { from: last.to, to: last.to, t: 1 };
  };
}
