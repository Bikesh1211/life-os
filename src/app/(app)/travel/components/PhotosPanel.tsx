"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { IconPhoto, IconTrash } from "@tabler/icons-react";
import { Card, Text, Group, Button, ActionIcon, Tooltip, Modal, TextInput, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import dayjs from "dayjs";

type Photo = {
  id: string;
  url: string;
  thumbnail: string | null;
  caption: string | null;
  location: string | null;
  dateTaken: string | null;
  album: string | null;
  tags: string[];
  isFavorited: boolean;
};

export function PhotosPanel() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [opened, { open, close }] = useDisclosure(false);

  useEffect(() => {
    fetch("/api/travel/photos")
      .then((r) => (r.ok ? r.json() : []))
      .then(setPhotos)
      .finally(() => setLoading(false));
  }, []);

  async function deletePhoto(id: string) {
    await fetch(`/api/travel/photos/${id}`, { method: "DELETE" });
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  }

  if (loading) {
    return (
      <>
        <div className="mb-6 h-8 w-32 animate-pulse rounded bg-[var(--mantine-color-dark-6,#1a1b1e)]" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-square animate-pulse rounded-xl bg-[var(--mantine-color-dark-6,#1a1b1e)]" />
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <Group justify="space-between" mb="lg">
        <div>
          <h2 className="text-2xl font-bold text-[var(--mantine-color-text,#c1c2c5)]">Photos</h2>
          <Text size="sm" c="dimmed">{photos.length} memories</Text>
        </div>
        <Button leftSection={<IconPhoto size={18} />} onClick={open}>Add Photo</Button>
      </Group>

      <Modal opened={opened} onClose={close} title="Add Photo" size="md">
        <form onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const data = Object.fromEntries(new FormData(form));
          await fetch("/api/travel/photos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: data.url, caption: data.caption || undefined }),
          });
          close();
          window.location.reload();
        }}>
          <Stack gap="sm">
            <TextInput name="url" label="Image URL" required placeholder="https://..." />
            <TextInput name="caption" label="Caption" />
            <Button type="submit" fullWidth mt="sm">Save</Button>
          </Stack>
        </form>
      </Modal>

      {photos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--mantine-color-dark-6,#1a1b1e)]">
            <IconPhoto size={28} className="text-[var(--mantine-color-dimmed,#5c5f66)]" />
          </div>
          <h3 className="text-lg font-semibold">No Photos Yet</h3>
          <p className="mt-1 text-sm text-[var(--mantine-color-dimmed,#5c5f66)]">Add your travel photos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo, i) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              className="group relative"
            >
              <div
                className="aspect-square rounded-xl bg-cover bg-center"
                style={{ backgroundImage: `url(${photo.thumbnail || photo.url})` }}
              >
                <div className="absolute inset-0 rounded-xl bg-black/0 transition-colors group-hover:bg-black/30" />
                <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <Tooltip label="Delete">
                    <ActionIcon color="red" variant="filled" size="sm" onClick={() => deletePhoto(photo.id)}>
                      <IconTrash size={14} />
                    </ActionIcon>
                  </Tooltip>
                </div>
              </div>
              {photo.caption && (
                <Text size="xs" c="dimmed" mt={4} lineClamp={1}>{photo.caption}</Text>
              )}
              {photo.dateTaken && (
                <Text size="xs" c="dimmed">{dayjs(photo.dateTaken).format("MMM D, YYYY")}</Text>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </>
  );
}
