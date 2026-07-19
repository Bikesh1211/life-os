"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Stack,
  Group,
  Text,
  Card,
  Badge,
  TextInput,
  ActionIcon,
  Menu,
  Button,
  Select,
  SimpleGrid,
  Loader,
  Center,
  Modal,
  Textarea,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconSearch,
  IconRoute,
  IconStar,
  IconStarFilled,
  IconTrash,
  IconDots,
  IconMap2,
  IconCalendar,
  IconClock,
  IconPlus,
  IconFilter,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import type { RouteCard } from "@/modules/travel-helper";
import { RouteDetail } from "./RouteDetail";
import dayjs from "dayjs";

const TRANSPORT_ICONS: Record<string, string> = {
  driving: "🚗",
  motorcycle: "🏍️",
  walking: "🚶",
  cycling: "🚲",
};

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

export function RoutesTab() {
  const [routes, setRoutes] = useState<RouteCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [transportFilter, setTransportFilter] = useState<string | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<RouteCard | null>(null);
  const [detailOpened, { open: openDetail, close: closeDetail }] = useDisclosure(false);

  const fetchRoutes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (transportFilter) params.set("transportMode", transportFilter);
      const res = await fetch(`/api/travel-helper/routes?${params.toString()}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setRoutes(data);
      }
    } catch {
      notifications.show({ color: "red", title: "Error", message: "Failed to load routes" });
    } finally {
      setLoading(false);
    }
  }, [search, transportFilter]);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  const toggleFavorite = async (route: RouteCard) => {
    const res = await fetch(`/api/travel-helper/routes/${route.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFavorite: !route.isFavorite }),
    });
    if (res.ok) {
      setRoutes((prev) =>
        prev.map((r) => (r.id === route.id ? { ...r, isFavorite: !r.isFavorite } : r)),
      );
    }
  };

  const deleteRoute = async (route: RouteCard) => {
    const res = await fetch(`/api/travel-helper/routes/${route.id}`, { method: "DELETE" });
    if (res.ok) {
      setRoutes((prev) => prev.filter((r) => r.id !== route.id));
      notifications.show({ color: "green", title: "Deleted", message: `"${route.name}" deleted` });
    }
  };

  const openRouteDetail = (route: RouteCard) => {
    setSelectedRoute(route);
    openDetail();
  };

  if (loading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  return (
    <Stack gap="md">
      <Group>
        <TextInput
          placeholder="Search routes..."
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          style={{ flex: 1 }}
        />
        <Select
          placeholder="Mode"
          leftSection={<IconFilter size={16} />}
          data={[
            { value: "", label: "All modes" },
            { value: "driving", label: "Driving" },
            { value: "motorcycle", label: "Motorcycle" },
            { value: "walking", label: "Walking" },
            { value: "cycling", label: "Cycling" },
          ]}
          value={transportFilter}
          onChange={setTransportFilter}
          clearable
          w={160}
        />
      </Group>

      {routes.length === 0 ? (
        <Center py="xl">
          <Stack align="center" gap="sm">
            <IconRoute size={48} color="gray" />
            <Text c="dimmed">No routes yet</Text>
            <Text size="sm" c="dimmed">
              Go to the Planner tab to create your first route
            </Text>
          </Stack>
        </Center>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
          {routes.map((route) => (
            <Card
              key={route.id}
              shadow="sm"
              padding="md"
              radius="md"
              withBorder
              style={{ cursor: "pointer" }}
              onClick={() => openRouteDetail(route)}
            >
              <Stack gap="xs">
                <Group justify="space-between" wrap="nowrap">
                  <Group gap="xs" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                    <Text size="lg">{TRANSPORT_ICONS[route.transportMode] ?? "🚗"}</Text>
                    <Text fw={600} truncate>
                      {route.name}
                    </Text>
                  </Group>
                  <Group gap={4} wrap="nowrap">
                    <ActionIcon
                      variant="subtle"
                      color="yellow"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(route);
                      }}
                    >
                      {route.isFavorite ? <IconStarFilled size={16} /> : <IconStar size={16} />}
                    </ActionIcon>
                    <Menu withinPortal>
                      <Menu.Target>
                        <ActionIcon
                          variant="subtle"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <IconDots size={16} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item
                          leftSection={<IconTrash size={14} />}
                          color="red"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteRoute(route);
                          }}
                        >
                          Delete
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Group>
                </Group>

                <Text size="sm" c="dimmed" truncate>
                  {route.origin.label} → {route.destination.label}
                </Text>

                <Group gap="xs">
                  {route.totalDistanceKm && (
                    <Badge variant="light" size="sm">
                      {route.totalDistanceKm} km
                    </Badge>
                  )}
                  {route.totalDurationMinutes && (
                    <Badge variant="light" size="sm" color="blue">
                      {formatDuration(route.totalDurationMinutes)}
                    </Badge>
                  )}
                  {route.routeDate && (
                    <Badge variant="light" size="sm" color="green">
                      {dayjs(route.routeDate).format("MMM D, YYYY")}
                    </Badge>
                  )}
                </Group>

                {route.tags.length > 0 && (
                  <Group gap={4}>
                    {route.tags.map((tag) => (
                      <Badge key={tag} variant="dot" size="sm" color="gray">
                        {tag}
                      </Badge>
                    ))}
                  </Group>
                )}
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      )}

      <Modal
        opened={detailOpened}
        onClose={closeDetail}
        size="xl"
        title={selectedRoute?.name ?? "Route Details"}
      >
        {selectedRoute && <RouteDetail route={selectedRoute} onClose={closeDetail} />}
      </Modal>
    </Stack>
  );
}
