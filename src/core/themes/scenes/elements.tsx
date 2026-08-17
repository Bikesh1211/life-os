import { VIEW_H, VIEW_W, mulberry32, scatter } from "./random";

/**
 * The decorative element library.
 *
 * Every scene in Life OS is assembled from these. They are original drawings —
 * shelves, ridgelines, a skyline, orbits, curtain folds — not traced from
 * anyone's artwork, which is both the licence-safe answer and the better one:
 * a silhouette drawn from primitives re-tints itself, scales without a raster,
 * and costs one composited layer instead of a network request.
 *
 * Two rules hold across all of them. Colour comes from `currentColor` or the
 * context tokens, so an element serves every environment. And nothing here
 * animates on a loop — the only motion in the whole system is a slow opacity
 * drift on dust, gated on `prefers-reduced-motion`.
 */

/* ── Shelving ─────────────────────────────────────────────────────────────
   A library wall: bays of boards with individual books standing on them.
   Books are generated so no two bays repeat, and a few are picked out in the
   accent so the wall has warmth in it rather than being a grid of ticks. */

const BAYS = (() => {
  const rand = mulberry32(20260901);
  return [40, 250, 460, 670, 880].map((x) => {
    const w = 170;
    const shelves = [110, 210, 310, 410, 510];
    const books = shelves.flatMap((y) => {
      const out: { x: number; y: number; w: number; h: number; tone: number }[] = [];
      let cursor = x + 4;
      while (cursor < x + w - 10) {
        const bw = 5 + rand() * 11;
        const bh = 46 + rand() * 34;
        out.push({ x: cursor, y: y - bh, w: bw, h: bh, tone: rand() });
        cursor += bw + 1.5 + rand() * 2;
      }
      return out;
    });
    return { x, w, shelves, books };
  });
})();

export function Shelves({ opacity = 0.5 }: { opacity?: number }) {
  return (
    <g opacity={opacity}>
      {BAYS.map((bay) => (
        <g key={bay.x}>
          {bay.shelves.map((y) => (
            <rect key={y} x={bay.x} y={y} width={bay.w} height={3} fill="currentColor" opacity={0.7} />
          ))}
          <rect x={bay.x - 5} y={40} width={5} height={490} fill="currentColor" opacity={0.55} />
          {bay.books.map((book, i) => (
            <rect
              key={i}
              x={book.x}
              y={book.y}
              width={book.w}
              height={book.h}
              fill={book.tone > 0.84 ? "var(--scene-accent)" : "currentColor"}
              opacity={book.tone > 0.84 ? 0.5 : 0.42 + book.tone * 0.3}
            />
          ))}
        </g>
      ))}
    </g>
  );
}

/* ── Terrain ──────────────────────────────────────────────────────────────
   Contour lines, not a grid: terrain is the subject. Each ridge is one open
   quadratic path so the line reads as land rather than as a chart. */

const RIDGES = (() => {
  const rand = mulberry32(20260817);
  return Array.from({ length: 10 }, (_, i) => {
    const baseY = 30 + i * 58;
    const pts = Array.from({ length: 6 }, (_, k) => ({
      x: (VIEW_W / 5) * k,
      y: baseY + (rand() - 0.5) * 58,
    }));
    const d = pts
      .map((p, k) =>
        k === 0
          ? `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}`
          : `Q ${((pts[k - 1].x + p.x) / 2).toFixed(1)} ${pts[k - 1].y.toFixed(1)} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`,
      )
      .join(" ");
    return { id: i, d, emphasis: i % 3 === 0 };
  });
})();

export function Contours({ opacity = 0.85 }: { opacity?: number }) {
  return (
    <g opacity={opacity} fill="none">
      {RIDGES.map((ridge) => (
        <path
          key={ridge.id}
          d={ridge.d}
          stroke={ridge.emphasis ? "var(--scene-accent)" : "currentColor"}
          strokeWidth={ridge.emphasis ? 1.4 : 1}
          opacity={ridge.emphasis ? 0.55 : 0.4}
        />
      ))}
    </g>
  );
}

