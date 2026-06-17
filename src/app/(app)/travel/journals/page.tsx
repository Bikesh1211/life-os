"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { IconPlus, IconBook, IconMoodSmile } from "@tabler/icons-react";
import { Card, Text, Group, Badge, Button, Modal, TextInput, Textarea, Select, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import dayjs from "dayjs";

type Journal = {
  id: string;
  title: string;
  location: string | null;
  date: string | null;
  mood: string | null;
  content: string | null;
  story: string | null;
  createdAt: string;
};

const moodConfig: Record<string, { color: string; emoji: string }> = {
  excited: { color: "yellow", emoji: "😆" },
  loved_it: { color: "pink", emoji: "🥰" },
  peaceful: { color: "teal", emoji: "😌" },
  emotional: { color: "indigo", emoji: "🥹" },
  amazing: { color: "grape", emoji: "🤩" },
  difficult: { color: "red", emoji: "😤" },
};

export default function JournalsPage() {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(true);
  const [opened, { open, close }] = useDisclosure(false);

  useEffect(() => {
    fetch("/api/travel/journals")
      .then((r) => (r.ok ? r.json() : []))
      .then(setJournals)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 h-8 w-40 animate-pulse rounded bg-[var(--mantine-color-dark-6,#1a1b1e)]" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-[var(--mantine-color-dark-6,#1a1b1e)]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <Group justify="space-between" mb="lg">
        <div>
          <h2 className="text-2xl font-bold text-[var(--mantine-color-text,#c1c2c5)]">Travel Journals</h2>
          <Text size="sm" c="dimmed">{journals.length} stories</Text>
        </div>
        <Button leftSection={<IconPlus size={18} />} onClick={open}>Write Story</Button>
      </Group>

      <Modal opened={opened} onClose={close} title="Write a Travel Story" size="lg">
        <form onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const data = Object.fromEntries(new FormData(form));
          await fetch("/api/travel/journals", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: data.title,
              location: data.location || undefined,
              content: data.content || undefined,
              date: data.date ? new Date(data.date as string).toISOString() : null,
            }),
          });
          close();
          window.location.reload();
        }}>
          <Stack gap="sm">
            <TextInput name="title" label="Title" required />
            <TextInput name="location" label="Location" />
            <TextInput name="date" label="Date" type="date" />
            <Textarea name="content" label="Story" autosize minRows={4} />
            <Button type="submit" fullWidth mt="sm">Publish</Button>
          </Stack>
        </form>
      </Modal>

      {journals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--mantine-color-dark-6,#1a1b1e)]">
            <IconBook size={28} className="text-[var(--mantine-color-dimmed,#5c5f66)]" />
          </div>
          <h3 className="text-lg font-semibold">No Stories Yet</h3>
          <p className="mt-1 text-sm text-[var(--mantine-color-dimmed,#5c5f66)]">Document your travel memories.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {journals.map((journal, i) => (
            <motion.div
              key={journal.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card shadow="sm" padding="md" radius="md" withBorder>
                <Text fw={600} size="sm" mb={4} lineClamp={1}>{journal.title}</Text>
                <Group gap="xs" mb="xs">
                  {journal.mood && moodConfig[journal.mood] && (
                    <Text size="sm">{moodConfig[journal.mood].emoji}</Text>
                  )}
                  {journal.location && (
                    <Text size="xs" c="dimmed">{journal.location}</Text>
                  )}
                </Group>
                {journal.content && (
                  <Text size="xs" c="dimmed" lineClamp={3}>{journal.content}</Text>
                )}
                <Group gap="xs" mt="sm">
                  {journal.date && (
                    <Text size="xs" c="dimmed">{dayjs(journal.date).format("MMM D, YYYY")}</Text>
                  )}
                </Group>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
