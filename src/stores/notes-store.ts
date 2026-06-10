import { create } from "zustand";
import type { Note } from "@/modules/notes";

export type ViewMode = "grid" | "list";

type NotesStore = {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  search: string;
  setSearch: (search: string) => void;
  selectedTags: string[];
  toggleTag: (tag: string) => void;
  clearTags: () => void;
  categoryFilter: string | null;
  setCategoryFilter: (category: string | null) => void;
  showArchived: boolean;
  setShowArchived: (show: boolean) => void;
  isQuickNoteOpen: boolean;
  openQuickNote: () => void;
  closeQuickNote: () => void;
  editingNote: Note | null;
  openEditNote: (note: Note) => void;
  clearEditingNote: () => void;
};

export const useNotesStore = create<NotesStore>((set) => ({
  viewMode: "grid",
  setViewMode: (mode) => set({ viewMode: mode }),
  search: "",
  setSearch: (search) => set({ search }),
  selectedTags: [],
  toggleTag: (tag) =>
    set((state) => ({
      selectedTags: state.selectedTags.includes(tag)
        ? state.selectedTags.filter((t) => t !== tag)
        : [...state.selectedTags, tag],
    })),
  clearTags: () => set({ selectedTags: [] }),
  categoryFilter: null,
  setCategoryFilter: (category) => set({ categoryFilter: category }),
  showArchived: false,
  setShowArchived: (show) => set({ showArchived: show }),
  isQuickNoteOpen: false,
  openQuickNote: () => set({ isQuickNoteOpen: true, editingNote: null }),
  closeQuickNote: () => set({ isQuickNoteOpen: false, editingNote: null }),
  editingNote: null,
  openEditNote: (note) => set({ isQuickNoteOpen: true, editingNote: note }),
  clearEditingNote: () => set({ editingNote: null }),
}));
