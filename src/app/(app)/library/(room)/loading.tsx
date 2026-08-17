/**
 * The room, arriving.
 *
 * Deliberately not the app's `DashboardSkeleton`: the Library has its own
 * chrome and its own palette, and a Mantine card skeleton flashing before a
 * parchment reading room reads as two applications loading in sequence.
 */
export default function LibraryLoading() {
  return (
    <div className="lb-container py-16">
      <div className="h-3 w-28 animate-pulse rounded bg-[var(--lb-border)]" />
      <div className="mt-6 h-14 w-full max-w-xl animate-pulse rounded bg-[var(--lb-border)]" />
      <div className="mt-4 h-4 w-full max-w-lg animate-pulse rounded bg-[var(--lb-border)]" />

      <div className="mt-16 space-y-14">
        {Array.from({ length: 3 }).map((_, shelf) => (
          <div key={shelf}>
            <div className="h-4 w-40 animate-pulse rounded bg-[var(--lb-border)]" />
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, card) => (
                <div
                  key={card}
                  className="h-44 animate-pulse rounded-md border border-[var(--lb-border)] bg-[var(--lb-border)]/30"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
