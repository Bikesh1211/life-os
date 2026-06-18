"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SimpleGrid, Text, Group, Button } from "@mantine/core";
import { IconPhotoHeart, IconPlus } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { SectionHeading } from "@/modules/movies/components/design-system/SectionHeading";
import { MemoryCard } from "./MemoryCard";
import { MemoryCreateModal } from "./MemoryCreateModal";

export function MemoriesContent() {
  const [opened, { open, close }] = useDisclosure(false);

  const { data: memories, refetch } = useQuery({
    queryKey: ["movie-memories"],
    queryFn: async () => {
      const res = await fetch("/api/movies/memories");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  return (
    <div>
      <SectionHeading
        title="Memories"
        icon={<IconPhotoHeart size={18} />}
        action={
          <Button leftSection={<IconPlus size={16} />} size="sm" onClick={open}>
            New Memory
          </Button>
        }
      />

      {memories?.length > 0 ? (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
          {memories.map((m: any) => (
            <MemoryCard key={m.id} memory={m} />
          ))}
        </SimpleGrid>
      ) : (
        <div className="flex flex-col items-center py-20 text-center">
          <div className="mb-4 text-5xl">🎥</div>
          <Text size="sm" c="dimmed">No memories yet. Create your first movie memory!</Text>
        </div>
      )}

      <MemoryCreateModal opened={opened} onClose={close} onSuccess={() => refetch()} />
    </div>
  );
}
