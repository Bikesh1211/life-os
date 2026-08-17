"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { IconPlus, IconWorld, IconMapPin, IconStar, IconMoodSmile } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import {
  Card,
  Text,
  Group,
  Badge,
  Button,
  Modal,
  Select,
  TextInput,
  Textarea,
  Stack,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import dayjs from "dayjs";
import { CATEGORY_OPTIONS, ExploreFieldset, optionalNumber } from "./ExploreFields";

type VisitedPlace = {
  id: string;
  country: string;
  city: string;
  place: string | null;
  visitStart: string | null;
  visitEnd: string | null;
  rating: number | null;
  mood: string | null;
  notes: string | null;
  companions: string[];
  activities: string[];
  isFavorited: boolean;
};

/**
 * Logging a place, and putting it on the archive's map.
 *
 * Coordinates are the one Explore field worth reaching for: a place without
 * them is in every list and every count, but it is not on the map, because the
 * archive will not guess a position it was never given. The lookup button asks
 * the geocoder Life OS's travel planner already uses rather than making anyone
 * copy numbers out of Google Maps.
 */
function AddVisitedModal({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [place, setPlace] = useState("");
  const [visitStart, setVisitStart] = useState("");
  const [rating, setRating] = useState("");
  const [notes, setNotes] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [elevation, setElevation] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [locating, setLocating] = useState(false);
  const [saving, setSaving] = useState(false);

  async function locate() {
    const query = [place, city, country].filter((v) => v.trim()).join(", ");
    if (!query) return;
    setLocating(true);
    try {
      const response = await fetch(`/api/travel-helper/geocode?q=${encodeURIComponent(query)}`);
      const results = response.ok ? await response.json() : null;
      /* Nominatim answers with an array of matches, best first, and its `lat`
         and `lon` are strings. The first match is the one to take: refining a
         wrong guess is what the two fields underneath are for. */
      const hit = Array.isArray(results) ? results[0] : undefined;
      const lat = hit?.lat;
      const lng = hit?.lon;
      if (lat === undefined || lng === undefined) {
        notifications.show({
          title: "Not found",
          message: `No position found for “${query}”. Enter the coordinates by hand.`,
          color: "orange",
        });
        return;
      }
      setLatitude(String(lat));
      setLongitude(String(lng));
    } catch {
      notifications.show({
        title: "Lookup failed",
        message: "The geocoder could not be reached. Enter the coordinates by hand.",
        color: "red",
      });
    } finally {
      setLocating(false);
    }
  }

  async function handleSubmit() {
    if (!country.trim() || !city.trim()) return;
    setSaving(true);
    try {
      const response = await fetch("/api/travel/visited", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country,
          city,
          place: place.trim() || undefined,
          visitStart: visitStart ? new Date(visitStart).toISOString() : undefined,
          rating: optionalNumber(rating),
          notes: notes.trim() || undefined,
          category: category || undefined,
          latitude: optionalNumber(latitude),
          longitude: optionalNumber(longitude),
          elevation: optionalNumber(elevation),
          coverImage: coverImage.trim() || undefined,
        }),
      });

      if (!response.ok) {
        notifications.show({
          title: "Not saved",
          message: "The place could not be saved. Check the fields and try again.",
          color: "red",
        });
        return;
      }

      onClose();
      window.location.reload();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Add Visited Place" size="md">
      <Stack gap="sm">
        <Group grow>
          <TextInput label="Country" value={country} onChange={(e) => setCountry(e.currentTarget.value)} required />
          <TextInput label="City" value={city} onChange={(e) => setCity(e.currentTarget.value)} required />
        </Group>
        <TextInput
          label="Place"
          placeholder="The specific spot, if it has a name"
          value={place}
          onChange={(e) => setPlace(e.currentTarget.value)}
        />
        <Group grow>
          <TextInput label="Visited on" type="date" value={visitStart} onChange={(e) => setVisitStart(e.currentTarget.value)} />
          <TextInput label="Rating (1–10)" type="number" min={1} max={10} value={rating} onChange={(e) => setRating(e.currentTarget.value)} />
        </Group>
        <Textarea
          label="Notes"
          placeholder="What you want to remember about it"
          autosize
          minRows={2}
          value={notes}
          onChange={(e) => setNotes(e.currentTarget.value)}
        />

        <ExploreFieldset hint="Coordinates are what put this place on the Adventure Archive's map. Everything else is optional.">
          <Group align="flex-end" gap="xs" grow>
            <TextInput label="Latitude" placeholder="27.7172" value={latitude} onChange={(e) => setLatitude(e.currentTarget.value)} />
            <TextInput label="Longitude" placeholder="85.3240" value={longitude} onChange={(e) => setLongitude(e.currentTarget.value)} />
          </Group>
          <Button
            variant="light"
            size="xs"
            leftSection={<IconMapPin size={14} />}
            onClick={locate}
            loading={locating}
            disabled={!country.trim() && !city.trim()}
          >
            Look up coordinates
          </Button>
          <Group grow>
            <Select label="Kind" data={CATEGORY_OPTIONS} value={category} onChange={setCategory} clearable />
            <TextInput label="Elevation (m)" type="number" value={elevation} onChange={(e) => setElevation(e.currentTarget.value)} />
          </Group>
          <TextInput
            label="Cover image URL"
            placeholder="https://…"
            value={coverImage}
            onChange={(e) => setCoverImage(e.currentTarget.value)}
          />
        </ExploreFieldset>

        <Button fullWidth mt="sm" onClick={handleSubmit} loading={saving}>
          Save
        </Button>
      </Stack>
    </Modal>
  );
}

