"use client";

import { useCallback } from "react";
import { IconSearch } from "@tabler/icons-react";
import { cn } from "@/core/utils";

export function SidebarSearch({ collapsed }: { collapsed: boolean }) {
  const openSpotlight = useCallback(() => {
    document.dispatchEvent(new CustomEvent("opencode-spotlight"));
  }, []);

  if (collapsed) {
    return (
      <div className="px-2 py-0.5">
        <button
          onClick={openSpotlight}
          className="flex items-center justify-center w-full h-8 rounded-lg border border-gray-200/70 dark:border-white/[0.08] text-gray-400 dark:text-gray-500 hover:border-gray-300 dark:hover:border-white/[0.15] hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-all"
          title="Search (⌘K)"
        >
          <IconSearch size={15} strokeWidth={1.5} />
        </button>
      </div>
    );
  }

  return (
    <div className="px-3 py-0.5">
      <button
        onClick={openSpotlight}
        className="flex items-center gap-2 w-full rounded-lg border border-gray-200/70 dark:border-white/[0.08] bg-gray-50/60 dark:bg-white/[0.03] px-3 h-8 text-xs text-gray-400 dark:text-gray-500 transition-all hover:border-gray-300 dark:hover:border-white/[0.15] hover:bg-gray-100/60 dark:hover:bg-white/[0.06] cursor-text active:scale-[0.99]"
      >
        <IconSearch size={14} strokeWidth={1.5} className="flex-shrink-0" />
        <span className="flex-1 text-left">Search...</span>
        <kbd className="flex-shrink-0 hidden sm:inline-flex items-center gap-px px-1.5 py-0.5 text-[9px] font-medium rounded-md border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-gray-400 dark:text-gray-500 leading-none">
          <span className="text-[8px]">⌘</span>K
        </kbd>
      </button>
    </div>
  );
}
