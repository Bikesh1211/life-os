"use client";

import { useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Textarea, Group, Text, ActionIcon, Tooltip, Paper, Box } from "@mantine/core";
import { IconArrowLeft, IconCheck, IconLoader2, IconCloudOff, IconCalendar } from "@tabler/icons-react";
import { MoodSelector } from "./MoodSelector";
import { TagInput } from "./TagInput";
import { ReflectionScoreMeter } from "./ReflectionScoreMeter";
import { useAutoSave } from "../hooks/useAutoSave";
import { computeReadingTime } from "@/modules/journal/utils";

type JournalEditorProps = {
  initialTitle?: string;
  initialContent?: string;
  initialMood?: string;
  initialTags?: string[];
  initialScore?: number;
  initialEventDate?: string;
  entryId?: string;
  onSave: (data: {
    title: string;
    content: string;
    mood?: string;
    tags?: string[];
    reflectionScore?: number;
    eventDate?: string;
  }) => Promise<void>;
};

export function JournalEditor({
  initialTitle = "",
  initialContent = "",
  initialMood,
  initialTags = [],
  initialScore,
  initialEventDate,
  entryId,
  onSave,
}: JournalEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [mood, setMood] = useState(initialMood ?? "");
  const [tags, setTags] = useState<string[]>(initialTags);
  const [score, setScore] = useState(initialScore ?? 5);
  const [eventDate, setEventDate] = useState(initialEventDate ?? "");

  const doSave = useCallback(async () => {
    await onSave({
      title,
      content,
      mood: mood || undefined,
      tags: tags.length > 0 ? tags : undefined,
      reflectionScore: score,
      eventDate: eventDate || undefined,
    });
  }, [title, content, mood, tags, score, eventDate, onSave]);

  const { status, scheduleSave, saveNow } = useAutoSave({ onSave: doSave, debounceMs: 2000 });

  useEffect(() => {
    if (!entryId) saveNow();
  }, []);

  useEffect(() => {
    scheduleSave();
  }, [title, content, mood, tags, score, eventDate]);

  function handleBack() {
    saveNow().then(() => router.push("/journal"));
  }

  const saveIndicator = {
    idle: null,
    saving: { icon: IconLoader2, text: "Saving...", className: "text-blue-500" },
    saved: { icon: IconCheck, text: "Saved", className: "text-green-500" },
    error: { icon: IconCloudOff, text: "Save failed", className: "text-red-500" },
  }[status];

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 py-4">
      <Group justify="space-between" mb="md" className="flex-shrink-0">
        <Group gap={4}>
          <Tooltip label="Back to journal">
            <ActionIcon variant="subtle" size="lg" onClick={handleBack}>
              <IconArrowLeft size={20} />
            </ActionIcon>
          </Tooltip>
          <Text size="sm" c="dimmed" className="hidden sm:block">
            Journal
          </Text>
        </Group>

        <Group gap="xs">
          {saveIndicator && (
            <Group gap={4}>
              <saveIndicator.icon size={14} className={saveIndicator.className} />
              <Text size="xs" className={saveIndicator.className}>
                {saveIndicator.text}
              </Text>
            </Group>
          )}
          {content && (
            <Text size="xs" c="dimmed">
              {computeReadingTime(content)} min read
            </Text>
          )}
        </Group>
      </Group>

      <Paper withBorder p="md" className="flex-shrink-0">
        <MoodSelector value={mood} onChange={setMood} size="sm" />
      </Paper>

      <div className="mt-4 flex-shrink-0">
        <TagInput value={tags} onChange={setTags} />
      </div>

      <div className="mt-4 mb-4 flex-shrink-0">
        <ReflectionScoreMeter value={score} onChange={setScore} />
      </div>

      <Paper withBorder p="sm" className="mb-4 flex-shrink-0">
        <Group gap="sm">
          <IconCalendar size={18} className="text-gray-400" />
          <Text size="sm" c="dimmed" className="whitespace-nowrap">
            Event date:
          </Text>
          <input
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.currentTarget.value)}
            className="flex-1 rounded border border-gray-200 bg-transparent px-2 py-1 text-sm dark:border-gray-700"
          />
          <Text size="xs" c="dimmed">
            {eventDate ? "(leave empty for today's entry)" : "Today's entry"}
          </Text>
        </Group>
      </Paper>

      <Box className="flex-1 min-h-0">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
          placeholder="What's on your mind?"
          className="w-full border-0 bg-transparent text-2xl font-bold outline-none placeholder:text-gray-300 dark:placeholder:text-gray-600"
          autoFocus
        />

        <div className="mt-2 h-px bg-gray-200 dark:bg-gray-700" />

        <Textarea
          value={content}
          onChange={(e) => setContent(e.currentTarget.value)}
          placeholder="Write your thoughts..."
          minRows={15}
          autosize
          variant="unstyled"
          className="mt-4"
          styles={{ input: { fontSize: "var(--mantine-font-size-md)", lineHeight: 1.8 } }}
        />
      </Box>
    </div>
  );
}
