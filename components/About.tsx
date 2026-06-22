"use client";

import Reveal from "./Reveal";
import { IDENTITY } from "@/lib/projects";

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
  return (
    <section id="about" data-morph-from="unbored" data-morph-to="ambient" className="about-outer">
      <div className="about-pin">
        <div className="mx-auto w-full" style={{ maxWidth: 1200, padding: "0 24px" }}>
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
          display: flex;
          align-items: center;
        }
        .principles {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .principle {
          padding: 22px 22px 24px;
          border-radius: 24px;
          border: 1px solid color-mix(in srgb, #ffffff 12%, transparent);
          background: color-mix(in srgb, #000000 40%, transparent);
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
