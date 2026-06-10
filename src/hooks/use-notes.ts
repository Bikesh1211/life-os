"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type { Note, NoteTag } from "@/modules/notes";

const NOTES_KEY = "notes" as const;
const TAGS_KEY = "note-tags" as const;

async function fetchNotes(params?: {
  search?: string;
  category?: string;
  tags?: string[];
  isArchived?: boolean;
  sortBy?: string;
  sortOrder?: string;
  limit?: number;
  offset?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.set("search", params.search);
  if (params?.category) searchParams.set("category", params.category);
  if (params?.tags?.length) searchParams.set("tags", params.tags.join(","));
  if (params?.isArchived !== undefined) searchParams.set("isArchived", String(params.isArchived));
  if (params?.sortBy) searchParams.set("sortBy", params.sortBy);
  if (params?.sortOrder) searchParams.set("sortOrder", params.sortOrder);
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.offset) searchParams.set("offset", String(params.offset));

  const qs = searchParams.toString();
  const res = await fetch(`/api/notes${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error("Failed to fetch notes");
  return res.json() as Promise<Note[]>;
}

async function fetchNote(id: string) {
  const res = await fetch(`/api/notes/${id}`);
  if (!res.ok) throw new Error("Failed to fetch note");
  return res.json() as Promise<Note>;
}

async function createNote(data: {
  title: string;
  content?: string;
  category?: string;
  tags?: string[];
  priority?: string;
  reminderDate?: string | null;
}) {
  const res = await fetch("/api/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create note");
  return res.json() as Promise<Note>;
}

async function updateNote(id: string, data: Record<string, unknown>) {
  const res = await fetch(`/api/notes/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update note");
  return res.json() as Promise<Note>;
}

async function deleteNote(id: string) {
  const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete note");
  return res.json();
}

async function fetchTags() {
  const res = await fetch("/api/notes/tags");
  if (!res.ok) throw new Error("Failed to fetch tags");
  return res.json() as Promise<NoteTag[]>;
}

async function createTag(data: { name: string; color?: string }) {
  const res = await fetch("/api/notes/tags", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create tag");
  return res.json() as Promise<NoteTag>;
}

export function useNotes(
  filters?: {
    search?: string;
    category?: string;
    tags?: string[];
    isArchived?: boolean;
  },
  initialData?: Note[],
) {
  return useQuery({
    queryKey: [NOTES_KEY, filters ?? {}],
    queryFn: () => fetchNotes(filters),
    staleTime: 30_000,
    initialData: initialData && !filters?.search && !filters?.category && !filters?.tags?.length
      ? initialData
      : undefined,
  });
}

export function useNote(id: string) {
  return useQuery({
    queryKey: [NOTES_KEY, id],
    queryFn: () => fetchNote(id),
    enabled: !!id,
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTES_KEY] });
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, unknown>) => updateNote(id, data),
    onMutate: async ({ id, ...data }) => {
      await queryClient.cancelQueries({ queryKey: [NOTES_KEY] });
      const previousQueries = queryClient.getQueriesData<Note[]>({ queryKey: [NOTES_KEY] });

      queryClient.setQueriesData<Note[]>({ queryKey: [NOTES_KEY] }, (old) =>
        old?.map((note) => (note.id === id ? { ...note, ...data } : note)),
      );

      return { previousQueries };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousQueries) {
        for (const [key, data] of context.previousQueries) {
          queryClient.setQueryData(key, data);
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [NOTES_KEY] });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTES_KEY] });
    },
  });
}

export function useTogglePin() {
  return useMutation({
    mutationFn: (id: string) => updateNote(id, { _action: "togglePin" }),
  });
}

export function useToggleArchive() {
  return useMutation({
    mutationFn: (id: string) => updateNote(id, { _action: "toggleArchive" }),
  });
}

export function useNoteTags() {
  return useQuery({
    queryKey: [TAGS_KEY],
    queryFn: fetchTags,
    staleTime: 60_000,
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TAGS_KEY] });
    },
  });
}
