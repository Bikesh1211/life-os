import { OpenTome } from "./marks";
import { cn } from "@/core/utils";
import type { LibraryEntry } from "@/modules/library";
import { SHELVES } from "@/modules/library";
import styles from "./library.module.css";

/**
 * The room, on arrival.
 *
 * Every number here is counted from the archive rather than authored, which is
 * the same rule Detective Mode's evidence panel follows: a figure the interface
 * cannot support is absent rather than estimated. An empty library therefore
 * shows an honest set of zeroes instead of a boast.
 */
export function LibraryHero({ entries }: { entries: LibraryEntry[] }) {
  const words = entries.reduce((sum, entry) => sum + entry.wordCount, 0);
  const shelvesInUse = SHELVES.filter((shelf) =>
    entries.some((entry) => entry.kind === shelf.kind),
  ).length;

  const minutes = entries.reduce((sum, entry) => sum + entry.readingMinutes, 0);

  const facts = [
    { value: entries.length.toLocaleString("en-GB"), label: "Pieces" },
    { value: words.toLocaleString("en-GB"), label: "Words" },
    { value: `${shelvesInUse}/${SHELVES.length}`, label: "Shelves in use" },
    /* Hours only once there are enough of them to be worth rounding to; below
       that the figure is more honest in minutes. */
    minutes >= 120
      ? { value: Math.round(minutes / 60).toLocaleString("en-GB"), label: "Hours of reading" }
      : { value: minutes.toLocaleString("en-GB"), label: "Minutes of reading" },
  ];

  return (
    <section className="relative overflow-hidden">
      {/* The tome behind the type — decoration, and held well back from it. */}
      <div
        className="pointer-events-none absolute -top-20 right-0 hidden opacity-[0.14] md:block"
        aria-hidden="true"
      >
        <OpenTome className="candle-flicker size-[34rem]" />
      </div>

      <div className="lb-container relative pt-16 pb-12 sm:pt-24 sm:pb-16">
        <p className="lb-caption mb-6 text-[var(--lb-primary)]">The Library</p>

        <h1 className="lb-h1 max-w-3xl text-balance">THE LIBRARY</h1>

        <p className="lb-body-lg mt-6 max-w-2xl text-balance">
          Everything you have written, imagined, experienced, and learned — gathered in one room.
        </p>

        <p className="mt-4 max-w-2xl text-lg text-[var(--lb-muted)] italic">
          Every journey leaves a story. Every thought becomes a page.
        </p>

        <div className={cn(styles.rule, "mt-10 max-w-md")} role="separator" />

        <dl className="mt-8 flex flex-wrap gap-x-12 gap-y-6">
          {facts.map((fact) => (
            <div key={fact.label}>
              <dd className="text-3xl font-semibold tabular-nums sm:text-4xl">{fact.value}</dd>
              <dt className="lb-caption mt-1 text-[var(--lb-muted)]">{fact.label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
