"use client";

import { TextInput, Select, Group, MultiSelect } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { useLabels } from "../hooks";

export type FilterValues = {
  search: string;
  status: string;
  priority: string;
  labelIds: string[];
};

type TaskFiltersProps = {
  filters: FilterValues;
  onChange: (filters: FilterValues) => void;
};

export function TaskFilters({ filters, onChange }: TaskFiltersProps) {
  const { data: labels } = useLabels();

  const update = (partial: Partial<FilterValues>) => {
    onChange({ ...filters, ...partial });
  };

  const labelOptions = (labels ?? []).map((l: any) => ({
    value: l.id,
    label: l.name,
  }));

  return (
    <Group gap="sm" wrap="wrap">
      <TextInput
        placeholder="Search tasks..."
        leftSection={<IconSearch size={16} />}
        value={filters.search}
        onChange={(e) => update({ search: e.currentTarget.value })}
        style={{ flex: 1, minWidth: 200 }}
        radius="md"
        size="sm"
      />
      <Select
        placeholder="Status"
        data={[
          { value: "", label: "All" },
          { value: "active", label: "Active" },
          { value: "todo", label: "To Do" },
          { value: "in_progress", label: "In Progress" },
          { value: "done", label: "Done" },
          { value: "cancelled", label: "Cancelled" },
        ]}
        value={filters.status}
        onChange={(v) => update({ status: v ?? "" })}
        clearable
        radius="md"
        size="sm"
        w={140}
      />
      <Select
        placeholder="Priority"
        data={[
          { value: "", label: "All" },
          { value: "p1", label: "P1 - Critical" },
          { value: "p2", label: "P2 - High" },
          { value: "p3", label: "P3 - Medium" },
          { value: "p4", label: "P4 - Low" },
          { value: "p5", label: "P5 - Trivial" },
        ]}
        value={filters.priority}
        onChange={(v) => update({ priority: v ?? "" })}
        clearable
        radius="md"
        size="sm"
        w={140}
      />
      <MultiSelect
        placeholder="Labels"
        data={labelOptions}
        value={filters.labelIds}
        onChange={(v) => update({ labelIds: v })}
        clearable
        searchable
        radius="md"
        size="sm"
        w={180}
      />
    </Group>
  );
}