/** Survey fixes — the marks a map acquires from being used. */
export function SurveyMarks({ opacity = 0.75 }: { opacity?: number }) {
  const fixes = scatter(20260818, 11, (rand) => ({
    x: rand() * VIEW_W,
    y: rand() * VIEW_H,
    r: 4 + rand() * 5,
    kind: rand(),
  }));
  return (
    <g opacity={opacity} fill="none" stroke="var(--scene-accent)" strokeWidth={1}>
      {fixes.map((f, i) => (
        <g key={i}>
          {f.kind > 0.5 ? (
            <circle cx={f.x} cy={f.y} r={f.r} />
          ) : (
            <>
              <line x1={f.x - f.r} y1={f.y} x2={f.x + f.r} y2={f.y} />
              <line x1={f.x} y1={f.y - f.r} x2={f.x} y2={f.y + f.r} />
            </>
          )}
        </g>
      ))}
    </g>
  );
}

/**
 * Layered mountain silhouettes.
 *
 * Contour lines alone give terrain a texture but no body, and a scene built
 * only from hairlines dissolves under the readability wash. These are filled
 * ranges receding into haze — four bands, each lighter and higher than the one
 * in front, which is what actually puts you outdoors.
 */
const RANGES = (() => {
  const rand = mulberry32(20260819);
  return [0, 1, 2, 3].map((band) => {
    const baseY = 250 + band * 74;
    const peaks = Array.from({ length: 9 }, (_, k) => ({
      x: (VIEW_W / 8) * k,
      y: baseY - rand() * (150 - band * 26),
    }));
    const d =
      peaks
        .map((p, k) =>
          k === 0
            ? `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}`
            : `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`,
        )
        .join(" ") + ` L ${VIEW_W} ${VIEW_H} L 0 ${VIEW_H} Z`;
    return { band, d };
  });
})();

export function Ridgeline({ opacity = 0.55 }: { opacity?: number }) {
  return (
    <g opacity={opacity}>
      {RANGES.map((range) => (
        <path
          key={range.band}
          d={range.d}
          fill="currentColor"
          /* Front bands are darker and more opaque; the ones behind fade into
             the air, which is the whole trick of aerial perspective. */
          opacity={0.14 + range.band * 0.1}
        />
      ))}
    </g>
  );
}

/** A bearing rose, for anything that navigates. */
export function Compass({ x = 850, y = 130, r = 92 }: { x?: number; y?: number; r?: number }) {
  const ticks = Array.from({ length: 16 }, (_, i) => (i * Math.PI * 2) / 16);
  return (
    <g opacity={0.6} fill="none" stroke="var(--scene-accent)">
      <circle cx={x} cy={y} r={r} strokeWidth={1} opacity={0.6} />
      <circle cx={x} cy={y} r={r * 0.72} strokeWidth={0.8} opacity={0.4} />
      {ticks.map((a, i) => (
        <line
          key={i}
          x1={x + Math.sin(a) * r * (i % 4 === 0 ? 0.62 : 0.86)}
          y1={y - Math.cos(a) * r * (i % 4 === 0 ? 0.62 : 0.86)}
          x2={x + Math.sin(a) * r}
          y2={y - Math.cos(a) * r}
          strokeWidth={i % 4 === 0 ? 1.2 : 0.7}
          opacity={i % 4 === 0 ? 0.7 : 0.4}
        />
      ))}
      <path d={`M ${x} ${y - r * 0.58} L ${x + 9} ${y} L ${x} ${y + r * 0.58} L ${x - 9} ${y} Z`} strokeWidth={1} />
    </g>
  );
}

/* ── Structure ────────────────────────────────────────────────────────────
   Grids and schematics, for anything operational or engineered. */

