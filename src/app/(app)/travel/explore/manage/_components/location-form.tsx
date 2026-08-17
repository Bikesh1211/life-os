"use client";

import { useState } from "react";
import { parseMapsUrl } from "@/modules/travel/explore/maps";
import {
  ArrayField,
  Field,
  FormSection,
  MapsUrlPreview,
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
  PLANNING_OPTIONS,
  PRIORITY_OPTIONS,
  type LocationKind,
  type TripRecord,
  type VisitedRecord,
  type WishlistRecord,
} from "./types";

/**
 * A place, visited or still wanted.
 *
 * One form over two tables, because a bucket-list entry and a visited place are
 * the same record at two moments in its life — which is how Explore reads them
 * and so how the desk should let them be written. The `kind` selector chooses
 * the table on a new record; on an existing one it is fixed, because a row
 * cannot change which table it lives in, and the transition that actually
 * matters (a plan coming true) is the "Reached" toggle on a planned record.
 */

export interface LocationFormState {
  kind: LocationKind;
  name: string;
  city: string;
  country: string;
  mapsUrl: string;
  latitude: string;
  longitude: string;
  coverImage: string;
  gallery: string[];
  category: string;
  notes: string;
  isFavorited: boolean;
  /* Visited only. */
  visitStart: string;
  visitEnd: string;
  tripId: string;
  rating: string;
  elevation: string;
  companions: string[];
  activities: string[];
  /* Planned only. */
  whyVisit: string;
  bestSeason: string;
  difficulty: string;
  priority: string;
  planningStatus: string;
  estimatedBudget: string;
  plannedYear: string;
  tags: string[];
  reached: boolean;
  visitedAt: string;
}

export const emptyLocation: LocationFormState = {
  kind: "VISITED",
  name: "",
  city: "",
  country: "",
  mapsUrl: "",
  latitude: "",
  longitude: "",
  coverImage: "",
  gallery: [],
  category: "",
  notes: "",
  isFavorited: false,
  visitStart: "",
  visitEnd: "",
  tripId: "",
  rating: "",
  elevation: "",
  companions: [],
  activities: [],
  whyVisit: "",
  bestSeason: "",
  difficulty: "",
  priority: "medium",
  planningStatus: "",
  estimatedBudget: "",
  plannedYear: "",
  tags: [],
  reached: false,
  visitedAt: "",
};

export function visitedToForm(r: VisitedRecord): LocationFormState {
  return {
    ...emptyLocation,
    kind: "VISITED",
    name: r.place ?? r.city,
    city: r.city,
    country: r.country,
    mapsUrl: r.mapsUrl ?? "",
    latitude: r.latitude != null ? String(r.latitude) : "",
    longitude: r.longitude != null ? String(r.longitude) : "",
    coverImage: r.coverImage ?? "",
    gallery: r.gallery ?? [],
    category: r.category ?? "",
    notes: r.notes ?? "",
    isFavorited: r.isFavorited,
    visitStart: toDateInput(r.visitStart),
    visitEnd: toDateInput(r.visitEnd),
    tripId: r.tripId ?? "",
    rating: r.rating != null ? String(r.rating) : "",
    elevation: r.elevation != null ? String(r.elevation) : "",
    companions: r.companions ?? [],
    activities: r.activities ?? [],
  };
}

export function wishlistToForm(r: WishlistRecord): LocationFormState {
  return {
    ...emptyLocation,
    kind: "PLANNED",
    name: r.title,
    city: r.city ?? "",
    country: r.country ?? "",
    latitude: r.latitude != null ? String(r.latitude) : "",
    longitude: r.longitude != null ? String(r.longitude) : "",
    coverImage: r.coverImage ?? "",
    category: r.category ?? "",
    notes: r.description ?? "",
    isFavorited: r.isFavorited,
    whyVisit: r.whyVisit ?? "",
    bestSeason: r.bestSeason ?? "",
    difficulty: r.difficulty ?? "",
    priority: r.priority ?? "medium",
    planningStatus: r.planningStatus ?? "",
    estimatedBudget: r.estimatedBudget != null ? String(r.estimatedBudget) : "",
    plannedYear: r.plannedYear != null ? String(r.plannedYear) : "",
    tags: r.tags ?? [],
    reached: r.isVisited,
    visitedAt: toDateInput(r.visitedAt),
  };
}

/**
 * The request the form becomes.
 *
 * Blank fields go as explicit `null` rather than being omitted: `JSON.stringify`
 * drops `undefined` keys, so an omitted field would leave the stored value in
 * place and emptying a box would silently do nothing.
 */
