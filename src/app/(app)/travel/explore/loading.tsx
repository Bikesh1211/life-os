/**
 * The archive, arriving.
 *
 * Deliberately not the app's `DashboardSkeleton`: Explore has its own chrome
 * and its own palette, and a Mantine card skeleton flashing before a warm field
 * document reads as two different applications loading in sequence.
 */
export default function ExploreLoading() {
  return (
    <div className="xp-container py-16">
      <div className="h-3 w-32 animate-pulse rounded bg-[var(--xp-border)]" />
      <div className="mt-6 h-12 w-full max-w-2xl animate-pulse rounded bg-[var(--xp-border)]" />
      <div className="mt-4 h-4 w-full max-w-lg animate-pulse rounded bg-[var(--xp-border)]" />

      <div className="mt-12 grid grid-cols-2 gap-px border border-[var(--xp-border)] bg-[var(--xp-border)] sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse bg-[var(--xp-bg)]" />
        ))}
      </div>

      <div className="mt-16 h-[460px] animate-pulse rounded-md border border-[var(--xp-border)] bg-[var(--xp-border)]/40" />
    </div>
  );
}
