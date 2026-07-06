"use client";

import { useRouter } from "next/navigation";
import { Card, Stack, Group, Text, Badge, Button, Box } from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";
import { AnimatedCountdown } from "./AnimatedCountdown";
import { CATEGORY_CONFIG } from "./categoryConfig";
import type { EnrichedCountdownEvent } from "@/modules/countdown";

type Props = {
  event: EnrichedCountdownEvent;
};

export function NearestEvent({ event }: Props) {
  const router = useRouter();
  const cat = CATEGORY_CONFIG[event.category as keyof typeof CATEGORY_CONFIG] ?? CATEGORY_CONFIG.custom;
  const CatIcon = cat.icon;
  const targetDate = event.targetDate ?? new Date(event.eventDate);
  const progress = event.progress;

  return (
    <Card
      padding="xl"
      radius="lg"
      style={{
        background: `linear-gradient(135deg, ${cat.color}15 0%, ${cat.color}08 100%)`,
        border: `1px solid ${cat.color}30`,
      }}
    >
      <Stack gap="md">
        <Group gap="xs">
          <Box
            style={{
              width: 40, height: 40, borderRadius: 12,
              background: `${cat.color}20`,
              color: cat.color,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <CatIcon size={22} />
          </Box>
          <div>
            <Text size="sm" c="dimmed">{cat.label}</Text>
            <Text fw={700} size="lg">{event.title}</Text>
          </div>
        </Group>

        <AnimatedCountdown targetDate={targetDate} size="lg" />

        {progress && (
          <>
            <Box style={{ width: "100%", height: 4, background: "#e9ecef", borderRadius: 2, overflow: "hidden" }}>
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
            <Group justify="space-between">
              <Text size="xs" c="dimmed">{progress.elapsedPercent}% complete</Text>
              <Text size="xs" c="dimmed">{progress.totalDays} days total</Text>
            </Group>
          </>
        )}

        <Button
          variant="light"
          color={cat.color.replace("#", "")}
          rightSection={<IconArrowRight size={16} />}
          fullWidth
          onClick={() => router.push(`/countdown/${event.id}`)}
        >
          View Details
        </Button>
      </Stack>
    </Card>
  );
}
