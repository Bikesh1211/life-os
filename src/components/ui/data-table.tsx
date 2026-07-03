"use client";

import { Table as MantineTable, Text, Group, Paper } from "@mantine/core";
import { motion, AnimatePresence } from "framer-motion";
import type { ReactNode } from "react";
import { EmptyState } from "./empty-state";
import { IconDatabase } from "@tabler/icons-react";

export interface Column<T> {
  key: string;
  label: string;
  render: (item: T) => ReactNode;
  width?: string | number;
  sortable?: boolean;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  loading?: boolean;
  onRowClick?: (item: T) => void;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyTitle = "No data",
  emptyDescription,
  emptyAction,
  loading,
  onRowClick,
}: DataTableProps<T>) {
  if (!loading && data.length === 0) {
    return (
      <Paper withBorder radius="lg" className="overflow-hidden">
        <EmptyState
          icon={IconDatabase}
          title={emptyTitle}
          description={emptyDescription}
          action={emptyAction}
        />
      </Paper>
    );
  }

  return (
    <Paper withBorder radius="lg" className="overflow-hidden">
      <div className="overflow-x-auto">
        <MantineTable>
          <MantineTable.Thead>
            <MantineTable.Tr>
              {columns.map((col) => (
                <MantineTable.Th
                  key={col.key}
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.label}
                </MantineTable.Th>
              ))}
            </MantineTable.Tr>
          </MantineTable.Thead>
          <MantineTable.Tbody>
            <AnimatePresence mode="popLayout">
              {data.map((item, index) => (
                <motion.tr
                  key={keyExtractor(item)}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{
                    duration: 0.15,
                    delay: index * 0.02,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                  onClick={onRowClick ? () => onRowClick(item) : undefined}
                  className={onRowClick ? "cursor-pointer" : undefined}
                >
                  {columns.map((col) => (
                    <MantineTable.Td key={col.key}>
                      {col.render(item)}
                    </MantineTable.Td>
                  ))}
                </motion.tr>
              ))}
            </AnimatePresence>
          </MantineTable.Tbody>
        </MantineTable>
      </div>
    </Paper>
  );
}
