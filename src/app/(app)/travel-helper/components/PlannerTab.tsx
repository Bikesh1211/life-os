"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Stack,
  Group,
  Text,
  TextInput,
  Button,
  Select,
  Card,
  Badge,
  ActionIcon,
  Divider,
  ScrollArea,
  Paper,
  Collapse,
  Loader,
  Center,
  SimpleGrid,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconMapPin,
  IconFlag,
  IconPlus,
  IconX,
  IconRoute,
  IconClock,
  IconSearch,
  IconArrowRight,
  IconDeviceFloppy,
  IconMaximize,
  IconMinimize,
  IconTrendingUp,
  IconTrendingDown,
  IconGripVertical,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { apiFetch, ApiError } from "@/core/api/http";
import type { Waypoint } from "@/modules/travel-helper/types";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const TRANSPORT_OPTIONS = [
  { value: "driving", label: "🚗 Driving" },
  { value: "motorcycle", label: "🏍️ Motorcycle" },
  { value: "walking", label: "🚶 Walking" },
  { value: "cycling", label: "🚲 Cycling" },
];

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

interface GeocodingResult {
  display_name: string;
  lat: string;
  lon: string;
}

async function geocode(query: string): Promise<GeocodingResult[]> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
    { headers: { "User-Agent": "LifeOS-TravelHelper/1.0" } },
  );
  if (!res.ok) return [];
  return res.json();
}

function apiErrorText(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    const body = error.body as { error?: unknown } | null | undefined;
    if (body && typeof body.error === "string") return body.error;
    return fallback;
  }
  return error instanceof Error ? error.message : fallback;
}