export function locationBody(form: LocationFormState): Record<string, unknown> {
  /* A pasted link wins over the coordinate boxes when it actually contains a
     fix, so correcting the link is enough — nobody has to remember to clear the
     old numbers underneath it too. */
  const parsed = parseMapsUrl(form.mapsUrl);
  const latitude = parsed.lat ?? numberOrNull(form.latitude);
  const longitude = parsed.lng ?? numberOrNull(form.longitude);

  if (form.kind === "VISITED") {
    return {
      /* `city` is required by the API and `place` is the specific spot. A name
         typed with no city becomes the city, so the record is never nameless. */
      country: form.country.trim(),
      city: form.city.trim() || form.name.trim(),
      place: textOrNull(form.name),
      visitStart: dateOrNull(form.visitStart),
      visitEnd: dateOrNull(form.visitEnd),
      tripId: textOrNull(form.tripId),
      rating: numberOrNull(form.rating),
      notes: textOrNull(form.notes),
      companions: form.companions.filter(Boolean),
      activities: form.activities.filter(Boolean),
      isFavorited: form.isFavorited,
      category: textOrNull(form.category),
      latitude,
      longitude,
      elevation: numberOrNull(form.elevation),
      coverImage: textOrNull(form.coverImage),
      gallery: form.gallery.filter(Boolean),
      mapsUrl: textOrNull(form.mapsUrl),
    };
  }

  return {
    title: form.name.trim(),
    country: textOrNull(form.country),
    city: textOrNull(form.city),
    description: textOrNull(form.notes),
    priority: form.priority || "medium",
    category: textOrNull(form.category),
    estimatedBudget: numberOrNull(form.estimatedBudget),
    bestSeason: textOrNull(form.bestSeason),
    coverImage: textOrNull(form.coverImage),
    whyVisit: textOrNull(form.whyVisit),
    plannedYear: numberOrNull(form.plannedYear),
    tags: form.tags.filter(Boolean),
    isFavorited: form.isFavorited,
    latitude,
    longitude,
    difficulty: textOrNull(form.difficulty),
    planningStatus: textOrNull(form.planningStatus),
    isVisited: form.reached,
    visitedAt: form.reached ? dateOrNull(form.visitedAt) : null,
  };
}

