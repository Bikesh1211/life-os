-- Migration: Sidebar preferences for cross-device sync
-- Stores user sidebar favorites and visibility settings server-side

CREATE TABLE IF NOT EXISTS "sidebar_preferences" (
  "user_id" text PRIMARY KEY NOT NULL,
  "favorites" text NOT NULL DEFAULT '[]',
  "visibility" text NOT NULL DEFAULT '{"hiddenGroups":[],"hiddenItems":[]}',
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
