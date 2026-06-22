"use client";

import { useEffect, useRef } from "react";
import { clamp01, easeInCubic, easeOutCubic, subscribeProgress } from "@/lib/scrollProgress";
import { pointer, subscribePointer } from "@/lib/pointer";
import type { FormationId, Project } from "@/lib/projects";

// Per-project "spatial personality": the direction the scene arrives from and
// recedes toward. Entrances dolly forward out of depth (−Z) with the project's
// own axis; exits push back into depth so the next scene reads as a cut, not a scroll.
interface Spatial {
  ex: number; ey: number; ez: number; erx: number; ery: number; esk: number; es: number; // enter
  xx: number; xy: number; xz: number; xry: number; xs: number; // exit (recede)
}
const MOTION: Record<FormationId, Spatial> = {
  cortex:    { ex: -110, ey: 26, ez: -340, erx: 0,   ery: 20,  esk: 0,  es: 0.9,  xx: -30, xy: -70, xz: -220, xry: -12, xs: 0.92 },
  regime:    { ex: 0,    ey: 120, ez: -360, erx: -18, ery: 0,  esk: 6,  es: 0.9,  xx: 0,   xy: -84, xz: -200, xry: 0,   xs: 0.92 },
  knowledge: { ex: 90,   ey: 44, ez: -380, erx: 7,   ery: -20, esk: 0,  es: 0.88, xx: 24,  xy: -70, xz: -220, xry: 10,  xs: 0.92 },
  forensics: { ex: -70,  ey: -40, ez: -320, erx: 10, ery: 12,  esk: -5, es: 0.9,  xx: 0,   xy: -60, xz: -200, xry: -8,  xs: 0.92 },
  chronicle: { ex: -150, ey: 32, ez: -300, erx: 0,   ery: 14,  esk: 3,  es: 0.9,  xx: 64,  xy: -56, xz: -190, xry: -12, xs: 0.92 },
  unbored:   { ex: 0,    ey: 70, ez: -420, erx: 0,   ery: 0,   esk: 0,  es: 0.8,  xx: 0,   xy: -64, xz: -200, xry: 0,   xs: 0.94 },
  ambient:   { ex: 0,    ey: 40, ez: -200, erx: 0,   ery: 0,   esk: 0,  es: 0.92, xx: 0,   xy: -54, xz: -160, xry: 0,   xs: 0.94 },
};

// Text settles (and is readable) by ENTER_END — formation is ~70% morphed there
// (the morph completes at MORPH_IN≈0.46). It holds, then the scene recedes.
const ENTER_END = 0.34;
const HOLD_END = 0.78;

