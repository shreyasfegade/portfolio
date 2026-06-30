"use client";

import { useEffect, useRef, useState } from "react";
import { IDENTITY } from "@/lib/projects";
import { useParallaxVars } from "@/lib/useParallax";

export default function Hero() {
  const [loaded, setLoaded] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  useParallaxVars(sectionRef);

  useEffect(() => {
    // a beat after mount so the field is present first, then the copy arrives
    const t = requestAnimationFrame(() => requestAnimationFrame(() => setLoaded(true)));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <section ref={sectionRef} id="top" className={`hero ${loaded ? "loaded" : ""}`}>
      <div className="mx-auto w-full" style={{ maxWidth: 1200, padding: "0 24px" }}>
        <div className="hero-inner">
          <p className="eyebrow text-bone hero-line" style={{ "--i": 0 } as React.CSSProperties}>
            {IDENTITY.role} · {IDENTITY.school}
          </p>

          <h1 className="display text-bone hero-name hero-line" style={{ "--i": 1 } as React.CSSProperties}>
            Shreyas
            <br />
            Fegade
          </h1>

          <p className="hero-thesis hero-line" style={{ "--i": 2 } as React.CSSProperties}>
            Raw signal into <span className="text-bone">legible intelligence.</span>
          </p>

          <p
            className="body-copy hero-line"
            style={{ maxWidth: 500, marginTop: 26, "--i": 3 } as React.CSSProperties}
          >
            I build software I&apos;d actually use myself — six products unified by one idea: tools
            that turn messy raw signal into something you can read, rendered through custom-built
            visualization, never dropped-in libraries.
          </p>

          <div className="hero-line hero-cta" style={{ "--i": 4 } as React.CSSProperties}>
            <a href="#work" className="btn-primary no-underline">
              View the work
            </a>
            <a href={IDENTITY.resume} className="btn-ghost no-underline">
              Résumé
            </a>
            <span className="hero-status">
              <span aria-hidden className="hero-status-dot" />
              {IDENTITY.status}
            </span>
          </div>
        </div>
      </div>

      <div aria-hidden className="scroll-hint hero-line" style={{ "--i": 5 } as React.CSSProperties}>
        Scroll — the field assembles
      </div>

      <style jsx>{`
        .hero {
          position: relative;
          z-index: 2;
          min-height: 100vh;
          min-height: 100dvh;
          display: flex;
          align-items: center;
        }
        .hero-inner {
          transform: translate3d(calc(var(--mx, 0) * -9px), calc(var(--my, 0) * -6px), 0);
          transition: transform 0.7s var(--ease-out);
        }
        .hero-name {
          font-size: clamp(66px, 12.4vw, 176px);
          line-height: 0.82;
          letter-spacing: -0.058em;
          margin: 24px 0 0;
        }
        .hero-thesis {
          font-size: clamp(22px, 3vw, 38px);
          font-weight: 300;
          line-height: 1.12;
          letter-spacing: -0.025em;
          color: var(--color-smoke);
          margin: 32px 0 0;
        }
        .hero-cta {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
          align-items: center;
          margin-top: 34px;
        }
        .hero-status {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--color-smoke);
          font-size: 13px;
          letter-spacing: 0.02em;
        }
        .hero-status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--color-lichen);
          box-shadow: 0 0 0 0 color-mix(in srgb, var(--color-lichen) 70%, transparent);
          animation: pulse 2.6s var(--ease-in-out) infinite;
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--color-lichen) 55%, transparent); }
          50% { box-shadow: 0 0 0 6px transparent; }
        }
        .scroll-hint {
          position: absolute;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          color: var(--color-smoke);
          font-size: 11px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }

        /* ---- arrival: each line rises + unskews into place, staggered ---- */
        .hero-line {
          opacity: 0;
          transform: translateY(34px) skewY(2.4deg);
          transition: opacity 1s var(--ease-out), transform 1.1s var(--ease-out);
          transition-delay: calc(var(--i) * 0.11s + 0.15s);
          will-change: opacity, transform;
        }
        .hero.loaded .hero-line {
          opacity: 1;
          transform: translateY(0) skewY(0);
        }
        .scroll-hint.hero-line {
          transform: translateX(-50%) translateY(20px);
        }
        .hero.loaded .scroll-hint.hero-line {
          transform: translateX(-50%) translateY(0);
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-line {
            opacity: 1;
            transform: none;
            transition: none;
          }
          .hero.loaded .scroll-hint.hero-line,
          .scroll-hint.hero-line {
            transform: translateX(-50%);
          }
          .hero-status-dot {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}
