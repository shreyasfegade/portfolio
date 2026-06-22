"use client";

import Reveal from "./Reveal";
import type { FormationId, Project } from "@/lib/projects";

export default function ProjectSection({
  project,
  from,
  isLast,
}: {
  project: Project;
  from: FormationId;
  isLast?: boolean;
}) {
  const primary = project.links.find((l) => l.label === "Live demo") ?? project.links[0];

  return (
    <section
      data-morph-from={from}
      data-morph-to={project.id}
      id={project.index === "01" ? "work" : undefined}
      className="project-outer"
    >
      <div className="project-pin">
        <div className="mx-auto w-full" style={{ maxWidth: 1200, padding: "0 24px", position: "relative" }}>
          {/* clickable emblem hit-area (the particle formation lives behind, on the canvas) */}
          <a
            href={primary.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${project.name} — ${primary.label}`}
            className="emblem-hit"
          />

          <div className="project-text">
            <Reveal>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
                <span
                  aria-hidden
                  style={{ width: 8, height: 8, background: `var(--color-${project.accent})`, transform: "rotate(45deg)" }}
                />
                <span className="eyebrow" style={{ color: "var(--color-smoke)" }}>
                  {project.index} / 06
                </span>
              </div>
            </Reveal>

            <Reveal delay={0.06}>
              <h2 className="display text-bone" style={{ fontSize: "clamp(38px, 5.4vw, 72px)", margin: 0, marginBottom: 16 }}>
                {project.name}
              </h2>
            </Reveal>

            <Reveal delay={0.12}>
              <p className="text-bone" style={{ fontSize: "clamp(18px,2vw,22px)", fontWeight: 400, lineHeight: 1.35, margin: 0, marginBottom: 18, letterSpacing: "0.01em" }}>
                {project.tagline}
              </p>
            </Reveal>

            <Reveal delay={0.18}>
              <p className="body-copy" style={{ maxWidth: 480, marginBottom: 24 }}>
                {project.description}
              </p>
            </Reveal>

            <Reveal delay={0.24}>
              <ul className="tech-row" style={{ listStyle: "none", display: "flex", flexWrap: "wrap", gap: 8, padding: 0, margin: 0, marginBottom: 28 }}>
                {project.tech.map((t) => (
                  <li
                    key={t}
                    style={{
                      fontSize: 12,
                      color: "var(--color-ash)",
                      letterSpacing: "0.02em",
                      padding: "6px 12px",
                      borderRadius: 24,
                      border: "1px solid color-mix(in srgb, #ffffff 12%, transparent)",
                    }}
                  >
                    {t}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.3}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                {project.links.map((l) => {
                  const isPrimary = l.label === "Live demo";
                  return (
                    <a
                      key={l.href}
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={isPrimary ? "no-underline" : "no-underline link-ghost"}
                      style={
                        isPrimary
                          ? {
                              background: "var(--color-plum)",
                              color: "var(--color-bone)",
                              fontWeight: 600,
                              fontSize: 12,
                              letterSpacing: "0.05em",
                              textTransform: "uppercase",
                              padding: "12px 20px",
                              borderRadius: 24,
                            }
                          : {
                              color: "var(--color-bone)",
                              fontWeight: 600,
                              fontSize: 12,
                              letterSpacing: "0.05em",
                              textTransform: "uppercase",
                              padding: "11px 20px",
                              borderRadius: 24,
                              border: "1px solid color-mix(in srgb, #ffffff 22%, transparent)",
                            }
                      }
                    >
                      {l.label} ↗
                    </a>
                  );
                })}
              </div>
            </Reveal>
          </div>
        </div>

        {/* caption naming what the particles have formed (anchored to the pinned viewport) */}
        <p className="form-caption" style={{ color: "var(--color-smoke)" }}>
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
        }
        .project-text {
          max-width: 460px;
          position: relative;
          z-index: 3;
        }
        .emblem-hit {
          position: absolute;
          right: 0;
          top: 8%;
          width: 52%;
          height: 84%;
          z-index: 2;
          display: block;
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
        .link-ghost:hover {
          border-color: var(--color-bone) !important;
        }
        @media (max-width: 820px) {
          .project-outer {
            height: 200vh;
          }
          .project-pin {
            align-items: flex-end;
          }
          .project-text {
            max-width: 100%;
            padding-bottom: 4vh;
          }
          /* tighten type + spacing so the copy clears the top emblem band */
          .project-text :global(h2) {
            font-size: 34px !important;
            margin-bottom: 8px !important;
          }
          .project-text :global(.body-copy) {
            font-size: 14.5px !important;
            margin-bottom: 18px !important;
          }
          .project-text :global(.tech-row) {
            margin-bottom: 18px !important;
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
