import { cn } from "@/core/utils";
import styles from "./explore.module.css";

/**
 * FIELD NOTES — the observations that make an archive personal rather than a
 * database.
 *
 * Set on paper, in the hand the rest of the mode reserves for annotation: these
 * are the lines someone wrote down at the time, not prose written afterwards
 * for a reader. Renders nothing when there are none, because an empty notebook
 * page with a heading over it says the wrong thing.
 */
export function FieldNotes({
  notes,
  title = "Field notes",
  id = "field-notes",
  className,
}: {
  notes: string[];
  title?: string;
  id?: string;
  className?: string;
}) {
  if (notes.length === 0) return null;

  return (
    <section aria-labelledby={id} className={cn("mt-16", className)}>
      <h2 id={id} className="xp-label mb-5 text-[var(--xp-muted)]">
        {title}
      </h2>

      <ul
        className={cn(
          styles.paper,
          "space-y-0 overflow-hidden rounded-md border border-[var(--xp-border)]",
        )}
      >
        {notes.map((note, index) => (
          <li
            key={index}
            className="flex gap-4 border-b border-[var(--xp-border)] px-5 py-4 last:border-b-0"
          >
            <span className="font-mono text-xs text-[var(--xp-primary)] opacity-70 tabular-nums">
              {String(index + 1).padStart(2, "0")}
            </span>
            <p className="text-sm leading-relaxed italic opacity-85">{note}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