export function BlueprintGrid({ step = 48, opacity = 0.4 }: { step?: number; opacity?: number }) {
  const cols = Math.ceil(VIEW_W / step);
  const rows = Math.ceil(VIEW_H / step);
  return (
    <g opacity={opacity} stroke="currentColor">
      {Array.from({ length: cols }, (_, i) => (
        <line key={`v${i}`} x1={i * step} y1={0} x2={i * step} y2={VIEW_H} strokeWidth={i % 5 === 0 ? 0.9 : 0.4} opacity={i % 5 === 0 ? 0.55 : 0.3} />
      ))}
      {Array.from({ length: rows }, (_, i) => (
        <line key={`h${i}`} x1={0} y1={i * step} x2={VIEW_W} y2={i * step} strokeWidth={i % 5 === 0 ? 0.9 : 0.4} opacity={i % 5 === 0 ? 0.55 : 0.3} />
      ))}
    </g>
  );
}

/** Corner brackets and a stamp block — the furniture of a classified document. */
export function DossierMarks() {
  const corner = (x: number, y: number, sx: number, sy: number) =>
    `M ${x + 34 * sx} ${y} L ${x} ${y} L ${x} ${y + 34 * sy}`;
  return (
    <g opacity={0.5} fill="none" stroke="var(--scene-accent)" strokeWidth={1.4}>
      <path d={corner(46, 46, 1, 1)} />
      <path d={corner(VIEW_W - 46, 46, -1, 1)} />
      <path d={corner(46, VIEW_H - 46, 1, -1)} />
      <path d={corner(VIEW_W - 46, VIEW_H - 46, -1, -1)} />
      <rect x={VIEW_W - 208} y={VIEW_H - 108} width={150} height={34} strokeWidth={1} opacity={0.6} />
      <line x1={VIEW_W - 196} y1={VIEW_H - 91} x2={VIEW_W - 70} y2={VIEW_H - 91} strokeWidth={0.8} opacity={0.45} />
    </g>
  );
}

/** Traces and pads: an engineering board without being a literal circuit. */
export function Circuitry() {
  const traces = scatter(20260902, 16, (rand) => {
    const x = rand() * VIEW_W;
    const y = rand() * VIEW_H;
    const len = 60 + rand() * 190;
    const down = rand() > 0.5;
    return { x, y, len, down, pad: rand() > 0.55 };
  });
  return (
    <g opacity={0.6} fill="none" stroke="var(--scene-accent)" strokeWidth={1}>
      {traces.map((t, i) => (
        <g key={i}>
          <path
            d={
              t.down
                ? `M ${t.x} ${t.y} h ${t.len * 0.5} l 18 18 h ${t.len * 0.5}`
                : `M ${t.x} ${t.y} h ${t.len * 0.5} l 18 -18 h ${t.len * 0.5}`
            }
            opacity={0.5}
          />
          {t.pad && <circle cx={t.x} cy={t.y} r={3} fill="var(--scene-accent)" stroke="none" opacity={0.7} />}
        </g>
      ))}
    </g>
  );
}

/* ── Sky ──────────────────────────────────────────────────────────────────
   Orbits, stars and nebulae, for time and for space. */

export function Orbits({ cx = 500, cy = 300 }: { cx?: number; cy?: number }) {
  const rings = [120, 190, 268, 352, 444];
  return (
    <g opacity={0.62} fill="none" stroke="currentColor">
      {rings.map((r, i) => (
        <ellipse
          key={r}
          cx={cx}
          cy={cy}
          rx={r}
          ry={r * 0.42}
          strokeWidth={i === 1 ? 1.3 : 0.8}
          opacity={i === 1 ? 0.6 : 0.32}
          transform={`rotate(${-14 + i * 3} ${cx} ${cy})`}
        />
      ))}
      {/* Two bodies on their paths, the only fixed points in the drawing. */}
      <circle cx={cx + 190} cy={cy - 34} r={4} fill="var(--scene-accent)" stroke="none" opacity={0.8} />
      <circle cx={cx - 268} cy={cy + 52} r={2.6} fill="var(--scene-accent)" stroke="none" opacity={0.55} />
    </g>
  );
}

