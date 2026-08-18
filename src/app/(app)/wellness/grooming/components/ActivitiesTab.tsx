"use client";

import { Stack, Group, Text, Paper, SimpleGrid, ThemeIcon, Badge, ActionIcon, Menu, TextInput, Select, Button, Box } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import {
  IconDotsVertical,
  IconEdit,
  IconArchive,
  IconTrash,
  IconEye,
  IconEyeOff,
  IconSearch,
  IconFilter,
  IconCircleCheck,
  IconCircleDashed,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { PageHeader } from "@/components/ui/page-header";
import { apiFetch } from "@/core/api/http";

const CATEGORY_COLORS: Record<string, string> = {
  "hair-care": "#81C784",
  "face-care": "#FFB74D",
  "skin-care": "#F48FB1",
  "dental-care": "#4FC3F7",
  "body-care": "#CE93D8",
  "personal-hygiene": "#FF8A65",
  "clothing-care": "#90CAF9",
  custom: "#B0BEC5",
};

function ActivityCard({ activity }: { activity: any }) {
  const isOverdue = activity.nextDueDate && activity.nextDueDate < dayjs().format("YYYY-MM-DD") && !activity.isCompletedToday;
  const categoryColor = CATEGORY_COLORS[activity.groomingCategory ?? "custom"] ?? "#B0BEC5";

  return (
    <Paper withBorder p="md" radius="lg" style={{ opacity: activity.isArchived ? 0.5 : 1 }}>
      <Group>
        <ThemeIcon size="md" radius="xl" color={activity.isCompletedToday ? "green" : isOverdue ? "red" : categoryColor} variant="light">
          <IconCircleCheck size={16} />
        </ThemeIcon>
        <Box style={{ flex: 1 }}>
          <Group gap="xs">
            <Text fw={600} size="sm">{activity.habit?.title}</Text>
            {activity.isArchived && <Badge size="xs" color="gray">Archived</Badge>}
            {isOverdue && <Badge size="xs" color="red">Overdue</Badge>}
          </Group>
          <Group gap="xs" mt={2}>
            <Badge size="xs" color={categoryColor} variant="dot">
              {activity.groomingCategory ?? "Uncategorized"}
            </Badge>
            <Text size="xs" c="dimmed">
              {activity.habit?.frequencyType === "daily" ? "Daily" :
               activity.habit?.frequencyType === "every_x_days" ? `Every ${activity.habit.frequencyInterval} days` :
               activity.habit?.frequencyType === "every_x_weeks" ? `Every ${activity.habit.frequencyInterval} weeks` :
               activity.habit?.frequencyType ?? activity.habit?.frequency}
            </Text>
          </Group>
        </Box>
        <Menu shadow="md" width={160}>
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray"><IconDotsVertical size={16} /></ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item leftSection={<IconEdit size={14} />}>Edit</Menu.Item>
            <Menu.Item leftSection={activity.isArchived ? <IconEye size={14} /> : <IconEyeOff size={14} />}>
              {activity.isArchived ? "Unarchive" : "Archive"}
            </Menu.Item>
            <Menu.Item leftSection={<IconTrash size={14} />} color="red">Delete</Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Paper>
  );
}

export function ActivitiesTab() {
  const { data: activities, isLoading } = useQuery({
    queryKey: ["wellness", "grooming", "activities"],
    queryFn: async () => {
      return apiFetch<any[]>("/api/wellness/grooming/activities");
    },
  });

  const list = activities ?? [];

  return (
    <Stack gap="lg">
      <PageHeader title="Grooming Activities" subtitle="Manage your personal care routines" />

      <Group>
        <TextInput
          placeholder="Search activities..."
          leftSection={<IconSearch size={16} />}
          style={{ flex: 1 }}
        />
        <Select
          placeholder="Category"
          leftSection={<IconFilter size={14} />}
          data={[
            { value: "", label: "All" },
            { value: "hair-care", label: "Hair Care" },
            { value: "face-care", label: "Face Care" },
            { value: "skin-care", label: "Skin Care" },
            { value: "dental-care", label: "Dental Care" },
            { value: "body-care", label: "Body Care" },
            { value: "personal-hygiene", label: "Personal Hygiene" },
            { value: "clothing-care", label: "Clothing Care" },
          ]}
          clearable
        />
      </Group>

      {list.length === 0 && (
        <Paper withBorder p="xl" radius="lg" ta="center">
          <Text c="dimmed" size="lg">No grooming activities yet</Text>
          <Text c="dimmed" size="sm">Click "Load Defaults" on the Dashboard to add preset activities</Text>
        </Paper>
      )}

      <SimpleGrid cols={{ base: 1, sm: 2 }}>
        {list.map((activity: any) => (
          <ActivityCard key={activity.id} activity={activity} />
        ))}
      </SimpleGrid>
    </Stack>
  );
}
