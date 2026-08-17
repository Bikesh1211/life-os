import type { MotifId } from "./motifs";

/**
 * A cinematic environment for one part of Life OS.
 *
 * Deliberately small. A context is *not* a second theme — it does not own
 * surfaces, text colours or borders, because those are what make the
 * application feel like one product and they belong to the global theme. A
 * context owns exactly two things: an accent, and a texture on the page behind
 * everything.
 *
 * That split is what keeps the ratio honest. Every module reads as itself, and
 * no module reads as a different application.
 */
export interface CinematicContext {
  id: string;
  /** The route prefixes this context claims. Longest match wins. */
  match: string[];
  /** What this environment is called, in the settings list. */
  title: string;
  /** The film or register it comes from. Named for the reader, never rendered as artwork. */
  inspiration: string;
  /** The one colour this area is identified by. */
  accent: string;
  /** Its lighter step, for hovers. */
  accentHover: string;
  /** Text placed on the accent. */
  accentContrast: string;
  /** Which pattern paints behind the page. */
  motif: MotifId;
  /** Relative strength, 0–1, before the intensity setting scales it. */
  weight: number;
}

/**
 * Every module in the application, audited from the route tree — 198 pages
 * under 46 top-level segments, plus the handful of sub-routes distinct enough
 * to deserve their own light.
 *
 * Resolution is longest-prefix, so `/tasks/projects` finds the workshop while
 * `/tasks/today` falls back to the mission board. Order in this array is the
 * order of the settings list, grouped the way the sidebar groups them.
 *
 * Two routes are deliberately absent and must stay that way: `/library` and
 * `/travel/explore` are full modes with their own scoped palettes (`.lb` and
 * `.xp`). They already do everything a context does and do it better. A context
 * layered over them would be a second atmosphere fighting the first.
 */
