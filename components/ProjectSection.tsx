"use client";

import { useEffect, useRef } from "react";
import { clamp01, easeInCubic, easeOutCubic, subscribeProgress } from "@/lib/scrollProgress";
import type { FormationId, Project } from "@/lib/projects";

// Per-project "spatial personality": the angle/axis the copy arrives from and
// leaves toward. One visual language (depth + rotation), distinct per project so
// REGIME feels different to move through than Forensics or Cortex.
interface Spatial {
  ex: number; ey: number; ez: number; erx: number; ery: number; esk: number; es: number; // enter
  xx: number; xy: number; xz: number; xry: number; xs: number; // exit
}
const MOTION: Record<FormationId, Spatial> = {
  cortex:    { ex: -90, ey: 24, ez: -180, erx: 0,   ery: 18,  esk: 0,  es: 1,    xx: 0,  xy: -64, xz: -60, xry: -10, xs: 1 },
  regime:    { ex: 0,   ey: 96, ez: -200, erx: -16, ery: 0,   esk: 5,  es: 1,    xx: 0,  xy: -72, xz: 0,   xry: 0,   xs: 1 },
  knowledge: { ex: 70,  ey: 40, ez: -220, erx: 6,   ery: -18, esk: 0,  es: 1,    xx: 0,  xy: -64, xz: -40, xry: 9,   xs: 1 },
  forensics: { ex: -56, ey: -34, ez: -150, erx: 9,  ery: 11,  esk: -4, es: 1,    xx: 0,  xy: -52, xz: 0,   xry: -7,  xs: 1 },
  chronicle: { ex: -120, ey: 30, ez: -130, erx: 0,  ery: 13,  esk: 2,  es: 1,    xx: 56, xy: -50, xz: 0,   xry: -11, xs: 1 },
  unbored:   { ex: 0,   ey: 64, ez: -240, erx: 0,   ery: 0,   esk: 0,  es: 0.84, xx: 0,  xy: -58, xz: 0,   xry: 0,   xs: 1.06 },
  ambient:   { ex: 0,   ey: 40, ez: -120, erx: 0,   ery: 0,   esk: 0,  es: 1,    xx: 0,  xy: -50, xz: 0,   xry: 0,   xs: 1 },
};

// Text is fully readable by ENTER_END (formation is ~70% settled there, since
// the morph completes at MORPH_IN≈0.46). It holds, then exits as the scene changes.
const ENTER_END = 0.34;
const HOLD_END = 0.8;

