"use client";

import { useEffect, type RefObject } from "react";
import { pointer, subscribePointer } from "./pointer";

// Writes the normalized pointer (-1..1) to --mx / --my on the given element so
// CSS can drive subtle, weighty parallax. No-ops under prefers-reduced-motion.
export function useParallaxVars(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    return subscribePointer(() => {
      const p = pointer();
      el.style.setProperty("--mx", String(p.nx));
      el.style.setProperty("--my", String(p.ny));
    });
  }, [ref]);
}