export function VisitedPanel() {
  const [places, setPlaces] = useState<VisitedPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [opened, { open, close }] = useDisclosure(false);

  useEffect(() => {
    fetch("/api/travel/visited")
      .then((r) => (r.ok ? r.json() : []))
      .then(setPlaces)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <>
        <div className="mb-6 h-8 w-48 animate-pulse rounded bg-[var(--mantine-color-dark-6,#1a1b1e)]" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-[var(--mantine-color-dark-6,#1a1b1e)]" />
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <Group justify="space-between" mb="lg">
        <div>
          <h2 className="text-2xl font-bold text-[var(--mantine-color-text,#c1c2c5)]">Visited Places</h2>
          <Text size="sm" c="dimmed">{places.length} places explored</Text>
        </div>
        <Button leftSection={<IconPlus size={18} />} onClick={open}>Add Place</Button>
      </Group>

      <AddVisitedModal opened={opened} onClose={close} />

      {places.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--mantine-color-dark-6,#1a1b1e)]">
            <IconWorld size={28} className="text-[var(--mantine-color-dimmed,#5c5f66)]" />
          </div>
          <h3 className="text-lg font-semibold">No Places Yet</h3>
          <p className="mt-1 text-sm text-[var(--mantine-color-dimmed,#5c5f66)]">Start logging where you have been.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {places.map((place, i) => (
            <motion.div
              key={place.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card shadow="sm" padding="md" radius="md" withBorder>
                <Group justify="space-between" mb="xs">
                  <Text fw={600} size="sm" lineClamp={1}>{place.place || place.city}</Text>
                  {place.rating && (
                    <Group gap={2}>
                      <IconStar size={14} className="text-[var(--mantine-color-yellow-6)]" />
                      <Text size="sm" fw={600}>{place.rating}</Text>
                    </Group>
                  )}
                </Group>
                <Group gap={4} mb="xs">
                  <IconMapPin size={14} className="text-[var(--mantine-color-dimmed,#5c5f66)]" />
                  <Text size="xs" c="dimmed">{place.city}, {place.country}</Text>
                </Group>
                <Group gap="xs">
                  {place.visitStart && (
                    <Text size="xs" c="dimmed">{dayjs(place.visitStart).format("MMM YYYY")}</Text>
                  )}
                  {place.mood && (
                    <Badge size="sm" variant="light" color="grape">{place.mood}</Badge>
                  )}
                  {place.isFavorited && (
                    <IconMoodSmile size={14} className="text-[var(--mantine-color-yellow-6)]" />
                  )}
                </Group>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </>
  );
}
