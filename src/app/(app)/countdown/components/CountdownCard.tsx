"use client";

import { useRouter } from "next/navigation";
import { Card, Stack, Group, Text, Badge, Box, ActionIcon } from "@mantine/core";
import { IconHeart, IconBell } from "@tabler/icons-react";
import { AnimatedCountdown } from "./AnimatedCountdown";
import { CATEGORY_CONFIG } from "./categoryConfig";
import type { EnrichedCountdownEvent } from "@/modules/countdown";

type Props = {
  event: EnrichedCountdownEvent;
};

export function CountdownCard({ event }: Props) {
  const router = useRouter();
  const cat = CATEGORY_CONFIG[event.category as keyof typeof CATEGORY_CONFIG] ?? CATEGORY_CONFIG.custom;
  const CatIcon = cat.icon;
  const targetDate = event.targetDate ?? new Date(event.eventDate);
  const progress = event.progress;

  return (
    <Card
      padding="lg"
      radius="lg"
      style={{
        border: `1px solid ${cat.color}20`,
        cursor: "pointer",
        transition: "box-shadow 0.2s, transform 0.2s",
      }}
      onClick={() => router.push(`/countdown/${event.id}`)}
      className="hover:shadow-md hover:-translate-y-0.5"
    >
      <Stack gap="sm">
        <Group justify="space-between" wrap="nowrap">
          <Group gap="xs" wrap="nowrap">
            <Box
              style={{
                width: 32, height: 32, borderRadius: 8,
                background: `${cat.color}20`,
                color: cat.color,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <CatIcon size={18} />
            </Box>
            <Badge size="sm" variant="light" color={cat.color.replace("#", "")}>
              {cat.label}
            </Badge>
          </Group>
          <Group gap={4} wrap="nowrap">
            {event.isFavorited && <IconHeart size={14} color="#ec4899" fill="#ec4899" />}
            <ActionIcon variant="subtle" color="gray" size="sm" onClick={(e) => e.stopPropagation()}>
              <IconBell size={14} />
            </ActionIcon>
          </Group>
        </Group>

        <Text fw={600} size="md" lineClamp={1}>{event.title}</Text>

        {event.coverImage && (
          <Box
            style={{
              width: "100%", height: 120, borderRadius: 8,
              backgroundImage: `url(${event.coverImage})`,
              backgroundSize: "cover", backgroundPosition: "center",
            }}
          />
        )}

        <AnimatedCountdown targetDate={targetDate} size="sm" showLabels={false} />

        <Group gap={4}>
          <Text size="xs" c="dimmed">{new Date(event.eventDate).toLocaleDateString()}</Text>
          {event.eventTime && <Text size="xs" c="dimmed">• {event.eventTime}</Text>}
        </Group>

        {progress && (
          <Box style={{ width: "100%", height: 3, background: "#e9ecef", borderRadius: 2, overflow: "hidden" }}>
            <Box
              style={{
                width: `${progress.elapsedPercent}%`,
                height: "100%",
                background: cat.color,
                borderRadius: 2,
                transition: "width 1s ease",
              }}
            />
          </Box>
        )}
      </Stack>
    </Card>
  );
}
