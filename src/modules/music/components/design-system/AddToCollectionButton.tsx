"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { IconFolderPlus, IconCheck } from "@tabler/icons-react";
import { apiFetch } from "@/core/api/http";

type Collection = {
  id: string;
  title: string;
  description: string | null;
  itemCount: number;
  isSmart: boolean;
};

export function AddToCollectionButton({ entityType, entityId }: { entityType: "track" | "album" | "artist"; entityId: string }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: collections } = useQuery<Collection[]>({
    queryKey: ["music-collections"],
    queryFn: () => apiFetch<Collection[]>("/api/music/collections"),
  });

  const addMutation = useMutation({
    mutationFn: (collectionId: string) =>
      apiFetch(`/api/music/collections/${collectionId}/items`, {
        method: "POST",
        body: JSON.stringify({ entityType, entityId }),
      }),
    onSuccess: () => {
      notifications.show({ title: "Added", message: "Added to collection", color: "green" });
      queryClient.invalidateQueries({ queryKey: ["music-collections"] });
    },
  });

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const list = Array.isArray(collections) ? collections : [];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-sm text-white/80 backdrop-blur-sm transition-colors hover:bg-white/20"
      >
        <IconFolderPlus size={14} />
        Add to Collection
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-2 shadow-xl">
          {list.length === 0 ? (
            <p className="px-2 py-3 text-center text-sm text-[var(--mantine-color-dimmed,#5c5f66)]">
              No collections yet
            </p>
          ) : (
            <div className="max-h-48 space-y-0.5 overflow-y-auto">
              {list.map((collection) => (
                <button
                  key={collection.id}
                  onClick={() => {
                    addMutation.mutate(collection.id);
                    setOpen(false);
                  }}
                  disabled={addMutation.isPending}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-[var(--mantine-color-text,#c1c2c5)] transition-colors hover:bg-[var(--mantine-color-dark-5,#25262b)] disabled:opacity-50"
                >
                  <span className="flex-1 truncate">{collection.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
