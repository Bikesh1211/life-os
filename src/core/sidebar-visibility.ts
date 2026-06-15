"use client";

import { useState, useEffect, useCallback } from "react";
import { navigation, type NavItem, type NavGroup } from "@/core/navigation";

const STORAGE_KEY = "life-os:sidebar-visibility";

export type VisibilityState = {
  hiddenGroups: string[];
  hiddenItems: string[];
};

function loadVisibility(): VisibilityState {
  if (typeof window === "undefined") return { hiddenGroups: [], hiddenItems: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { hiddenGroups: [], hiddenItems: [] };
}

function saveVisibility(state: VisibilityState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function useSidebarVisibility() {
  const [state, setState] = useState<VisibilityState>({ hiddenGroups: [], hiddenItems: [] });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setState(loadVisibility());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    fetch("/api/sidebar/preferences")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        if (data.visibility) {
          setState((prev) => {
            if (JSON.stringify(prev) === JSON.stringify(data.visibility)) return prev;
            saveVisibility(data.visibility);
            return data.visibility;
          });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const timer = setTimeout(() => {
      fetch("/api/sidebar/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visibility: state }),
      }).catch(() => {});
    }, 300);
    return () => clearTimeout(timer);
  }, [state, loaded]);

  const toggleGroup = useCallback((groupLabel: string) => {
    setState((prev) => {
      const hidden = prev.hiddenGroups.includes(groupLabel)
        ? prev.hiddenGroups.filter((g) => g !== groupLabel)
        : [...prev.hiddenGroups, groupLabel];
      const next = { ...prev, hiddenGroups: hidden };
      saveVisibility(next);
      return next;
    });
  }, []);

  const toggleItem = useCallback((featureId: string) => {
    setState((prev) => {
      const hidden = prev.hiddenItems.includes(featureId)
        ? prev.hiddenItems.filter((i) => i !== featureId)
        : [...prev.hiddenItems, featureId];
      const next = { ...prev, hiddenItems: hidden };
      saveVisibility(next);
      return next;
    });
  }, []);

  const groupVisible = useCallback(
    (groupLabel: string) => !state.hiddenGroups.includes(groupLabel),
    [state.hiddenGroups],
  );

  const itemVisible = useCallback(
    (featureId: string) => !state.hiddenItems.includes(featureId),
    [state.hiddenItems],
  );

  function getVisibleGroups(): NavGroup[] {
    return navigation
      .map((group) => {
        if (group.label === "System" || group.label === "Favorites") return group;
        if (state.hiddenGroups.includes(group.label)) return null;

        const items = group.items.filter((item) => {
          if (!state.hiddenItems.includes(item.featureId)) return true;
          return false;
        });

        if (items.length === 0) return null;

        const filteredChildren = (item: NavItem): NavItem | null => {
          if (!item.children) return item;
          const visibleChildren = item.children.filter(
            (c) => !state.hiddenItems.includes(c.featureId),
          );
          if (visibleChildren.length === 0) return null;
          return { ...item, children: visibleChildren };
        };

        const filteredItems = items
          .map((item) => (item.children ? filteredChildren(item) : item))
          .filter(Boolean) as NavItem[];

        if (filteredItems.length === 0) return null;
        return { ...group, items: filteredItems };
      })
      .filter(Boolean) as NavGroup[];
  }

  return {
    state,
    loaded,
    toggleGroup,
    toggleItem,
    groupVisible,
    itemVisible,
    getVisibleGroups,
  };
}
