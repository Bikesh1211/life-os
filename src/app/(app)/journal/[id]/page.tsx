"use client";

import { useCallback, useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Text, Loader } from "@mantine/core";
import { JournalEditor } from "../components/JournalEditor";
import type { JournalEntry } from "@/modules/journal";

export default function EditJournalEntryPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/journal/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setEntry(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleSave = useCallback(
    async (data: { title: string; content: string; mood?: string; tags?: string[]; reflectionScore?: number }) => {
      const res = await fetch(`/api/journal/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save");
    },
    [id],
  );

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Text c="dimmed">Entry not found</Text>
      </div>
    );
  }

  return (
    <JournalEditor
      entryId={id}
      initialTitle={entry.title}
      initialContent={entry.content ?? ""}
      initialMood={entry.mood ?? undefined}
      initialTags={entry.tags ?? []}
      initialScore={entry.reflectionScore ?? 5}
      onSave={handleSave}
    />
  );
}
