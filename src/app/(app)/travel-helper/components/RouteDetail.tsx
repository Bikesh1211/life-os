"use client";

import { useEffect, useRef, useState } from "react";
import {
  Stack,
  Group,
  Text,
  Badge,
  ActionIcon,
  TextInput,
  Textarea,
  Button,
  Divider,
  SimpleGrid,
  Paper,
  Tooltip,
} from "@mantine/core";
import {
  IconMapPin,
  IconFlag,
  IconRoute,
  IconClock,
  IconTrendingUp,
  IconTrendingDown,
  IconMaximize,
  IconMinimize,
  IconStar,
  IconStarFilled,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { apiFetch } from "@/core/api/http";
import type { RouteCard } from "@/modules/travel-helper";
import dayjs from "dayjs";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface RouteDetailProps {
  route: RouteCard;
  onClose: () => void;
}

const TRANSPORT_LABELS: Record<string, string> = {
  driving: "Driving",
  motorcycle: "Motorcycle",
  walking: "Walking",
  cycling: "Cycling",
};

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function RouteDetail({ route, onClose }: RouteDetailProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(route.name);
  const [description, setDescription] = useState(route.description ?? "");
  const [notes, setNotes] = useState(route.notes ?? "");
  const [isFavorite, setIsFavorite] = useState(route.isFavorite);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: true,
      attributionControl: false,
    }).setView([0, 0], 2);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    const allCoords: [number, number][] = [
      [route.origin.lat, route.origin.lng],
      ...route.waypoints.map((w) => [w.lat, w.lng] as [number, number]),
      [route.destination.lat, route.destination.lng],
    ];

    L.marker([route.origin.lat, route.origin.lng], {
      icon: L.divIcon({
        className: "custom-marker",
        html: '<div style="background:#228be6;color:white;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:bold;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3)">A</div>',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      }),
    })
      .bindPopup(`<b>Start:</b> ${route.origin.label}`)
      .addTo(map);

    route.waypoints.forEach((wp, i) => {
      L.marker([wp.lat, wp.lng], {
        icon: L.divIcon({
          className: "custom-marker",
          html: `<div style="background:#fab005;color:white;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:bold;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3)">${i + 1}</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        }),
      })
        .bindPopup(`<b>Stop ${i + 1}:</b> ${wp.label}`)
        .addTo(map);
    });

    L.marker([route.destination.lat, route.destination.lng], {
      icon: L.divIcon({
        className: "custom-marker",
        html: '<div style="background:#e03131;color:white;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:bold;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3)">B</div>',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      }),
    })
      .bindPopup(`<b>End:</b> ${route.destination.label}`)
      .addTo(map);

    if (route.geometries) {
      const geo = route.geometries as { type: string; coordinates: [number, number][] };
      if (geo.type === "LineString" && geo.coordinates?.length) {
        const latlngs = geo.coordinates.map((c: [number, number]) => [c[1], c[0]] as [number, number]);
        L.polyline(latlngs, { color: "#228be6", weight: 4, opacity: 0.8 }).addTo(map);
        map.fitBounds(latlngs, { padding: [40, 40] });
      }
    } else if (allCoords.length > 1) {
      L.polyline(allCoords, { color: "#228be6", weight: 3, opacity: 0.6, dashArray: "8, 8" }).addTo(map);
      map.fitBounds(allCoords, { padding: [40, 40] });
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [route]);

  const saveChanges = async () => {
    setSaving(true);
    try {
      await apiFetch(`/api/travel-helper/routes/${route.id}`, {
        method: "PATCH",
        body: JSON.stringify({ name, description: description || null, notes: notes || null, isFavorite }),
      });
      notifications.show({ color: "green", title: "Saved", message: "Route updated" });
      setIsEditing(false);
    } catch {
      notifications.show({ color: "red", title: "Error", message: "Failed to save" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack gap="md">
      <div
        ref={mapRef}
        style={{ height: 300, borderRadius: 8, overflow: "hidden", zIndex: 0 }}
      />

      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
        <Paper withBorder p="sm" radius="md">
          <Group gap="xs">
            <IconRoute size={16} color="gray" />
            <Text size="xs" c="dimmed">Distance</Text>
          </Group>
          <Text fw={600}>{route.totalDistanceKm ? `${route.totalDistanceKm} km` : "—"}</Text>
        </Paper>
        <Paper withBorder p="sm" radius="md">
          <Group gap="xs">
            <IconClock size={16} color="gray" />
            <Text size="xs" c="dimmed">Duration</Text>
          </Group>
          <Text fw={600}>{route.totalDurationMinutes ? formatDuration(route.totalDurationMinutes) : "—"}</Text>
        </Paper>
        <Paper withBorder p="sm" radius="md">
          <Group gap="xs">
            <IconMapPin size={16} color="gray" />
            <Text size="xs" c="dimmed">Mode</Text>
          </Group>
          <Text fw={600}>{TRANSPORT_LABELS[route.transportMode] ?? route.transportMode}</Text>
        </Paper>
        <Paper withBorder p="sm" radius="md">
          <Group gap="xs">
            <IconTrendingUp size={16} color="gray" />
            <Text size="xs" c="dimmed">Elevation</Text>
          </Group>
          <Text fw={600}>
            {route.elevationGain ? `+${route.elevationGain}m` : "—"}
            {route.elevationLoss ? ` / -${route.elevationLoss}m` : ""}
          </Text>
        </Paper>
      </SimpleGrid>

      <Divider />

      {isEditing ? (
        <Stack gap="sm">
          <TextInput
            label="Name"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
          />
          <Textarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.currentTarget.value)}
            autosize
            minRows={2}
          />
          <Textarea
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.currentTarget.value)}
            autosize
            minRows={3}
          />
          <Group>
            <Button onClick={saveChanges} loading={saving}>
              Save
            </Button>
            <Button variant="subtle" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </Group>
        </Stack>
      ) : (
        <Stack gap="sm">
          {route.description && (
            <Text size="sm" c="dimmed">
              {route.description}
            </Text>
          )}
          <Group gap="xs">
            <Text size="sm" fw={500}>From:</Text>
            <Text size="sm">{route.origin.label}</Text>
            {route.origin.address && (
              <Text size="xs" c="dimmed">({route.origin.address})</Text>
            )}
          </Group>
          {route.waypoints.length > 0 && (
            <Stack gap={4}>
              <Text size="sm" fw={500}>Stops ({route.waypoints.length}):</Text>
              {route.waypoints.map((wp, i) => (
                <Group key={i} gap="xs">
                  <Badge size="sm" variant="light" color="yellow">
                    {i + 1}
                  </Badge>
                  <Text size="sm">{wp.label}</Text>
                  {wp.notes && <Text size="xs" c="dimmed">— {wp.notes}</Text>}
                </Group>
              ))}
            </Stack>
          )}
          <Group gap="xs">
            <Text size="sm" fw={500}>To:</Text>
            <Text size="sm">{route.destination.label}</Text>
            {route.destination.address && (
              <Text size="xs" c="dimmed">({route.destination.address})</Text>
            )}
          </Group>
          {route.tags.length > 0 && (
            <Group gap={4}>
              {route.tags.map((tag) => (
                <Badge key={tag} variant="dot" size="sm">
                  {tag}
                </Badge>
              ))}
            </Group>
          )}
          {route.routeDate && (
            <Text size="sm" c="dimmed">
              Date: {dayjs(route.routeDate).format("MMMM D, YYYY")}
            </Text>
          )}
          {route.notes && (
            <>
              <Divider />
              <Text size="sm" fw={500}>Notes:</Text>
              <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                {route.notes}
              </Text>
            </>
          )}
          <Group>
            <Button variant="light" onClick={() => setIsEditing(true)}>
              Edit Details
            </Button>
            <Button
              variant="subtle"
              onClick={() => {
                setIsFavorite(!isFavorite);
                apiFetch(`/api/travel-helper/routes/${route.id}`, {
                  method: "PATCH",
                  body: JSON.stringify({ isFavorite: !isFavorite }),
                }).catch(() => {});
              }}
              color="yellow"
            >
              {isFavorite ? "Unfavorite" : "Favorite"}
            </Button>
          </Group>
        </Stack>
      )}
    </Stack>
  );
}
