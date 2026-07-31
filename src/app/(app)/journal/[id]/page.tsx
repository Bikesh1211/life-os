"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Text, Loader } from "@mantine/core";
import { JournalEditor } from "../components/JournalEditor";
import type { JournalEntry } from "@/modules/journal";

export default function EditJournalEntryPage() {
  const { id } = useParams<{ id: string }>();
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
      initialDateLabel={
        entry.eventDate ?? entry.createdAt
          ? new Date(entry.eventDate ?? entry.createdAt).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })
          : undefined
      }
    />
  );
}