export const CONTEXTS: CinematicContext[] = [
  /* ── Command ─────────────────────────────────────────────────────────── */
  {
    id: "dashboard",
    match: ["/"],
    title: "Mission Control",
    inspiration: "Avengers",
    accent: "#6f9fd8",
    accentHover: "#8bb6e8",
    accentContrast: "#06101c",
    motif: "grid",
    weight: 0.8,
  },
  {
    id: "tasks",
    match: ["/tasks"],
    title: "The Mission",
    inspiration: "Mission: Impossible",
    accent: "#d8615c",
    accentHover: "#e8807b",
    accentContrast: "#0b0b0d",
    motif: "blueprint",
    weight: 1,
  },
  {
    id: "projects",
    match: ["/tasks/projects", "/field-roadmap"],
    title: "The Workshop",
    inspiration: "Iron Man",
    accent: "#e0674f",
    accentHover: "#ee8570",
    accentContrast: "#0b0b0d",
    motif: "schematic",
    weight: 1,
  },
  {
    id: "goals",
    match: ["/goals", "/milestones"],
    title: "Assembly",
    inspiration: "Avengers",
    accent: "#7fa9d6",
    accentHover: "#9cbfe4",
    accentContrast: "#080a10",
    motif: "grid",
    weight: 0.9,
  },
  {
    id: "strategy",
    match: ["/strategy", "/career"],
    title: "The War Room",
    inspiration: "Moneyball",
    accent: "#8fa4ba",
    accentHover: "#abbdd0",
    accentContrast: "#08090a",
    motif: "blueprint",
    weight: 0.85,
  },

  /* ── Writing and thought ─────────────────────────────────────────────── */
  {
    id: "journal",
    match: ["/journal"],
    title: "Nightfall",
    inspiration: "The Vampire Diaries",
    accent: "#b06a86",
    accentHover: "#c98aa3",
    accentContrast: "#0d0a10",
    motif: "mist",
    weight: 1,
  },
  {
    id: "quick-note",
    match: ["/quick-note"],
    title: "The Continental",
    inspiration: "John Wick",
    accent: "#c04a52",
    accentHover: "#d46a72",
    accentContrast: "#08080a",
    motif: "editorial",
    weight: 0.9,
  },
  {
    id: "notes",
    match: ["/notes"],
    title: "Baker Street",
    inspiration: "Sherlock",
    accent: "#6f9c7a",
    accentHover: "#8bb595",
    accentContrast: "#0a0d0a",
    motif: "paper",
    weight: 0.9,
  },
  {
    id: "writing",
    match: ["/creator-studio", "/studio", "/pages"],
    title: "Verse",
    inspiration: "Dead Poets Society",
    accent: "#c9a961",
    accentHover: "#dcc084",
    accentContrast: "#0e120e",
    motif: "paper",
    weight: 1,
  },
  {
    id: "knowledge",
    match: ["/knowledge", "/brain", "/vault"],
    title: "The Construct",
    inspiration: "The Matrix",
    accent: "#4fbf7f",
    accentHover: "#74d29c",
    accentContrast: "#050705",
    motif: "dataflow",
    weight: 1,
  },
  {
    id: "learning",
    match: ["/learning"],
    title: "Theory",
    inspiration: "The Theory of Everything",
    accent: "#c9b06a",
    accentHover: "#dcc78d",
    accentContrast: "#0a0e16",
    motif: "equations",
    weight: 0.95,
  },
  {
    id: "archive",
    match: ["/archive"],
    title: "The Stacks",
    inspiration: "The Name of the Rose",
    accent: "#a8956b",
    accentHover: "#c2b08c",
    accentContrast: "#0d0b08",
    motif: "shelf",
    weight: 0.85,
  },

  /* ── Reading, watching, listening ────────────────────────────────────── */
  {
    id: "reading",
    match: ["/library/tracker"],
    title: "The Enchanted Library",
    inspiration: "Beauty and the Beast",
    accent: "#c98f5e",
    accentHover: "#dcaa80",
    accentContrast: "#100a08",
    motif: "shelf",
    weight: 1,
  },
  {
    id: "movies",
    match: ["/movies"],
    title: "The Picture House",
    inspiration: "Classic cinema",
    accent: "#c9a961",
    accentHover: "#dcc084",
    accentContrast: "#0a0708",
    motif: "curtain",
    weight: 1,
  },
  {
    id: "music",
    match: ["/music"],
    title: "Knowhere",
    inspiration: "Guardians of the Galaxy",
    accent: "#a274d0",
    accentHover: "#bb95e0",
    accentContrast: "#0a0710",
    motif: "waves",
    weight: 1,
  },
  {
    id: "discovery",
    match: ["/discovery-feed", "/gamification"],
    title: "The Oasis",
    inspiration: "Ready Player One",
    accent: "#7d8fe0",
    accentHover: "#9aa8ea",
    accentContrast: "#080a12",
    motif: "dataflow",
    weight: 0.9,
  },

  /* ── The world outside ───────────────────────────────────────────────── */
  {
    id: "travel",
    match: ["/travel", "/travel-helper"],
    title: "The Expedition",
    inspiration: "Indiana Jones",
    accent: "#c08a45",
    accentHover: "#d4a468",
    accentContrast: "#0c0f0b",
    motif: "topographic",
    weight: 1,
  },
  {
    id: "places",
    match: ["/travel/visited", "/travel/wishlist", "/travel/bucket-list"],
    title: "Uncharted",
    inspiration: "National Treasure",
    accent: "#b08a52",
    accentHover: "#c7a473",
    accentContrast: "#0b0d09",
    motif: "compass",
    weight: 1,
  },
  {
    id: "photos",
    match: ["/travel/photos"],
    title: "Off-World",
    inspiration: "Blade Runner",
    accent: "#6fb8c9",
    accentHover: "#8fcedb",
    accentContrast: "#080b10",
    motif: "bokeh",
    weight: 1,
  },
  {
    id: "network",
    match: ["/network"],
    title: "Connections",
    inspiration: "The Social Network",
    accent: "#6f9fd8",
    accentHover: "#8bb6e8",
    accentContrast: "#06101c",
    motif: "grid",
    weight: 0.8,
  },

  /* ── Time ────────────────────────────────────────────────────────────── */
  {
    id: "timeline",
    match: ["/timeline"],
    title: "Spacetime",
    inspiration: "Interstellar · Tenet",
    accent: "#6fc3d8",
    accentHover: "#8fd6e8",
    accentContrast: "#050a10",
    motif: "rings",
    weight: 1,
  },
  {
    id: "memories",
    match: ["/timeline/memories", "/movies/memories", "/music/memories", "/network/memories"],
    title: "The Notebook",
    inspiration: "The Notebook",
    accent: "#c08a7a",
    accentHover: "#d4a89a",
    accentContrast: "#0f0a08",
    motif: "paper",
    weight: 1,
  },
  {
    id: "calendar",
    match: ["/calendar", "/countdown"],
    title: "Hours",
    inspiration: "About Time",
    accent: "#c08a6a",
    accentHover: "#d4a68b",
    accentContrast: "#0e0a08",
    motif: "rings",
    weight: 0.85,
  },
  {
    id: "time",
    match: ["/time", "/time-audit", "/routines"],
    title: "Inversion",
    inspiration: "Tenet",
    accent: "#7fa9d6",
    accentHover: "#9cbfe4",
    accentContrast: "#080a10",
    motif: "orbit",
    weight: 0.9,
  },

  /* ── Body and mind ───────────────────────────────────────────────────── */
  {
    id: "health",
    match: ["/health", "/wellness"],
    title: "Life Support",
    inspiration: "The Martian",
    accent: "#d89a5c",
    accentHover: "#e8b380",
    accentContrast: "#080b12",
    motif: "orbit",
    weight: 0.9,
  },
  {
    id: "training",
    match: ["/fitness", "/habits", "/discipline", "/curb"],
    title: "The Gym",
    inspiration: "Rocky · Creed",
    accent: "#c85a4e",
    accentHover: "#d97a6e",
    accentContrast: "#0a0908",
    motif: "scanlines",
    weight: 0.95,
  },
  {
    id: "mindset",
    match: ["/mindset", "/integrity"],
    title: "Limbo",
    inspiration: "Inception",
    accent: "#9a8fd0",
    accentHover: "#b3aae0",
    accentContrast: "#08080f",
    motif: "rings",
    weight: 0.9,
  },

  /* ── Things and money ────────────────────────────────────────────────── */
  {
    id: "finance",
    match: ["/finance", "/purchases"],
    title: "Wall Street",
    inspiration: "The Wolf of Wall Street",
    accent: "#4fa87f",
    accentHover: "#71bd98",
    accentContrast: "#060806",
    motif: "ledger",
    weight: 1,
  },
  {
    id: "inventory",
    match: ["/inventory"],
    title: "The Atelier",
    inspiration: "The Devil Wears Prada",
    accent: "#c9b48c",
    accentHover: "#dcc9a9",
    accentContrast: "#0a0a0a",
    motif: "editorial",
    weight: 0.9,
  },
  {
    id: "wardrobe",
    match: ["/inventory/wardrobe"],
    title: "Editorial",
    inspiration: "The Devil Wears Prada",
    accent: "#b0808c",
    accentHover: "#c79ea8",
    accentContrast: "#0a0a0a",
    motif: "editorial",
    weight: 0.9,
  },

  /* ── The system itself ───────────────────────────────────────────────── */
  {
    id: "settings",
    match: ["/settings", "/profile", "/feedback"],
    title: "The System",
    inspiration: "Black Mirror",
    accent: "#6fb8c9",
    accentHover: "#8fcedb",
    accentContrast: "#07090a",
    motif: "scanlines",
    weight: 0.6,
  },
];

