"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Paper, Stack, TextInput, Textarea, Select, Switch, Group, Button,
  Text, Title, Loader, Center, SimpleGrid, TagsInput, Tabs, NumberInput,
  Divider,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconDownload, IconUsers, IconNotebook, IconTargetArrow } from "@tabler/icons-react";
import { CollaboratorList } from "./CollaboratorList";
import { CharacterManager } from "../characters/CharacterManager";
import { ResearchNotesPanel } from "../research/ResearchNotesPanel";

const bookTypes = [
  { value: "novel", label: "Novel" },
  { value: "fantasy", label: "Fantasy" },
  { value: "romance", label: "Romance" },
  { value: "science-fiction", label: "Science Fiction" },
  { value: "horror", label: "Horror" },
  { value: "mystery", label: "Mystery" },
  { value: "thriller", label: "Thriller" },
  { value: "self-help", label: "Self Help" },
  { value: "business", label: "Business" },
  { value: "technical", label: "Technical" },
  { value: "biography", label: "Biography" },
  { value: "memoir", label: "Memoir" },
  { value: "poetry", label: "Poetry" },
  { value: "research", label: "Research" },
  { value: "journal", label: "Journal" },
  { value: "educational", label: "Educational" },
  { value: "cookbook", label: "Cookbook" },
  { value: "childrens-book", label: "Children's Book" },
  { value: "custom", label: "Custom" },
];

const languages = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "hi", label: "Hindi" },
  { value: "zh", label: "Chinese" },
  { value: "ja", label: "Japanese" },
  { value: "other", label: "Other" },
];

