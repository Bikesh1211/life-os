"use client";

import { Field, FormSection, dateOrNull, inputCls, textOrNull, toDateInput } from "./fields";
import { MOOD_OPTIONS, type JournalRecord, type TripRecord } from "./types";

/**
 * A written account.
 *
 * This is the archive's prose layer, and every field on it is read somewhere in
 * Explore: `content` and `story` become the story page and the excerpt on the
 * expedition; `favoriteMoment` becomes Highlights; `lessonsLearned` becomes
 * "What it taught me"; `wouldDoAgain` becomes "If you go"; `foodTried` and
 * `peopleMet` become the field notes.
 *
 * Linking a journal to an expedition is what makes those sections appear on
 * that expedition's page. An unlinked journal is still a story in its own
 * right — it just stands alone.
 */

export interface JournalFormState {
  title: string;
  tripId: string;
  location: string;
  date: string;
  mood: string;
  coverImage: string;
  content: string;
  story: string;
  favoriteMoment: string;
  lessonsLearned: string;
  wouldDoAgain: string;
  foodTried: string;
  peopleMet: string;
}

export const emptyJournal: JournalFormState = {
  title: "",
  tripId: "",
  location: "",
  date: "",
  mood: "",
  coverImage: "",
  content: "",
  story: "",
  favoriteMoment: "",
  lessonsLearned: "",
  wouldDoAgain: "",
  foodTried: "",
  peopleMet: "",
};

export function journalToForm(r: JournalRecord): JournalFormState {
  return {
    title: r.title,
    tripId: r.tripId ?? "",
    location: r.location ?? "",
    date: toDateInput(r.date),
    mood: r.mood ?? "",
    coverImage: r.coverImage ?? "",
    content: r.content ?? "",
    story: r.story ?? "",
    favoriteMoment: r.favoriteMoment ?? "",
    lessonsLearned: r.lessonsLearned ?? "",
    wouldDoAgain: r.wouldDoAgain ?? "",
    foodTried: r.foodTried ?? "",
    peopleMet: r.peopleMet ?? "",
  };
}

export function journalBody(form: JournalFormState): Record<string, unknown> {
  return {
    title: form.title.trim(),
    tripId: textOrNull(form.tripId),
    location: textOrNull(form.location),
    date: dateOrNull(form.date),
    mood: textOrNull(form.mood),
    coverImage: textOrNull(form.coverImage),
    content: textOrNull(form.content),
    story: textOrNull(form.story),
    favoriteMoment: textOrNull(form.favoriteMoment),
    lessonsLearned: textOrNull(form.lessonsLearned),
    wouldDoAgain: textOrNull(form.wouldDoAgain),
    foodTried: textOrNull(form.foodTried),
    peopleMet: textOrNull(form.peopleMet),
  };
}

export function JournalForm({
  form,
  setForm,
  trips,
}: {
  form: JournalFormState;
  setForm: (updater: (f: JournalFormState) => JournalFormState) => void;
  trips: TripRecord[];
}) {
  function set<K extends keyof JournalFormState>(key: K, value: JournalFormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title *" className="sm:col-span-2">
          <input
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            required
            placeholder="The morning the clouds broke"
            className={inputCls}
          />
        </Field>
        <Field
          label="Expedition"
          hint="Links this account to a trip's page and its highlights."
        >
          <select
            value={form.tripId}
            onChange={(e) => set("tripId", e.target.value)}
            className={inputCls}
          >
            <option value="">None — a story on its own</option>
            {trips.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Written on">
          <input
            type="date"
            value={form.date}
            onChange={(e) => set("date", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Location">
          <input
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            placeholder="Ghorepani"
            className={inputCls}
          />
        </Field>
        <Field label="Mood">
          <select
            value={form.mood}
            onChange={(e) => set("mood", e.target.value)}
            className={inputCls}
          >
            {MOOD_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Cover image URL" className="sm:col-span-2">
          <input
            value={form.coverImage}
            onChange={(e) => set("coverImage", e.target.value)}
            placeholder="https://…"
            className={inputCls}
          />
        </Field>
      </div>

      <FormSection title="The account">
        <Field label="Story">
          <textarea
            value={form.content}
            onChange={(e) => set("content", e.target.value)}
            rows={8}
            placeholder="What happened. Blank lines become paragraphs."
            className={`${inputCls} resize-y`}
          />
        </Field>
        <Field label="Continued" hint="Optional — appended after the story above.">
          <textarea
            value={form.story}
            onChange={(e) => set("story", e.target.value)}
            rows={4}
            className={`${inputCls} resize-y`}
          />
        </Field>
      </FormSection>

      <FormSection title="What the expedition page shows">
        <Field label="Favourite moment" hint="Appears under Highlights.">
          <textarea
            value={form.favoriteMoment}
            onChange={(e) => set("favoriteMoment", e.target.value)}
            rows={2}
            className={`${inputCls} resize-y`}
          />
        </Field>
        <Field label="What it taught me" hint="Appears under its own heading.">
          <textarea
            value={form.lessonsLearned}
            onChange={(e) => set("lessonsLearned", e.target.value)}
            rows={2}
            className={`${inputCls} resize-y`}
          />
        </Field>
        <Field label="If you go" hint="Advice for someone following. Stored as “would do again”.">
          <textarea
            value={form.wouldDoAgain}
            onChange={(e) => set("wouldDoAgain", e.target.value)}
            rows={2}
            className={`${inputCls} resize-y`}
          />
        </Field>
      </FormSection>

      <FormSection title="Field notes">
        <p className="-mt-2 text-[11px] text-[var(--xp-muted)]">
          The observations written down at the time, set on paper in the archive.
        </p>
        <Field label="Food tried">
          <textarea
            value={form.foodTried}
            onChange={(e) => set("foodTried", e.target.value)}
            rows={2}
            className={`${inputCls} resize-y`}
          />
        </Field>
        <Field label="People met">
          <textarea
            value={form.peopleMet}
            onChange={(e) => set("peopleMet", e.target.value)}
            rows={2}
            className={`${inputCls} resize-y`}
          />
        </Field>
      </FormSection>
    </>
  );
}
