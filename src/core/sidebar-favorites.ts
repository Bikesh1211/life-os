"use client";

import { useState, useEffect, useCallback } from "react";
import { findNavItemByFeatureId, type NavItem } from "@/core/navigation";

const DEFAULT_FAVORITES = [
  "dashboard",
  "quick_note",
  "expenses",
  "timeline",
  "journal",
  "habits",
];

export function useSidebarFavorites() {
  const getFavoriteItems = useCallback((): NavItem[] => {
    return DEFAULT_FAVORITES
      .map((id) => findNavItemByFeatureId(id))
      .filter((item): item is NavItem => item !== undefined);
  }, []);

  return {
    favorites: DEFAULT_FAVORITES,
    loaded: true,
    toggleFavorite: () => {},
    isFavorited: () => false,
    getFavoriteItems,
  };
}
