"use client";

import {
  ArrayField,
  Field,
  FormSection,
  Toggle,
  dateOrNull,
  inputCls,
  numberOrNull,
  textOrNull,
  toDateInput,
} from "./fields";
import {
  CATEGORY_OPTIONS,
  DIFFICULTY_OPTIONS,
  TRIP_STATUS_OPTIONS,
  type TripRecord,
} from "./types";

/**
 * An expedition.
 *
 * The trip record is what the journey *cost* — where, when, how far, how hard.
 * What it *was* lives in the journals, and this form does not duplicate a word
 * of it: the story, the lessons and the field notes are written on the Journals
 * tab and Explore joins the two by `tripId`. Two forms rather than one long
 * one, because a trip is entered when it is planned and its story is written
 * when it is over.
 */

export interface ExpeditionFormState {
  title: string;
  destination: string;
  country: string;
  startDate: string;
  endDate: string;
  status: string;
  coverImage: string;
  gallery: string[];
  notes: string;
  category: string;
  distanceKm: string;
  elevationM: string;
  transportation: string;
  difficulty: string;
  budget: string;
  currency: string;
  travelers: string;
  featured: boolean;
}

export const emptyExpedition: ExpeditionFormState = {
  title: "",
  destination: "",
  country: "",
  startDate: "",
  endDate: "",
  status: "completed",
  coverImage: "",
  gallery: [],
  notes: "",
  category: "",
  distanceKm: "",
  elevationM: "",
  transportation: "",
  difficulty: "",
  budget: "",
  currency: "USD",
  travelers: "1",
  featured: false,
};

export function tripToForm(r: TripRecord): ExpeditionFormState {
  return {
    title: r.title,
    destination: r.destination,
    country: r.country ?? "",
    startDate: toDateInput(r.startDate),
    endDate: toDateInput(r.endDate),
    status: r.status,
    coverImage: r.coverImage ?? "",
    gallery: r.gallery ?? [],
    notes: r.notes ?? "",
    category: r.category ?? "",
    distanceKm: r.distanceKm != null ? String(r.distanceKm) : "",
    elevationM: r.elevationM != null ? String(r.elevationM) : "",
    transportation: r.transportation ?? "",
    difficulty: r.difficulty ?? "",
    budget: r.budget != null ? String(r.budget) : "",
    currency: r.currency ?? "USD",
    travelers: r.travelers != null ? String(r.travelers) : "1",
    featured: r.featured,
  };
}

export function expeditionBody(form: ExpeditionFormState): Record<string, unknown> {
  return {
    title: form.title.trim(),
    /* The API requires a destination, and a trip whose title *is* its
       destination is the common case — so a blank box takes the title rather
       than failing validation on something the author already said. */
    destination: form.destination.trim() || form.title.trim(),
    country: textOrNull(form.country),
    startDate: dateOrNull(form.startDate),
    endDate: dateOrNull(form.endDate),
    status: form.status,
    coverImage: textOrNull(form.coverImage),
    gallery: form.gallery.filter(Boolean),
    notes: textOrNull(form.notes),
    category: textOrNull(form.category),
    distanceKm: numberOrNull(form.distanceKm),
    elevationM: numberOrNull(form.elevationM),
    transportation: textOrNull(form.transportation),
    difficulty: textOrNull(form.difficulty),
    budget: numberOrNull(form.budget),
    currency: form.currency.trim() || "USD",
    travelers: numberOrNull(form.travelers) ?? 1,
    featured: form.featured,
  };
}

export function ExpeditionForm({
  form,
  setForm,
}: {
  form: ExpeditionFormState;
  setForm: (updater: (f: ExpeditionFormState) => ExpeditionFormState) => void;
}) {
  function set<K extends keyof ExpeditionFormState>(key: K, value: ExpeditionFormState[K]) {
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
            placeholder="Annapurna Dawn"
            className={inputCls}
          />
        </Field>
        <Field label="Destination" hint="Defaults to the title.">
          <input
            value={form.destination}
            onChange={(e) => set("destination", e.target.value)}
            placeholder="Annapurna Base Camp"
            className={inputCls}
          />
        </Field>
        <Field label="Country">
          <input
            value={form.country}
            onChange={(e) => set("country", e.target.value)}
            placeholder="Nepal"
            className={inputCls}
          />
        </Field>
        <Field label="Departed">
          <input
            type="date"
            value={form.startDate}
            onChange={(e) => set("startDate", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Returned">
          <input
            type="date"
            value={form.endDate}
            onChange={(e) => set("endDate", e.target.value)}
            className={inputCls}
          />
        </Field>
      </div>

      <Field label="Description">
        <textarea
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          rows={3}
          placeholder="A short summary — this is what the dossier card shows."
          className={`${inputCls} resize-y`}
        />
      </Field>

      {/* ── The logbook ────────────────────────────────────────────────── */}
      <FormSection title="Expedition logbook">
        <p className="-mt-2 text-[11px] text-[var(--xp-muted)]">
          A figure left blank is omitted from the archive rather than printed as zero.
        </p>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Kind">
            <select
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              className={inputCls}
            >
              {CATEGORY_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Distance (km)">
            <input
              type="number"
              value={form.distanceKm}
              onChange={(e) => set("distanceKm", e.target.value)}
              placeholder="132"
              className={inputCls}
            />
          </Field>
          <Field label="Peak elevation (m)">
            <input
              type="number"
              value={form.elevationM}
              onChange={(e) => set("elevationM", e.target.value)}
              placeholder="4130"
              className={inputCls}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Transport">
            <input
              value={form.transportation}
              onChange={(e) => set("transportation", e.target.value)}
              placeholder="Motorcycle, train, on foot…"
              className={inputCls}
            />
          </Field>
          <Field label="Difficulty">
            <select
              value={form.difficulty}
              onChange={(e) => set("difficulty", e.target.value)}
              className={inputCls}
            >
              {DIFFICULTY_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <p className="text-[11px] text-[var(--xp-muted)]">
          Companions come from the places this trip reached, so they are recorded once, on the
          leg they were there for.
        </p>
      </FormSection>

      {/* ── Presentation ───────────────────────────────────────────────── */}
      <FormSection title="Presentation">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Cover image URL">
            <input
              value={form.coverImage}
              onChange={(e) => set("coverImage", e.target.value)}
              placeholder="https://…"
              className={inputCls}
            />
          </Field>
          <Field label="Status">
            <select
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
              className={inputCls}
            >
              {TRIP_STATUS_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <ArrayField
          label="Gallery"
          values={form.gallery}
          onChange={(v) => set("gallery", v)}
          placeholder="https://…"
        />

        <Toggle
          label="Feature on the archive's front page"
          checked={form.featured}
          onChange={(v) => set("featured", v)}
        />
      </FormSection>

      {/* ── Budget ─────────────────────────────────────────────────────── */}
      <FormSection title="Budget">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Budget">
            <input
              type="number"
              value={form.budget}
              onChange={(e) => set("budget", e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Currency">
            <input
              value={form.currency}
              onChange={(e) => set("currency", e.target.value)}
              placeholder="USD"
              className={inputCls}
            />
          </Field>
          <Field label="Travellers">
            <input
              type="number"
              min={1}
              value={form.travelers}
              onChange={(e) => set("travelers", e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>
      </FormSection>
    </>
  );
}
