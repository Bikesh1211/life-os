"use client";

import { useState } from "react";
import {
  SimpleGrid,
  Paper,
  Group,
  Text,
  ThemeIcon,
  Badge,
  Button,
  Stack,
  Modal,
  Timeline,
  Box,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconSunrise,
  IconBook,
  IconBrain,
  IconRun,
  IconMoon,
  IconCopy,
  IconRepeat,
} from "@tabler/icons-react";
import { useRoutineTemplates, useCloneTemplate } from "@/hooks/use-routine-templates";

const iconMap: Record<string, React.ElementType> = {
  sunrise: IconSunrise,
  book: IconBook,
  brain: IconBrain,
  run: IconRun,
  moon: IconMoon,
};

export function RoutineTemplateGallery() {
  const { data: templates, isLoading } = useRoutineTemplates();
  const cloneTemplate = useCloneTemplate();
  const [previewId, setPreviewId] = useState<string | null>(null);

  const preview = templates?.find((t) => t.id === previewId);

  async function handleClone(templateId: string) {
    try {
      await cloneTemplate.mutateAsync(templateId);
      notifications.show({
        title: "Routine Created",
        message: "Template has been cloned to your routines",
        color: "green",
      });
    } catch {
      notifications.show({
        title: "Error",
        message: "Failed to clone template",
        color: "red",
      });
    }
  }

  if (isLoading) {
    return (
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Paper key={i} withBorder p="md" radius="md">
            <div className="h-24 animate-pulse rounded bg-[var(--mantine-color-dark-6)]" />
          </Paper>
        ))}
      </SimpleGrid>
    );
  }

  if (!templates || templates.length === 0) {
    return (
      <Paper withBorder p="xl" radius="md" ta="center">
        <Text c="dimmed">No templates available</Text>
      </Paper>
    );
  }

  return (
    <>
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
        {templates.map((template) => {
          const Icon = template.icon ? iconMap[template.icon] : IconRepeat;
          return (
            <Paper
              key={template.id}
              withBorder
              p="md"
              radius="md"
              className="hover:border-blue-500/30 transition-colors"
            >
              <Stack gap="sm">
                <Group gap="sm" wrap="nowrap">
                  <ThemeIcon
                    variant="light"
                    color={template.color ?? "blue"}
                    size="lg"
                    radius="md"
                  >
                    <Icon size={20} />
                  </ThemeIcon>
                  <div className="flex-1 min-w-0">
                    <Text size="sm" fw={600} lineClamp={1}>
                      {template.name}
                    </Text>
                    {template.description && (
                      <Text size="xs" c="dimmed" lineClamp={2}>
                        {template.description}
                      </Text>
                    )}
                  </div>
                </Group>

                <Group gap={4}>
                  <Badge size="sm" variant="light">
                    {template.items.length} activities
                  </Badge>
                  <Badge size="sm" variant="outline" color="gray">
                    {template.scheduleType === "daily"
                      ? "Every day"
                      : template.scheduleType === "weekdays"
                        ? "Weekdays"
                        : template.scheduleType === "weekends"
                          ? "Weekends"
                          : "Custom"}
                  </Badge>
                </Group>

                <Group grow>
                  <Button
                    variant="light"
                    size="xs"
                    onClick={() => setPreviewId(template.id)}
                  >
                    Preview
                  </Button>
                  <Button
                    size="xs"
                    leftSection={<IconCopy size={14} />}
                    loading={cloneTemplate.isPending}
                    onClick={() => handleClone(template.id)}
                  >
                    Use Template
                  </Button>
                </Group>
              </Stack>
            </Paper>
          );
        })}
      </SimpleGrid>

      <Modal
        opened={!!preview}
        onClose={() => setPreviewId(null)}
        title={preview?.name}
        size="md"
      >
        {preview && (
          <Stack gap="md">
            <Text size="sm" c="dimmed">
              {preview.description}
            </Text>
            <Timeline active={-1} bulletSize={20} lineWidth={2}>
              {preview.items
                .sort((a, b) => a.order - b.order)
                .map((item) => (
                  <Timeline.Item
                    key={item.id}
                    title={
                      <Group gap="xs">
                        <Text size="sm" fw={500}>
                          {item.title}
                        </Text>
                        {item.isOptional && (
                          <Badge size="xs" variant="outline" color="gray">
                            Optional
                          </Badge>
                        )}
                      </Group>
                    }
                  >
                    <Text size="xs" c="dimmed">
                      {item.startTime}
                      {item.endTime ? ` - ${item.endTime}` : ""}
                    </Text>
                  </Timeline.Item>
                ))}
            </Timeline>
            <Button
              fullWidth
              leftSection={<IconCopy size={16} />}
              onClick={() => handleClone(preview.id)}
              loading={cloneTemplate.isPending}
            >
              Use This Template
            </Button>
          </Stack>
        )}
      </Modal>
    </>
  );
}