export default function ProjectSection({ project, from }: { project: Project; from: FormationId }) {
  const outerRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const numeralRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
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
    const caption = captionRef.current;

    if (reduce) {
      if (text) { text.style.opacity = "1"; text.style.transform = "none"; }
      if (caption) caption.style.opacity = "1";
      return;
    }

    return subscribeProgress(el, (p) => {
      let transform: string;
      let opacity: number;

      if (p >= HOLD_END) {
        // exit — the scene changes: copy lifts and rotates away
        const xp = easeInCubic(clamp01((p - HOLD_END) / (1 - HOLD_END)));
        const s = 1 + (m.xs - 1) * xp;
        transform = `translate3d(${m.xx * xp}px, ${m.xy * xp}px, ${m.xz * xp}px) rotateY(${m.xry * xp}deg) scale(${s})`;
        opacity = 1 - xp;
      } else if (p <= ENTER_END) {
        // enter — arrives at an angle and corrects into reading position
        const e = easeOutCubic(clamp01(p / ENTER_END));
        const amt = 1 - e;
        const s = 1 - (1 - m.es) * amt;
        transform = `translate3d(${m.ex * amt}px, ${m.ey * amt}px, ${m.ez * amt}px) rotateX(${m.erx * amt}deg) rotateY(${m.ery * amt}deg) skewY(${m.esk * amt}deg) scale(${s})`;
        opacity = clamp01((p - 0.02) / (ENTER_END * 0.66));
      } else {
        transform = "translate3d(0,0,0)";
        opacity = 1;
      }

      if (text) {
        text.style.transform = transform;
        text.style.opacity = String(opacity);
      }
      // background numeral drifts slower — parallax depth as you move through
      if (numeral) {
        numeral.style.transform = `translate3d(0, ${(p - 0.5) * -120}px, 0)`;
        numeral.style.opacity = String(0.05 + (1 - Math.abs(p - 0.5) * 2) * 0.04);
      }
      // framing rule shifts perspective through the section
      if (frame) {
        frame.style.transform = `translateY(${(0.5 - p) * 80}px) scaleY(${0.6 + clamp01(p * 2) * 0.4})`;
        frame.style.opacity = String(clamp01((p - 0.05) / 0.2) * (1 - clamp01((p - 0.85) / 0.15)));
      }
      // caption appears only once the emblem has formed
      if (caption) caption.style.opacity = String(clamp01((p - 0.42) / 0.18) * (1 - clamp01((p - 0.85) / 0.15)));
    });
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
        {/* huge ghost numeral — a spatial depth marker behind the copy */}
        <div ref={numeralRef} className="proj-numeral" aria-hidden>
          {project.index}
        </div>

        <div className="mx-auto w-full" style={{ maxWidth: 1200, padding: "0 24px", position: "relative" }}>
          {/* clickable emblem hit-area (the particle formation lives behind, on the canvas) */}
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

          <div ref={textRef} className="project-text">
            {/* per-project framing rule in the project's accent */}
            <div ref={frameRef} className="proj-frame" style={{ background: `var(--color-${project.accent})` }} aria-hidden />

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
              <span aria-hidden style={{ width: 8, height: 8, background: `var(--color-${project.accent})`, transform: "rotate(45deg)" }} />
              <span className="eyebrow" style={{ color: "var(--color-smoke)" }}>
                {project.index} / 06
              </span>
            </div>

            <h2 className="display text-bone proj-name" style={{ margin: 0, marginBottom: 18 }}>
              {project.name}
            </h2>

            <p className="proj-tagline text-bone" style={{ margin: 0, marginBottom: 18 }}>
              {project.tagline}
            </p>

            <p className="body-copy" style={{ maxWidth: 480, marginBottom: 26 }}>
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

        <p ref={captionRef} className="form-caption" style={{ color: "var(--color-smoke)", opacity: 0 }}>
          {project.formCaption}
        </p>
      </div>

      <style jsx>{`
        .project-outer {
          position: relative;
          height: 240vh;
          z-index: 2;
        }
        .project-pin {
          position: sticky;
          top: 0;
          height: 100vh;
          display: flex;
          align-items: center;
          perspective: 1300px;
          perspective-origin: 30% 50%;
        }
        .project-text {
          max-width: 470px;
          position: relative;
          z-index: 3;
          transform-style: preserve-3d;
          will-change: transform, opacity;
          padding-left: 26px;
        }
        .proj-frame {
          position: absolute;
          left: 0;
          top: 4px;
          width: 2px;
          height: calc(100% - 8px);
          transform-origin: top center;
          opacity: 0;
        }
        .proj-numeral {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          font-size: 42vh;
          font-weight: 300;
          line-height: 1;
          letter-spacing: -0.05em;
          color: var(--color-bone);
          opacity: 0.05;
          z-index: 1;
          pointer-events: none;
          user-select: none;
        }
        .proj-name {
          font-size: clamp(46px, 6.6vw, 92px);
          line-height: 0.92;
          letter-spacing: -0.045em;
        }
        .proj-tagline {
          font-size: clamp(19px, 2.1vw, 24px);
          font-weight: 400;
          line-height: 1.3;
          letter-spacing: -0.01em;
          color: var(--color-bone);
        }
        .tech-chip {
          font-size: 12px;
          color: var(--color-ash);
          letter-spacing: 0.03em;
          padding: 7px 13px;
          border-radius: 24px;
          border: 1px solid color-mix(in srgb, #ffffff 14%, transparent);
          transition: border-color 0.45s cubic-bezier(0.16, 1, 0.3, 1),
            color 0.45s cubic-bezier(0.16, 1, 0.3, 1), transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .tech-chip:hover {
          border-color: color-mix(in srgb, #ffffff 42%, transparent);
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
          background: color-mix(in srgb, #000000 50%, transparent);
          transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1),
            color 0.5s cubic-bezier(0.16, 1, 0.3, 1);
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
          max-width: 260px;
          margin: 0;
          text-align: right;
          font-size: 12px;
          letter-spacing: 0.04em;
          line-height: 1.5;
          z-index: 3;
        }
        @media (max-width: 820px) {
          .project-outer {
            height: 200vh;
          }
          .project-pin {
            align-items: flex-end;
            perspective: 900px;
            perspective-origin: 50% 40%;
          }
          .project-text {
            max-width: 100%;
            padding-bottom: 4vh;
            padding-left: 18px;
          }
          .proj-name {
            font-size: 38px !important;
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
            font-size: 30vh;
            top: 22%;
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
