"use client";

import { useState } from "react";
import { useForm } from "@mantine/form";
import {
  TextInput, Textarea, Button, Stack, Group, Paper, Title, Text,
  Select, NumberInput, Switch, SimpleGrid, Stepper, TagsInput,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";
import { IconBook, IconTargetArrow, IconEye } from "@tabler/icons-react";
import { apiFetch } from "@/core/api/http";

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
  { value: "it", label: "Italian" },
  { value: "pt", label: "Portuguese" },
  { value: "ru", label: "Russian" },
  { value: "zh", label: "Chinese" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "ar", label: "Arabic" },
  { value: "hi", label: "Hindi" },
  { value: "other", label: "Other" },
];

export function NewBookForm() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm({
    initialValues: {
      title: "",
      subtitle: "",
      authorByline: "",
      description: "",
      bookType: "",
      genre: "",
      language: "en",
      tags: [] as string[],
      coverUrl: "",
      bannerUrl: "",

      targetWordCount: undefined as number | undefined,
      targetChapterCount: undefined as number | undefined,
      dailyWritingGoal: undefined as number | undefined,
      weeklyGoal: undefined as number | undefined,
      deadline: undefined as Date | undefined,

      isListed: true,
    },
    validate: {
      title: (v) => (v.length < 1 ? "Title is required" : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        title: values.title,
        subtitle: values.subtitle || undefined,
        authorByline: values.authorByline || undefined,
        description: values.description || undefined,
        bookType: values.bookType || undefined,
        genre: values.genre || undefined,
        language: values.language,
        tags: values.tags,
        coverUrl: values.coverUrl || undefined,
        bannerUrl: values.bannerUrl || undefined,
        targetWordCount: values.targetWordCount || undefined,
        targetChapterCount: values.targetChapterCount || undefined,
        dailyWritingGoal: values.dailyWritingGoal || undefined,
        weeklyGoal: values.weeklyGoal || undefined,
        deadline: values.deadline?.toISOString() || undefined,
        isListed: values.isListed,
      };

      const book = await apiFetch<{ id: string }>("/api/books", {
        method: "POST",
        body: JSON.stringify(body),
      });
      notifications.show({ title: "Created", message: "Book created successfully", color: "green" });
      router.push(`/creator-studio/books/${book.id}/write`);
    } catch (err) {
      notifications.show({
        title: "Error",
        message: err instanceof Error ? err.message : "Failed to create book",
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Paper withBorder p="xl" radius="md" maw={700} mx="auto" mt="lg">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stepper
          active={activeStep}
          onStepClick={setActiveStep}
          allowNextStepsSelect={false}
          mb="xl"
        >
          <Stepper.Step
            label="Basic Info"
            description="Title, genre, author"
            icon={<IconBook size={16} />}
          >
            <Stack gap="md" mt="md">
              <TextInput
                label="Book Title"
                placeholder="The Great Adventure"
                required
                {...form.getInputProps("title")}
              />

              <TextInput
                label="Subtitle"
                placeholder="A journey through uncharted lands"
                {...form.getInputProps("subtitle")}
              />

              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <TextInput
                  label="Author Byline"
                  placeholder="Your name or pen name"
                  {...form.getInputProps("authorByline")}
                />
                <Select
                  label="Language"
                  data={languages}
                  {...form.getInputProps("language")}
                />
              </SimpleGrid>

              <Textarea
                label="Description"
                placeholder="A brief description of your book..."
                minRows={3}
                maxRows={6}
                autosize
                {...form.getInputProps("description")}
              />

              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <Select
                  label="Book Type"
                  placeholder="Select type"
                  data={bookTypes}
                  searchable
                  clearable
                  {...form.getInputProps("bookType")}
                />
                <TextInput
                  label="Genre"
                  placeholder="e.g. Epic Fantasy, Hard Sci-Fi"
                  {...form.getInputProps("genre")}
                />
              </SimpleGrid>

              <TagsInput
                label="Tags"
                placeholder="Add tags"
                {...form.getInputProps("tags")}
              />

              <TextInput
                label="Cover Image URL"
                placeholder="https://example.com/cover.jpg"
                {...form.getInputProps("coverUrl")}
              />

              <TextInput
                label="Banner Image URL"
                placeholder="https://example.com/banner.jpg"
                {...form.getInputProps("bannerUrl")}
              />
            </Stack>
          </Stepper.Step>

          <Stepper.Step
            label="Writing Goals"
            description="Targets and deadlines"
            icon={<IconTargetArrow size={16} />}
          >
            <Stack gap="md" mt="md">
              <Text size="sm" c="dimmed">
                Set targets to track your writing progress. All fields are optional.
              </Text>

              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <NumberInput
                  label="Target Word Count"
                  placeholder="50000"
                  min={0}
                  step={1000}
                  {...form.getInputProps("targetWordCount")}
                />
                <NumberInput
                  label="Target Chapter Count"
                  placeholder="20"
                  min={0}
                  {...form.getInputProps("targetChapterCount")}
                />
              </SimpleGrid>

              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <NumberInput
                  label="Daily Writing Goal (words)"
                  placeholder="500"
                  min={0}
                  step={100}
                  {...form.getInputProps("dailyWritingGoal")}
                />
                <NumberInput
                  label="Weekly Goal (words)"
                  placeholder="3500"
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
            </Stack>
          </Stepper.Step>

          <Stepper.Step
            label="Visibility"
            description="Publishing settings"
            icon={<IconEye size={16} />}
          >
            <Stack gap="md" mt="md">
              <Text size="sm" c="dimmed">
                Control who can discover your book.
              </Text>

              <Switch
                label="Listed in discovery"
                description="Allow others to discover this book"
                {...form.getInputProps("isListed", { type: "checkbox" })}
              />

              <Paper p="md" withBorder bg="var(--mantine-color-dark-6)">
                <Text size="sm" fw={500} mb={4}>Visibility Summary</Text>
                <Text size="xs" c="dimmed">
                  Your book will start as a <strong>draft</strong>. You can
                  publish it later from the book settings.
                  {form.values.isListed
                    ? " It will be discoverable when published."
                    : " It will remain private even when published."}
                </Text>
              </Paper>
            </Stack>
          </Stepper.Step>

          <Stepper.Completed>
            <Text size="sm" c="dimmed" mt="md">
              Review your book details and click "Create Book" to get started.
            </Text>
          </Stepper.Completed>
        </Stepper>

        <Group justify="space-between" mt="xl">
          <Button
            variant="light"
            onClick={() => {
              if (activeStep === 0) router.push("/creator-studio/books");
              else setActiveStep(activeStep - 1);
            }}
          >
            {activeStep === 0 ? "Cancel" : "Back"}
          </Button>

          {activeStep < 2 ? (
            <Button onClick={() => setActiveStep(activeStep + 1)}>
              Next
            </Button>
          ) : (
            <Button type="submit" loading={submitting}>
              Create Book
            </Button>
          )}
        </Group>
      </form>
    </Paper>
  );
}