const BY_ID = new Map(CONTEXTS.map((context) => [context.id, context]));

export function contextById(id: string): CinematicContext | undefined {
  return BY_ID.get(id);
}

/**
 * Which environment a path belongs to.
 *
 * Longest prefix wins, so a more specific route claims itself: `/inventory`
 * is the atelier, `/inventory/wardrobe` is the editorial. Matching is on
 * segment boundaries — `/timeline` must not claim `/timelinesomething`, and
 * more importantly `/travel` must not claim `/travel-helper` by accident of
 * string prefix. `/` matches only itself.
 */
export function contextForPath(pathname: string): CinematicContext | undefined {
  const path = pathname.replace(/\/+$/, "") || "/";

  let best: CinematicContext | undefined;
  let bestLength = -1;

  for (const context of CONTEXTS) {
    for (const prefix of context.match) {
      const matches =
        prefix === "/" ? path === "/" : path === prefix || path.startsWith(`${prefix}/`);
      if (matches && prefix.length > bestLength) {
        best = context;
        bestLength = prefix.length;
      }
    }
  }

  return best;
}

/**
 * Routes that own their atmosphere already and must not receive a context.
 *
 * The reading room and Explore Mode are full modes with scoped palettes of
 * their own (`.lb` and `.xp`). Painting a context behind either would put two
 * atmospheres on one page, and the one that lost would be the better one.
 *
 * `/library/tracker` is the exception inside the exception: it lives under
 * `/library` in the URL but it is an ordinary Mantine surface outside the
 * room's route group, so it takes the enchanted-library context like any other
 * page.
 */
const EXEMPT = ["/library", "/travel/explore"];
const NOT_EXEMPT = ["/library/tracker"];

export function isExemptPath(pathname: string): boolean {
  const path = pathname.replace(/\/+$/, "") || "/";
  const under = (prefix: string) => path === prefix || path.startsWith(`${prefix}/`);

  if (NOT_EXEMPT.some(under)) return false;
  return EXEMPT.some(under);
}
