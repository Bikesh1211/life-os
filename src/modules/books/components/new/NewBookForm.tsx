"use client";

import { useForm } from "@mantine/form";
import { TextInput, Textarea, Button, Stack, Group, Paper, Title, Text, Select } from "@mantine/core";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";

const genres = [
  "Fiction", "Non-Fiction", "Science Fiction", "Fantasy", "Mystery",
  "Romance", "Thriller", "Horror", "Biography", "History", "Science",
  "Technology", "Philosophy", "Self-Help", "Poetry", "Drama", "Comedy",
  "Adventure", "Children", "Education", "Other",
];

export function NewBookForm() {
  const router = useRouter();

  const form = useForm({
    initialValues: {
      title: "",
      subtitle: "",
      authorByline: "",
      description: "",
      genre: "",
      language: "en",
    },
    validate: {
      title: (v) => (v.length < 1 ? "Title is required" : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          genre: values.genre || undefined,
          subtitle: values.subtitle || undefined,
          authorByline: values.authorByline || undefined,
          description: values.description || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to create book");
      }

      const book = await res.json();
      notifications.show({ title: "Created", message: "Book created successfully", color: "green" });
      router.push(`/creator-studio/books/${book.id}/write`);
    } catch (err) {
      notifications.show({
        title: "Error",
        message: err instanceof Error ? err.message : "Failed to create book",
        color: "red",
      });
    }
  };

  return (
    <Paper withBorder p="xl" radius="md" maw={600} mx="auto" mt="lg">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Title order={3}>Create New Book</Title>
          <Text size="sm" c="dimmed">Set up the basic details for your book. You can change these later.</Text>

          <TextInput
            label="Title"
            placeholder="My Amazing Book"
            required
            {...form.getInputProps("title")}
          />

          <TextInput
            label="Subtitle"
            placeholder="A subtitle for your book"
            {...form.getInputProps("subtitle")}
          />

          <TextInput
            label="Author Byline"
            placeholder="Your name or pen name"
            {...form.getInputProps("authorByline")}
          />

          <Textarea
            label="Description"
            placeholder="A brief description of your book..."
            minRows={3}
            maxRows={6}
            autosize
            {...form.getInputProps("description")}
          />

          <Select
            label="Genre"
            placeholder="Select a genre"
            data={genres}
            clearable
            searchable
            {...form.getInputProps("genre")}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={() => router.push("/creator-studio/books")}>
              Cancel
            </Button>
            <Button type="submit">Create Book</Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
}
