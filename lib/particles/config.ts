// Tuning knobs for the particle system. Kept in one place so the whole field
// can be re-balanced without touching the engine or formation geometry.

export const MOBILE_BREAKPOINT = 820;

// Particle counts — desktop-first, scaled down on small screens for 60fps.
export const COUNT_DESKTOP = 5200;
export const COUNT_MOBILE = 2100;

// Triangle sprite base size (CSS px) the sprites are rendered at; particles
// are drawn scaled down from this for crispness.
export const SPRITE_BASE = 16;
export const ROTATION_FRAMES = 18; // pre-rendered rotation buckets per color

// Per-particle size range (CSS px) — the 2–6px the design system calls for.
export const SIZE_MIN = 2.0;
export const SIZE_MAX = 6.0;

// Morph: fraction of a section's pinned scroll spent assembling the emblem
// (the rest holds it while the text is read).
export const MORPH_IN = 0.46;

// Per-particle arrival stagger (fraction of the morph window). Higher = more
// "choreographed assembly", particles landing at visibly different times.
export const STAGGER = 0.38;

// How fast a particle eases toward its scrubbed target each frame.
export const LERP = 0.14;

// Idle drift amplitude (CSS px) so a settled field still breathes.
export const DRIFT_AMP = 1.4;
export const DRIFT_SPEED = 0.0006;

// Emblem placement within the viewport.
export const layout = (w: number, h: number) => {
  const mobile = w < MOBILE_BREAKPOINT;
  // On mobile the emblem lives in the top band and the text sits below it,
  // so it must be smaller and higher to avoid colliding with the copy.
  const scale = mobile ? Math.min(w, h) * 0.23 : Math.min(w, h) * 0.37;
  const cx = mobile ? w * 0.5 : w * 0.66;
  const cy = mobile ? h * 0.2 : h * 0.5;
  return { w, h, cx, cy, scale, mobile };
};

// Palette — bone, smoke, plum, amber, lichen. Indices used across the engine.
export const PALETTE = ["#ffffff", "#9a9a9a", "#8052ff", "#ffb829", "#15846e"];
export const C = { BONE: 0, SMOKE: 1, PLUM: 2, AMBER: 3, LICHEN: 4 } as const;
