"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Spotlight, spotlight } from "@mantine/spotlight";
import { IconSearch } from "@tabler/icons-react";
import { navigation } from "@/core/navigation";

export function CommandPalette() {
  const router = useRouter();

  useEffect(() => {
    const handler = () => spotlight.open();
    document.addEventListener("opencode-spotlight", handler);
    return () => document.removeEventListener("opencode-spotlight", handler);
  }, []);

  const actions = useMemo(() => {
    const result: Array<{
      id: string;
      label: string;
      description: string;
      onClick: () => void;
      leftSection: React.ReactNode;
    }> = [];

    for (const group of navigation) {
      for (const item of group.items) {
        if (!item.route || item.route === "/logout") continue;
        result.push({
          id: item.featureId,
          label: item.label,
          description: item.description || group.label,
          onClick: () => router.push(item.route),
          leftSection: <item.icon size={18} />,
        });
        if (item.children) {
          for (const child of item.children) {
            result.push({
              id: child.featureId,
              label: child.label,
              description: `${item.label} · ${group.label}`,
              onClick: () => router.push(child.route),
              leftSection: <child.icon size={18} />,
            });
          }
        }
      }
    }
    return result;
  }, [router]);

  return (
    <Spotlight
      shortcut={["mod + K"]}
      actions={actions}
      highlightQuery
      searchProps={{
        leftSection: <IconSearch size={18} />,
        placeholder: "Search pages...",
        rightSection: (
          <kbd className="flex items-center gap-px px-1.5 py-0.5 text-[9px] font-medium rounded border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-gray-500 leading-none">
            <span className="text-[8px]">⌘</span>K
          </kbd>
        ),
      }}
      nothingFound="No results found"
      maxHeight={600}
      scrollable
    />
  );
}