export function StarField({ count = 46, opacity = 0.65 }: { count?: number; opacity?: number }) {
  const stars = scatter(20260903, count, (rand) => ({
    x: rand() * VIEW_W,
    y: rand() * VIEW_H,
    r: 0.5 + rand() * 1.5,
    o: 0.25 + rand() * 0.6,
  }));
  return (
    <g opacity={opacity}>
      {stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="currentColor" opacity={s.o} />
      ))}
    </g>
  );
}

/** Sound as concentric arcs rising from the foot of the frame. */
export function SoundWaves({ cx = 500, cy = 640 }: { cx?: number; cy?: number }) {
  return (
    <g opacity={0.6} fill="none" stroke="var(--scene-accent)">
      {[110, 175, 245, 320, 400, 486].map((r, i) => (
        <circle key={r} cx={cx} cy={cy} r={r} strokeWidth={i % 2 === 0 ? 1.2 : 0.7} opacity={0.55 - i * 0.06} />
      ))}
    </g>
  );
}

/* ── Architecture ─────────────────────────────────────────────────────────
   Buildings, arches and racks — the silhouettes that place a scene. */

/** An abstract financial district: glass towers, no landmark. */
export function Skyline({ opacity = 0.45 }: { opacity?: number }) {
  const towers = scatter(20260904, 22, (rand, i) => {
    const w = 26 + rand() * 44;
    return {
      x: i * 46 - 10,
      w,
      h: 90 + rand() * 300,
      windows: rand() > 0.35,
      lit: rand(),
    };
  });
  return (
    <g opacity={opacity}>
      {towers.map((t, i) => (
        <g key={i}>
          <rect x={t.x} y={VIEW_H - t.h} width={t.w} height={t.h} fill="currentColor" opacity={0.5} />
          {t.windows &&
            Array.from({ length: Math.floor(t.h / 26) }, (_, r) => (
              <rect
                key={r}
                x={t.x + 6}
                y={VIEW_H - t.h + 12 + r * 26}
                width={t.w - 12}
                height={5}
                fill={t.lit > 0.7 && r % 3 === 0 ? "var(--scene-accent)" : "currentColor"}
                opacity={t.lit > 0.7 && r % 3 === 0 ? 0.5 : 0.22}
              />
            ))}
        </g>
      ))}
    </g>
  );
}

/** Gothic arcading — a cloister wall, for the journal's night. */
export function GothicArches({ opacity = 0.7 }: { opacity?: number }) {
  const bays = [70, 260, 450, 640, 830];
  return (
    <g opacity={opacity} fill="none" stroke="currentColor" strokeWidth={1.2}>
      {bays.map((x) => (
        <g key={x}>
          {/* A pointed arch: two arcs meeting at the apex. */}
          <path d={`M ${x} ${VIEW_H} L ${x} 300 Q ${x + 60} 170 ${x + 120} 300 L ${x + 120} ${VIEW_H}`} opacity={0.6} />
          <path d={`M ${x + 18} ${VIEW_H} L ${x + 18} 312 Q ${x + 60} 210 ${x + 102} 312 L ${x + 102} ${VIEW_H}`} opacity={0.3} />
          <circle cx={x + 60} cy={268} r={13} strokeWidth={0.9} opacity={0.45} />
        </g>
      ))}
    </g>
  );
}

