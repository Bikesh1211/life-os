"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  SimpleGrid, Group, Text, Badge, TextInput, Stack, Center, Loader,
  Button, Menu, ActionIcon, Tooltip, Card, SegmentedControl, Select,
  RingProgress, Paper,
} from "@mantine/core";
import { useRouter, useSearchParams } from "next/navigation";
import {
  IconBooks, IconDotsVertical, IconEdit, IconEye, IconTrash,
  IconSearch, IconPlus, IconGridDots, IconList, IconClock,
  IconBook2, IconStar, IconStarFilled, IconFileText,
  IconArchive, IconRotate, IconShare, IconFileExport,
  IconHeart, IconHeartFilled, IconArrowUp,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { PageHeader } from "@/components/ui/page-header";

type Book = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  coverUrl: string | null;
  bannerUrl: string | null;
  status: "draft" | "published" | "archived";
  bookType: string | null;
  genre: string | null;
  wordCount: number;
  chapterCount: number;
  targetWordCount: number | null;
  targetChapterCount: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

const statusColor: Record<string, string> = {
  draft: "yellow",
  published: "green",
  archived: "gray",
};

const viewOptions = [
  { value: "library", label: "Library" },
  { value: "drafts", label: "Drafts" },
  { value: "published", label: "Published" },
  { value: "archive", label: "Archive" },
  { value: "trash", label: "Trash" },
];

const sortOptions = [
  { value: "updatedAt", label: "Last Updated" },
  { value: "createdAt", label: "Created" },
  { value: "title", label: "Title" },
  { value: "wordCount", label: "Word Count" },
];

function estimateReadingTime(wordCount: number): string {
  const minutes = Math.max(1, Math.round(wordCount / 200));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function BookCard({ book, index, onDelete, onToggleFavorite }: {
  book: Book;
  index: number;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}) {
  const router = useRouter();
  const progress = book.targetWordCount
    ? Math.min(100, Math.round((book.wordCount / book.targetWordCount) * 100))
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      layout
    >
      <Card
        padding={0}
        radius="md"
        withBorder
        style={{ cursor: "pointer", overflow: "hidden", height: "100%" }}
        onClick={() => router.push(`/creator-studio/books/${book.id}`)}
      >
        <Card.Section
          h={200}
          style={{
            background: book.coverUrl
              ? `url(${book.coverUrl}) center/cover no-repeat`
              : "linear-gradient(135deg, var(--mantine-color-blue-8), var(--mantine-color-violet-8))",
            position: "relative",
            display: "flex",
            alignItems: "flex-end",
            padding: 16,
          }}
        >
          <Group gap="xs" style={{ position: "absolute", top: 12, right: 12 }}>
            <Badge
              color={statusColor[book.status]}
              size="sm"
              variant="filled"
              style={{ textTransform: "capitalize" }}
            >
              {book.status}
            </Badge>
          </Group>

          {book.bookType && (
            <Badge size="sm" variant="white" style={{ textTransform: "capitalize" }}>
              {book.bookType.replace(/-/g, " ")}
            </Badge>
          )}
        </Card.Section>

        <div style={{ padding: "12px 16px 16px" }}>
          <Group justify="space-between" wrap="nowrap" mb={4} gap={4}>
            <Text fw={600} lineClamp={1} style={{ flex: 1, minWidth: 0 }}>
              {book.title}
            </Text>
            <Menu withinPortal position="bottom-end" shadow="md">
              <Menu.Target>
                <ActionIcon
                  variant="subtle"
                  size="sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <IconDotsVertical size={14} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<IconEdit size={14} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/creator-studio/books/${book.id}/write`);
                  }}
                >
                  Continue Writing
                </Menu.Item>
                {book.status === "published" && (
                  <Menu.Item
                    leftSection={<IconEye size={14} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/creator-studio/books/${book.id}/read`);
                    }}
                  >
                    Read
                  </Menu.Item>
                )}
                <Menu.Item
                  leftSection={<IconFileExport size={14} />}
                  onClick={(e) => e.stopPropagation()}
                >
                  Export
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconShare size={14} />}
                  onClick={(e) => e.stopPropagation()}
                >
                  Share
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  leftSection={<IconArchive size={14} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/creator-studio/books/${book.id}`);
                  }}
                >
                  Details
                </Menu.Item>
                <Menu.Item
                  color="red"
                  leftSection={<IconTrash size={14} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(book.id);
                  }}
                >
                  Delete
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>

          {book.subtitle && (
            <Text size="xs" c="dimmed" lineClamp={1} mb="xs">
              {book.subtitle}
            </Text>
          )}

          <Group gap={4} mb="md" wrap="wrap">
            <Text size="xs" c="dimmed">
              {book.wordCount.toLocaleString()} words
            </Text>
            <Text size="xs" c="dimmed">·</Text>
            <Text size="xs" c="dimmed">
              {book.chapterCount} {book.chapterCount === 1 ? "chapter" : "chapters"}
            </Text>
            <Text size="xs" c="dimmed">·</Text>
            <Text size="xs" c="dimmed">
              <IconClock size={10} style={{ display: "inline", marginRight: 2 }} />
              {estimateReadingTime(book.wordCount)}
            </Text>
          </Group>

          <Group justify="space-between" align="center">
            <Text size="xs" c="dimmed">
              {formatRelativeTime(book.updatedAt)}
            </Text>

            {book.targetWordCount && (
              <Tooltip label={`${progress}% of ${book.targetWordCount.toLocaleString()} word goal`}>
                <RingProgress
                  size={36}
                  thickness={4}
                  roundCaps
                  sections={[
                    {
                      value: progress,
                      color: progress >= 100 ? "green" : progress >= 50 ? "blue" : "yellow",
                    },
                  ]}
                  style={{ cursor: "pointer" }}
                />
              </Tooltip>
            )}
          </Group>
        </div>
      </Card>
    </motion.div>
  );
}

