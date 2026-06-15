"use client";

import { useState } from "react";
import { Select, Group, Button } from "@mantine/core";
import { IconFilter } from "@tabler/icons-react";

type FiltersState = {
  period: string | null;
  category: string | null;
};

type AnalyticsFiltersProps = {
  onApply: (filters: { period?: string; category?: string }) => void;
};

const periods = [
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "quarter", label: "This Quarter" },
  { value: "year", label: "This Year" },
];

const categories = [
  { value: "health", label: "Health" },
  { value: "fitness", label: "Fitness" },
  { value: "reading", label: "Reading" },
  { value: "learning", label: "Learning" },
  { value: "productivity", label: "Productivity" },
  { value: "mindfulness", label: "Mindfulness" },
  { value: "finance", label: "Finance" },
  { value: "social", label: "Social" },
  { value: "creative", label: "Creative" },
];

export function AnalyticsFilters({ onApply }: AnalyticsFiltersProps) {
  const [filters, setFilters] = useState<FiltersState>({ period: "month", category: null });

  return (
    <Group gap="sm" mb="lg" wrap="wrap">
      <IconFilter size={18} className="text-[var(--mantine-color-dimmed)]" />
      <Select
        value={filters.period}
        onChange={(value) => setFilters((prev) => ({ ...prev, period: value }))}
        data={periods}
        placeholder="Period"
        size="sm"
        w={140}
        clearable
      />
      <Select
        value={filters.category}
        onChange={(value) => setFilters((prev) => ({ ...prev, category: value }))}
        data={categories}
        placeholder="Category"
        size="sm"
        w={140}
        clearable
      />
      <Button
        size="sm"
        variant="light"
        onClick={() => {
          const params: { period?: string; category?: string } = {};
          if (filters.period) params.period = filters.period;
          if (filters.category) params.category = filters.category;
          onApply(params);
        }}
      >
        Apply
      </Button>
    </Group>
  );
}