export function PlannerTab() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const polylineRef = useRef<L.Polyline | null>(null);

  const [transportMode, setTransportMode] = useState<string>("driving");
  const [origin, setOrigin] = useState<Waypoint | null>(null);
  const [destination, setDestination] = useState<Waypoint | null>(null);
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [routeName, setRouteName] = useState("");
  const [routeDate, setRouteDate] = useState("");
  const [routeTags, setRouteTags] = useState("");

  const [originSearch, setOriginSearch] = useState("");
  const [destSearch, setDestSearch] = useState("");
  const [waypointSearch, setWaypointSearch] = useState("");
  const [originResults, setOriginResults] = useState<GeocodingResult[]>([]);
  const [destResults, setDestResults] = useState<GeocodingResult[]>([]);
  const [waypointResults, setWaypointResults] = useState<GeocodingResult[]>([]);
  const [showOriginSearch, setShowOriginSearch] = useState(false);
  const [showDestSearch, setShowDestSearch] = useState(false);
  const [showWaypointSearch, setShowWaypointSearch] = useState(false);

  const [routeResult, setRouteResult] = useState<{
    distanceKm: number;
    durationMinutes: number;
    polyline: string;
    geometry: unknown;
    elevation: { min: number | null; max: number | null; gain: number | null; loss: number | null } | null;
    steps: Array<{ instruction: string; distance: number; duration: number; name?: string; mode?: string; location: [number, number] }>;
    legs: Array<{ distanceKm: number; durationMinutes: number }>;
  } | null>(null);
  const [computing, setComputing] = useState(false);
  const [saving, setSaving] = useState(false);

  const initMap = useCallback(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: true,
      attributionControl: false,
    }).setView([20, 0], 2);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);

    map.on("click", (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      const label = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      const wp: Waypoint = { label, lat, lng };

      if (!origin) {
        setOrigin(wp);
        setShowOriginSearch(false);
      } else if (!destination) {
        setDestination(wp);
        setShowDestSearch(false);
      } else {
        setWaypoints((prev) => [...prev, wp]);
      }
    });

    mapInstanceRef.current = map;
  }, [origin, destination]);

  useEffect(() => {
    initMap();
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [initMap]);

  /* Update markers whenever waypoints change */
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    /* Clear old markers */
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    const allCoords: [number, number][] = [];

    if (origin) {
      allCoords.push([origin.lat, origin.lng]);
      const m = L.marker([origin.lat, origin.lng], {
        icon: L.divIcon({
          className: "custom-marker",
          html: '<div style="background:#228be6;color:white;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:bold;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3)">A</div>',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        }),
      })
        .bindPopup(`<b>Start:</b> ${origin.label}`)
        .addTo(map);
      markersRef.current.push(m);
    }

    waypoints.forEach((wp, i) => {
      allCoords.push([wp.lat, wp.lng]);
      const m = L.marker([wp.lat, wp.lng], {
        icon: L.divIcon({
          className: "custom-marker",
          html: `<div style="background:#fab005;color:white;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:bold;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3)">${i + 1}</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        }),
      })
        .bindPopup(`<b>Stop ${i + 1}:</b> ${wp.label}`)
        .addTo(map);
      markersRef.current.push(m);
    });

    if (destination) {
      allCoords.push([destination.lat, destination.lng]);
      const m = L.marker([destination.lat, destination.lng], {
        icon: L.divIcon({
          className: "custom-marker",
          html: '<div style="background:#e03131;color:white;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:bold;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3)">B</div>',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        }),
      })
        .bindPopup(`<b>End:</b> ${destination.label}`)
        .addTo(map);
      markersRef.current.push(m);
    }

    if (allCoords.length > 1) {
      const line = L.polyline(allCoords, {
        color: "#228be6",
        weight: 3,
        opacity: 0.5,
        dashArray: "8, 8",
      }).addTo(map);
      polylineRef.current = line;
      map.fitBounds(allCoords, { padding: [40, 40] });
    }
  }, [origin, destination, waypoints]);

  /* Update route result polyline when routeResult changes */
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    if (routeResult?.geometry) {
      const geo = routeResult.geometry as { type: string; coordinates: [number, number][] };
      if (geo.type === "LineString" && geo.coordinates?.length) {
        const latlngs = geo.coordinates.map((c) => [c[1], c[0]] as [number, number]);
        polylineRef.current = L.polyline(latlngs, {
          color: "#228be6",
          weight: 5,
          opacity: 0.9,
        }).addTo(map);
        map.fitBounds(latlngs, { padding: [40, 40] });
      }
    }
  }, [routeResult]);

  const handleGeocodeSearch = async (
    query: string,
    setResults: React.Dispatch<React.SetStateAction<GeocodingResult[]>>,
  ) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const results = await geocode(query);
    setResults(results);
  };

  const selectGeocodingResult = (
    result: GeocodingResult,
    setter: React.Dispatch<React.SetStateAction<Waypoint | null>>,
    setSearch: React.Dispatch<React.SetStateAction<string>>,
    setResults: React.Dispatch<React.SetStateAction<GeocodingResult[]>>,
    setShow: React.Dispatch<React.SetStateAction<boolean>>,
  ) => {
    const wp: Waypoint = {
      label: result.display_name.split(",")[0].trim(),
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      address: result.display_name,
    };
    setter(wp);
    setSearch(result.display_name.split(",")[0].trim());
    setResults([]);
    setShow(false);
  };

  const computeRoute = async () => {
    if (!origin || !destination) {
      notifications.show({
        color: "yellow",
        title: "Missing waypoints",
        message: "Please set both origin and destination",
      });
      return;
    }

    setComputing(true);
    try {
      const data = await apiFetch<any>("/api/travel-helper/route", {
        method: "POST",
        body: JSON.stringify({ origin, destination, waypoints, transportMode }),
      });
      setRouteResult(data);
    } catch (err) {
      notifications.show({
        color: "red",
        title: "Route computation failed",
        message: apiErrorText(err, "Failed to compute route"),
      });
    } finally {
      setComputing(false);
    }
  };

  const saveRoute = async () => {
    if (!origin || !destination || !routeResult) return;
    if (!routeName.trim()) {
      notifications.show({ color: "yellow", title: "Name required", message: "Please enter a route name" });
      return;
    }

    setSaving(true);
    try {
      const tags = routeTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      await apiFetch("/api/travel-helper/routes", {
        method: "POST",
        body: JSON.stringify({
          name: routeName.trim(),
          origin,
          destination,
          waypoints,
          polyline: routeResult.polyline,
          totalDistanceKm: routeResult.distanceKm,
          totalDurationMinutes: routeResult.durationMinutes,
          transportMode,
          routeDate: routeDate || null,
          tags,
          elevationMin: routeResult.elevation?.min ?? null,
          elevationMax: routeResult.elevation?.max ?? null,
          elevationGain: routeResult.elevation?.gain ?? null,
          elevationLoss: routeResult.elevation?.loss ?? null,
          geometries: routeResult.geometry,
        }),
      });
      notifications.show({
        color: "green",
        title: "Saved!",
        message: `"${routeName.trim()}" has been saved`,
      });
      resetPlanner();
    } catch (err) {
      notifications.show({
        color: "red",
        title: "Error",
        message: apiErrorText(err, "Failed to save route"),
      });
    } finally {
      setSaving(false);
    }
  };

  const resetPlanner = () => {
    setOrigin(null);
    setDestination(null);
    setWaypoints([]);
    setRouteResult(null);
    setRouteName("");
    setRouteDate("");
    setRouteTags("");
    setOriginSearch("");
    setDestSearch("");
    setWaypointSearch("");
    setShowOriginSearch(false);
    setShowDestSearch(false);
    setShowWaypointSearch(false);
  };

  const removeWaypoint = (index: number) => {
    setWaypoints((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Stack gap="md">
      {/* Transport Mode & Route Name */}
      <Group>
        <Select
          data={TRANSPORT_OPTIONS}
          value={transportMode}
          onChange={(v) => setTransportMode(v ?? "driving")}
          w={200}
        />
        <TextInput
          placeholder="Route name (for saving)"
          value={routeName}
          onChange={(e) => setRouteName(e.currentTarget.value)}
          style={{ flex: 1 }}
        />
      </Group>

      {/* Map */}
      <Paper withBorder radius="md" style={{ overflow: "hidden" }}>
        <div ref={mapRef} style={{ height: 400, zIndex: 0 }} />
      </Paper>

      <Text size="xs" c="dimmed">
        Click on the map to set points, or search below. First click = Origin (A), second = Destination (B), more = Waypoints.
      </Text>

      {/* Origin */}
      <Card withBorder padding="sm" radius="md">
        <Group gap="xs" mb="xs">
          <IconMapPin size={18} color="#228be6" />
          <Text fw={600} size="sm">Origin</Text>
          {origin && (
            <Badge size="sm" color="blue" variant="light">
              {origin.label}
            </Badge>
          )}
          {origin && (
            <ActionIcon
              variant="subtle"
              size="sm"
              onClick={() => {
                setOrigin(null);
                setOriginSearch("");
              }}
              ml="auto"
            >
              <IconX size={14} />
            </ActionIcon>
          )}
        </Group>
        {!origin && (
          <>
            <TextInput
              placeholder="Search for a place..."
              value={originSearch}
              onChange={(e) => {
                setOriginSearch(e.currentTarget.value);
                handleGeocodeSearch(e.currentTarget.value, setOriginResults);
              }}
              leftSection={<IconSearch size={16} />}
              onFocus={() => setShowOriginSearch(true)}
            />
            {showOriginSearch && originResults.length > 0 && (
              <ScrollArea h={150}>
                <Stack gap={2} mt="xs">
                  {originResults.map((r, i) => (
                    <Paper
                      key={i}
                      p="xs"
                      withBorder
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        selectGeocodingResult(r, setOrigin, setOriginSearch, setOriginResults, setShowOriginSearch)
                      }
                    >
                      <Text size="sm">{r.display_name}</Text>
                    </Paper>
                  ))}
                </Stack>
              </ScrollArea>
            )}
          </>
        )}
      </Card>

      {/* Waypoints */}
      <Card withBorder padding="sm" radius="md">
        <Group gap="xs" mb="xs">
          <IconFlag size={18} color="#fab005" />
          <Text fw={600} size="sm">Waypoints</Text>
          <Badge size="sm" color="yellow" variant="light">
            {waypoints.length}
          </Badge>
        </Group>

        {waypoints.length > 0 && (
          <Stack gap={4} mb="sm">
            {waypoints.map((wp, i) => (
              <Group key={i} gap="xs">
                <Badge size="sm" variant="light" color="yellow">
                  {i + 1}
                </Badge>
                <Text size="sm" style={{ flex: 1 }}>
                  {wp.label}
                </Text>
                <ActionIcon variant="subtle" size="sm" color="red" onClick={() => removeWaypoint(i)}>
                  <IconX size={14} />
                </ActionIcon>
              </Group>
            ))}
          </Stack>
        )}

        <Group>
          <TextInput
            placeholder="Add a waypoint..."
            value={waypointSearch}
            onChange={(e) => {
              setWaypointSearch(e.currentTarget.value);
              handleGeocodeSearch(e.currentTarget.value, setWaypointResults);
            }}
            leftSection={<IconSearch size={16} />}
            style={{ flex: 1 }}
            onFocus={() => setShowWaypointSearch(true)}
          />
        </Group>

        {showWaypointSearch && waypointResults.length > 0 && (
          <ScrollArea h={120} mt="xs">
            <Stack gap={2}>
              {waypointResults.map((r, i) => (
                <Paper
                  key={i}
                  p="xs"
                  withBorder
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    const wp: Waypoint = {
                      label: r.display_name.split(",")[0].trim(),
                      lat: parseFloat(r.lat),
                      lng: parseFloat(r.lon),
                      address: r.display_name,
                    };
                    setWaypoints((prev) => [...prev, wp]);
                    setWaypointSearch("");
                    setWaypointResults([]);
                    setShowWaypointSearch(false);
                  }}
                >
                  <Text size="sm">{r.display_name}</Text>
                </Paper>
              ))}
            </Stack>
          </ScrollArea>
        )}
      </Card>

      {/* Destination */}
      <Card withBorder padding="sm" radius="md">
        <Group gap="xs" mb="xs">
          <IconFlag size={18} color="#e03131" />
          <Text fw={600} size="sm">Destination</Text>
          {destination && (
            <Badge size="sm" color="red" variant="light">
              {destination.label}
            </Badge>
          )}
          {destination && (
            <ActionIcon
              variant="subtle"
              size="sm"
              onClick={() => {
                setDestination(null);
                setDestSearch("");
              }}
              ml="auto"
            >
              <IconX size={14} />
            </ActionIcon>
          )}
        </Group>
        {!destination && (
          <>
            <TextInput
              placeholder="Search for a place..."
              value={destSearch}
              onChange={(e) => {
                setDestSearch(e.currentTarget.value);
                handleGeocodeSearch(e.currentTarget.value, setDestResults);
              }}
              leftSection={<IconSearch size={16} />}
              onFocus={() => setShowDestSearch(true)}
            />
            {showDestSearch && destResults.length > 0 && (
              <ScrollArea h={150} mt="xs">
                <Stack gap={2}>
                  {destResults.map((r, i) => (
                    <Paper
                      key={i}
                      p="xs"
                      withBorder
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        selectGeocodingResult(r, setDestination, setDestSearch, setDestResults, setShowDestSearch)
                      }
                    >
                      <Text size="sm">{r.display_name}</Text>
                    </Paper>
                  ))}
                </Stack>
              </ScrollArea>
            )}
          </>
        )}
      </Card>

      {/* Compute Route Button */}
      <Button
        leftSection={<IconRoute size={18} />}
        onClick={computeRoute}
        loading={computing}
        disabled={!origin || !destination}
        fullWidth
        size="md"
      >
        Compute Route
      </Button>

      {/* Route Result */}
      {routeResult && (
        <>
          <Divider label="Route Summary" labelPosition="center" />

          <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
            <Paper withBorder p="sm" radius="md">
              <Text size="xs" c="dimmed">Distance</Text>
              <Text fw={600}>{routeResult.distanceKm} km</Text>
            </Paper>
            <Paper withBorder p="sm" radius="md">
              <Text size="xs" c="dimmed">Duration</Text>
              <Text fw={600}>{formatDuration(routeResult.durationMinutes)}</Text>
            </Paper>
            {routeResult.elevation?.gain !== null && (
              <Paper withBorder p="sm" radius="md">
                <Text size="xs" c="dimmed">Elevation Gain</Text>
                <Text fw={600}>+{routeResult.elevation?.gain ?? 0}m</Text>
              </Paper>
            )}
            {routeResult.elevation?.loss !== null && (
              <Paper withBorder p="sm" radius="md">
                <Text size="xs" c="dimmed">Elevation Loss</Text>
                <Text fw={600}>-{routeResult.elevation?.loss ?? 0}m</Text>
              </Paper>
            )}
          </SimpleGrid>

          {routeResult.steps.length > 0 && (
            <>
              <Divider label="Turn-by-Turn Directions" labelPosition="center" />
              <ScrollArea h={200}>
                <Stack gap={2}>
                  {routeResult.steps.map((step, i) => (
                    <Group key={i} gap="xs" p="xs" style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}>
                      <Badge size="sm" variant="light" color="gray" w={50}>
                        {step.distance > 1000
                          ? `${(step.distance / 1000).toFixed(1)}km`
                          : `${step.distance}m`}
                      </Badge>
                      <Text size="sm" style={{ flex: 1 }}>
                        {step.instruction}
                        {step.name ? ` on ${step.name}` : ""}
                      </Text>
                    </Group>
                  ))}
                </Stack>
              </ScrollArea>
            </>
          )}

          <Divider />

          {/* Save Options */}
          <Group>
            <TextInput
              placeholder="Route date (YYYY-MM-DD)"
              value={routeDate}
              onChange={(e) => setRouteDate(e.currentTarget.value)}
              w={200}
            />
            <TextInput
              placeholder="Tags (comma-separated)"
              value={routeTags}
              onChange={(e) => setRouteTags(e.currentTarget.value)}
              style={{ flex: 1 }}
            />
          </Group>

          <Group>
            <Button
              leftSection={<IconDeviceFloppy size={18} />}
              onClick={saveRoute}
              loading={saving}
              disabled={!routeName.trim()}
            >
              Save Route
            </Button>
            <Button variant="subtle" onClick={resetPlanner}>
              Clear
            </Button>
          </Group>
        </>
      )}
    </Stack>
  );
}