export default function ProjectSection({ project, from }: { project: Project; from: FormationId }) {
  const outerRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const numeralRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const vignetteRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLParagraphElement>(null);

  const primary = project.links.find((l) => l.label === "Live demo") ?? project.links[0];
  const m = MOTION[project.id];

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const text = textRef.current;
    const numeral = numeralRef.current;
    const frame = frameRef.current;
    const vignette = vignetteRef.current;
    const caption = captionRef.current;

    if (reduce) {
      if (text) { text.style.opacity = "1"; text.style.transform = "none"; text.style.filter = "none"; }
      if (caption) caption.style.opacity = "1";
      if (vignette) vignette.style.opacity = "1";
      return;
    }

    // ---- mouse parallax: write normalized pointer to CSS vars on the root ----
    const unsubPointer = subscribePointer(() => {
      const p = pointer();
      el.style.setProperty("--mx", String(p.nx));
      el.style.setProperty("--my", String(p.ny));
    });

    // ---- scroll-driven spatial choreography (imperative, never transitioned) ----
    const unsubScroll = subscribeProgress(el, (p) => {
      let transform: string;
      let opacity: number;
      let blur: number;

      if (p >= HOLD_END) {
        const xp = easeInCubic(clamp01((p - HOLD_END) / (1 - HOLD_END)));
        const s = 1 + (m.xs - 1) * xp;
        transform = `translate3d(${m.xx * xp}px, ${m.xy * xp}px, ${m.xz * xp}px) rotateY(${m.xry * xp}deg) scale(${s})`;
        opacity = 1 - xp;
        blur = xp * 8;
      } else if (p <= ENTER_END) {
        const e = easeOutCubic(clamp01(p / ENTER_END));
        const amt = 1 - e;
        const s = 1 - (1 - m.es) * amt;
        transform = `translate3d(${m.ex * amt}px, ${m.ey * amt}px, ${m.ez * amt}px) rotateX(${m.erx * amt}deg) rotateY(${m.ery * amt}deg) skewY(${m.esk * amt}deg) scale(${s})`;
        opacity = clamp01((p - 0.01) / (ENTER_END * 0.6));
        blur = amt * 7;
      } else {
        transform = "translate3d(0,0,0)";
        opacity = 1;
        blur = 0;
      }

      if (text) {
        text.style.transform = transform;
        text.style.opacity = String(opacity);
        text.style.filter = blur > 0.15 ? `blur(${blur.toFixed(2)}px)` : "none";
      }
      // numeral: a slower, larger scene marker — grows as the section centers
      if (numeral) {
        const centered = 1 - Math.abs(p - 0.5) * 2;
        numeral.style.transform = `translate3d(0, ${(p - 0.5) * -150}px, 0) scale(${0.9 + clamp01(centered) * 0.16})`;
        numeral.style.opacity = String(0.045 + clamp01(centered) * 0.045);
      }
      // accent framing rule sweeps in with the copy
      if (frame) {
        frame.style.transform = `scaleY(${0.4 + clamp01(p * 2.4) * 0.6})`;
        frame.style.opacity = String(clamp01((p - 0.04) / 0.18) * (1 - clamp01((p - 0.84) / 0.16)));
      }
      // per-scene atmosphere: the accent glow rises as the scene becomes active
      if (vignette) {
        const inA = clamp01((p - 0.02) / 0.26);
        const outA = 1 - clamp01((p - 0.72) / 0.28);
        vignette.style.opacity = String(inA * outA);
      }
      if (caption) caption.style.opacity = String(clamp01((p - 0.42) / 0.18) * (1 - clamp01((p - 0.84) / 0.16)));
    });

    return () => {
      unsubPointer();
      unsubScroll();
    };
  }, [m, project.id]);

  return (
    <section
      ref={outerRef}
      data-morph-from={from}
      data-morph-to={project.id}
      id={project.index === "01" ? "work" : undefined}
      className="project-outer"
    >
      <div className="project-pin">
        {/* per-scene atmosphere — a low, intentional accent glow on the void */}
        <div
          ref={vignetteRef}
          className="scene-vignette"
          aria-hidden
          style={{
            background: `radial-gradient(58% 56% at var(--vx) 50%, color-mix(in srgb, var(--color-${project.accent}) 11%, transparent), transparent 72%)`,
            opacity: 0,
          }}
        />

        {/* huge ghost numeral — a slow spatial scene marker */}
        <div className="num-parallax" aria-hidden>
          <div ref={numeralRef} className="proj-numeral">
            {project.index}
          </div>
        </div>

        <div className="mx-auto w-full" style={{ maxWidth: 1200, padding: "0 24px", position: "relative" }}>
          <a
            href={primary.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${project.name} — ${primary.label}`}
            className="emblem-hit"
          >
            <span className="emblem-hint" aria-hidden>
              {primary.label} ↗
            </span>
          </a>

          <div className="text-parallax">
            <div ref={textRef} className="project-text">
              <div ref={frameRef} className="proj-frame" style={{ background: `var(--color-${project.accent})` }} aria-hidden />

              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <span aria-hidden className="eyebrow-tick" />
                <span className="eyebrow" style={{ color: "var(--color-smoke)" }}>
                  {project.index} <span style={{ opacity: 0.5 }}>/ 06</span>
                </span>
              </div>

              <h2 className="display text-bone proj-name" style={{ margin: 0, marginBottom: 18 }}>
                {project.name}
              </h2>

              <p className="proj-tagline" style={{ margin: 0, marginBottom: 20 }}>
                {project.tagline}
              </p>

              <p className="body-copy" style={{ maxWidth: 460, marginBottom: 28 }}>
                {project.description}
              </p>

              <ul className="tech-row" style={{ listStyle: "none", display: "flex", flexWrap: "wrap", gap: 8, padding: 0, margin: 0, marginBottom: 30 }}>
                {project.tech.map((t) => (
                  <li key={t} className="tech-chip">
                    {t}
                  </li>
                ))}
              </ul>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                {project.links.map((l) => {
                  const isPrimary = l.label === "Live demo";
                  return (
                    <a
                      key={l.href}
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={isPrimary ? "btn-primary no-underline" : "btn-ghost no-underline"}
                    >
                      {l.label} ↗
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <p ref={captionRef} className="form-caption" style={{ opacity: 0 }}>
          {project.formCaption}
        </p>
      </div>

      <style jsx>{`
        .project-outer {
          position: relative;
          height: 250vh;
          z-index: 2;
        }
        .project-pin {
          position: sticky;
          top: 0;
          height: 100vh;
          display: flex;
          align-items: center;
          perspective: 1400px;
          perspective-origin: 28% 48%;
        }
        .scene-vignette {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          --vx: 66%;
          transform: translate3d(calc(var(--mx, 0) * 16px), calc(var(--my, 0) * 12px), 0);
          transition: transform 1.1s var(--ease-out);
        }
        .num-parallax {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          transform: translate3d(calc(var(--mx, 0) * 30px), calc(var(--my, 0) * 24px), 0);
          transition: transform 0.9s var(--ease-out);
        }
        .proj-numeral {
          position: absolute;
          right: 8%;
          top: 50%;
          margin-top: -0.5em;
          font-size: 46vh;
          font-weight: 300;
          line-height: 1;
          letter-spacing: -0.06em;
          color: var(--color-bone);
          opacity: 0.05;
          user-select: none;
        }
        .text-parallax {
          position: relative;
          z-index: 3;
          transform: translate3d(calc(var(--mx, 0) * -10px), calc(var(--my, 0) * -7px), 0);
          transition: transform 0.6s var(--ease-out);
        }
        .project-text {
          max-width: 470px;
          position: relative;
          transform-style: preserve-3d;
          will-change: transform, opacity, filter;
          padding-left: 28px;
        }
        .proj-frame {
          position: absolute;
          left: 0;
          top: 6px;
          width: 2px;
          height: calc(100% - 12px);
          transform-origin: top center;
          opacity: 0;
        }
        .eyebrow-tick {
          width: 22px;
          height: 1px;
          background: var(--color-smoke);
          display: inline-block;
        }
        .proj-name {
          font-size: clamp(48px, 7vw, 100px);
          line-height: 0.9;
          letter-spacing: -0.052em;
          font-weight: 300;
        }
        .proj-tagline {
          font-size: clamp(19px, 2.05vw, 25px);
          font-weight: 400;
          line-height: 1.28;
          letter-spacing: -0.015em;
          color: var(--color-bone);
        }
        .tech-chip {
          font-size: 11.5px;
          color: var(--color-ash);
          letter-spacing: 0.04em;
          padding: 7px 13px;
          border-radius: 24px;
          border: 1px solid color-mix(in srgb, #ffffff 13%, transparent);
          transition: border-color 0.45s var(--ease-out), color 0.45s var(--ease-out),
            transform 0.45s var(--ease-out);
        }
        .tech-chip:hover {
          border-color: color-mix(in srgb, #ffffff 40%, transparent);
          color: var(--color-bone);
          transform: translateY(-2px);
        }
        .emblem-hit {
          position: absolute;
          right: 0;
          top: 8%;
          width: 52%;
          height: 84%;
          z-index: 2;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          cursor: pointer;
        }
        .emblem-hint {
          opacity: 0;
          transform: translateY(8px);
          font-size: 11px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--color-smoke);
          padding: 8px 16px;
          border-radius: 24px;
          border: 1px solid color-mix(in srgb, #ffffff 16%, transparent);
          background: color-mix(in srgb, #000000 55%, transparent);
          transition: opacity 0.5s var(--ease-out), transform 0.5s var(--ease-out), color 0.5s var(--ease-out);
        }
        .emblem-hit:hover .emblem-hint {
          opacity: 1;
          transform: translateY(0);
          color: var(--color-bone);
        }
        .form-caption {
          position: absolute;
          right: 5vw;
          bottom: 8vh;
          max-width: 250px;
          margin: 0;
          text-align: right;
          font-size: 11.5px;
          letter-spacing: 0.05em;
          line-height: 1.55;
          color: var(--color-smoke);
          z-index: 3;
        }
        @media (max-width: 820px) {
          .project-outer {
            height: 210vh;
          }
          .project-pin {
            align-items: flex-end;
            perspective: 1000px;
            perspective-origin: 50% 38%;
          }
          .text-parallax {
            transform: none;
          }
          .project-text {
            max-width: 100%;
            padding-bottom: 4vh;
            padding-left: 18px;
          }
          .proj-name {
            font-size: 40px !important;
            margin-bottom: 8px !important;
          }
          .proj-tagline {
            font-size: 18px !important;
          }
          .body-copy {
            font-size: 14.5px !important;
            margin-bottom: 18px !important;
          }
          .tech-row {
            margin-bottom: 18px !important;
          }
          .proj-numeral {
            font-size: 32vh;
            top: 24%;
            right: 4%;
          }
          .scene-vignette {
            --vx: 50%;
          }
          .emblem-hit {
            top: 3%;
            right: 5%;
            width: 90%;
            height: 28%;
          }
          .form-caption {
            right: 5vw;
            bottom: 2vh;
            max-width: 60%;
          }
        }
      `}</style>
    </section>
  );
}