type BookData = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  authorByline: string | null;
  coverUrl: string | null;
  bannerUrl: string | null;
  bookType: string | null;
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
  targetWordCount: number | null;
  targetChapterCount: number | null;
  dailyWritingGoal: number | null;
  weeklyGoal: number | null;
  deadline: string | null;
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
      bookType: "",
      genre: "",
      language: "en",
      isbn: "",
      coverUrl: "",
      bannerUrl: "",
      publisher: "",
      edition: "",
      series: "",
      copyright: "",
      license: "",
      readingLevel: "",
      ageRating: "",
      status: "draft" as "draft" | "published" | "archived",
      isListed: true,
      tags: [] as string[],
      keywords: [] as string[],
      targetWordCount: undefined as number | undefined,
      targetChapterCount: undefined as number | undefined,
      dailyWritingGoal: undefined as number | undefined,
      weeklyGoal: undefined as number | undefined,
      deadline: undefined as Date | undefined,
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
      bookType: book.bookType ?? "",
      genre: book.genre ?? "",
      language: book.language,
      isbn: book.isbn ?? "",
      coverUrl: book.coverUrl ?? "",
      bannerUrl: book.bannerUrl ?? "",
      publisher: book.publisher ?? "",
      edition: book.edition ?? "",
      series: book.series ?? "",
      copyright: book.copyright ?? "",
      license: book.license ?? "",
      readingLevel: book.readingLevel ?? "",
      ageRating: book.ageRating ?? "",
      status: book.status,
      isListed: book.isListed,
      tags: book.tags ?? [],
      keywords: book.keywords ?? [],
      targetWordCount: book.targetWordCount ?? undefined,
      targetChapterCount: book.targetChapterCount ?? undefined,
      dailyWritingGoal: book.dailyWritingGoal ?? undefined,
      weeklyGoal: book.weeklyGoal ?? undefined,
      deadline: book.deadline ? new Date(book.deadline) : undefined,
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
      subtitle: values.subtitle || null,
      authorByline: values.authorByline || null,
      description: values.description || null,
      bookType: values.bookType || null,
      genre: values.genre || null,
      isbn: values.isbn || null,
      coverUrl: values.coverUrl || null,
      bannerUrl: values.bannerUrl || null,
      publisher: values.publisher || null,
      edition: values.edition || null,
      series: values.series || null,
      copyright: values.copyright || null,
      license: values.license || null,
      readingLevel: values.readingLevel || null,
      ageRating: values.ageRating || null,
      targetWordCount: values.targetWordCount || null,
      targetChapterCount: values.targetChapterCount || null,
      dailyWritingGoal: values.dailyWritingGoal || null,
      weeklyGoal: values.weeklyGoal || null,
      deadline: values.deadline?.toISOString() || null,
    });
  };

  const handleExport = async (format: "markdown" | "json" | "html" | "txt") => {
    try {
      const res = await fetch(`/api/books/${bookId}/export/${format}`);
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const ext = format === "markdown" ? "md" : format === "html" ? "html" : format === "txt" ? "txt" : "json";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${book.title.replace(/[^a-zA-Z0-9]/g, "_")}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
      notifications.show({ title: "Exported", message: `Exported as ${format}`, color: "green" });
    } catch {
      notifications.show({ title: "Error", message: "Export failed", color: "red" });
    }
  };

  return (
    <Tabs defaultValue="metadata">
      <Tabs.List mb="md">
        <Tabs.Tab value="metadata">Metadata</Tabs.Tab>
        <Tabs.Tab value="goals" leftSection={<IconTargetArrow size={14} />}>Goals</Tabs.Tab>
        <Tabs.Tab value="publishing">Publishing</Tabs.Tab>
        <Tabs.Tab value="collaborators">Collaborators</Tabs.Tab>
        <Tabs.Tab value="characters" leftSection={<IconUsers size={14} />}>Characters</Tabs.Tab>
        <Tabs.Tab value="research" leftSection={<IconNotebook size={14} />}>Research</Tabs.Tab>
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
                <Select label="Book Type" data={bookTypes} clearable searchable {...form.getInputProps("bookType")} />
                <TextInput label="Genre" {...form.getInputProps("genre")} />
              </SimpleGrid>
              <SimpleGrid cols={2}>
                <Select label="Language" data={languages} {...form.getInputProps("language")} />
                <TextInput label="ISBN" {...form.getInputProps("isbn")} />
              </SimpleGrid>
              <TextInput label="Cover Image URL" {...form.getInputProps("coverUrl")} />
              <TextInput label="Banner Image URL" {...form.getInputProps("bannerUrl")} />
              <Group justify="flex-end" mt="md">
                <Button type="submit" loading={updateMutation.isPending}>Save Changes</Button>
              </Group>
            </Stack>
          </form>
        </Paper>
      </Tabs.Panel>

      <Tabs.Panel value="goals">
        <Paper withBorder p="xl" radius="md" maw={700}>
          <Stack gap="md">
            <Title order={4}>Writing Goals</Title>
            <Text size="sm" c="dimmed">
              {book.wordCount.toLocaleString()} words written · {book.chapterCount} chapters
            </Text>
            <SimpleGrid cols={2}>
              <NumberInput
                label="Target Word Count"
                min={0}
                step={1000}
                {...form.getInputProps("targetWordCount")}
              />
              <NumberInput
                label="Target Chapter Count"
                min={0}
                {...form.getInputProps("targetChapterCount")}
              />
            </SimpleGrid>
            <SimpleGrid cols={2}>
              <NumberInput
                label="Daily Writing Goal (words)"
                min={0}
                step={100}
                {...form.getInputProps("dailyWritingGoal")}
              />
              <NumberInput
                label="Weekly Goal (words)"
                min={0}
                step={500}
                {...form.getInputProps("weeklyGoal")}
              />
            </SimpleGrid>
            <DatePickerInput
              label="Completion Deadline"
              placeholder="Pick a date"
              clearable
              {...form.getInputProps("deadline")}
            />
            <Group justify="flex-end" mt="md">
              <Button onClick={() => handleSave(form.values)} loading={updateMutation.isPending}>
                Save Goals
              </Button>
            </Group>
          </Stack>
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
            <TagsInput label="Tags" {...form.getInputProps("tags")} />
            <TagsInput label="Keywords" {...form.getInputProps("keywords")} />
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

      <Tabs.Panel value="characters">
        <CharacterManager bookId={bookId} />
      </Tabs.Panel>

      <Tabs.Panel value="research">
        <ResearchNotesPanel bookId={bookId} />
      </Tabs.Panel>

      <Tabs.Panel value="export">
        <Paper withBorder p="xl" radius="md" maw={700}>
          <Stack gap="md">
            <Title order={4}>Export Book</Title>
            <Text size="sm" c="dimmed">
              Export your book in various formats.
            </Text>
            <SimpleGrid cols={2}>
              <Button variant="light" leftSection={<IconDownload size={16} />} onClick={() => handleExport("markdown")}>
                Markdown
              </Button>
              <Button variant="light" leftSection={<IconDownload size={16} />} onClick={() => handleExport("html")}>
                HTML
              </Button>
              <Button variant="light" leftSection={<IconDownload size={16} />} onClick={() => handleExport("txt")}>
                Plain Text
              </Button>
              <Button variant="light" leftSection={<IconDownload size={16} />} onClick={() => handleExport("json")}>
                JSON
              </Button>
            </SimpleGrid>
          </Stack>
        </Paper>
      </Tabs.Panel>
    </Tabs>
  );
}
