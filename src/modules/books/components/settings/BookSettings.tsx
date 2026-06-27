"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Paper, Stack, TextInput, Textarea, Select, Switch, Group, Button,
  Text, Title, Loader, Center, SimpleGrid, Badge, Tabs, NumberInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconDownload } from "@tabler/icons-react";
import { CollaboratorList } from "./CollaboratorList";

const genres = [
  "Fiction", "Non-Fiction", "Science Fiction", "Fantasy", "Mystery",
  "Romance", "Thriller", "Horror", "Biography", "History", "Science",
  "Technology", "Philosophy", "Self-Help", "Poetry", "Drama", "Comedy",
  "Adventure", "Children", "Education", "Other",
];

type BookData = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  authorByline: string | null;
  coverUrl: string | null;
  bannerUrl: string | null;
  genre: string | null;
  language: string;
  isbn: string | null;
  tags: string[];
  keywords: string[];
  status: "draft" | "published" | "archived";
  isListed: boolean;
  publishAt: string | null;
  publisher: string | null;
  edition: string | null;
  series: string | null;
  copyright: string | null;
  license: string | null;
  readingLevel: string | null;
  ageRating: string | null;
  wordCount: number;
  chapterCount: number;
};

export function BookSettings() {
  const params = useParams<{ id: string }>();
  const bookId = params.id;
  const queryClient = useQueryClient();

  const { data: book, isLoading } = useQuery({
    queryKey: ["book", bookId],
    queryFn: async () => {
      const res = await fetch(`/api/books/${bookId}`);
      if (!res.ok) throw new Error("Failed to load book");
      return res.json() as Promise<BookData>;
    },
    enabled: !!bookId,
  });

  const form = useForm({
    initialValues: {
      title: "",
      subtitle: "",
      authorByline: "",
      description: "",
      genre: "",
      language: "en",
      isbn: "",
      coverUrl: "",
      publisher: "",
      edition: "",
      series: "",
      copyright: "",
      license: "",
      readingLevel: "",
      ageRating: "",
      status: "draft" as "draft" | "published" | "archived",
      isListed: true,
      tags: "",
      keywords: "",
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      const res = await fetch(`/api/books/${bookId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["book", bookId] });
      queryClient.invalidateQueries({ queryKey: ["books"] });
      notifications.show({ title: "Saved", message: "Book settings updated", color: "green" });
    },
    onError: (err) => {
      notifications.show({
        title: "Error",
        message: err instanceof Error ? err.message : "Failed to update",
        color: "red",
      });
    },
  });

  useEffect(() => {
    if (!book) return;
    form.setValues({
      title: book.title,
      subtitle: book.subtitle ?? "",
      authorByline: book.authorByline ?? "",
      description: book.description ?? "",
      genre: book.genre ?? "",
      language: book.language,
      isbn: book.isbn ?? "",
      coverUrl: book.coverUrl ?? "",
      publisher: book.publisher ?? "",
      edition: book.edition ?? "",
      series: book.series ?? "",
      copyright: book.copyright ?? "",
      license: book.license ?? "",
      readingLevel: book.readingLevel ?? "",
      ageRating: book.ageRating ?? "",
      status: book.status,
      isListed: book.isListed,
      tags: book.tags?.join(", ") ?? "",
      keywords: book.keywords?.join(", ") ?? "",
    });
  }, [book]);

  if (isLoading) {
    return <Center h={400}><Loader size="lg" /></Center>;
  }

  if (!book) {
    return <Center h={400}><Text c="dimmed">Book not found</Text></Center>;
  }

  const handleSave = (values: typeof form.values) => {
    updateMutation.mutate({
      ...values,
      tags: values.tags.split(",").map((t: string) => t.trim()).filter(Boolean),
      keywords: values.keywords.split(",").map((t: string) => t.trim()).filter(Boolean),
      subtitle: values.subtitle || null,
      authorByline: values.authorByline || null,
      description: values.description || null,
      genre: values.genre || null,
      isbn: values.isbn || null,
      coverUrl: values.coverUrl || null,
      publisher: values.publisher || null,
      edition: values.edition || null,
      series: values.series || null,
      copyright: values.copyright || null,
      license: values.license || null,
      readingLevel: values.readingLevel || null,
      ageRating: values.ageRating || null,
    });
  };

  const handleExport = async (format: "markdown" | "json") => {
    try {
      const res = await fetch(`/api/books/${bookId}/export/${format}`);
      if (!res.ok) throw new Error("Export failed");
      if (format === "markdown") {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${book.title.replace(/[^a-zA-Z0-9]/g, "_")}.md`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const data = await res.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${book.title.replace(/[^a-zA-Z0-9]/g, "_")}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
      notifications.show({ title: "Exported", message: `Exported as ${format}`, color: "green" });
    } catch {
      notifications.show({ title: "Error", message: "Export failed", color: "red" });
    }
  };

  return (
    <Tabs defaultValue="metadata">
      <Tabs.List mb="md">
        <Tabs.Tab value="metadata">Metadata</Tabs.Tab>
        <Tabs.Tab value="publishing">Publishing</Tabs.Tab>
        <Tabs.Tab value="collaborators">Collaborators</Tabs.Tab>
        <Tabs.Tab value="export">Export</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="metadata">
        <Paper withBorder p="xl" radius="md" maw={700}>
          <form onSubmit={form.onSubmit(handleSave)}>
            <Stack gap="md">
              <Title order={4}>Book Metadata</Title>
              <SimpleGrid cols={2}>
                <TextInput label="Title" required {...form.getInputProps("title")} />
                <TextInput label="Subtitle" {...form.getInputProps("subtitle")} />
              </SimpleGrid>
              <TextInput label="Author Byline" {...form.getInputProps("authorByline")} />
              <Textarea label="Description" minRows={3} autosize {...form.getInputProps("description")} />
              <SimpleGrid cols={2}>
                <Select label="Genre" data={genres} clearable searchable {...form.getInputProps("genre")} />
                <Select
                  label="Language"
                  data={[
                    { value: "en", label: "English" },
                    { value: "es", label: "Spanish" },
                    { value: "fr", label: "French" },
                    { value: "de", label: "German" },
                    { value: "hi", label: "Hindi" },
                    { value: "zh", label: "Chinese" },
                    { value: "ja", label: "Japanese" },
                    { value: "other", label: "Other" },
                  ]}
                  {...form.getInputProps("language")}
                />
              </SimpleGrid>
              <SimpleGrid cols={2}>
                <TextInput label="ISBN" {...form.getInputProps("isbn")} />
                <TextInput label="Cover Image URL" {...form.getInputProps("coverUrl")} />
              </SimpleGrid>
              <Group justify="flex-end" mt="md">
                <Button type="submit" loading={updateMutation.isPending}>Save Changes</Button>
              </Group>
            </Stack>
          </form>
        </Paper>
      </Tabs.Panel>

      <Tabs.Panel value="publishing">
        <Paper withBorder p="xl" radius="md" maw={700}>
          <Stack gap="md">
            <Title order={4}>Publishing Settings</Title>
            <Select
              label="Status"
              data={[
                { value: "draft", label: "Draft" },
                { value: "published", label: "Published" },
                { value: "archived", label: "Archived" },
              ]}
              value={form.values.status}
              onChange={(v) => {
                if (v) form.setFieldValue("status", v as "draft" | "published" | "archived");
              }}
            />
            <Switch
              label="Listed in library"
              description="If disabled, the book is only accessible via direct link"
              checked={form.values.isListed}
              onChange={(e) => form.setFieldValue("isListed", e.currentTarget.checked)}
            />
            <SimpleGrid cols={2}>
              <TextInput label="Publisher" {...form.getInputProps("publisher")} />
              <TextInput label="Edition" {...form.getInputProps("edition")} />
              <TextInput label="Series" {...form.getInputProps("series")} />
              <TextInput label="Reading Level" {...form.getInputProps("readingLevel")} />
              <TextInput label="Age Rating" {...form.getInputProps("ageRating")} />
              <TextInput label="Copyright" {...form.getInputProps("copyright")} />
              <TextInput label="License" {...form.getInputProps("license")} />
            </SimpleGrid>
            <TextInput label="Tags (comma separated)" {...form.getInputProps("tags")} />
            <TextInput label="Keywords (comma separated)" {...form.getInputProps("keywords")} />
            <Group gap="xs">
              <Text size="sm" c="dimmed">{book.wordCount.toLocaleString()} words</Text>
              <Text size="sm" c="dimmed">·</Text>
              <Text size="sm" c="dimmed">{book.chapterCount} chapters</Text>
            </Group>
            <Group justify="flex-end" mt="md">
              <Button onClick={() => handleSave(form.values)} loading={updateMutation.isPending}>
                Save Changes
              </Button>
            </Group>
          </Stack>
        </Paper>
      </Tabs.Panel>

      <Tabs.Panel value="collaborators">
        <CollaboratorList bookId={bookId} />
      </Tabs.Panel>

      <Tabs.Panel value="export">
        <Paper withBorder p="xl" radius="md" maw={700}>
          <Stack gap="md">
            <Title order={4}>Export Book</Title>
            <Text size="sm" c="dimmed">
              Export your book as Markdown or JSON. Markdown is good for editing in other tools.
              JSON is a complete lossless export including chapter-level ProseMirror content.
            </Text>
            <Group>
              <Button
                variant="light"
                leftSection={<IconDownload size={18} />}
                onClick={() => handleExport("markdown")}
              >
                Export as Markdown
              </Button>
              <Button
                variant="light"
                leftSection={<IconDownload size={18} />}
                onClick={() => handleExport("json")}
              >
                Export as JSON
              </Button>
            </Group>
          </Stack>
        </Paper>
      </Tabs.Panel>
    </Tabs>
  );
}
