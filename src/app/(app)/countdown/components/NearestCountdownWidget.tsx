"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Paper, Group, Text, Stack, Box, Button } from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";
import { CATEGORY_CONFIG } from "@/app/(app)/countdown/components/categoryConfig";
import type { EnrichedCountdownEvent } from "@/modules/countdown";

export function NearestCountdownWidget() {
  const router = useRouter();
  const [event, setEvent] = useState<EnrichedCountdownEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/countdown?status=pending");
        if (res.ok) {
          const data: EnrichedCountdownEvent[] = await res.json();
          const upcoming = data
            .filter((e) => e.progress && !e.progress.isPast)
            .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
          if (upcoming.length > 0) setEvent(upcoming[0]);
        }
      } catch {}
      setLoading(false);
    })();
  }, []);

  if (loading || !event) return null;

  const cat = CATEGORY_CONFIG[event.category as keyof typeof CATEGORY_CONFIG] ?? CATEGORY_CONFIG.custom;
  const CatIcon = cat.icon;
  const target = event.targetDate ?? new Date(event.eventDate);
  const diff = Math.max(0, target.getTime() - Date.now());
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);

  return (
    <Paper
      p="md"
      radius="lg"
      style={{
        background: `linear-gradient(135deg, ${cat.color}12 0%, ${cat.color}06 100%)`,
        border: `1px solid ${cat.color}25`,
      }}
    >
      <Group gap="sm" wrap="nowrap">
        <Box
          style={{
            width: 36, height: 36, borderRadius: 10,
            background: `${cat.color}20`,
            color: cat.color,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <CatIcon size={20} />
        </Box>
        <Stack gap={0} style={{ flex: 1 }}>
          <Text size="xs" c="dimmed">Up Next</Text>
          <Text fw={600} size="sm" lineClamp={1}>{event.title}</Text>
          <Text size="xs" c="dimmed">{days}d {hours}h remaining</Text>
        </Stack>
        <Button
          variant="subtle"
          color={cat.color.replace("#", "")}
          size="compact-sm"
          rightSection={<IconArrowRight size={14} />}
          onClick={() => router.push(`/countdown/${event.id}`)}
        >
          View
        </Button>
      </Group>
    </Paper>
  );
}
