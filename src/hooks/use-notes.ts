"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type { Note, NoteTag } from "@/modules/notes";

const NOTES_KEY = "notes" as const;
const TAGS_KEY = "note-tags" as const;
const FOLDERS_KEY = "note-folders" as const;
const LINKS_KEY = "note-links" as const;

type NoteData = Note & { contentJson?: unknown };

async function fetchNotes(params?: Record<string, string | number | boolean | string[] | undefined>) {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.set("search", String(params.search));
  if (params?.category) searchParams.set("category", String(params.category));
  if (params?.status) searchParams.set("status", String(params.status));
  if (params?.folderId) searchParams.set("folderId", String(params.folderId));
  if (params?.tags && Array.isArray(params.tags)) searchParams.set("tags", params.tags.join(","));
  if (params?.isPinned !== undefined) searchParams.set("isPinned", String(params.isPinned));
  if (params?.includeArchived !== undefined) searchParams.set("includeArchived", String(params.includeArchived));
  if (params?.includeDeleted !== undefined) searchParams.set("includeDeleted", String(params.includeDeleted));
  if (params?.sortBy) searchParams.set("sortBy", String(params.sortBy));
  if (params?.sortOrder) searchParams.set("sortOrder", String(params.sortOrder));
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
  return res.json() as Promise<NoteData>;
}

async function createNote(data: {
  title: string;
  content?: string;
  contentJson?: unknown;
  category?: string;
  tags?: string[];
  status?: string;
  folderId?: string;
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
    status?: string;
    folderId?: string;
    includeArchived?: boolean;
    includeDeleted?: boolean;
    isPinned?: boolean;
    sortBy?: string;
    sortOrder?: string;
    limit?: number;
    offset?: number;
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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => updateNote(id, { _action: "togglePin" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTES_KEY] });
    },
  });
}

export function useToggleArchive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => updateNote(id, { _action: "toggleArchive" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTES_KEY] });
    },
  });
}

export function useRestoreNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => updateNote(id, { _action: "restore" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTES_KEY] });
    },
  });
}

export function useDuplicateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => updateNote(id, { _action: "duplicate" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTES_KEY] });
    },
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

// ── Note Links ──

export function useNoteLinks(noteId: string) {
  return useQuery({
    queryKey: [LINKS_KEY, "outgoing", noteId],
    queryFn: async () => {
      const res = await fetch(`/api/notes/links?noteId=${noteId}&type=outgoing`);
      if (!res.ok) throw new Error("Failed to fetch links");
      return res.json();
    },
    enabled: !!noteId,
  });
}

export function useNoteBacklinks(noteId: string) {
  return useQuery({
    queryKey: [LINKS_KEY, "backlinks", noteId],
    queryFn: async () => {
      const res = await fetch(`/api/notes/links?noteId=${noteId}&type=backlinks`);
      if (!res.ok) throw new Error("Failed to fetch backlinks");
      return res.json();
    },
    enabled: !!noteId,
  });
}

export function useCreateNoteLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ noteId, linkedNoteId }: { noteId: string; linkedNoteId: string }) => {
      const res = await fetch("/api/notes/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId, linkedNoteId }),
      });
      if (!res.ok) throw new Error("Failed to create link");
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [LINKS_KEY, "outgoing", variables.noteId] });
      queryClient.invalidateQueries({ queryKey: [LINKS_KEY, "backlinks", variables.linkedNoteId] });
    },
  });
}

export function useDeleteNoteLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, noteId }: { id: string; noteId: string }) => {
      const res = await fetch(`/api/notes/links?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete link");
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [LINKS_KEY, "outgoing", variables.noteId] });
      queryClient.invalidateQueries({ queryKey: [LINKS_KEY, "backlinks", variables.noteId] });
    },
  });
}

// ── Note Folders ──

export function useNoteFolders() {
  return useQuery({
    queryKey: [FOLDERS_KEY],
    queryFn: async () => {
      const res = await fetch("/api/notes/folders");
      if (!res.ok) throw new Error("Failed to fetch folders");
      return res.json();
    },
    staleTime: 60_000,
  });
}

export function useCreateNoteFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; color?: string; icon?: string; parentId?: string | null }) => {
      const res = await fetch("/api/notes/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create folder");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FOLDERS_KEY] });
    },
  });
}

export function useUpdateNoteFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; name?: string; color?: string; icon?: string; parentId?: string | null }) => {
      const res = await fetch("/api/notes/folders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...data }),
      });
      if (!res.ok) throw new Error("Failed to update folder");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FOLDERS_KEY] });
      queryClient.invalidateQueries({ queryKey: [NOTES_KEY] });
    },
  });
}

export function useDeleteNoteFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/notes/folders?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete folder");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FOLDERS_KEY] });
      queryClient.invalidateQueries({ queryKey: [NOTES_KEY] });
    },
  });
}
