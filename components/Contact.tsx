"use client";

import Reveal from "./Reveal";
import { IDENTITY } from "@/lib/projects";

export default function Contact() {
  return (
    <section
      id="contact"
      style={{ position: "relative", zIndex: 2, minHeight: "92vh", display: "flex", alignItems: "center" }}
    >
      <div className="mx-auto w-full" style={{ maxWidth: 1200, padding: "120px 24px 64px" }}>
        <Reveal>
          <p className="eyebrow text-bone" style={{ marginBottom: 22 }}>
            {IDENTITY.status}
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <h2 className="display text-bone" style={{ fontSize: "clamp(40px,6.6vw,96px)", margin: 0, marginBottom: 36 }}>
            Let&apos;s build
            <br />
            something real.
          </h2>
        </Reveal>

        <Reveal delay={0.16}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 56 }}>
            <a
              href={`mailto:${IDENTITY.email}`}
              className="no-underline"
              style={{
                background: "var(--color-plum)",
                color: "var(--color-bone)",
                fontWeight: 600,
                fontSize: 13,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                padding: "15px 26px",
                borderRadius: 24,
              }}
            >
              {IDENTITY.email}
            </a>
            <a
              href={IDENTITY.github}
              target="_blank"
              rel="noopener noreferrer"
              className="no-underline c-ghost"
              style={ghost}
            >
              GitHub ↗
            </a>
            <a href={IDENTITY.resume} className="no-underline c-ghost" style={ghost}>
              Résumé ↓
            </a>
          </div>
        </Reveal>

        <Reveal delay={0.22}>
          <div
            className="hairline"
            style={{ borderLeft: "none", borderRight: "none", borderBottom: "none", paddingTop: 28, display: "flex", flexWrap: "wrap", gap: "8px 40px", color: "var(--color-smoke)", fontSize: 13 }}
          >
            <span>{IDENTITY.githubHandle}</span>
            <a href={IDENTITY.domainHref} target="_blank" rel="noopener noreferrer" className="no-underline foot-link" style={{ color: "var(--color-smoke)" }}>
              {IDENTITY.domain}
            </a>
            <span>{IDENTITY.location}</span>
            <span style={{ marginLeft: "auto" }}>© {new Date().getFullYear()} {IDENTITY.name}</span>
          </div>
        </Reveal>
      </div>

      <style jsx>{`
        .c-ghost:hover {
          border-color: var(--color-bone) !important;
        }
        .foot-link:hover {
          color: var(--color-bone) !important;
        }
      `}</style>
    </section>
  );
}

const ghost: React.CSSProperties = {
  color: "var(--color-bone)",
  fontWeight: 600,
  fontSize: 13,
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  padding: "14px 26px",
  borderRadius: 24,
  border: "1px solid color-mix(in srgb, #ffffff 22%, transparent)",
};
