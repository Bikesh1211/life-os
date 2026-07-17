"use client";

import { useState, useEffect } from "react";
import {
  Stack,
  Title,
  Button,
  Paper,
  Group,
  Text,
  Modal,
  TextInput,
  List,
  ActionIcon,
  Tooltip,
  LoadingOverlay,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconVersions, IconDeviceFloppy, IconRestore, IconHistory } from "@tabler/icons-react";

type Version = {
  id: string;
  versionNumber: number;
  summary: string | null;
  wordCount: number;
  createdAt: string;
};

export function VersionsPanel() {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [opened, { open, close }] = useDisclosure(false);
  const [summary, setSummary] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchVersions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/strategy/versions");
      if (res.ok) setVersions(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVersions();
  }, []);

  const handleSaveVersion = async () => {
    setSaving(true);
    try {
      await fetch("/api/strategy/versions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary }),
      });
      setSummary("");
      close();
      fetchVersions();
    } finally {
      setSaving(false);
    }
  };

  const handleRestore = async (versionId: string) => {
    if (!window.confirm("This will replace all current Operating Manual content with this version. Current content will be lost.")) return;
    try {
      await fetch(`/api/strategy/versions/${versionId}/restore`, { method: "POST" });
      fetchVersions();
    } catch {}
  };

  return (
    <Stack gap="md" pos="relative">
      <Group justify="space-between">
        <Title order={3}>Version History</Title>
        <Button leftSection={<IconDeviceFloppy size={16} />} onClick={open} size="sm">
          Save Version
        </Button>
      </Group>

      <LoadingOverlay visible={loading} />

      {!loading && versions.length === 0 && (
        <Paper p="xl" withBorder style={{ textAlign: "center" }}>
          <IconHistory size={48} stroke={1.5} style={{ opacity: 0.3, marginBottom: 12 }} />
          <Text c="dimmed">No versions saved yet. Click "Save Version" to create the first snapshot.</Text>
        </Paper>
      )}

      <Stack gap="sm">
        {versions.map((v) => (
          <Paper key={v.id} p="md" radius="md" withBorder>
            <Group justify="space-between">
              <div>
                <Text fw={600}>Version {v.versionNumber}</Text>
                <Text size="sm" c="dimmed">
                  {new Date(v.createdAt).toLocaleDateString()} · {v.wordCount} words
                </Text>
                {v.summary && <Text size="sm" mt={4}>{v.summary}</Text>}
              </div>
              <Tooltip label="Restore this version">
                <ActionIcon variant="light" color="blue" onClick={() => handleRestore(v.id)}>
                  <IconRestore size={18} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Paper>
        ))}
      </Stack>

      <Modal opened={opened} onClose={close} title="Save Version" centered>
        <Stack gap="sm">
          <TextInput
            label="Summary of changes"
            placeholder="What changed in this version?"
            value={summary}
            onChange={(e) => setSummary(e.currentTarget.value)}
          />
          <Button onClick={handleSaveVersion} loading={saving} fullWidth>
            Save Snapshot
          </Button>
        </Stack>
      </Modal>
    </Stack>
  );
}
