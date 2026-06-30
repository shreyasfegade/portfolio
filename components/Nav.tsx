"use client";

import { useEffect, useRef, useState } from "react";
import { IDENTITY } from "@/lib/projects";

const LINKS: ReadonlyArray<readonly [string, string]> = [
  ["Work", "#work"],
  ["About", "#about"],
  ["Contact", "#contact"],
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // While the menu is open: lock body scroll, close on Escape, trap focus inside
  // the panel, move focus in on open, and return it to the toggle on close.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key === "Tab" && panelRef.current) {
        const f = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled])'
        );
        if (f.length === 0) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);

    const raf = requestAnimationFrame(() =>
      panelRef.current?.querySelector<HTMLElement>("a[href]")?.focus()
    );

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      cancelAnimationFrame(raf);
      toggleRef.current?.focus();
    };
  }, [open]);

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          // NOTE: never apply backdrop-filter here while the menu is open — a
          // backdrop-filter creates a containing block that would trap the
          // fixed-position overlay (rendered as a sibling below) inside the nav.
          backdropFilter: scrolled && !open ? "blur(8px)" : "none",
          borderBottom:
            scrolled && !open
              ? "1px solid color-mix(in srgb, #ffffff 10%, transparent)"
              : "1px solid transparent",
          background: scrolled && !open ? "color-mix(in srgb, #000000 55%, transparent)" : "transparent",
          transition:
            "background 0.5s cubic-bezier(0.16,1,0.3,1), border-color 0.5s cubic-bezier(0.16,1,0.3,1), backdrop-filter 0.5s cubic-bezier(0.16,1,0.3,1)",
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
              {LINKS.map(([label, href]) => (
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
              className="no-underline nav-cta hidden md:inline-flex"
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

            {/* Mobile-only menu toggle — desktop keeps the inline links above */}
            <button
              ref={toggleRef}
              type="button"
              className="nav-burger md:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((v) => !v)}
            >
              <span className={`burger ${open ? "is-open" : ""}`} aria-hidden>
                <span />
                <span />
                <span />
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Full-screen mobile menu — sibling of <nav> so no ancestor containing
          block can clip this fixed overlay. Pure void, restrained reveal. */}
      <div
        id="mobile-menu"
        ref={panelRef}
        className={`mobile-menu ${open ? "is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        aria-hidden={!open}
        inert={!open}
      >
        <div className="mobile-menu-inner">
          <ul className="m-list">
            {LINKS.map(([label, href], i) => (
              <li key={href}>
                <a
                  href={href}
                  className="m-link no-underline"
                  style={{ "--i": i } as React.CSSProperties}
                  onClick={() => setOpen(false)}
                >
                  <span className="m-idx" aria-hidden>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{label}</span>
                </a>
              </li>
            ))}
          </ul>

          <a
            href={`mailto:${IDENTITY.email}`}
            className="m-cta no-underline"
            style={{ "--i": LINKS.length } as React.CSSProperties}
            onClick={() => setOpen(false)}
          >
            Get in touch
          </a>
        </div>
      </div>

      <style jsx>{`
        .navlink {
          transition: color 0.45s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .navlink:hover {
          color: var(--color-bone) !important;
        }
        .nav-cta {
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), background 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .nav-cta:hover {
          transform: translateY(-1px);
          background: color-mix(in srgb, var(--color-plum) 86%, #ffffff) !important;
        }

        /* ---- mobile toggle: 44×44 hit area, three lines that morph to an X ---- */
        .nav-burger {
          width: 44px;
          height: 44px;
          margin-right: -10px;
          display: grid;
          place-items: center;
          background: none;
          border: 0;
          cursor: pointer;
          color: var(--color-bone);
          touch-action: manipulation;
          z-index: 60;
        }
        /* styled-jsx outranks Tailwind's md:hidden, so hide the burger here at
           the md breakpoint where the inline desktop links take over. */
        @media (min-width: 768px) {
          .nav-burger {
            display: none;
          }
        }
        .burger {
          position: relative;
          display: block;
          width: 22px;
          height: 14px;
        }
        .burger span {
          position: absolute;
          left: 0;
          width: 100%;
          height: 2px;
          background: var(--color-bone);
          border-radius: 2px;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s linear;
        }
        .burger span:nth-child(1) {
          top: 0;
        }
        .burger span:nth-child(2) {
          top: 6px;
        }
        .burger span:nth-child(3) {
          top: 12px;
        }
        .burger.is-open span:nth-child(1) {
          transform: translateY(6px) rotate(45deg);
        }
        .burger.is-open span:nth-child(2) {
          opacity: 0;
        }
        .burger.is-open span:nth-child(3) {
          transform: translateY(-6px) rotate(-45deg);
        }

        /* ---- full-screen overlay panel ---- */
        .mobile-menu {
          position: fixed;
          inset: 0;
          z-index: 45;
          /* strong scrim so foreground stays legible (UX: 40–60%+ black) */
          background: #000000;
          backdrop-filter: blur(16px);
          opacity: 0;
          visibility: hidden;
          transform: translateY(-1.5%);
          transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1),
            transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), visibility 0s linear 0.5s;
        }
        .mobile-menu.is-open {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
          transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1),
            transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), visibility 0s;
        }
        .mobile-menu-inner {
          height: 100%;
          height: 100dvh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 36px;
          padding: 88px 28px calc(48px + env(safe-area-inset-bottom));
          max-width: 560px;
          margin: 0 auto;
        }
        .m-list {
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .m-link {
          display: flex;
          align-items: baseline;
          gap: 18px;
          padding: 20px 0;
          min-height: 44px;
          border-bottom: 1px solid color-mix(in srgb, #ffffff 8%, transparent);
          color: var(--color-bone);
          font-size: clamp(34px, 11vw, 52px);
          font-weight: 300;
          letter-spacing: -0.04em;
          line-height: 1;
          transition: color 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .m-link:hover,
        .m-link:focus-visible {
          color: var(--color-plum);
        }
        .m-idx {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: var(--color-smoke);
          transform: translateY(-0.4em);
        }
        .m-cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          align-self: flex-start;
          min-height: 48px;
          background: var(--color-plum);
          color: var(--color-bone);
          font-weight: 600;
          font-size: 12px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          padding: 15px 26px;
          border-radius: 24px;
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), background 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .m-cta:hover,
        .m-cta:focus-visible {
          transform: translateY(-1px);
          background: color-mix(in srgb, var(--color-plum) 86%, #ffffff);
        }

        /* staggered entrance — transform/opacity only */
        .m-link,
        .m-cta {
          opacity: 0;
          transform: translateY(14px);
          transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1),
            transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), color 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          transition-delay: calc(var(--i) * 0.06s + 0.1s);
        }
        .mobile-menu.is-open .m-link,
        .mobile-menu.is-open .m-cta {
          opacity: 1;
          transform: translateY(0);
        }

        @media (prefers-reduced-motion: reduce) {
          .burger span,
          .mobile-menu,
          .m-link,
          .m-cta {
            transition: opacity 0.001ms, visibility 0s;
          }
          .mobile-menu.is-open .m-link,
          .mobile-menu.is-open .m-cta {
            transform: none;
          }
        }
      `}</style>
    </>
  );
}
