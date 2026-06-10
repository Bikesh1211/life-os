"use client";

import { useState, useEffect, useCallback } from "react";
import { findNavItemByFeatureId, type NavItem } from "@/core/navigation";

const STORAGE_KEY = "life-os:sidebar-favorites";
const DEFAULT_FAVORITES = ["dashboard", "quick_note", "timeline", "calendar"];

export function useSidebarFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setFavorites(JSON.parse(raw));
      } else {
        setFavorites(DEFAULT_FAVORITES);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_FAVORITES));
      }
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
          setFavorites((prev) => {
            if (JSON.stringify(prev) === JSON.stringify(data.favorites)) return prev;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data.favorites));
            return data.favorites;
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
        body: JSON.stringify({ favorites }),
      }).catch(() => {});
    }, 300);
    return () => clearTimeout(timer);
  }, [favorites, loaded]);

  const toggleFavorite = useCallback((featureId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(featureId)
        ? prev.filter((id) => id !== featureId)
        : [...prev, featureId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isFavorited = useCallback(
    (featureId: string) => favorites.includes(featureId),
    [favorites],
  );

  const getFavoriteItems = useCallback((): NavItem[] => {
    return favorites
      .map((id) => findNavItemByFeatureId(id))
      .filter((item): item is NavItem => item !== undefined);
  }, [favorites]);

  return { favorites, loaded, toggleFavorite, isFavorited, getFavoriteItems };
}
