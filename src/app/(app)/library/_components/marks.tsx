/**
 * The room's marks.
 *
 * Drawn rather than imported: both have to take their colours from props (the
 * entrance paints them on a dark curtain where the mode tokens do not apply),
 * and the tome has to render at 34rem behind the hero without a raster asset
 * going soft.
 *
 * `id` exists because a page can carry two tomes at different sizes, and an SVG
 * gradient id has to be unique in the document.
 */

/** The small mark, for the rail: an open book between two arcs. */
export function GrimoireMark({ className, ring = true }: { className?: string; ring?: boolean }) {
  const page = "M12 7.6 C9.4 5.6 6.2 5 3.2 5.4 L3.2 17.4 C6.2 17 9.4 17.6 12 19.6 Z";

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Two arcs rather than a closed ring: an archway over the shelf, and a
          full circle would crop the book's outer corners at this size. */}
      {ring && (
        <>
          <path
            d="M2.48 16.44 A10.5 10.5 0 0 1 2.48 7.56"
            stroke="currentColor"
            strokeWidth={1.1}
            opacity={0.4}
          />
          <path
            d="M21.52 16.44 A10.5 10.5 0 0 0 21.52 7.56"
            stroke="currentColor"
            strokeWidth={1.1}
            opacity={0.4}
          />
        </>
      )}

      <path d={page} stroke="currentColor" strokeWidth={1.1} opacity={0.85} />
      <path
        d={page}
        transform="matrix(-1 0 0 1 24 0)"
        stroke="currentColor"
        strokeWidth={1.1}
        opacity={0.85}
      />
      <line
        x1={12}
        y1={7.6}
        x2={12}
        y2={19.6}
        stroke="currentColor"
        strokeWidth={1.1}
        opacity={0.5}
      />
    </svg>
  );
}

/** Lines of writing, following the sag of each page. Declared rather than
    randomised so the server and the client draw the same book. */
const RULES = [
  { y: 196, from: 74, to: 178 },
  { y: 214, from: 68, to: 182 },
  { y: 232, from: 66, to: 172 },
  { y: 250, from: 64, to: 180 },
  { y: 268, from: 62, to: 156 },
];

/** Motes lifting off the gutter. Ten, and every one of them declared. */
const MOTES = [
  { x: 200, y: 108, r: 3.4, o: 0.9 },
  { x: 176, y: 84, r: 2.2, o: 0.7 },
  { x: 226, y: 76, r: 2.6, o: 0.75 },
  { x: 156, y: 52, r: 1.8, o: 0.5 },
  { x: 246, y: 44, r: 2, o: 0.55 },
  { x: 200, y: 40, r: 2.4, o: 0.6 },
  { x: 132, y: 108, r: 1.6, o: 0.4 },
  { x: 272, y: 116, r: 1.8, o: 0.42 },
  { x: 188, y: 22, r: 1.4, o: 0.35 },
  { x: 218, y: 14, r: 1.2, o: 0.3 },
];

/** The open book, with light coming out of the gutter. */
export function OpenTome({
  className,
  tone = "var(--lb-gold)",
  warm = "var(--lb-candle)",
  id = "tome",
}: {
  className?: string;
  tone?: string;
  warm?: string;
  id?: string;
}) {
  const glow = `${id}-glow`;
  const leaf = `${id}-leaf`;

  return (
    <svg viewBox="0 0 400 400" fill="none" aria-hidden="true" className={className}>
      <defs>
        <radialGradient id={glow} cx="50%" cy="46%" r="46%">
          <stop offset="0%" stopColor={warm} stopOpacity="0.55" />
          <stop offset="100%" stopColor={warm} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={leaf} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={tone} stopOpacity="0.24" />
          <stop offset="100%" stopColor={tone} stopOpacity="0.06" />
        </linearGradient>
      </defs>

      {/* The light, before anything it falls on. */}
      <ellipse cx={200} cy={180} rx={170} ry={130} fill={`url(#${glow})`} />

      {/* The two leaves, sagging away from the gutter. */}
      <path
        d="M200 176 C160 150 110 142 62 148 L62 300 C110 294 160 302 200 328 Z"
        fill={`url(#${leaf})`}
        stroke={tone}
        strokeOpacity={0.55}
        strokeWidth={1.4}
      />
      <path
        d="M200 176 C240 150 290 142 338 148 L338 300 C290 294 240 302 200 328 Z"
        fill={`url(#${leaf})`}
        stroke={tone}
        strokeOpacity={0.55}
        strokeWidth={1.4}
      />

      {/* The gutter. */}
      <line
        x1={200}
        y1={176}
        x2={200}
        y2={328}
        stroke={tone}
        strokeOpacity={0.5}
        strokeWidth={1.6}
      />

      {/* Writing, on both leaves. */}
      <g stroke={tone} strokeOpacity={0.32} strokeWidth={1.6} strokeLinecap="round">
        {RULES.map((rule) => (
          <line
            key={`l-${rule.y}`}
            x1={200 - rule.to}
            y1={rule.y}
            x2={200 - rule.from}
            y2={rule.y}
          />
        ))}
        {RULES.map((rule) => (
          <line
            key={`r-${rule.y}`}
            x1={200 + rule.from}
            y1={rule.y}
            x2={200 + rule.to}
            y2={rule.y}
          />
        ))}
      </g>

      {/* Motes rising out of the gutter. */}
      <g fill={warm}>
        {MOTES.map((mote, index) => (
          <circle key={index} cx={mote.x} cy={mote.y} r={mote.r} opacity={mote.o} />
        ))}
      </g>
    </svg>
  );
}
