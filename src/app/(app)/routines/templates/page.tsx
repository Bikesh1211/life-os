"use client";

import { motion } from "framer-motion";
import { Text, ActionIcon, Group } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";
import { RoutineTemplateGallery } from "@/modules/routines/components/RoutineTemplateGallery";

export default function RoutineTemplatesPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <Group mb="md">
          <ActionIcon variant="subtle" component={Link} href="/routines">
            <IconArrowLeft size={18} />
          </ActionIcon>
          <Text fw={600}>Templates</Text>
        </Group>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--mantine-color-text)] sm:text-4xl">
            Routine Templates
          </h1>
          <p className="mt-1 text-[var(--mantine-color-dimmed)]">
            Choose a template to get started quickly
          </p>
        </div>

        <RoutineTemplateGallery />
      </motion.div>
    </div>
  );
}
