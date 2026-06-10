"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Stack,
  Title,
  TextInput,
  Textarea,
  Select,
  NumberInput,
  Group,
  Button,
  TagsInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import type { KnowledgeEntry } from "@/modules/knowledge";

type Props = {
  subjects: string[];
  initialData?: KnowledgeEntry;
};

const difficultyOptions = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const sourceOptions = [
  "Course",
  "Book",
  "Article",
  "Video",
  "Podcast",
  "Documentation",
  "Work Experience",
  "Personal Experiment",
  "Other",
].map((s) => ({ value: s.toLowerCase(), label: s }));

export function EntryForm({ subjects, initialData }: Props) {
  const router = useRouter();
  const isEditing = !!initialData;
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<string[]>(initialData?.tags ?? []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const body: Record<string, unknown> = {
      title: form.get("title"),
      subject: form.get("subject"),
      subcategory: form.get("subcategory") || undefined,
      dateLearned: new Date(
        form.get("dateLearned") as string,
      ).toISOString(),
      summary: (form.get("summary") as string) || undefined,
      detailedNotes: (form.get("detailedNotes") as string) || undefined,
      keyTakeaways: (form.get("keyTakeaways") as string) || undefined,
      examples: (form.get("examples") as string) || undefined,
      resources: (form.get("resources") as string) || undefined,
      tags: tags.length > 0 ? tags : undefined,
      difficultyLevel: form.get("difficultyLevel") || undefined,
      learningSource: form.get("learningSource") || undefined,
      resourceUrl: (form.get("resourceUrl") as string) || undefined,
      masteryLevel: form.get("masteryLevel")
        ? Number(form.get("masteryLevel"))
        : undefined,
      confidenceScore: form.get("confidenceScore")
        ? Number(form.get("confidenceScore"))
        : undefined,
      timeSpent: form.get("timeSpent")
        ? Number(form.get("timeSpent"))
        : undefined,
      nextActions: (form.get("nextActions") as string) || undefined,
    };

    try {
      const url = isEditing
        ? `/api/knowledge/${initialData.id}`
        : "/api/knowledge";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to save");

      const data = await res.json();
      notifications.show({
        title: isEditing ? "Updated" : "Created",
        message: `"${data.title}" has been ${isEditing ? "updated" : "created"} successfully.`,
        color: "green",
      });
      router.push(`/knowledge/${data.id}`);
      router.refresh();
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to save entry",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        <Title order={2}>{isEditing ? "Edit Entry" : "New Entry"}</Title>

        <TextInput
          name="title"
          label="Title"
          required
          defaultValue={initialData?.title ?? ""}
        />

        <Group grow>
          <TextInput
            name="subject"
            label="Subject"
            required
            list="subjects-list"
            defaultValue={initialData?.subject ?? ""}
          />
          <datalist id="subjects-list">
            {subjects.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
          <TextInput
            name="subcategory"
            label="Subcategory"
            defaultValue={initialData?.subcategory ?? ""}
          />
        </Group>

        <TextInput
          name="dateLearned"
          label="Date Learned"
          type="date"
          required
          defaultValue={
            initialData?.dateLearned
              ? new Date(initialData.dateLearned).toISOString().split("T")[0]
              : new Date().toISOString().split("T")[0]
          }
        />

        <Textarea
          name="summary"
          label="Summary"
          minRows={2}
          maxRows={4}
          defaultValue={initialData?.summary ?? ""}
        />

        <Textarea
          name="detailedNotes"
          label="Detailed Notes (Markdown)"
          minRows={6}
          maxRows={20}
          autosize
          defaultValue={initialData?.detailedNotes ?? ""}
        />

        <Textarea
          name="keyTakeaways"
          label="Key Takeaways"
          minRows={3}
          maxRows={6}
          defaultValue={initialData?.keyTakeaways ?? ""}
        />

        <Textarea
          name="examples"
          label="Examples"
          minRows={3}
          maxRows={6}
          defaultValue={initialData?.examples ?? ""}
        />

        <Textarea
          name="resources"
          label="Resources / References"
          minRows={2}
          maxRows={4}
          defaultValue={initialData?.resources ?? ""}
        />

        <TagsInput
          label="Tags"
          value={tags}
          onChange={setTags}
          placeholder="Type tag and press Enter"
        />

        <Group grow>
          <Select
            name="difficultyLevel"
            label="Difficulty"
            data={difficultyOptions}
            defaultValue={initialData?.difficultyLevel ?? "beginner"}
          />
          <Select
            name="learningSource"
            label="Learning Source"
            data={sourceOptions}
            defaultValue={initialData?.learningSource ?? null}
            searchable
            clearable
          />
        </Group>

        <TextInput
          name="resourceUrl"
          label="Resource URL"
          type="url"
          defaultValue={initialData?.resourceUrl ?? ""}
        />

        <Group grow>
          <NumberInput
            name="masteryLevel"
            label="Mastery Level (1-10)"
            min={1}
            max={10}
            defaultValue={initialData?.masteryLevel ?? 1}
          />
          <NumberInput
            name="confidenceScore"
            label="Confidence Score (1-10)"
            min={1}
            max={10}
            defaultValue={initialData?.confidenceScore ?? 1}
          />
          <NumberInput
            name="timeSpent"
            label="Time Spent (minutes)"
            min={0}
            defaultValue={initialData?.timeSpent ?? undefined}
          />
        </Group>

        <Textarea
          name="nextActions"
          label="Next Actions"
          minRows={2}
          maxRows={4}
          defaultValue={initialData?.nextActions ?? ""}
        />

        <Group justify="flex-end">
          <Button
            variant="subtle"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {isEditing ? "Update" : "Create"}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
