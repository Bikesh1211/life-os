"use client";

import { notifications } from "@mantine/notifications";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type { Note, NoteTag } from "@/modules/notes";
import { apiFetch, toSearchParams } from "@/core/api/http";

const NOTES_KEY = "notes" as const;
const TAGS_KEY = "note-tags" as const;
const FOLDERS_KEY = "note-folders" as const;
const LINKS_KEY = "note-links" as const;

type NoteData = Note & { contentJson?: unknown };

async function fetchNotes(params?: Record<string, string | number | boolean | string[] | undefined>) {
  return apiFetch<Note[]>(`/api/notes${toSearchParams(params ?? {})}`);
}

async function fetchNote(id: string) {
  return apiFetch<NoteData>(`/api/notes/${id}`);
}

async function createNote(data: {
  title: string;
  content?: string | null;
  contentJson?: unknown;
  category?: string;
  tags?: string[];
  status?: string;
  folderId?: string;
  priority?: string;
  isPinned?: boolean;
  reminderDate?: string | null;
  color?: string | null;
}) {
  return apiFetch<Note>("/api/notes", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

async function updateNote(id: string, data: Record<string, unknown>) {
  return apiFetch<Note>(`/api/notes/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

async function deleteNote(id: string) {
  return apiFetch<any>(`/api/notes/${id}`, { method: "DELETE" });
}

async function fetchTags() {
  return apiFetch<NoteTag[]>("/api/notes/tags");
}

async function createTag(data: { name: string; color?: string }) {
  return apiFetch<NoteTag>("/api/notes/tags", {
    method: "POST",
    body: JSON.stringify(data),
  });
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
    onMutate: async (newNote) => {
      await queryClient.cancelQueries({ queryKey: [NOTES_KEY] });
      const previousQueries = queryClient.getQueriesData<Note[]>({ queryKey: [NOTES_KEY] });

      const tempId = `temp-${crypto.randomUUID()}`;
      const tempNote: Note = {
        id: tempId,
        userId: "",
        title: newNote.title,
        content: newNote.content ?? null,
        contentJson: null,
        excerpt: null,
        coverImage: null,
        category: newNote.category ?? "personal",
        tags: newNote.tags ?? [],
        isPinned: newNote.isPinned ?? false,
        status: newNote.status ?? "published",
        folderId: newNote.folderId ?? null,
        reminderDate: newNote.reminderDate ? new Date(newNote.reminderDate) : null,
        color: newNote.color ?? null,
        priority: newNote.priority ?? "medium",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      queryClient.setQueriesData<Note[]>({ queryKey: [NOTES_KEY] }, (old) =>
        old ? [tempNote, ...old] : [tempNote],
      );

      return { previousQueries, tempId };
    },
    onSuccess: (savedNote, _vars, context) => {
      notifications.show({ title: "Created", message: "Note created", color: "green" });
      queryClient.setQueriesData<Note[]>({ queryKey: [NOTES_KEY] }, (old) =>
        old?.map((n) => (n.id === context?.tempId ? savedNote : n)),
      );
    },
    onError: (_err, _vars, context) => {
      notifications.show({ title: "Error", message: "Failed to create note", color: "red" });
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
    onSuccess: () => {
      notifications.show({ title: "Updated", message: "Note updated", color: "green" });
    },
    onError: (_err, _vars, context) => {
      notifications.show({ title: "Error", message: "Failed to update note", color: "red" });
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
      notifications.show({ title: "Deleted", message: "Note deleted", color: "orange" });
      queryClient.invalidateQueries({ queryKey: [NOTES_KEY] });
    },
    onError: () => {
      notifications.show({ title: "Error", message: "Failed to delete note", color: "red" });
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
      notifications.show({ title: "Created", message: "Tag created", color: "green" });
      queryClient.invalidateQueries({ queryKey: [TAGS_KEY] });
    },
  });
}

// ── Note Links ──

export function useNoteLinks(noteId: string) {
  return useQuery({
    queryKey: [LINKS_KEY, "outgoing", noteId],
    queryFn: () => apiFetch<any[]>(`/api/notes/links${toSearchParams({ noteId, type: "outgoing" })}`),
    enabled: !!noteId,
  });
}

export function useNoteBacklinks(noteId: string) {
  return useQuery({
    queryKey: [LINKS_KEY, "backlinks", noteId],
    queryFn: () => apiFetch<any[]>(`/api/notes/links${toSearchParams({ noteId, type: "backlinks" })}`),
    enabled: !!noteId,
  });
}

export function useCreateNoteLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ noteId, linkedNoteId }: { noteId: string; linkedNoteId: string }) =>
      apiFetch("/api/notes/links", {
        method: "POST",
        body: JSON.stringify({ noteId, linkedNoteId }),
      }),
    onSuccess: (_, variables) => {
      notifications.show({ title: "Created", message: "Note linked", color: "green" });
      queryClient.invalidateQueries({ queryKey: [LINKS_KEY, "outgoing", variables.noteId] });
      queryClient.invalidateQueries({ queryKey: [LINKS_KEY, "backlinks", variables.linkedNoteId] });
    },
  });
}

export function useDeleteNoteLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, noteId }: { id: string; noteId: string }) =>
      apiFetch(`/api/notes/links${toSearchParams({ id })}`, { method: "DELETE" }),
    onSuccess: (_, variables) => {
      notifications.show({ title: "Deleted", message: "Link removed", color: "orange" });
      queryClient.invalidateQueries({ queryKey: [LINKS_KEY, "outgoing", variables.noteId] });
      queryClient.invalidateQueries({ queryKey: [LINKS_KEY, "backlinks", variables.noteId] });
    },
  });
}

// ── Note Folders ──

export function useNoteFolders() {
  return useQuery({
    queryKey: [FOLDERS_KEY],
    queryFn: () => apiFetch<any[]>("/api/notes/folders"),
    staleTime: 60_000,
  });
}

export function useCreateNoteFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; color?: string; icon?: string; parentId?: string | null }) =>
      apiFetch("/api/notes/folders", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      notifications.show({ title: "Created", message: "Folder created", color: "green" });
      queryClient.invalidateQueries({ queryKey: [FOLDERS_KEY] });
    },
  });
}

export function useUpdateNoteFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; color?: string; icon?: string; parentId?: string | null }) =>
      apiFetch("/api/notes/folders", {
        method: "PATCH",
        body: JSON.stringify({ id, ...data }),
      }),
    onSuccess: () => {
      notifications.show({ title: "Updated", message: "Folder updated", color: "green" });
      queryClient.invalidateQueries({ queryKey: [FOLDERS_KEY] });
      queryClient.invalidateQueries({ queryKey: [NOTES_KEY] });
    },
  });
}

export function useDeleteNoteFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/notes/folders${toSearchParams({ id })}`, { method: "DELETE" }),
    onSuccess: () => {
      notifications.show({ title: "Deleted", message: "Folder deleted", color: "orange" });
      queryClient.invalidateQueries({ queryKey: [FOLDERS_KEY] });
      queryClient.invalidateQueries({ queryKey: [NOTES_KEY] });
    },
  });
}