export function LocationForm({
  form,
  setForm,
  trips,
  editing,
}: {
  form: LocationFormState;
  setForm: (updater: (f: LocationFormState) => LocationFormState) => void;
  trips: TripRecord[];
  editing: boolean;
}) {
  const [showCoords, setShowCoords] = useState(
    () => Boolean(form.latitude || form.longitude) && !form.mapsUrl,
  );

  function set<K extends keyof LocationFormState>(key: K, value: LocationFormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const planned = form.kind === "PLANNED";

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Kind"
          hint={
            editing
              ? "Fixed once saved — a record cannot change which list it belongs to."
              : undefined
          }
        >
          <select
            value={form.kind}
            onChange={(e) => set("kind", e.target.value as LocationKind)}
            disabled={editing}
            className={inputCls}
          >
            <option value="VISITED">Visited place</option>
            <option value="PLANNED">Bucket list</option>
          </select>
        </Field>

        <Field label="Name *">
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            required
            placeholder={planned ? "Santorini" : "Phewa Lake"}
            className={inputCls}
          />
        </Field>

        <Field label={planned ? "City" : "City *"}>
          <input
            value={form.city}
            onChange={(e) => set("city", e.target.value)}
            required={!planned}
            placeholder="Pokhara"
            className={inputCls}
          />
        </Field>

        <Field label={planned ? "Country" : "Country *"}>
          <input
            value={form.country}
            onChange={(e) => set("country", e.target.value)}
            required={!planned}
            placeholder="Nepal"
            className={inputCls}
          />
        </Field>
      </div>

      {/* ── Position ───────────────────────────────────────────────────── */}
      <FormSection title="Position">
        <Field label="Google Maps URL">
          <input
            value={form.mapsUrl}
            onChange={(e) => set("mapsUrl", e.target.value)}
            placeholder="https://www.google.com/maps/place/…/@28.2096,83.9856,13z/…"
            className={inputCls}
          />
        </Field>
        <MapsUrlPreview url={form.mapsUrl} />

        <button
          type="button"
          onClick={() => setShowCoords((v) => !v)}
          className="text-xs text-[var(--xp-primary)] transition-opacity hover:opacity-80"
        >
          {showCoords ? "Hide coordinates" : "Enter coordinates by hand"}
        </button>

        {showCoords && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Latitude">
              <input
                value={form.latitude}
                onChange={(e) => set("latitude", e.target.value)}
                placeholder="28.2096"
                className={inputCls}
              />
            </Field>
            <Field label="Longitude">
              <input
                value={form.longitude}
                onChange={(e) => set("longitude", e.target.value)}
                placeholder="83.9856"
                className={inputCls}
              />
            </Field>
          </div>
        )}
      </FormSection>

      {/* ── The record ─────────────────────────────────────────────────── */}
      <FormSection title="The record">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Kind of place">
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
          <Field label="Cover image URL">
            <input
              value={form.coverImage}
              onChange={(e) => set("coverImage", e.target.value)}
              placeholder="https://…"
              className={inputCls}
            />
          </Field>
        </div>

        <Field label={planned ? "Description" : "Notes"}>
          <textarea
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            rows={3}
            placeholder={
              planned ? "What is it?" : "What you want to remember about it"
            }
            className={`${inputCls} resize-y`}
          />
        </Field>

        {!planned && (
          <ArrayField
            label="Gallery"
            values={form.gallery}
            onChange={(v) => set("gallery", v)}
            placeholder="https://…"
          />
        )}

        <Toggle
          label="Favourite"
          checked={form.isFavorited}
          onChange={(v) => set("isFavorited", v)}
        />
      </FormSection>

      {/* ── Visited ────────────────────────────────────────────────────── */}
      {!planned && (
        <FormSection title="The visit">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Arrived">
              <input
                type="date"
                value={form.visitStart}
                onChange={(e) => set("visitStart", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Left">
              <input
                type="date"
                value={form.visitEnd}
                onChange={(e) => set("visitEnd", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field
              label="Expedition"
              hint="Linking a place to a trip puts it on that expedition's route."
            >
              <select
                value={form.tripId}
                onChange={(e) => set("tripId", e.target.value)}
                className={inputCls}
              >
                <option value="">None</option>
                {trips.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Rating (1–10)">
              <input
                type="number"
                min={1}
                max={10}
                value={form.rating}
                onChange={(e) => set("rating", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Elevation (m)">
              <input
                type="number"
                value={form.elevation}
                onChange={(e) => set("elevation", e.target.value)}
                placeholder="1400"
                className={inputCls}
              />
            </Field>
          </div>

          <ArrayField
            label="Companions"
            values={form.companions}
            onChange={(v) => set("companions", v)}
            placeholder="Who came along?"
          />
          <ArrayField
            label="Activities"
            values={form.activities}
            onChange={(v) => set("activities", v)}
            placeholder="Boating, sunrise hike…"
          />
        </FormSection>
      )}

      {/* ── Planned ────────────────────────────────────────────────────── */}
      {planned && (
        <FormSection title="The plan">
          <Field label="Why this one">
            <textarea
              value={form.whyVisit}
              onChange={(e) => set("whyVisit", e.target.value)}
              rows={2}
              placeholder="What makes it worth the trip?"
              className={`${inputCls} resize-y`}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Best season">
              <input
                value={form.bestSeason}
                onChange={(e) => set("bestSeason", e.target.value)}
                placeholder="Oct–Nov"
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
            <Field label="Priority">
              <select
                value={form.priority}
                onChange={(e) => set("priority", e.target.value)}
                className={inputCls}
              >
                {PRIORITY_OPTIONS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Planning status">
              <select
                value={form.planningStatus}
                onChange={(e) => set("planningStatus", e.target.value)}
                className={inputCls}
              >
                {PLANNING_OPTIONS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Estimated budget">
              <input
                type="number"
                value={form.estimatedBudget}
                onChange={(e) => set("estimatedBudget", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Planned year">
              <input
                type="number"
                value={form.plannedYear}
                onChange={(e) => set("plannedYear", e.target.value)}
                placeholder="2027"
                className={inputCls}
              />
            </Field>
          </div>

          <ArrayField
            label="Tags"
            values={form.tags}
            onChange={(v) => set("tags", v)}
            placeholder="island, diving…"
          />

          <div className="rounded-lg border border-dashed border-[var(--xp-border)] p-4">
            <Toggle
              label="Reached — move this into the visited archive"
              checked={form.reached}
              onChange={(v) => set("reached", v)}
            />
            <p className="mt-1.5 text-[11px] text-[var(--xp-muted)]">
              This one field is the whole of it: a reached destination leaves The Next Expeditions
              and appears on the map, in the timeline and in the counts. Nothing is copied, so
              unticking it puts the plan back.
            </p>
            {form.reached && (
              <div className="mt-3 max-w-xs">
                <Field label="Reached on">
                  <input
                    type="date"
                    value={form.visitedAt}
                    onChange={(e) => set("visitedAt", e.target.value)}
                    className={inputCls}
                  />
                </Field>
              </div>
            )}
          </div>
        </FormSection>
      )}
    </>
  );
}
