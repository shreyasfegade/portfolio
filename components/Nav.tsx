"use client";

import { useEffect, useState } from "react";
import { IDENTITY } from "@/lib/projects";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        backdropFilter: scrolled ? "blur(8px)" : "none",
        borderBottom: scrolled
          ? "1px solid color-mix(in srgb, #ffffff 10%, transparent)"
          : "1px solid transparent",
        background: scrolled ? "color-mix(in srgb, #000000 55%, transparent)" : "transparent",
        transition: "background 0.4s ease, border-color 0.4s ease, backdrop-filter 0.4s ease",
      }}
    >
      <div className="mx-auto flex items-center justify-between" style={{ maxWidth: 1200, padding: "16px 24px" }}>
        <a href="#top" className="flex items-center gap-[10px] no-underline" aria-label="Shreyas Fegade — home">
          <span
            aria-hidden
            style={{
              width: 9,
              height: 9,
              background: "var(--color-plum)",
              transform: "rotate(45deg)",
              display: "inline-block",
            }}
          />
          <span className="text-bone" style={{ fontWeight: 600, fontSize: 15, letterSpacing: "0.02em" }}>
            Shreyas Fegade
          </span>
        </a>

        <div className="flex items-center" style={{ gap: 28 }}>
          <div className="hidden items-center md:flex" style={{ gap: 28 }}>
            {[
              ["Work", "#work"],
              ["About", "#about"],
              ["Contact", "#contact"],
            ].map(([label, href]) => (
              <a
                key={href}
                href={href}
                className="no-underline navlink"
                style={{ color: "var(--color-smoke)", fontSize: 14, letterSpacing: "0.02em" }}
              >
                {label}
              </a>
            ))}
          </div>
          <a
            href={`mailto:${IDENTITY.email}`}
            className="no-underline"
            style={{
              background: "var(--color-plum)",
              color: "var(--color-bone)",
              fontWeight: 600,
              fontSize: 12,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              padding: "11px 18px",
              borderRadius: 24,
            }}
          >
            Get in touch
          </a>
        </div>
      </div>

      <style jsx>{`
        .navlink:hover {
          color: var(--color-bone) !important;
        }
      `}</style>
    </nav>
  );
}
