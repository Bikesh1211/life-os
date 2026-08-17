/**
 * The archive's mark.
 *
 * Drawn rather than imported, for two reasons: it has to take its colours from
 * two props (the entrance paints it on a dark curtain where the mode tokens do
 * not apply), and it has to be able to render at 32rem behind the hero without
 * a raster asset going soft. Eight points, a graticule, a settled needle.
 *
 * `id` exists because a page can carry two of these at different sizes and an
 * SVG gradient id has to be unique in the document.
 */
export function CompassRose({
  className,
  tone = "var(--xp-brass)",
  warm = "var(--xp-expedition)",
  id = "xp-compass",
}: {
  className?: string;
  tone?: string;
  warm?: string;
  id?: string;
}) {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-needle`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={warm} />
          <stop offset="100%" stopColor={warm} stopOpacity="0.35" />
        </linearGradient>
      </defs>

      {/* The rings. */}
      <circle cx="100" cy="100" r="92" stroke={tone} strokeOpacity="0.45" strokeWidth="1" />
      <circle cx="100" cy="100" r="78" stroke={tone} strokeOpacity="0.28" strokeWidth="1" />
      <circle cx="100" cy="100" r="46" stroke={tone} strokeOpacity="0.2" strokeWidth="1" />

      {/* The graticule — a tick every fifteen degrees, longer on the eight
          principal bearings. */}
      <g stroke={tone} strokeOpacity="0.45" strokeWidth="1">
        {Array.from({ length: 24 }, (_, i) => {
          const angle = (i * 15 * Math.PI) / 180;
          const principal = i % 3 === 0;
          const inner = principal ? 68 : 78;
          return (
            <line
              key={i}
              x1={100 + Math.sin(angle) * inner}
              y1={100 - Math.cos(angle) * inner}
              x2={100 + Math.sin(angle) * 90}
              y2={100 - Math.cos(angle) * 90}
              strokeOpacity={principal ? 0.6 : 0.28}
            />
          );
        })}
      </g>

      {/* The star. Four long points on the cardinals, four short between. */}
      <g>
        <path d="M100 14 L112 92 L100 100 L88 92 Z" fill={`url(#${id}-needle)`} />
        <path d="M100 186 L88 108 L100 100 L112 108 Z" fill={tone} fillOpacity="0.45" />
        <path d="M14 100 L92 88 L100 100 L92 112 Z" fill={tone} fillOpacity="0.32" />
        <path d="M186 100 L108 112 L100 100 L108 88 Z" fill={tone} fillOpacity="0.32" />
      </g>

      <circle cx="100" cy="100" r="5" fill={tone} />
      <circle cx="100" cy="100" r="2" fill={warm} />
    </svg>
  );
}

/** The small mark, for the rail. Same vocabulary, four strokes. */
export function CompassMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.4" opacity="0.6" />
      <path
        d="M12 3.5 L14 11 L12 12 L10 11 Z"
        fill="currentColor"
      />
      <path d="M12 20.5 L10 13 L12 12 L14 13 Z" fill="currentColor" opacity="0.4" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" />
    </svg>
  );
}
