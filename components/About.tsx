"use client";

import { useRef } from "react";
import Reveal from "./Reveal";
import { IDENTITY } from "@/lib/projects";
import { useParallaxVars } from "@/lib/useParallax";

const PRINCIPLES = [
  {
    k: "Custom visualization, always",
    v: "Every chart, graph and field is drawn from the data by hand — no Cytoscape, no charting library. The rendering is the product, not an afterthought.",
  },
  {
    k: "Signal in, legibility out",
    v: "EXIF bytes, market regimes, attention entropy, a dense PDF — each project takes a messy raw signal and makes it something a person can actually read.",
  },
  {
    k: "Treated as real products",
    v: "Real loading, empty and error states. Keyboard-first. Privacy by default. Built to be used, not just demoed.",
  },
];

// Pinned closing statement. As it pins, the particles disperse from the final
// emblem back to the ambient field (data-morph unbored → ambient).
export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  useParallaxVars(sectionRef);
  return (
    <section ref={sectionRef} id="about" data-morph-from="unbored" data-morph-to="ambient" className="about-outer">
      <div className="about-pin">
        <div className="mx-auto w-full about-inner" style={{ maxWidth: 1200, padding: "0 24px" }}>
          <div style={{ maxWidth: 760 }}>
            <Reveal>
              <p className="eyebrow text-bone" style={{ marginBottom: 24 }}>
                Who this is
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="display text-bone" style={{ fontSize: "clamp(32px,4.6vw,58px)", margin: 0, marginBottom: 26, lineHeight: 1.02 }}>
                {IDENTITY.name} — building tools that read the signal.
              </h2>
            </Reveal>
            <Reveal delay={0.14}>
              <p className="body-copy" style={{ maxWidth: 640, marginBottom: 40 }}>
                {IDENTITY.role} at {IDENTITY.school}, {IDENTITY.years}, based in {IDENTITY.location}. Six
                projects, one thesis: {IDENTITY.thesis}
              </p>
            </Reveal>

            <div className="principles">
              {PRINCIPLES.map((p, i) => (
                <Reveal key={p.k} delay={0.18 + i * 0.07}>
                  <div className="principle">
                    <h3 className="text-bone" style={{ fontSize: 16, fontWeight: 600, margin: 0, marginBottom: 10, letterSpacing: "0.01em" }}>
                      {p.k}
                    </h3>
                    <p style={{ color: "var(--color-ash)", fontSize: 14, lineHeight: 1.6, margin: 0 }}>{p.v}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .about-outer {
          position: relative;
          height: 200vh;
          z-index: 2;
        }
        .about-pin {
          position: sticky;
          top: 0;
          height: 100vh;
          height: 100dvh;
          display: flex;
          align-items: center;
        }
        .about-inner {
          transform: translate3d(calc(var(--mx, 0) * -8px), calc(var(--my, 0) * -6px), 0);
          transition: transform 0.7s var(--ease-out);
        }
        .principles {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          perspective: 1100px;
        }
        .principle {
          padding: 22px 22px 24px;
          border-radius: 24px;
          border: 1px solid color-mix(in srgb, #ffffff 12%, transparent);
          background: color-mix(in srgb, #000000 40%, transparent);
          transition: border-color 0.55s cubic-bezier(0.16, 1, 0.3, 1),
            transform 0.55s cubic-bezier(0.16, 1, 0.3, 1),
            background 0.55s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .principle:hover {
          border-color: color-mix(in srgb, #ffffff 32%, transparent);
          background: color-mix(in srgb, #000000 20%, transparent);
          transform: translateY(-4px) rotateX(3deg);
        }
        @media (max-width: 820px) {
          .about-outer {
            height: auto;
          }
          .about-pin {
            position: relative;
            height: auto;
            padding: 120px 0 80px;
          }
          .principles {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
