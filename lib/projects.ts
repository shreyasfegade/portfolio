// Single source of truth for the six projects.
// Every claim here is drawn from each project's actual README — no invented tech.

export type FormationId =
  | "ambient"
  | "cortex"
  | "regime"
  | "knowledge"
  | "forensics"
  | "chronicle"
  | "unbored";

export interface Project {
  id: FormationId;
  index: string; // "01".."06"
  name: string;
  tagline: string; // one short line
  description: string; // 2–3 sentences, accurate to the README
  tech: string[];
  links: { label: string; href: string }[];
  /** Accent the particle emblem leans on, drawn only from the palette. */
  accent: "plum" | "amber" | "lichen" | "bone";
  /** What the particle formation depicts, for the on-screen caption. */
  formCaption: string;
}

export const GITHUB = "https://github.com/shreyasfegade";

export const PROJECTS: Project[] = [
  {
    id: "cortex",
    index: "01",
    name: "Cortex",
    tagline: "An AI-native developer workspace in one window.",
    description:
      "Terminal, browser, file explorer, tasks and a multi-provider AI assistant collapsed into a single keyboard-driven Electron shell. A passive telemetry layer records the workday to local SQLite and feeds it straight back to the assistant as selectable context.",
    tech: ["Electron 35", "React 19", "TypeScript", "120 typed IPC channels", "node-pty", "SQLite (WAL)"],
    links: [{ label: "GitHub", href: `${GITHUB}/cortex` }],
    accent: "plum",
    formCaption: "A two-process workspace resolving into a context engine",
  },
  {
    id: "regime",
    index: "02",
    name: "REGIME",
    tagline: "Four hidden market regimes, classified and stress-tested.",
    description:
      "A 4-state Gaussian Hidden Markov Model reads return, volatility, volume and momentum to infer the unobserved regime a market is in — then measures the forward edge and runs a walk-forward, out-of-sample backtest. Built India-first for NSE/BSE, rendered through a hand-drawn HTML5 Canvas engine.",
    tech: ["Python", "Gaussian HMM", "FastAPI", "Canvas engine", "GSAP", "yfinance"],
    links: [{ label: "GitHub", href: `${GITHUB}/regime` }],
    accent: "amber",
    formCaption: "A four-state HMM lattice over a candlestick stream",
  },
  {
    id: "knowledge",
    index: "03",
    name: "Knowledge Mapper",
    tagline: "A dense PDF, rendered as a map of how its ideas connect.",
    description:
      "A three-stage LLM pipeline — global understanding, hierarchical concept extraction, topology inference — turns a document into a force-directed concept graph with typed, justified relationships. The renderer is a from-scratch 2D canvas engine with its own force simulation and spatial-hash hit testing. No graph library.",
    tech: ["Next.js 15", "React 19", "FastAPI", "Canvas force sim", "Spatial hash", "SSE", "SQLite"],
    links: [{ label: "GitHub", href: `${GITHUB}/knowledge-mapper` }],
    accent: "lichen",
    formCaption: "A force-directed concept graph settling into a galaxy",
  },
  {
    id: "forensics",
    index: "04",
    name: "Forensics",
    tagline: "See what your files are hiding — entirely in the browser.",
    description:
      "Drop any file to expose EXIF metadata, GPS leaks, true file type, byte-level Shannon entropy, embedded strings and appended steganographic payloads. A hand-rolled binary EXIF/TIFF parser and entropy chart, with zero uploads and zero dependencies — nothing ever leaves your machine.",
    tech: ["Vanilla JS", "ArrayBuffer + DataView", "Canvas", "Shannon entropy", "0 dependencies"],
    links: [
      { label: "Live demo", href: "https://forensics-bay.vercel.app" },
      { label: "GitHub", href: `${GITHUB}/forensics` },
    ],
    accent: "amber",
    formCaption: "A 256-bar entropy histogram beneath a scanning reticle",
  },
  {
    id: "chronicle",
    index: "05",
    name: "Chronicle",
    tagline: "Passive focus intelligence, measured as entropy.",
    description:
      "A Windows tray daemon samples the foreground window and turns attention into a single honest number — a Focus Score built from normalized Shannon entropy — rendered through a hand-built D3 Focus Stream where turbulence is the entropy itself. Native Win32 via ctypes, WAL-mode SQLite, everything local.",
    tech: ["Python", "Win32 ctypes", "Shannon entropy", "FastAPI", "SQLite (WAL)", "D3.js"],
    links: [{ label: "GitHub", href: `${GITHUB}/chronicle` }],
    accent: "lichen",
    formCaption: "A focus ribbon fraying from calm into turbulence",
  },
  {
    id: "unbored",
    index: "06",
    name: "Unbored",
    tagline: "The decision-paralysis killer — one confident pick.",
    description:
      "Pick a mood, tap once, get one thing to watch right now. A weighted scoring engine ranks candidates from TMDB and AniList across genre, keyword, mood, runtime and diversity, then a pluggable LLM writes one honest 'Why now?' sentence. Procedural poster art for artless titles; 302 tests.",
    tech: ["React 19", "TypeScript", "FastAPI", "TMDB + AniList", "Gemini / pluggable LLM"],
    links: [{ label: "GitHub", href: `${GITHUB}/unbored` }],
    accent: "plum",
    formCaption: "A field of candidates collapsing to a single confident pick",
  },
];

export const IDENTITY = {
  name: "Shreyas Fegade",
  role: "Second-year CSE",
  school: "Manipal University Jaipur",
  years: "2025–2029",
  location: "Jaipur, India",
  email: "shreyasf@icloud.com",
  github: GITHUB,
  githubHandle: "github.com/shreyasfegade",
  domain: "shreyas.info",
  domainHref: "https://shreyas.info",
  status: "Open for internship opportunities",
  thesis:
    "Tools that turn messy raw signal into legible intelligence — every visualization hand-built, never a dropped-in library.",
  resume: "/Shreyas-Fegade-Resume.pdf",
};
