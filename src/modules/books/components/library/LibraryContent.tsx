"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { SimpleGrid, Card, Text, Group, Badge, TextInput, Stack, Center, Loader, Button, Menu, ActionIcon, Tooltip } from "@mantine/core";
import { useRouter } from "next/navigation";
import { IconBooks, IconDotsVertical, IconEdit, IconEye, IconTrash, IconSearch, IconPlus, IconGridDots, IconList } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";

type Book = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  coverUrl: string | null;
  status: "draft" | "published" | "archived";
  genre: string | null;
  wordCount: number;
  chapterCount: number;
  createdAt: string;
  updatedAt: string;
};

export function LibraryContent() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: books, isLoading } = useQuery({
    queryKey: ["books", search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
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
      notifications.show({ title: "Deleted", message: "Book deleted", color: "green" });
    },
    onError: () => {
      notifications.show({ title: "Error", message: "Failed to delete book", color: "red" });
    },
  });

  const statusColor: Record<string, string> = {
    draft: "yellow",
    published: "green",
    archived: "gray",
  };

  if (isLoading) {
    return (
      <Center h={400}>
        <Loader size="lg" />
      </Center>
    );
  }

  if (!books?.length) {
    return (
      <Stack align="center" gap="md" mt={80}>
        <IconBooks size={64} stroke={1.5} opacity={0.3} />
        <Text size="xl" c="dimmed">No books yet</Text>
        <Text size="sm" c="dimmed">Create your first book to get started</Text>
        <Button
          leftSection={<IconPlus size={18} />}
          onClick={() => router.push("/creator-studio/books/new")}
        >
          New Book
        </Button>
      </Stack>
    );
  }

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <TextInput
          placeholder="Search books..."
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          style={{ flex: 1, maxWidth: 400 }}
        />
        <Group gap="xs">
          <Tooltip label="Grid view">
            <ActionIcon
              variant={viewMode === "grid" ? "filled" : "subtle"}
              onClick={() => setViewMode("grid")}
            >
              <IconGridDots size={18} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="List view">
            <ActionIcon
              variant={viewMode === "list" ? "filled" : "subtle"}
              onClick={() => setViewMode("list")}
            >
              <IconList size={18} />
            </ActionIcon>
          </Tooltip>
          <Button
            leftSection={<IconPlus size={18} />}
            onClick={() => router.push("/creator-studio/books/new")}
          >
            New Book
          </Button>
        </Group>
      </Group>

      {viewMode === "grid" ? (
        <SimpleGrid cols={{ base: 1, xs: 2, sm: 3, md: 4 }} spacing="md">
          {books.map((book, i) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card
                padding="lg"
                radius="md"
                withBorder
                style={{ cursor: "pointer" }}
                onClick={() => router.push(`/creator-studio/books/${book.id}`)}
              >
                <Card.Section
                  h={180}
                  style={{
                    background: book.coverUrl
                      ? `url(${book.coverUrl}) center/cover`
                      : "linear-gradient(135deg, var(--mantine-color-blue-8), var(--mantine-color-violet-8))",
                    display: "flex",
                    alignItems: "flex-end",
                    padding: 12,
                  }}
                >
                  <Badge
                    color={statusColor[book.status]}
                    size="sm"
                    variant="filled"
                  >
                    {book.status}
                  </Badge>
                </Card.Section>

                <Group justify="space-between" mt="xs" wrap="nowrap">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text fw={600} lineClamp={1}>{book.title}</Text>
                    {book.subtitle && (
                      <Text size="sm" c="dimmed" lineClamp={1}>{book.subtitle}</Text>
                    )}
                  </div>
                  <Menu withinPortal position="bottom-end">
                    <Menu.Target>
                      <ActionIcon variant="subtle" size="sm" onClick={(e) => e.stopPropagation()}>
                        <IconDotsVertical size={16} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item
                        leftSection={<IconEdit size={16} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/creator-studio/books/${book.id}/write`);
                        }}
                      >
                        Write
                      </Menu.Item>
                      {book.status === "published" && (
                        <Menu.Item
                          leftSection={<IconEye size={16} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/creator-studio/books/${book.id}/read`);
                          }}
                        >
                          Read
                        </Menu.Item>
                      )}
                      <Menu.Item
                        leftSection={<IconTrash size={16} />}
                        color="red"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMutation.mutate(book.id);
                        }}
                      >
                        Delete
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Group>

                <Group gap="xs" mt="xs">
                  <Text size="xs" c="dimmed">{book.wordCount.toLocaleString()} words</Text>
                  <Text size="xs" c="dimmed">·</Text>
                  <Text size="xs" c="dimmed">{book.chapterCount} chapters</Text>
                </Group>
              </Card>
            </motion.div>
          ))}
        </SimpleGrid>
      ) : (
        <Stack gap="xs">
          {books.map((book) => (
            <Card
              key={book.id}
              padding="sm"
              radius="md"
              withBorder
              style={{ cursor: "pointer" }}
              onClick={() => router.push(`/creator-studio/books/${book.id}`)}
            >
              <Group justify="space-between" wrap="nowrap">
                <Group gap="md" wrap="nowrap">
                  <div
                    style={{
                      width: 48,
                      height: 64,
                      borderRadius: 6,
                      background: book.coverUrl
                        ? `url(${book.coverUrl}) center/cover`
                        : "linear-gradient(135deg, var(--mantine-color-blue-8), var(--mantine-color-violet-8))",
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <Text fw={600}>{book.title}</Text>
                    <Text size="sm" c="dimmed">
                      {book.wordCount.toLocaleString()} words · {book.chapterCount} chapters
                    </Text>
                  </div>
                </Group>
                <Group gap="xs">
                  <Badge color={statusColor[book.status]} size="sm">{book.status}</Badge>
                  {book.genre && <Badge variant="light" size="sm">{book.genre}</Badge>}
                </Group>
              </Group>
            </Card>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
