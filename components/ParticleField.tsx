"use client";

import { useEffect, useRef } from "react";
import { ParticleEngine } from "@/lib/particles/engine";
import { createScrollSampler, MorphSection } from "@/lib/particles/scroll";
import type { FormationKey } from "@/lib/particles/formations";

// The fixed full-viewport canvas that renders the entire particle system.
// It discovers the morph sections from the DOM ([data-morph-to]) so the page
// markup stays the single source of truth for the scroll choreography.
export default function ParticleField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    let engine: ParticleEngine;
    try {
      engine = new ParticleEngine(canvas);
    } catch {
      return; // no 2D context — degrade to the plain DOM content
    }

    const build = () => {
      const els = Array.from(document.querySelectorAll<HTMLElement>("[data-morph-to]"));
      const sections: MorphSection[] = els.map((el) => ({
        el,
        from: (el.dataset.morphFrom || "ambient") as FormationKey,
        to: (el.dataset.morphTo || "ambient") as FormationKey,
      }));
      engine.setSampler(createScrollSampler(sections));
    };

    build();
    engine.resize();
    engine.start();

    let resizeRaf = 0;
    const onResize = () => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => engine.resize());
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(resizeRaf);
      engine.destroy();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
