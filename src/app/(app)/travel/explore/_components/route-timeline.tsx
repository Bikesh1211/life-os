import { IconMapPin } from "@tabler/icons-react";
import { cn } from "@/core/utils";
import type { Expedition } from "@/modules/travel/explore";

/**
 * THE JOURNEY — an expedition, leg by leg.
 *
 * Built from the trip's own day-by-day plan when it has one, because only the
 * itinerary knows the order the ground was covered in and on which day. When it
 * has none, the linked places stand in, ordered by visit date — the same
 * fallback the route line uses, so the map and the timeline never disagree.
 *
 * Legs with no coordinates appear here even though the map cannot draw them:
 * "stopped for tea somewhere on the pass" is part of a journey whether or not
 * anyone took a fix.
 */
export function RouteTimeline({ expedition }: { expedition: Expedition }) {
  const legs =
    expedition.routeStops.length > 0
      ? expedition.routeStops
      : expedition.places.map((place) => ({
          name: place.name,
          at: place.visitedAt
            ? new Date(place.visitedAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
              })
            : undefined,
          note: place.notes,
        }));

  if (legs.length === 0) return null;

  return (
    <section aria-labelledby="journey" className="mt-16">
      <h2 id="journey" className="xp-label mb-6 text-[var(--xp-muted)]">
        The journey
      </h2>

      <ol className="relative">
        {/* The spine. Inset to the marker's centre so the line runs through
            them rather than beside them. */}
        <span
          aria-hidden="true"
          className="absolute top-2 bottom-2 left-[7px] w-px bg-gradient-to-b from-[color-mix(in_oklab,var(--xp-primary)_50%,transparent)] via-[var(--xp-border)] to-transparent"
        />

        {legs.map((leg, index) => (
          <li key={`${leg.name}-${index}`} className="relative flex gap-5 pb-8 last:pb-0">
            <span className="relative z-10 mt-1.5 flex size-[15px] shrink-0 items-center justify-center">
              <span
                className={cn(
                  "size-[9px] rounded-full",
                  index === legs.length - 1
                    ? "bg-[var(--xp-expedition)]"
                    : "border-2 border-[var(--xp-primary)] bg-[var(--xp-bg)]",
                )}
              />
            </span>

            <div className="min-w-0 flex-1">
              {leg.at && <p className="xp-label text-[var(--xp-primary)] tabular-nums">{leg.at}</p>}
              <p className="mt-0.5 flex items-center gap-2 text-lg font-medium">
                <IconMapPin size={14} className="shrink-0 text-[var(--xp-muted)]" aria-hidden="true" />
                {leg.name}
              </p>
              {leg.note && (
                <p className="mt-1.5 text-sm leading-relaxed text-[var(--xp-muted)]">{leg.note}</p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
