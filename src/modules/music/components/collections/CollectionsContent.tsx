"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { MusicContainer } from "../design-system/MusicContainer";
import { MusicEmptyState } from "../design-system/MusicEmptyState";
import { notifications } from "@mantine/notifications";
import { IconFolder, IconPlus } from "@tabler/icons-react";
import Link from "next/link";
import { Editor } from "@/components/editor";
import { textToEditorContent, textFromEditor } from "@/components/editor/utils";

type Collection = {
  id: string;
  title: string;
  description: string | null;
  itemCount: number;
  isSmart: boolean;
};

export function CollectionsContent() {
  const [showCreate, setShowCreate] = useState(false);
  const [createTitle, setCreateTitle] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["music-collections"],
    queryFn: async () => {
      const res = await fetch("/api/music/collections");
      if (!res.ok) throw new Error("Failed to load collections");
      return res.json() as Promise<{ collections: Collection[] }>;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/music/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: createTitle, description: createDesc || undefined }),
      });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => {
      notifications.show({ title: "Created", message: "Collection created", color: "green" });
      queryClient.invalidateQueries({ queryKey: ["music-collections"] });
      setShowCreate(false);
      setCreateTitle("");
      setCreateDesc("");
    },
  });

  if (isLoading) {
    return (
      <MusicContainer>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-[var(--mantine-color-dark-6,#1a1b1e)]" />
          ))}
        </div>
      </MusicContainer>
    );
  }

  const collections = data?.collections ?? [];

  return (
    <MusicContainer>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--mantine-color-text,#c1c2c5)] sm:text-4xl">
              Collections
            </h1>
            <p className="mt-1 text-[var(--mantine-color-dimmed,#5c5f66)]">
              {collections.length} collections
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700"
          >
            <IconPlus size={16} />
            Create
          </button>
        </div>
      </motion.div>

      {showCreate && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-4"
        >
          <input
            value={createTitle}
            onChange={(e) => setCreateTitle(e.target.value)}
            placeholder="Collection name"
            className="mb-3 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-2.5 text-sm text-[var(--mantine-color-text,#c1c2c5)] outline-none focus:border-blue-500/50"
          />
          <Editor
            content={textToEditorContent(createDesc)}
            onChange={(_json, _html, text) => setCreateDesc(text)}
            placeholder="Description (optional)"
            minHeight="80px"
            showToolbar={false}
          />
          <div className="flex gap-2">
            <button
              onClick={() => createMutation.mutate()}
              disabled={!createTitle.trim() || createMutation.isPending}
              className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {createMutation.isPending ? "Creating..." : "Create"}
            </button>
            <button
              onClick={() => { setShowCreate(false); setCreateTitle(""); setCreateDesc(""); }}
              className="rounded-lg border border-[var(--border-subtle)] px-4 py-1.5 text-sm text-[var(--mantine-color-dimmed,#5c5f66)] transition-colors hover:text-white"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {collections.length === 0 && !showCreate ? (
        <MusicEmptyState
          title="No collections yet"
          description="Create a collection to group your favorite albums, artists, and tracks."
          action={{ label: "Create collection", onClick: () => setShowCreate(true) }}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection, i) => (
            <motion.div
              key={collection.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={`/music/collections/${collection.id}`}>
                <div className="group rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-5 transition-all hover:shadow-md">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--mantine-color-body,#0a0a0f)]">
                      <IconFolder size={20} className="text-[var(--mantine-color-dimmed,#5c5f66)]" />
                    </div>
                    <div>
                      <h3 className="font-medium text-[var(--mantine-color-text,#c1c2c5)]">
                        {collection.title}
                      </h3>
                      {collection.isSmart && (
                        <span className="text-xs text-blue-400">Smart collection</span>
                      )}
                    </div>
                  </div>
                  {collection.description && (
                    <p className="text-sm text-[var(--mantine-color-dimmed,#5c5f66)]">
                      {collection.description}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-[var(--mantine-color-dimmed,#5c5f66)]">
                    {collection.itemCount} items
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </MusicContainer>
  );
}
