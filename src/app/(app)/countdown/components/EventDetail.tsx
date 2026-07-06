"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Stack, Group, Text, Badge, Button, Box, Title, ActionIcon,
  Card, Grid, Tooltip, Loader, Center, Progress,
} from "@mantine/core";
import {
  IconArrowLeft, IconHeart, IconShare, IconClock,
  IconMapPin, IconUser, IconCalendarEvent, IconNotes,
  IconEdit, IconTrash, IconBell, IconListCheck,
  IconPhoto, IconStar,
} from "@tabler/icons-react";
import { AnimatedCountdown } from "../components/AnimatedCountdown";
import { CATEGORY_CONFIG } from "../components/categoryConfig";
import type { EnrichedCountdownEvent, CountdownProgress } from "@/modules/countdown";

type Props = {
  eventId: string;
};

export function EventDetail({ eventId }: Props) {
  const router = useRouter();
  const [event, setEvent] = useState<EnrichedCountdownEvent | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchEvent = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/countdown/${eventId}`);
      if (res.ok) {
        const data = await res.json();
        setEvent(data);
      }
    } catch {}
    setLoading(false);
  }, [eventId]);

  useEffect(() => { fetchEvent(); }, [fetchEvent]);

  if (loading) {
    return <Center h={400}><Loader /></Center>;
  }

  if (!event) {
    return <Center h={400}><Text c="dimmed">Event not found</Text></Center>;
  }

  const cat = CATEGORY_CONFIG[event.category as keyof typeof CATEGORY_CONFIG] ?? CATEGORY_CONFIG.custom;
  const CatIcon = cat.icon;
  const targetDate = event.targetDate ?? new Date(event.eventDate);
  const progress = event.progress;
  const isComplete = progress?.isPast ?? false;

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <ActionIcon variant="subtle" color="gray" size="lg" onClick={() => router.push("/countdown")}>
          <IconArrowLeft size={20} />
        </ActionIcon>
        <Group gap="xs">
          <Tooltip label={event.isFavorited ? "Remove from favorites" : "Add to favorites"}>
            <ActionIcon variant={event.isFavorited ? "filled" : "subtle"} color="red" size="lg">
              <IconHeart size={18} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Share">
            <ActionIcon variant="subtle" color="gray" size="lg">
              <IconShare size={18} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Edit">
            <ActionIcon variant="subtle" color="gray" size="lg" onClick={() => router.push(`/countdown/${event.id}/edit`)}>
              <IconEdit size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      {event.bannerImage && (
        <Box
          style={{
            width: "100%", height: 240, borderRadius: 16,
            backgroundImage: `url(${event.bannerImage})`,
            backgroundSize: "cover", backgroundPosition: "center",
            position: "relative", overflow: "hidden",
          }}
        >
          <Box
            style={{
              position: "absolute", inset: 0,
              background: `linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)`,
            }}
          />
          <Box style={{ position: "absolute", bottom: 16, left: 16, color: "white" }}>
            <Group gap="xs">
              <CatIcon size={20} />
              <Badge variant="white" size="sm">{cat.label}</Badge>
            </Group>
          </Box>
        </Box>
      )}

      <Group gap="xs">
        {!event.bannerImage && (
          <Box
            style={{
              width: 48, height: 48, borderRadius: 12,
              background: `${cat.color}20`,
              color: cat.color,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <CatIcon size={28} />
          </Box>
        )}
        <div>
          <Title order={2}>{event.title}</Title>
          {event.description && (
            <Text c="dimmed" size="sm">{event.description}</Text>
          )}
        </div>
      </Group>

      {isComplete ? (
        <Stack align="center" gap="md" py="xl">
          <Text size="xl" fw={700}>Today is the day!</Text>
          <Text c="dimmed">{new Date(event.eventDate).toLocaleDateString()}</Text>
        </Stack>
      ) : (
        <Card padding="xl" radius="lg" withBorder>
          <AnimatedCountdown targetDate={targetDate} size="lg" />
        </Card>
      )}

      {progress && (
        <Box>
          <Group justify="space-between" mb="xs">
            <Text size="sm" c="dimmed">Progress</Text>
            <Text size="sm" fw={600}>{progress.elapsedPercent}%</Text>
          </Group>
          <Progress value={progress.elapsedPercent} color={cat.color} size="md" radius="md" animated />
        </Box>
      )}

      <Grid>
        {event.eventTime && (
          <Grid.Col span={{ base: 6, sm: 3 }}>
            <Card padding="sm" radius="md" withBorder>
              <Group gap="xs">
                <IconClock size={16} className="opacity-50" />
                <Text size="xs" c="dimmed">Time</Text>
              </Group>
              <Text fw={600} size="sm">{event.eventTime}</Text>
            </Card>
          </Grid.Col>
        )}
        {event.timezone && (
          <Grid.Col span={{ base: 6, sm: 3 }}>
            <Card padding="sm" radius="md" withBorder>
              <Group gap="xs">
                <IconCalendarEvent size={16} className="opacity-50" />
                <Text size="xs" c="dimmed">Timezone</Text>
              </Group>
              <Text fw={600} size="sm">{event.timezone}</Text>
            </Card>
          </Grid.Col>
        )}
        {event.location && (
          <Grid.Col span={{ base: 6, sm: 3 }}>
            <Card padding="sm" radius="md" withBorder>
              <Group gap="xs">
                <IconMapPin size={16} className="opacity-50" />
                <Text size="xs" c="dimmed">Location</Text>
              </Group>
              <Text fw={600} size="sm" lineClamp={1}>{event.location}</Text>
            </Card>
          </Grid.Col>
        )}
        {event.organizer && (
          <Grid.Col span={{ base: 6, sm: 3 }}>
            <Card padding="sm" radius="md" withBorder>
              <Group gap="xs">
                <IconUser size={16} className="opacity-50" />
                <Text size="xs" c="dimmed">Organizer</Text>
              </Group>
              <Text fw={600} size="sm" lineClamp={1}>{event.organizer}</Text>
            </Card>
          </Grid.Col>
        )}
      </Grid>

      {event.notes && (
        <Card padding="md" radius="lg" withBorder>
          <Group gap="xs" mb="sm">
            <IconNotes size={16} className="opacity-50" />
            <Text fw={600} size="sm">Notes</Text>
          </Group>
          <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>{event.notes}</Text>
        </Card>
      )}

      <Group gap="md">
        <Button
          variant="light"
          color="red"
          leftSection={<IconTrash size={16} />}
          onClick={async () => {
            if (confirm("Delete this countdown?")) {
              await fetch(`/api/countdown/${event.id}`, { method: "DELETE" });
              router.push("/countdown");
            }
          }}
        >
          Delete
        </Button>
      </Group>
    </Stack>
  );
}
