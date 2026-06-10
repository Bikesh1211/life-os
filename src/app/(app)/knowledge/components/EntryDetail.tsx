"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Stack,
  Title,
  Group,
  Text,
  Badge,
  Button,
  Paper,
  Divider,
  ActionIcon,
  Menu,
  SimpleGrid,
} from "@mantine/core";
import { showSuccess, showError } from "@/core/notifications";
import {
  IconEdit,
  IconTrash,
  IconDots,
  IconArrowBackUp,
  IconCheck,
  IconBooks,
} from "@tabler/icons-react";
import Link from "next/link";
import dayjs from "dayjs";
import type { KnowledgeEntry } from "@/modules/knowledge";
import type { KnowledgeEntryLink } from "@/modules/knowledge/repository";

type Props = {
  entry: KnowledgeEntry;
  links: Array<{
    link: KnowledgeEntryLink;
    linkedEntry: KnowledgeEntry;
  }>;
};

const difficultyColor: Record<string, string> = {
  beginner: "green",
  intermediate: "yellow",
  advanced: "red",
};

const reviewStatusColor: Record<string, string> = {
  not_reviewed: "gray",
  reviewing: "blue",
  mastered: "green",
};

export function EntryDetail({ entry, links }: Props) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete this entry?")) return;
    setDeleting(true);
    try {
      await fetch(`/api/knowledge/${entry.id}`, { method: "DELETE" });
      showSuccess("Entry has been deleted", "Deleted");
      router.push("/knowledge");
      router.refresh();
    } catch {
      showError("Failed to delete entry");
    } finally {
      setDeleting(false);
    }
  };

  const handleReview = async (action: "reviewed" | "mastered") => {
    try {
      await fetch("/api/knowledge/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryId: entry.id, action }),
      });
      showSuccess(
        action === "mastered" ? "Marked as mastered" : "Entry reviewed successfully",
        "Reviewed",
      );
      router.refresh();
    } catch {
      showError("Failed to record review");
    }
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-start">
        <div>
          <Group gap="xs" mb={4}>
            <Badge variant="light">{entry.subject}</Badge>
            {entry.subcategory && (
              <Badge variant="outline" color="gray">
                {entry.subcategory}
              </Badge>
            )}
            <Badge
              color={difficultyColor[entry.difficultyLevel] ?? "gray"}
              variant="dot"
            >
              {entry.difficultyLevel}
            </Badge>
            <Badge
              color={reviewStatusColor[entry.reviewStatus] ?? "gray"}
              variant="light"
            >
              {entry.reviewStatus.replace("_", " ")}
            </Badge>
          </Group>
          <Title order={2}>{entry.title}</Title>
          <Text size="sm" c="dimmed">
            Learned {dayjs(entry.dateLearned).format("MMMM D, YYYY")}
          </Text>
        </div>

        <Group gap="xs">
          <Button
            variant="light"
            color="green"
            size="sm"
            leftSection={<IconCheck size={16} />}
            onClick={() => handleReview("reviewed")}
          >
            Review
          </Button>
          <Button
            variant="light"
            size="sm"
            leftSection={<IconArrowBackUp size={16} />}
            onClick={() => handleReview("mastered")}
          >
            Mastered
          </Button>
          <Menu shadow="md">
            <Menu.Target>
              <ActionIcon variant="subtle">
                <IconDots size={18} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                component={Link}
                href={`/knowledge/${entry.id}/edit`}
                leftSection={<IconEdit size={16} />}
              >
                Edit
              </Menu.Item>
              <Menu.Item
                color="red"
                leftSection={<IconTrash size={16} />}
                onClick={handleDelete}
                disabled={deleting}
              >
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>

      {entry.summary && (
        <Paper withBorder p="md" radius="md">
          <Text size="sm" c="dimmed" mb={4}>Summary</Text>
          <Text>{entry.summary}</Text>
        </Paper>
      )}

      {entry.detailedNotes && (
        <Paper withBorder p="md" radius="md">
          <Text size="sm" c="dimmed" mb={4}>Detailed Notes</Text>
          <Text style={{ whiteSpace: "pre-wrap" }}>{entry.detailedNotes}</Text>
        </Paper>
      )}

      {entry.keyTakeaways && (
        <Paper withBorder p="md" radius="md">
          <Text size="sm" c="dimmed" mb={4}>Key Takeaways</Text>
          <Text style={{ whiteSpace: "pre-wrap" }}>{entry.keyTakeaways}</Text>
        </Paper>
      )}

      {entry.examples && (
        <Paper withBorder p="md" radius="md">
          <Text size="sm" c="dimmed" mb={4}>Examples</Text>
          <Text style={{ whiteSpace: "pre-wrap" }}>{entry.examples}</Text>
        </Paper>
      )}

      {entry.resources && (
        <Paper withBorder p="md" radius="md">
          <Text size="sm" c="dimmed" mb={4}>Resources / References</Text>
          <Text style={{ whiteSpace: "pre-wrap" }}>{entry.resources}</Text>
        </Paper>
      )}

      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <Paper withBorder p="md" radius="md">
          <Text size="sm" c="dimmed" mb="sm">Metrics</Text>
          <Stack gap="xs">
            <Group justify="space-between">
              <Text size="sm">Mastery Level</Text>
              <Text size="sm" fw={500}>{entry.masteryLevel}/10</Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm">Confidence Score</Text>
              <Text size="sm" fw={500}>{entry.confidenceScore}/10</Text>
            </Group>
            {entry.timeSpent && (
              <Group justify="space-between">
                <Text size="sm">Time Spent</Text>
                <Text size="sm" fw={500}>{entry.timeSpent} min</Text>
              </Group>
            )}
            {entry.learningSource && (
              <Group justify="space-between">
                <Text size="sm">Source</Text>
                <Text size="sm" fw={500}>{entry.learningSource}</Text>
              </Group>
            )}
          </Stack>
        </Paper>

        <Paper withBorder p="md" radius="md">
          <Text size="sm" c="dimmed" mb="sm">Tags</Text>
          <Group gap={4}>
            {entry.tags.length > 0 ? (
              entry.tags.map((tag) => (
                <Badge key={tag} variant="light">
                  {tag}
                </Badge>
              ))
            ) : (
              <Text size="sm" c="dimmed">No tags</Text>
            )}
          </Group>
          {entry.resourceUrl && (
            <>
              <Divider my="sm" />
              <Text size="sm" c="dimmed" mb={4}>Resource URL</Text>
              <Text
                component="a"
                href={entry.resourceUrl}
                target="_blank"
                size="sm"
                style={{ wordBreak: "break-all" }}
              >
                {entry.resourceUrl}
              </Text>
            </>
          )}
        </Paper>
      </SimpleGrid>

      {entry.nextActions && (
        <Paper withBorder p="md" radius="md">
          <Text size="sm" c="dimmed" mb={4}>Next Actions</Text>
          <Text style={{ whiteSpace: "pre-wrap" }}>{entry.nextActions}</Text>
        </Paper>
      )}

      {links.length > 0 && (
        <Paper withBorder p="md" radius="md">
          <Group mb="sm">
            <IconBooks size={20} />
            <Text fw={500}>Related Knowledge</Text>
          </Group>
          <Stack gap="xs">
            {links.map(({ link, linkedEntry }) => (
              <Paper
                key={link.id}
                component={Link}
                href={`/knowledge/${linkedEntry.id}`}
                p="sm"
                withBorder
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <Group justify="space-between">
                  <div>
                    <Text size="sm" fw={500}>{linkedEntry.title}</Text>
                    <Badge size="xs" variant="light">
                      {link.relationshipType.replace("_", " ")}
                    </Badge>
                  </div>
                  <Badge size="sm" color="gray" variant="outline">
                    {linkedEntry.masteryLevel}/10
                  </Badge>
                </Group>
              </Paper>
            ))}
          </Stack>
        </Paper>
      )}

      {entry.lastReviewedAt && (
        <Text size="xs" c="dimmed">
          Last reviewed: {dayjs(entry.lastReviewedAt).format("MMMM D, YYYY")}
        </Text>
      )}
    </Stack>
  );
}
