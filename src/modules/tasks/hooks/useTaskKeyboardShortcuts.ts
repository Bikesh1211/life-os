"use client";

import { useEffect } from "react";

type ShortcutMap = {
  onNewTask?: () => void;
  onSearch?: () => void;
  onToggleSelection?: () => void;
  onEscape?: () => void;
};

export function useTaskKeyboardShortcuts(shortcuts: ShortcutMap) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;

      if (e.key === "Escape") {
        shortcuts.onEscape?.();
        return;
      }

      if (!isInput) {
        if (e.key === "n" && !e.metaKey && !e.ctrlKey) {
          e.preventDefault();
          shortcuts.onNewTask?.();
        }
        if (e.key === "s" && !e.metaKey && !e.ctrlKey) {
          e.preventDefault();
          shortcuts.onSearch?.();
        }
        if (e.key === "x" && !e.metaKey && !e.ctrlKey) {
          e.preventDefault();
          shortcuts.onToggleSelection?.();
        }
      }

      if ((e.key === "n" && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        shortcuts.onNewTask?.();
      }

      if ((e.key === "s" && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        shortcuts.onSearch?.();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [shortcuts]);
}