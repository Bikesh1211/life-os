import type { MotifId } from "./motifs";
import type { ContextPalette } from "./palette";

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
  /** A line in the room's own voice, shown on its chrome band. */
  tagline: string;
  /** Whether the room is lit or dark. */
  scheme: "light" | "dark";
  /**
   * The five colours the room is built from. Everything else — secondary text,
   * borders, hovers, status, shadow — is derived in `palette.ts`, measured
   * against AA and pulled back until it passes.
   */
  palette: ContextPalette;
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
    tagline: "Command deck",
    scheme: "dark",
    palette: {
      background: "#080b12",
      surface: "#0e1320",
      surfaceElevated: "#141a2a",
      ink: "#e4ecf7",
      accent: "#6f9fd8",
    },
    motif: "grid",
    weight: 0.8,
  },
  {
    id: "tasks",
    match: ["/tasks"],
    title: "The Mission",
    inspiration: "Mission: Impossible",
    tagline: "Your mission, should you choose to accept it",
    scheme: "dark",
    palette: {
      background: "#0c0b0c",
      surface: "#141315",
      surfaceElevated: "#1c1b1e",
      ink: "#f0eef0",
      accent: "#d8615c",
    },
    motif: "blueprint",
    weight: 1,
  },
  {
    id: "projects",
    match: ["/tasks/projects", "/field-roadmap"],
    title: "The Workshop",
    inspiration: "Iron Man",
    tagline: "Build something extraordinary",
    scheme: "dark",
    palette: {
      background: "#0d0a09",
      surface: "#161110",
      surfaceElevated: "#1f1917",
      ink: "#f2ede9",
      accent: "#e0674f",
    },
    motif: "schematic",
    weight: 1,
  },
  {
    id: "goals",
    match: ["/goals", "/milestones"],
    title: "Assembly",
    inspiration: "Avengers",
    tagline: "Assemble your future",
    scheme: "dark",
    palette: {
      background: "#080a11",
      surface: "#0f1320",
      surfaceElevated: "#161c2b",
      ink: "#e6ecf6",
      accent: "#7fa9d6",
    },
    motif: "grid",
    weight: 0.9,
  },
  {
    id: "strategy",
    match: ["/strategy", "/career"],
    title: "The War Room",
    inspiration: "Moneyball",
    tagline: "Play the long game",
    scheme: "dark",
    palette: {
      background: "#0a0b0d",
      surface: "#121417",
      surfaceElevated: "#1a1d21",
      ink: "#eef0f3",
      accent: "#8fa4ba",
    },
    motif: "blueprint",
    weight: 0.85,
  },

  /* ── Writing and thought ─────────────────────────────────────────────── */
  {
    id: "journal",
    match: ["/journal"],
    title: "Nightfall",
    inspiration: "The Vampire Diaries",
    tagline: "The night has a thousand eyes",
    scheme: "dark",
    palette: {
      background: "#0c0910",
      surface: "#140f19",
      surfaceElevated: "#1c1622",
      ink: "#ece4f0",
      accent: "#b06a86",
    },
    motif: "mist",
    weight: 1,
  },
  {
    id: "quick-note",
    match: ["/quick-note"],
    title: "The Continental",
    inspiration: "John Wick",
    tagline: "Fast. Precise. Focused.",
    scheme: "dark",
    palette: {
      background: "#08080a",
      surface: "#101012",
      surfaceElevated: "#181819",
      ink: "#f2f1f0",
      accent: "#c04a52",
    },
    motif: "editorial",
    weight: 0.9,
  },
  {
    id: "notes",
    match: ["/notes"],
    title: "Baker Street",
    inspiration: "Sherlock",
    tagline: "The game is afoot",
    scheme: "dark",
    palette: {
      background: "#0a0d0b",
      surface: "#111512",
      surfaceElevated: "#181e1a",
      ink: "#e9ede9",
      accent: "#6f9c7a",
    },
    motif: "paper",
    weight: 0.9,
  },
  {
    id: "writing",
    match: ["/creator-studio", "/studio", "/pages"],
    title: "Verse",
    inspiration: "Dead Poets Society",
    tagline: "O Captain! My Captain!",
    scheme: "dark",
    palette: {
      background: "#0b0f0c",
      surface: "#121813",
      surfaceElevated: "#1a211b",
      ink: "#ece7d9",
      accent: "#c9a961",
    },
    motif: "paper",
    weight: 1,
  },
  {
    id: "knowledge",
    match: ["/knowledge", "/brain", "/vault"],
    title: "The Construct",
    inspiration: "The Matrix",
    tagline: "There is no spoon",
    scheme: "dark",
    palette: {
      background: "#050705",
      surface: "#0c110d",
      surfaceElevated: "#131a14",
      ink: "#dbe6db",
      accent: "#4fbf7f",
    },
    motif: "dataflow",
    weight: 1,
  },
  {
    id: "learning",
    match: ["/learning"],
    title: "Theory",
    inspiration: "The Theory of Everything",
    tagline: "Look up at the stars",
    scheme: "dark",
    palette: {
      background: "#080c14",
      surface: "#0f1522",
      surfaceElevated: "#161d2d",
      ink: "#eae6d8",
      accent: "#c9b06a",
    },
    motif: "equations",
    weight: 0.95,
  },
  {
    id: "archive",
    match: ["/archive"],
    title: "The Stacks",
    inspiration: "The Name of the Rose",
    tagline: "The stacks remember",
    scheme: "dark",
    palette: {
      background: "#0c0a07",
      surface: "#13100c",
      surfaceElevated: "#1b1712",
      ink: "#e9e2d4",
      accent: "#a8956b",
    },
    motif: "shelf",
    weight: 0.85,
  },

  /* ── Reading, watching, listening ────────────────────────────────────── */
  {
    id: "reading",
    match: ["/library/tracker"],
    title: "The Enchanted Library",
    inspiration: "Beauty and the Beast",
    tagline: "A library, and a rose",
    scheme: "dark",
    palette: {
      background: "#100a08",
      surface: "#18100c",
      surfaceElevated: "#211712",
      ink: "#f0e4d6",
      accent: "#c98f5e",
    },
    motif: "shelf",
    weight: 1,
  },
  {
    id: "movies",
    match: ["/movies"],
    title: "The Picture House",
    inspiration: "Classic cinema",
    tagline: "The house lights are down",
    scheme: "dark",
    palette: {
      background: "#0a0708",
      surface: "#120d0f",
      surfaceElevated: "#1a1316",
      ink: "#f0e8dc",
      accent: "#c9a961",
    },
    motif: "curtain",
    weight: 1,
  },
  {
    id: "music",
    match: ["/music"],
    title: "Knowhere",
    inspiration: "Guardians of the Galaxy",
    tagline: "Hooked on a feeling",
    scheme: "dark",
    palette: {
      background: "#0a0712",
      surface: "#110d1c",
      surfaceElevated: "#191428",
      ink: "#ebe4f4",
      accent: "#a274d0",
    },
    motif: "waves",
    weight: 1,
  },
  {
    id: "discovery",
    match: ["/discovery-feed", "/gamification"],
    title: "The Oasis",
    inspiration: "Ready Player One",
    tagline: "Ready player one",
    scheme: "dark",
    palette: {
      background: "#080a12",
      surface: "#0f121e",
      surfaceElevated: "#161b2b",
      ink: "#e6e9f6",
      accent: "#7d8fe0",
    },
    motif: "dataflow",
    weight: 0.9,
  },

  /* ── The world outside ───────────────────────────────────────────────── */
  {
    id: "travel",
    match: ["/travel", "/travel-helper"],
    title: "The Expedition",
    inspiration: "Indiana Jones",
    tagline: "It belongs in a museum",
    scheme: "dark",
    palette: {
      background: "#0b0e0a",
      surface: "#121710",
      surfaceElevated: "#1a2018",
      ink: "#ede7d6",
      accent: "#c08a45",
    },
    motif: "topographic",
    weight: 1,
  },
  {
    id: "places",
    match: ["/travel/visited", "/travel/wishlist", "/travel/bucket-list"],
    title: "Uncharted",
    inspiration: "National Treasure",
    tagline: "X marks the spot",
    scheme: "dark",
    palette: {
      background: "#0b0d09",
      surface: "#12150f",
      surfaceElevated: "#1a1e16",
      ink: "#ebe4d4",
      accent: "#b08a52",
    },
    motif: "compass",
    weight: 1,
  },
  {
    id: "photos",
    match: ["/travel/photos"],
    title: "Off-World",
    inspiration: "Blade Runner",
    tagline: "All those moments",
    scheme: "dark",
    palette: {
      background: "#070a10",
      surface: "#0e131c",
      surfaceElevated: "#151b28",
      ink: "#e4ecf3",
      accent: "#6fb8c9",
    },
    motif: "bokeh",
    weight: 1,
  },
  {
    id: "network",
    match: ["/network"],
    title: "Connections",
    inspiration: "The Social Network",
    tagline: "The people you keep",
    scheme: "dark",
    palette: {
      background: "#08090d",
      surface: "#101218",
      surfaceElevated: "#171a22",
      ink: "#e9ecf2",
      accent: "#6f9fd8",
    },
    motif: "grid",
    weight: 0.8,
  },

  /* ── Time ────────────────────────────────────────────────────────────── */
  {
    id: "timeline",
    match: ["/timeline"],
    title: "Spacetime",
    inspiration: "Interstellar · Tenet",
    tagline: "Time is relative",
    scheme: "dark",
    palette: {
      background: "#04070d",
      surface: "#0a0f18",
      surfaceElevated: "#101724",
      ink: "#e2ecf4",
      accent: "#6fc3d8",
    },
    motif: "rings",
    weight: 1,
  },
  {
    id: "memories",
    match: ["/timeline/memories", "/movies/memories", "/music/memories", "/network/memories"],
    title: "The Notebook",
    inspiration: "The Notebook",
    tagline: "It still isn't over",
    scheme: "dark",
    palette: {
      background: "#0f0a08",
      surface: "#17100d",
      surfaceElevated: "#201814",
      ink: "#f0e6da",
      accent: "#c08a7a",
    },
    motif: "paper",
    weight: 1,
  },
  {
    id: "calendar",
    match: ["/calendar", "/countdown"],
    title: "Hours",
    inspiration: "About Time",
    tagline: "We're all travelling through time",
    scheme: "dark",
    palette: {
      background: "#0e0a08",
      surface: "#16110d",
      surfaceElevated: "#1e1813",
      ink: "#efe6da",
      accent: "#c08a6a",
    },
    motif: "rings",
    weight: 0.85,
  },
  {
    id: "time",
    match: ["/time", "/time-audit", "/routines"],
    title: "Inversion",
    inspiration: "Tenet",
    tagline: "What happened, happened",
    scheme: "dark",
    palette: {
      background: "#070a10",
      surface: "#0e131c",
      surfaceElevated: "#151b27",
      ink: "#e5ebf4",
      accent: "#7fa9d6",
    },
    motif: "orbit",
    weight: 0.9,
  },

  /* ── Body and mind ───────────────────────────────────────────────────── */
  {
    id: "health",
    match: ["/health", "/wellness"],
    title: "Life Support",
    inspiration: "The Martian",
    tagline: "Work the problem",
    scheme: "dark",
    palette: {
      background: "#070a12",
      surface: "#0e131e",
      surfaceElevated: "#151b2b",
      ink: "#eae7de",
      accent: "#d89a5c",
    },
    motif: "orbit",
    weight: 0.9,
  },
  {
    id: "training",
    match: ["/fitness", "/habits", "/discipline", "/curb"],
    title: "The Gym",
    inspiration: "Rocky · Creed",
    tagline: "It ain't about how hard you hit",
    scheme: "dark",
    palette: {
      background: "#0a0908",
      surface: "#121010",
      surfaceElevated: "#1a1717",
      ink: "#f0edea",
      accent: "#c85a4e",
    },
    motif: "scanlines",
    weight: 0.95,
  },
  {
    id: "mindset",
    match: ["/mindset", "/integrity"],
    title: "Limbo",
    inspiration: "Inception",
    tagline: "Dream a little bigger",
    scheme: "dark",
    palette: {
      background: "#08080f",
      surface: "#0f0f19",
      surfaceElevated: "#161624",
      ink: "#e8e6f2",
      accent: "#9a8fd0",
    },
    motif: "rings",
    weight: 0.9,
  },

  /* ── Things and money ────────────────────────────────────────────────── */
  {
    id: "finance",
    match: ["/finance", "/purchases"],
    title: "Wall Street",
    inspiration: "The Wolf of Wall Street",
    tagline: "The show goes on",
    scheme: "dark",
    palette: {
      background: "#060806",
      surface: "#0d110e",
      surfaceElevated: "#141915",
      ink: "#e6eae6",
      accent: "#4fa87f",
    },
    motif: "ledger",
    weight: 1,
  },
  {
    id: "inventory",
    match: ["/inventory"],
    title: "The Atelier",
    inspiration: "The Devil Wears Prada",
    tagline: "Everything you own",
    scheme: "dark",
    palette: {
      background: "#0a0a0a",
      surface: "#121212",
      surfaceElevated: "#1a1a1a",
      ink: "#f2f0ec",
      accent: "#c9b48c",
    },
    motif: "editorial",
    weight: 0.9,
  },
  {
    id: "wardrobe",
    match: ["/inventory/wardrobe"],
    title: "Editorial",
    inspiration: "The Devil Wears Prada",
    tagline: "That's all",
    scheme: "dark",
    palette: {
      background: "#0a0909",
      surface: "#131111",
      surfaceElevated: "#1b1818",
      ink: "#f2eeee",
      accent: "#b0808c",
    },
    motif: "editorial",
    weight: 0.9,
  },

  /* ── The system itself ───────────────────────────────────────────────── */
  {
    id: "settings",
    match: ["/settings", "/profile", "/feedback"],
    title: "The System",
    inspiration: "Black Mirror",
    tagline: "Control your own system",
    scheme: "dark",
    palette: {
      background: "#07090a",
      surface: "#0e1112",
      surfaceElevated: "#151819",
      ink: "#e8ecee",
      accent: "#6fb8c9",
    },
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
