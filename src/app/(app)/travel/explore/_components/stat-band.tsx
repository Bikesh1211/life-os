import { cn } from "@/core/utils";
import type { ExploreStats } from "@/modules/travel/explore";

/**
 * The expedition readout.
 *
 * Every figure is counted out of the archive, and a figure the archive cannot
 * support is *absent* rather than zero — see `computeStats`, which returns
 * `null` for distance until a trip records one and for travel days until a trip
 * records both of its dates. This component drops those rows entirely. "0 km"
 * and "we have not recorded that yet" are different claims, and only one of
 * them is true.
 */
export function StatBand({ stats, className }: { stats: ExploreStats; className?: string }) {
  const rows: { label: string; value: string; suffix?: string }[] = [
    /* No "+" suffix anywhere below: the counts are exact, and decorating an
       exact number with a "more than this" marker is a small lie for a visual
       flourish. */
    { label: "Countries", value: String(stats.countries).padStart(2, "0") },
    { label: "Cities", value: String(stats.cities) },
    { label: "Places", value: String(stats.places) },
    { label: "Expeditions", value: String(stats.expeditions) },
    { label: "Planned", value: String(stats.planned) },
  ];

  if (stats.distanceKm !== null) {
    rows.push({ label: "Distance", value: stats.distanceKm.toLocaleString("en-GB"), suffix: " km" });
  }
  if (stats.travelDays !== null) rows.push({ label: "Travel days", value: String(stats.travelDays) });
  if (stats.highestElevationM !== null) {
    rows.push({
      label: "Highest point",
      value: stats.highestElevationM.toLocaleString("en-GB"),
      suffix: " m",
    });
  }
  if (stats.photos > 0) rows.push({ label: "Photographs", value: String(stats.photos) });
  if (stats.stories > 0) rows.push({ label: "Stories", value: String(stats.stories) });
  if (stats.favourites > 0) rows.push({ label: "Favourites", value: String(stats.favourites) });

  return (
    <dl
      className={cn(
        "grid grid-cols-2 gap-px overflow-hidden border border-[var(--xp-border)] bg-[var(--xp-border)] sm:grid-cols-3 lg:grid-cols-5",
        className,
      )}
    >
      {rows.map((row) => (
        <div key={row.label} className="bg-[var(--xp-bg)] px-5 py-4">
          <dt className="xp-label mb-1.5 text-[var(--xp-muted)] opacity-80">{row.label}</dt>
          <dd className="text-2xl font-bold tabular-nums">
            {row.value}
            {row.suffix && <span className="text-[var(--xp-primary)]">{row.suffix}</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}
