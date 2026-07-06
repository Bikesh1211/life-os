import type { TablerIcon } from "@tabler/icons-react";
import {
  IconBallFootball, IconMovie, IconMusic, IconPlane, IconSun,
  IconCake, IconHeart, IconChristmasTree, IconSchool,
  IconUsersGroup, IconRocket, IconPlaneDeparture,
  IconStar, IconSettings,
} from "@tabler/icons-react";

type CategoryConfig = {
  label: string;
  icon: TablerIcon;
  color: string;
};

export const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  football: { label: "Football", icon: IconBallFootball, color: "#22c55e" },
  movies: { label: "Movies", icon: IconMovie, color: "#ef4444" },
  concerts: { label: "Concerts", icon: IconMusic, color: "#a855f7" },
  travel: { label: "Travel", icon: IconPlane, color: "#3b82f6" },
  retreats: { label: "Retreats", icon: IconSun, color: "#f59e0b" },
  birthdays: { label: "Birthdays", icon: IconCake, color: "#ec4899" },
  weddings: { label: "Weddings", icon: IconHeart, color: "#f43f5e" },
  festivals: { label: "Festivals", icon: IconChristmasTree, color: "#10b981" },
  exams: { label: "Exams", icon: IconSchool, color: "#6366f1" },
  meetings: { label: "Meetings", icon: IconUsersGroup, color: "#8b5cf6" },
  "product-launches": { label: "Product Launches", icon: IconRocket, color: "#06b6d4" },
  holidays: { label: "Holidays", icon: IconPlaneDeparture, color: "#14b8a6" },
  personal: { label: "Personal", icon: IconStar, color: "#f97316" },
  custom: { label: "Custom", icon: IconSettings, color: "#6b7280" },
};

export function getCategoryColor(category: string): string {
  return CATEGORY_CONFIG[category]?.color ?? "#6b7280";
}
