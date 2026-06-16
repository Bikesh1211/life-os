"use client";

import { use, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { MusicContainer } from "../design-system/MusicContainer";
import { MusicCard } from "../design-system/MusicCard";
import { SectionHeading } from "../design-system/SectionHeading";
import { MusicEmptyState } from "../design-system/MusicEmptyState";
import { IconArrowLeft, IconTrash, IconEdit, IconPlus } from "@tabler/icons-react";
import Link from "next/link";
import { Editor } from "@/components/editor";
import { textToEditorContent, textFromEditor } from "@/components/editor/utils";

type CollectionItem = {
  id: string;
  entityType: "track" | "album" | "artist";
  entityId: string;
  position: number;
  title?: string;
  subtitle?: string;
  imageUrl?: string;
};

type CollectionDetail = {
  id: string;
  title: string;
  description: string | null;
  isSmart: boolean;
  items: CollectionItem[];
};

export function CollectionDetailContent({ idPromise }: { idPromise: Promise<{ id: string }> }) {
  const { id } = use(idPromise);
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const { data, isLoading } = useQuery<CollectionDetail>({
    queryKey: ["music-collection", id],
    queryFn: async () => {
      const res = await fetch(`/api/music/collections/${id}`);
      if (!res.ok) throw new Error("Collection not found");
      return res.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (body: { title?: string; description?: string }) => {
      const res = await fetch(`/api/music/collections/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["music-collection", id] });
      queryClient.invalidateQueries({ queryKey: ["music-collections"] });
      setEditing(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/music/collections/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      window.location.href = "/music/library";
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const res = await fetch(`/api/music/collections/${id}/items?itemId=${itemId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to remove item");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["music-collection", id] });
    },
  });

  if (isLoading) {
    return (
      <MusicContainer>
        <div className="h-32 animate-pulse rounded-2xl bg-[var(--mantine-color-dark-6,#1a1b1e)]" />
        <div className="mt-6 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-[var(--mantine-color-dark-6,#1a1b1e)]" />
          ))}
        </div>
      </MusicContainer>
    );
  }

  if (!data) {
    return (
      <MusicContainer>
        <MusicEmptyState title="Collection not found" description="This collection doesn't exist." />
      </MusicContainer>
    );
  }

  return (
    <MusicContainer>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <Link
          href="/music/library"
          className="mb-4 inline-flex items-center gap-1 text-sm text-[var(--mantine-color-dimmed,#5c5f66)] transition-colors hover:text-white"
        >
          <IconArrowLeft size={16} />
          Back to Library
        </Link>

        {editing ? (
          <div className="mb-6 space-y-3">
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full rounded-xl border border-[var(--mantine-color-dark-4,#2e2f33)] bg-[var(--mantine-color-dark-6,#1a1b1e)] p-3 text-xl font-bold text-[var(--mantine-color-text,#c1c2c5)] outline-none"
              placeholder="Collection name"
            />
            <Editor
              content={textToEditorContent(editDesc)}
              onChange={(_json, _html, text) => setEditDesc(text)}
              placeholder="Description (optional)"
              minHeight="80px"
              showToolbar={false}
            />
            <div className="flex gap-2">
              <button
                onClick={() => updateMutation.mutate({ title: editTitle, description: editDesc || undefined })}
                disabled={!editTitle.trim() || updateMutation.isPending}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                Save
              </button>
              <button
                onClick={() => setEditing(false)}
                className="rounded-xl border border-[var(--mantine-color-dark-4,#2e2f33)] px-4 py-2 text-sm text-[var(--mantine-color-dimmed,#5c5f66)] transition-colors hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[var(--mantine-color-text,#c1c2c5)] sm:text-4xl">
              {data.title}
            </h1>
            {data.description && (
              <p className="mt-1 text-[var(--mantine-color-dimmed,#5c5f66)]">{data.description}</p>
            )}
            <p className="mt-1 text-sm text-[var(--mantine-color-dimmed,#5c5f66)]">
              {data.items.length} items
            </p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => { setEditTitle(data.title); setEditDesc(data.description ?? ""); setEditing(true); }}
                className="flex items-center gap-1.5 rounded-xl border border-[var(--mantine-color-dark-4,#2e2f33)] px-3 py-1.5 text-sm text-[var(--mantine-color-dimmed,#5c5f66)] transition-colors hover:text-white"
              >
                <IconEdit size={14} />
                Edit
              </button>
              <button
                onClick={() => { if (confirm("Delete this collection?")) deleteMutation.mutate(); }}
                className="flex items-center gap-1.5 rounded-xl border border-[var(--mantine-color-dark-4,#2e2f33)] px-3 py-1.5 text-sm text-red-400 transition-colors hover:text-red-300"
              >
                <IconTrash size={14} />
                Delete
              </button>
            </div>
          </div>
        )}

        {data.items.length === 0 ? (
          <MusicEmptyState
            title="Empty collection"
            description="Add tracks, albums, or artists to this collection by searching for them."
            action={{ label: "Search music", onClick: () => window.location.href = "/music" }}
          />
        ) : (
          <section>
            <SectionHeading title={`Items (${data.items.length})`} />
            <div className="space-y-2">
              {data.items.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3 rounded-xl border border-[var(--mantine-color-dark-4,#2e2f33)] bg-[var(--mantine-color-dark-6,#1a1b1e)] p-3 transition-colors hover:border-[var(--mantine-color-dark-3,#373a40)]"
                >
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt="" className="h-12 w-12 rounded-lg object-cover" />
                  )}
                  <Link
                    href={`/music/${item.entityType === "artist" ? "artists" : item.entityType === "album" ? "albums" : "tracks"}/${item.entityId}`}
                    className="flex-1 min-w-0"
                  >
                    <p className="text-sm text-[var(--mantine-color-text,#c1c2c5)] truncate">{item.title ?? item.entityId}</p>
                    {item.subtitle && (
                      <p className="text-xs text-[var(--mantine-color-dimmed,#5c5f66)] truncate">{item.subtitle}</p>
                    )}
                  </Link>
                  <span className="hidden sm:block text-xs text-[var(--mantine-color-dimmed,#5c5f66)] capitalize">{item.entityType}</span>
                  <button
                    onClick={() => removeItemMutation.mutate(item.id)}
                    className="shrink-0 text-[var(--mantine-color-dimmed,#5c5f66)] transition-colors hover:text-red-400"
                  >
                    <IconTrash size={14} />
                  </button>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </motion.div>
    </MusicContainer>
  );
}