/** Velvet folds, for the cinema. */
export function Curtain({ opacity = 0.4 }: { opacity?: number }) {
  const folds = Array.from({ length: 26 }, (_, i) => i * 40);
  return (
    <g opacity={opacity}>
      {folds.map((x, i) => (
        <path
          key={x}
          d={`M ${x} 0 Q ${x + 20} ${VIEW_H / 2} ${x + (i % 2 ? 10 : -10)} ${VIEW_H}`}
          stroke="currentColor"
          strokeWidth={i % 3 === 0 ? 12 : 5}
          fill="none"
          opacity={i % 3 === 0 ? 0.24 : 0.13}
        />
      ))}
    </g>
  );
}

/** Hanging rails, for the wardrobe. */
export function Racks({ opacity = 0.62 }: { opacity?: number }) {
  const rails = [180, 380];
  return (
    <g opacity={opacity} stroke="currentColor" fill="none">
      {rails.map((y) => (
        <g key={y}>
          <line x1={80} y1={y} x2={VIEW_W - 80} y2={y} strokeWidth={2} opacity={0.55} />
          {scatter(20260905 + y, 26, (rand, i) => ({ x: 96 + i * 30 + rand() * 8, w: 16 + rand() * 12, h: 90 + rand() * 60 })).map(
            (g, i) => (
              <path
                key={i}
                d={`M ${g.x} ${y} l ${-g.w / 2} ${g.h * 0.22} l ${g.w * 0.16} ${g.h * 0.78} l ${g.w * 0.68} 0 l ${g.w * 0.16} ${-g.h * 0.78} Z`}
                strokeWidth={0.8}
                opacity={0.3}
              />
            ),
          )}
        </g>
      ))}
    </g>
  );
}

/** Ring ropes, for the gym. */
export function RingRopes({ opacity = 0.62 }: { opacity?: number }) {
  return (
    <g opacity={opacity} stroke="var(--scene-accent)" fill="none">
      {[190, 290, 390].map((y, i) => (
        <line key={y} x1={-20} y1={y + i * 6} x2={VIEW_W + 20} y2={y - i * 6} strokeWidth={4} opacity={0.35} />
      ))}
      {[60, 500, 940].map((x) => (
        <line key={x} x1={x} y1={130} x2={x} y2={470} stroke="currentColor" strokeWidth={7} opacity={0.28} />
      ))}
    </g>
  );
}

/* ── Data ─────────────────────────────────────────────────────────────────
   Networks and markets. */

