"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TextInput, Text, Title } from "@mantine/core";
import { IconSearch, IconX } from "@tabler/icons-react";
import { motion } from "framer-motion";
import { navigation, type NavItem, type NavGroup } from "@/core/navigation";
import { cn } from "@/core/utils";
import { useAppShell } from "@/app/(app)/AppShellProvider";

type FlatPageItem = {
  id: string;
  label: string;
  description: string;
  route: string;
  groupLabel: string;
  parentLabel?: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
};

const SKIP_GROUPS = new Set(["Favorites"]);

function flattenNav(groups: NavGroup[]): FlatPageItem[] {
  const items: FlatPageItem[] = [];
  for (const group of groups) {
    if (SKIP_GROUPS.has(group.label)) continue;
    for (const item of group.items) {
      if (!item.route) continue;
      items.push({
        id: item.featureId,
        label: item.label,
        description: item.description,
        route: item.route,
        groupLabel: group.label,
        icon: item.icon,
      });
      for (const child of item.children ?? []) {
        if (!child.route) continue;
        items.push({
          id: child.featureId,
          label: child.label,
          description: child.description,
          route: child.route,
          groupLabel: group.label,
          parentLabel: item.label,
          icon: child.icon,
        });
      }
    }
  }
  return items;
}

const ALL_ITEMS = flattenNav(navigation);

function groupItems(items: FlatPageItem[]): { group: string; items: FlatPageItem[] }[] {
  const map = new Map<string, FlatPageItem[]>();
  for (const item of items) {
    const list = map.get(item.groupLabel) ?? [];
    list.push(item);
    map.set(item.groupLabel, list);
  }
  return Array.from(map.entries()).map(([group, groupItems]) => ({ group, items: groupItems }));
}

function searchItems(items: FlatPageItem[], query: string): FlatPageItem[] {
  const q = query.toLowerCase().trim();
  if (!q) return items;

  const aliasMap: Record<string, string[]> = {
    dashboard: ["home", "overview", "start"],
    journal: ["diary", "write", "reflection", "entries", "book", "reader"],
    notes: ["quick note", "capture", "scratch", "memo"],
    tasks: ["todo", "to do", "checklist"],
    habits: ["streak", "daily"],
    goals: ["objectives", "targets", "okr"],
    finance: ["money", "budget", "spending", "expenses", "accounts", "subscriptions"],
    knowledge: ["vault", "wiki", "reference"],
    timeline: ["story", "history", "activity"],
    countdown: ["events", "days until", "timer"],
    gamification: ["xp", "level", "badges", "achievements", "trophy"],
    music: ["songs", "albums", "artists", "listening"],
    movies: ["films", "watchlist", "cinema", "tv", "anime"],
    travel: ["trips", "places", "journeys"],
    career: ["work", "job", "applications"],
    "field_roadmap": ["roadmap", "career path", "mastery", "become better"],
    network: ["people", "contacts", "relationships"],
    wellness: ["health", "self care"],
    routines: ["daily plan", "planner", "schedule"],
    strategy: ["operating manual", "values", "principles", "vision", "manual"],
    feedback: ["support", "bug", "suggestion", "report"],
    settings: ["preferences", "config", "options"],
    profile: ["account", "me"],
    integrity: ["commitments", "promises", "accountability"],
    curb: ["bad habits", "reduce"],
    fitness: ["workout", "exercise", "gym"],
    "time_audit": ["time tracking", "productivity"],
    brain: ["knowledge", "mind map"],
  };

  return items.filter((item) => {
    if (item.label.toLowerCase().includes(q)) return true;
    if (item.description.toLowerCase().includes(q)) return true;
    if (item.parentLabel?.toLowerCase().includes(q)) return true;
    const aliases = aliasMap[item.id];
    if (aliases?.some((a) => a.includes(q))) return true;
    return false;
  });
}

export default function PagesPage() {
  const router = useRouter();
  const { closeMobile } = useAppShell();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => searchItems(ALL_ITEMS, query), [query]);
  const grouped = useMemo(() => groupItems(filtered), [filtered]);
  const totalCount = ALL_ITEMS.length;

  const handleNavigate = useCallback(
    (route: string) => {
      closeMobile();
      router.push(route);
    },
    [closeMobile, router],
  );

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div className="mb-6">
          <Title order={2} className="text-gray-900 dark:text-white">
            All Pages
          </Title>
          <Text size="sm" c="dimmed" className="mt-1">
            {totalCount} pages available
          </Text>
        </div>

        <TextInput
          placeholder="Filter pages…"
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          leftSection={<IconSearch size={16} strokeWidth={1.5} />}
          rightSection={
            query ? (
              <button
                onClick={() => setQuery("")}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <IconX size={16} strokeWidth={1.5} />
              </button>
            ) : null
          }
          className="mb-6"
          size="md"
          radius="md"
        />

        <div className="space-y-8">
          {grouped.map((group) => (
            <div key={group.group}>
              <div className="mb-3">
                <span className="sd-group-label text-xs">{group.group}</span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.id}
                      href={item.route}
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavigate(item.route);
                      }}
                      className={cn(
                        "flex items-start gap-3 rounded-xl p-3.5 transition-all duration-150",
                        "border border-gray-100/80 dark:border-white/[0.06]",
                        "hover:border-gray-200 dark:hover:border-white/[0.12]",
                        "hover:shadow-sm hover:bg-gray-50/60 dark:hover:bg-white/[0.03]",
                        "active:scale-[0.99]",
                      )}
                    >
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        <Icon size={18} strokeWidth={1.75} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <Text size="sm" fw={600} className="text-gray-900 dark:text-white leading-snug">
                          {item.label}
                        </Text>
                        <Text size="xs" c="dimmed" lineClamp={1} className="mt-0.5">
                          {item.parentLabel ? `${item.parentLabel} · ${item.description}` : item.description}
                        </Text>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <IconSearch size={40} strokeWidth={1} className="text-gray-300 dark:text-gray-600 mb-4" />
            <Text size="sm" c="dimmed" fw={500}>
              No pages match &ldquo;{query}&rdquo;
            </Text>
            <button
              onClick={() => setQuery("")}
              className="mt-2 text-sm text-blue-500 hover:text-blue-600 transition-colors"
            >
              Clear filter
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