function BookListItem({ book, onDelete }: {
  book: Book;
  onDelete: (id: string) => void;
}) {
  const router = useRouter();
  const progress = book.targetWordCount
    ? Math.min(100, Math.round((book.wordCount / book.targetWordCount) * 100))
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      layout
    >
      <Paper
        withBorder
        p="sm"
        radius="md"
        style={{ cursor: "pointer" }}
        onClick={() => router.push(`/creator-studio/books/${book.id}`)}
      >
        <Group justify="space-between" wrap="nowrap">
          <Group gap="md" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                width: 40,
                height: 56,
                borderRadius: 6,
                flexShrink: 0,
                background: book.coverUrl
                  ? `url(${book.coverUrl}) center/cover no-repeat`
                  : "linear-gradient(135deg, var(--mantine-color-blue-8), var(--mantine-color-violet-8))",
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <Group gap="xs" wrap="nowrap">
                <Text fw={600} lineClamp={1}>{book.title}</Text>
                <Badge
                  color={statusColor[book.status]}
                  size="xs"
                  variant="light"
                  style={{ textTransform: "capitalize", flexShrink: 0 }}
                >
                  {book.status}
                </Badge>
              </Group>
              <Group gap="xs">
                <Text size="xs" c="dimmed">
                  {book.wordCount.toLocaleString()} words
                </Text>
                <Text size="xs" c="dimmed">·</Text>
                <Text size="xs" c="dimmed">
                  {estimateReadingTime(book.wordCount)}
                </Text>
                <Text size="xs" c="dimmed">·</Text>
                <Text size="xs" c="dimmed">
                  {formatRelativeTime(book.updatedAt)}
                </Text>
              </Group>
            </div>
          </Group>

          <Group gap="xs" wrap="nowrap">
            {book.targetWordCount && (
              <Tooltip label={`${progress}% complete`}>
                <RingProgress
                  size={28}
                  thickness={3}
                  roundCaps
                  sections={[{ value: progress, color: progress >= 100 ? "green" : "blue" }]}
                />
              </Tooltip>
            )}
            <Menu withinPortal position="bottom-end" shadow="md">
              <Menu.Target>
                <ActionIcon variant="subtle" size="sm" onClick={(e) => e.stopPropagation()}>
                  <IconDotsVertical size={14} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<IconEdit size={14} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/creator-studio/books/${book.id}/write`);
                  }}
                >
                  Continue Writing
                </Menu.Item>
                {book.status === "published" && (
                  <Menu.Item
                    leftSection={<IconEye size={14} />}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    Read
                  </Menu.Item>
                )}
                <Menu.Item
                  color="red"
                  leftSection={<IconTrash size={14} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(book.id);
                  }}
                >
                  Delete
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </Paper>
    </motion.div>
  );
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function LibraryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const view = searchParams.get("view") || "library";
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("updatedAt");

  const { data: books, isLoading } = useQuery({
    queryKey: ["books", view, search, sortBy],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (view !== "library") params.set("view", view);
      if (search) params.set("search", search);
      params.set("sortBy", sortBy);
      params.set("sortOrder", "desc");
      params.set("limit", "200");
      const res = await fetch(`/api/books?${params}`);
      if (!res.ok) throw new Error("Failed to load books");
      return res.json() as Promise<Book[]>;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/books/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete book");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      notifications.show({ title: "Deleted", message: "Book moved to trash", color: "green" });
    },
    onError: () => {
      notifications.show({ title: "Error", message: "Failed to delete book", color: "red" });
    },
  });

  const setView = (newView: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newView === "library") params.delete("view");
    else params.set("view", newView);
    router.push(`/creator-studio/books?${params.toString()}`);
  };

  if (isLoading) {
    return (
      <Center h={400}>
        <Loader size="lg" />
      </Center>
    );
  }

  if (!books || books.length === 0) {
    return (
      <Stack align="center" gap="md" mt={80}>
        <IconBooks size={64} stroke={1.5} opacity={0.3} />
        <Text size="xl" fw={600} c="dimmed">
          {view === "trash" ? "Trash is empty" : "No books yet"}
        </Text>
        <Text size="sm" c="dimmed">
          {view === "trash"
            ? "Deleted books will appear here"
            : "Create your first book to get started"}
        </Text>
        {view !== "trash" && (
          <Button
            leftSection={<IconPlus size={18} />}
            onClick={() => router.push("/creator-studio/books/new")}
          >
            New Book
          </Button>
        )}
      </Stack>
    );
  }

  return (
    <Stack gap="lg">
      <PageHeader
        title="Books"
        subtitle={`${books.length} ${books.length === 1 ? "book" : "books"}`}
      >
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => router.push("/creator-studio/books/new")}
        >
          New Book
        </Button>
      </PageHeader>

      <Group justify="space-between" wrap="wrap" gap="sm">
        <SegmentedControl
          value={view}
          onChange={setView}
          data={viewOptions}
          size="xs"
        />

        <Group gap="sm" wrap="wrap">
          <TextInput
            placeholder="Search books..."
            leftSection={<IconSearch size={14} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            size="xs"
            style={{ width: 220 }}
          />

          <Select
            value={sortBy}
            onChange={(v) => v && setSortBy(v)}
            data={sortOptions}
            size="xs"
            style={{ width: 140 }}
          />

          <Tooltip label="Grid view">
            <ActionIcon
              variant={viewMode === "grid" ? "filled" : "subtle"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <IconGridDots size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="List view">
            <ActionIcon
              variant={viewMode === "list" ? "filled" : "subtle"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <IconList size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      <AnimatePresence mode="wait">
        {viewMode === "grid" ? (
          <SimpleGrid
            cols={{ base: 1, xs: 2, sm: 3, md: 4 }}
            spacing="md"
            key="grid"
          >
            {books.map((book, i) => (
              <BookCard
                key={book.id}
                book={book}
                index={i}
                onDelete={(id) => deleteMutation.mutate(id)}
                onToggleFavorite={() => {}}
              />
            ))}
          </SimpleGrid>
        ) : (
          <Stack gap="xs" key="list">
            {books.map((book) => (
              <BookListItem
                key={book.id}
                book={book}
                onDelete={(id) => deleteMutation.mutate(id)}
              />
            ))}
          </Stack>
        )}
      </AnimatePresence>
    </Stack>
  );
}
