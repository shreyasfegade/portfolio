# Shreyas Fegade — Portfolio

A dark, cinematic single-page portfolio whose core visual system is a field of tiny
animated triangle particles. The particles start as an ambient field, then **morph six
times** as you scroll — once per project — each formation an abstract emblem derived from
that project's own hand-built visualization. The particles *are* the navigation through
the work.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** for design tokens (ported from the "Dala" reference system)
- A **hand-written `<canvas>` particle engine** — no animation or charting library.
  Scroll choreography is hand-rolled with `position: sticky` pins + a scroll-progress
  sampler (no scroll-jacking).

## How it works

| Module | Role |
|---|---|
| `lib/particles/engine.ts` | Particle pool, pre-rendered triangle sprites, the rAF render loop, staggered easing, idle drift, reduced-motion fallback. |
| `lib/particles/formations.ts` | Procedural target geometry for the ambient field and the six project emblems. |
| `lib/particles/scroll.ts` | Maps native scroll position onto `{ from, to, t }` for the engine. |
| `lib/projects.ts` | The six projects + identity as the single source of truth. |
| `components/*` | Nav, Hero, the reusable pinned `ProjectSection`, About, Contact. |

The morph order is: ambient → Cortex → REGIME → Knowledge Mapper → Forensics →
Chronicle → Unbored → (disperse back to ambient).

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build (statically prerendered)
npm run typecheck  # tsc --noEmit
```

## Deploy

Zero-config on **Vercel** — import the repo and deploy (Next.js preset, static output).

## Accessibility

All content is real DOM text and links (the canvas is decorative, `aria-hidden`).
`prefers-reduced-motion` disables the morph and renders each emblem statically.

## Note

The résumé button links to `/Shreyas-Fegade-Resume.pdf` — drop that file into `public/`
to wire it up.

---

© Shreyas Fegade · [shreyas.info](https://shreyas.info) · [github.com/shreyasfegade](https://github.com/shreyasfegade)
