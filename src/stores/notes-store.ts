import { create } from "zustand";
import type { Note } from "@/modules/notes";

export type SidebarView = "notes" | "reminders" | "labels" | "archive" | "trash";

type NotesStore = {
  search: string;
  setSearch: (search: string) => void;
  sidebarView: SidebarView;
  setSidebarView: (view: SidebarView) => void;
  activeLabel: string | null;
  setActiveLabel: (label: string | null) => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  editModalNote: Note | null;
  isEditModalOpen: boolean;
  openEditModal: (note: Note) => void;
  openCreateModal: () => void;
  closeEditModal: () => void;
};

export const useNotesStore = create<NotesStore>((set) => ({
  search: "",
  setSearch: (search) => set({ search }),
  sidebarView: "notes",
  setSidebarView: (view) => set({ sidebarView: view, activeLabel: null }),
  activeLabel: null,
  setActiveLabel: (label) => set({ activeLabel: label }),
  isSidebarOpen: false,
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  closeSidebar: () => set({ isSidebarOpen: false }),
  editModalNote: null,
  isEditModalOpen: false,
  openEditModal: (note) => set({ editModalNote: note, isEditModalOpen: true }),
  openCreateModal: () => set({ editModalNote: null, isEditModalOpen: true }),
  closeEditModal: () => set({ editModalNote: null, isEditModalOpen: false }),
}));
