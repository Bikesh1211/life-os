"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { IconRepeat, IconPlus } from "@tabler/icons-react";
import { Button, Stack, Modal, Text, SimpleGrid } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useRoutines, useDeleteRoutine, useDuplicateRoutine, useToggleRoutineActive } from "@/hooks/use-routines";
import { RoutineCard } from "@/modules/routines/components/RoutineCard";
import { RoutineBuilder } from "@/modules/routines/components/RoutineBuilder";

export default function RoutinesPage() {
  const { data: routines, isLoading } = useRoutines();
  const deleteRoutine = useDeleteRoutine();
  const duplicateRoutine = useDuplicateRoutine();
  const toggleActive = useToggleRoutineActive();
  const [showBuilder, setShowBuilder] = useState(false);

  async function handleDelete(id: string) {
    if (!confirm("Delete this routine?")) return;
    try {
      await deleteRoutine.mutateAsync(id);
      notifications.show({ title: "Deleted", message: "Routine deleted", color: "red" });
    } catch {
      notifications.show({ title: "Error", message: "Failed to delete", color: "red" });
    }
  }

  async function handleDuplicate(id: string) {
    try {
      await duplicateRoutine.mutateAsync(id);
      notifications.show({ title: "Duplicated", message: "Routine duplicated", color: "green" });
    } catch {
      notifications.show({ title: "Error", message: "Failed to duplicate", color: "red" });
    }
  }

  async function handleToggleActive(id: string, isActive: boolean) {
    await toggleActive.mutateAsync({ id, isActive });
  }

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8 h-8 w-48 animate-pulse rounded bg-[var(--mantine-color-dark-6)]" />
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-[var(--mantine-color-dark-6)]" />
          ))}
        </SimpleGrid>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--mantine-color-text)] sm:text-4xl">
              Routines
            </h1>
            <p className="mt-1 text-[var(--mantine-color-dimmed)]">
              Plan and track your daily schedules
            </p>
          </div>
          <Button
            leftSection={<IconPlus size={20} />}
            onClick={() => setShowBuilder(true)}
          >
            Create Routine
          </Button>
        </div>
      </motion.div>

      {!routines || routines.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--mantine-color-dark-6)]">
            <IconRepeat size={32} className="text-[var(--mantine-color-dimmed)]" />
          </div>
          <h3 className="text-xl font-semibold text-[var(--mantine-color-text)]">
            No Routines Yet
          </h3>
          <p className="mt-2 max-w-sm text-sm text-[var(--mantine-color-dimmed)]">
            Create your first routine to start structuring your day with timed activities and schedules.
          </p>
          <Button
            mt="lg"
            leftSection={<IconPlus size={16} />}
            onClick={() => setShowBuilder(true)}
          >
            Create Your First Routine
          </Button>
        </div>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
          {routines.map((routine) => (
            <RoutineCard
              key={routine.id}
              routine={routine}
              onToggleActive={handleToggleActive}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
            />
          ))}
        </SimpleGrid>
      )}

      <Modal
        opened={showBuilder}
        onClose={() => setShowBuilder(false)}
        title="Create Routine"
        size="lg"
      >
        <RoutineBuilder onSuccess={() => setShowBuilder(false)} onCancel={() => setShowBuilder(false)} />
      </Modal>
    </div>
  );
}