/** A knowledge network: nodes reaching for their two nearest neighbours. */
export function NodeNetwork({ count = 26, opacity = 0.7 }: { count?: number; opacity?: number }) {
  const nodes = scatter(20260906, count, (rand, i) => ({
    id: i,
    x: rand() * VIEW_W,
    y: rand() * VIEW_H,
    r: 1.4 + rand() * 2.6,
    hot: rand() > 0.78,
  }));

  const seen = new Set<string>();
  const links: { a: (typeof nodes)[number]; b: (typeof nodes)[number] }[] = [];
  for (const node of nodes) {
    const near = nodes
      .filter((n) => n.id !== node.id)
      .map((n) => ({ n, d: Math.hypot(n.x - node.x, n.y - node.y) }))
      .sort((p, q) => p.d - q.d)
      .slice(0, 2);
    for (const { n } of near) {
      const key = node.id < n.id ? `${node.id}-${n.id}` : `${n.id}-${node.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      links.push({ a: node, b: n });
    }
  }

  return (
    <g opacity={opacity}>
      <g stroke="currentColor" strokeWidth={0.7} opacity={0.42}>
        {links.map((l, i) => (
          <line key={i} x1={l.a.x} y1={l.a.y} x2={l.b.x} y2={l.b.y} />
        ))}
      </g>
      {nodes.map((n) => (
        <circle
          key={n.id}
          cx={n.x}
          cy={n.y}
          r={n.r}
          fill={n.hot ? "var(--scene-accent)" : "currentColor"}
          opacity={n.hot ? 0.85 : 0.5}
        />
      ))}
    </g>
  );
}

/** Candlesticks and a trend line — a market, not a terminal. */
export function MarketChart({ opacity = 0.45 }: { opacity?: number }) {
  const bars = scatter(20260907, 34, (rand, i) => {
    const mid = 420 - i * 5 - rand() * 40;
    const body = 14 + rand() * 46;
    return { x: 40 + i * 28, mid, body, wick: body + 16 + rand() * 30, up: rand() > 0.42 };
  });
  return (
    <g opacity={opacity}>
      {bars.map((b, i) => (
        <g key={i} opacity={0.55}>
          <line x1={b.x} y1={b.mid - b.wick / 2} x2={b.x} y2={b.mid + b.wick / 2} stroke="currentColor" strokeWidth={0.8} opacity={0.5} />
          <rect
            x={b.x - 5}
            y={b.mid - b.body / 2}
            width={10}
            height={b.body}
            fill={b.up ? "var(--scene-accent)" : "currentColor"}
            opacity={b.up ? 0.45 : 0.3}
          />
        </g>
      ))}
    </g>
  );
}

/* ── Paper and light ──────────────────────────────────────────────────────
   The finishing layers most scenes end with. */

/** Dust in a beam. The only thing in the system that moves. */
export function Dust({ count = 22 }: { count?: number }) {
  const motes = scatter(20260908, count, (rand) => ({
    x: rand() * VIEW_W,
    y: rand() * VIEW_H,
    r: 0.9 + rand() * 2.1,
    delay: rand() * 9,
    duration: 8 + rand() * 9,
  }));
  return (
    <g>
      {motes.map((m, i) => (
        <circle
          key={i}
          cx={m.x}
          cy={m.y}
          r={m.r}
          fill="var(--scene-accent)"
          opacity={0.35}
          className="scene-drift"
          style={{ animationDelay: `${m.delay}s`, animationDuration: `${m.duration}s` }}
        />
      ))}
    </g>
  );
}

/** Torn edges and rule lines: a page rather than a panel. */
export function PaperLines({ opacity = 0.35 }: { opacity?: number }) {
  return (
    <g opacity={opacity} stroke="currentColor">
      {Array.from({ length: 16 }, (_, i) => (
        <line key={i} x1={120} y1={90 + i * 32} x2={VIEW_W - 120} y2={90 + i * 32} strokeWidth={0.6} opacity={0.28} />
      ))}
      <line x1={168} y1={40} x2={168} y2={VIEW_H - 40} stroke="var(--scene-accent)" strokeWidth={1} opacity={0.35} />
    </g>
  );
}

/** Chalk working: a dot lattice with construction lines through it. */
export function Equations({ opacity = 0.62 }: { opacity?: number }) {
  const marks = scatter(20260909, 30, (rand) => ({
    x: rand() * VIEW_W,
    y: rand() * VIEW_H,
    len: 20 + rand() * 70,
    angle: rand() * 180,
  }));
  return (
    <g opacity={opacity} stroke="currentColor">
      {marks.map((m, i) => (
        <g key={i} transform={`rotate(${m.angle} ${m.x} ${m.y})`} opacity={0.32}>
          <line x1={m.x} y1={m.y} x2={m.x + m.len} y2={m.y} strokeWidth={0.7} />
          <circle cx={m.x} cy={m.y} r={1.6} fill="var(--scene-accent)" stroke="none" opacity={0.6} />
        </g>
      ))}
    </g>
  );
}

/** Rain, for a city at night. Static streaks, not an animation. */
export function Rain({ opacity = 0.3 }: { opacity?: number }) {
  const drops = scatter(20260910, 60, (rand) => ({
    x: rand() * VIEW_W,
    y: rand() * VIEW_H,
    len: 12 + rand() * 34,
  }));
  return (
    <g opacity={opacity} stroke="currentColor" strokeWidth={0.7}>
      {drops.map((d, i) => (
        <line key={i} x1={d.x} y1={d.y} x2={d.x - 7} y2={d.y + d.len} opacity={0.4} />
      ))}
    </g>
  );
}
