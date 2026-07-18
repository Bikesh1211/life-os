"use client";

import { useState, useEffect, useCallback } from "react";
import { findNavItemByFeatureId, type NavItem } from "@/core/navigation";

const STORAGE_KEY = "life-os:sidebar-favorites";

export const DEFAULT_FAVORITES = [
  "dashboard",
  "notes",
  "expenses",
  "timeline",
  "journal",
  "habits",
];

export function useSidebarFavorites() {
  const [customFavorites, setCustomFavorites] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setCustomFavorites(JSON.parse(raw));
    } catch {}
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
        if (data.favorites) {
          const nonDefaults = data.favorites.filter(
            (id: string) => !DEFAULT_FAVORITES.includes(id),
          );
          setCustomFavorites((prev) => {
            if (JSON.stringify(prev) === JSON.stringify(nonDefaults)) return prev;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(nonDefaults));
            return nonDefaults;
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
        body: JSON.stringify({ favorites: customFavorites }),
      }).catch(() => {});
    }, 300);
    return () => clearTimeout(timer);
  }, [customFavorites, loaded]);

  const getDefaultFavoriteItems = useCallback((): NavItem[] => {
    return DEFAULT_FAVORITES.map((id) => findNavItemByFeatureId(id)).filter(
      (item): item is NavItem => item !== undefined,
    );
  }, []);

  const getCustomFavoriteItems = useCallback((): NavItem[] => {
    return customFavorites
      .map((id) => findNavItemByFeatureId(id))
      .filter((item): item is NavItem => item !== undefined);
  }, [customFavorites]);

  const toggleFavorite = useCallback((featureId: string) => {
    if (DEFAULT_FAVORITES.includes(featureId)) return;
    setCustomFavorites((prev) => {
      const next = prev.includes(featureId)
        ? prev.filter((id) => id !== featureId)
        : [...prev, featureId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isFavorited = useCallback(
    (featureId: string) => customFavorites.includes(featureId),
    [customFavorites],
  );

  const isDefault = useCallback(
    (featureId: string) => DEFAULT_FAVORITES.includes(featureId),
    [],
  );

  return {
    loaded,
    getDefaultFavoriteItems,
    getCustomFavoriteItems,
    toggleFavorite,
    isFavorited,
    isDefault,
    customFavorites,
  };
}
