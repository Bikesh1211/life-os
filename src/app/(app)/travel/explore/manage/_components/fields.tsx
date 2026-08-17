"use client";

import { IconPlus, IconX } from "@tabler/icons-react";
import { cn } from "@/core/utils";
import { isShortMapsLink, parseMapsUrl } from "@/modules/travel/explore/maps";

/**
 * The desk's form primitives.
 *
 * Plain inputs rather than Mantine's, deliberately. This page lives inside
 * Explore Mode, which carries its own warm palette under `.xp`, and a Mantine
 * field would arrive with Life OS's blue-grey theme baked into it — the desk
 * would read as a different application bolted onto the archive. These are the
 * same controls, wearing the archive's colours.
 */

export const inputCls =
  "w-full rounded-lg border border-[var(--xp-border)] bg-[var(--xp-surface)] px-3 py-1.5 text-sm text-[var(--xp-fg)] outline-none focus:ring-1 focus:ring-[var(--xp-primary)] placeholder:text-[var(--xp-muted)]";

export const filterCls =
  "rounded-lg border border-[var(--xp-border)] bg-[var(--xp-surface)] px-3 py-1.5 text-xs text-[var(--xp-muted)] outline-none focus:ring-1 focus:ring-[var(--xp-primary)]";

export function Field({
  label,
  children,
  hint,
  className,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="block text-xs font-medium text-[var(--xp-muted)]">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-[var(--xp-muted)]">{hint}</p>}
    </div>
  );
}

/** A section rule, so a long form reads as a document rather than a wall. */
export function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4 border-t border-[var(--xp-border)] pt-5">
      <p className="xp-label text-[var(--xp-muted)]">{title}</p>
      {children}
    </div>
  );
}

/**
 * A repeating list of strings — galleries, tags, companions, field notes.
 *
 * Rows are keyed by index, which is safe here only because the list is never
 * reordered and never filtered: adding appends, removing splices, and every
 * input is fully controlled. Blank rows are kept while typing and stripped on
 * save, so an accidental empty box never becomes an empty entry in the archive.
 */
export function ArrayField({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-[var(--xp-muted)]">{label}</label>
      {values.map((value, i) => (
        <div key={i} className="flex gap-1.5">
          <input
            value={value}
            onChange={(e) => {
              const next = [...values];
              next[i] = e.target.value;
              onChange(next);
            }}
            placeholder={placeholder ?? `Item ${i + 1}`}
            className={inputCls}
          />
          <button
            type="button"
            onClick={() => onChange(values.filter((_, j) => j !== i))}
            aria-label={`Remove ${label.toLowerCase()} ${i + 1}`}
            className="rounded-lg px-2 text-[var(--xp-muted)] transition-colors hover:text-[var(--xp-expedition)]"
          >
            <IconX size={14} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...values, ""])}
        className="flex items-center gap-1 text-xs text-[var(--xp-primary)] transition-opacity hover:opacity-80"
      >
        <IconPlus size={12} /> Add {label.toLowerCase()}
      </button>
    </div>
  );
}

/**
 * What the pasted Maps link resolved to, said out loud.
 *
 * A silent parse is the worst version of this: the position either lands or it
 * does not, and the only way to tell would be to save and go look at the map.
 */
export function MapsUrlPreview({ url }: { url: string }) {
  const trimmed = url.trim();
  if (!trimmed) {
    return (
      <p className="text-[11px] text-[var(--xp-muted)]">
        Paste a Google Maps link containing <code>@lat,lng</code> to place this on the expedition
        map — or type the coordinates below.
      </p>
    );
  }

  if (isShortMapsLink(trimmed)) {
    return (
      <p className="text-[11px] text-[var(--xp-expedition)]">
        Short links carry no coordinates. Open it in Google Maps and copy the full URL from the
        address bar, or type the coordinates below.
      </p>
    );
  }

  const coords = parseMapsUrl(trimmed);
  if (coords.lat === undefined || coords.lng === undefined) {
    return (
      <p className="text-[11px] text-[var(--xp-expedition)]">
        No <code>@lat,lng</code> found in this link. The coordinates below are unchanged.
      </p>
    );
  }

  return (
    <p className="text-[11px] text-[var(--xp-primary)] tabular-nums">
      Detected {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
    </p>
  );
}

export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded border-[var(--xp-border)] accent-[var(--xp-primary)]"
      />
      <span className="text-sm">{label}</span>
    </label>
  );
}

/**
 * A blank numeric field is "not recorded", not zero.
 *
 * `null` rather than `undefined`, because `JSON.stringify` drops undefined keys
 * entirely and an update would then leave the stored number in place — emptying
 * the box has to be able to erase it.
 */
export function numberOrNull(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

/** Same rule for text: an emptied box erases the stored value. */
export function textOrNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

/** `2024-05-03` → an ISO instant the API's `z.string().datetime()` accepts. */
export function dateOrNull(value: string): string | null {
  if (!value.trim()) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

/** An ISO instant back into the `yyyy-mm-dd` a date input wants. */
export function toDateInput(value: string | null | undefined): string {
  if (!value) return "";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString().slice(0, 10);
}
