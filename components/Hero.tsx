"use client";

import Reveal from "./Reveal";
import { IDENTITY } from "@/lib/projects";

export default function Hero() {
  return (
    <section
      id="top"
      style={{ position: "relative", zIndex: 2, minHeight: "100vh", display: "flex", alignItems: "center" }}
    >
      <div className="mx-auto w-full" style={{ maxWidth: 1200, padding: "0 24px" }}>
        <div style={{ maxWidth: 620 }}>
          <Reveal>
            <p className="eyebrow text-bone" style={{ marginBottom: 24 }}>
              {IDENTITY.name} · {IDENTITY.location}
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <h1
              className="display text-bone"
              style={{
                fontSize: "clamp(44px, 7.4vw, 104px)",
                margin: 0,
                marginBottom: 28,
              }}
            >
              Raw signal into
              <br />
              legible intelligence.
            </h1>
          </Reveal>

          <Reveal delay={0.16}>
            <p className="body-copy" style={{ maxWidth: 520, marginBottom: 14 }}>
              {IDENTITY.role} at {IDENTITY.school} ({IDENTITY.years}). I build software I&apos;d
              actually use myself — six products unified by one idea: tools that turn messy raw
              signal into something you can read, rendered through custom-built visualization,
              never dropped-in libraries.
            </p>
          </Reveal>

          <Reveal delay={0.24}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 30, alignItems: "center" }}>
              <a
                href="#work"
                className="no-underline"
                style={{
                  background: "var(--color-plum)",
                  color: "var(--color-bone)",
                  fontWeight: 600,
                  fontSize: 12,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  padding: "14px 22px",
                  borderRadius: 24,
                }}
              >
                View the work
              </a>
              <a
                href={IDENTITY.resume}
                className="no-underline cta-ghost"
                style={{
                  color: "var(--color-bone)",
                  fontWeight: 600,
                  fontSize: 12,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  padding: "13px 22px",
                  borderRadius: 24,
                  border: "1px solid color-mix(in srgb, #ffffff 22%, transparent)",
                }}
              >
                Résumé
              </a>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  color: "var(--color-smoke)",
                  fontSize: 13,
                  letterSpacing: "0.02em",
                }}
              >
                <span
                  aria-hidden
                  style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--color-lichen)" }}
                />
                {IDENTITY.status}
              </span>
            </div>
          </Reveal>
        </div>
      </div>

      {/* scroll hint */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: 28,
          left: "50%",
          transform: "translateX(-50%)",
          color: "var(--color-smoke)",
          fontSize: 11,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
        }}
      >
        Scroll — the field assembles
      </div>

      <style jsx>{`
        .cta-ghost:hover {
          border-color: var(--color-amber) !important;
          color: var(--color-amber) !important;
        }
      `}</style>
    </section>
  );
}
