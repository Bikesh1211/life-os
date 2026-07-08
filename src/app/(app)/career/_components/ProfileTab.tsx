"use client";

import { useEffect, useState } from "react";
import {
  Paper,
  TextInput,
  NumberInput,
  Textarea,
  Button,
  Stack,
  Group,
  Skeleton,
  Title,
  Notification,
} from "@mantine/core";

export default function ProfileTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    currentPosition: "",
    company: "",
    yearsOfExperience: null as number | null,
    careerLevel: "",
    targetRole: "",
    dreamCompany: "",
    bio: "",
  });

  useEffect(() => {
    fetch("/api/career/profile")
      .then(async (r) => {
        if (!r.ok) throw new Error("Failed to load");
        const d = await r.json();
        if (d && d.id) {
          setForm({
            currentPosition: d.currentPosition ?? "",
            company: d.company ?? "",
            yearsOfExperience: d.yearsOfExperience ?? null,
            careerLevel: d.careerLevel ?? "",
            targetRole: d.targetRole ?? "",
            dreamCompany: d.dreamCompany ?? "",
            bio: d.bio ?? "",
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/career/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to save");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Stack gap="md">
        <Skeleton height={40} />
        <Skeleton height={40} />
        <Skeleton height={40} />
        <Skeleton height={120} />
      </Stack>
    );
  }

  return (
    <Paper withBorder p="lg" radius="md" maw={640}>
      <Title order={3} mb="md">
        Career Profile
      </Title>

      <Stack gap="md">
        <Group grow>
          <TextInput
            label="Current Position"
            placeholder="e.g. Senior Software Engineer"
            value={form.currentPosition}
            onChange={(e) => setForm({ ...form, currentPosition: e.target.value })}
          />
          <TextInput
            label="Company"
            placeholder="e.g. Acme Corp"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
          />
        </Group>

        <Group grow>
          <NumberInput
            label="Years of Experience"
            placeholder="e.g. 5"
            min={0}
            max={100}
            value={form.yearsOfExperience ?? undefined}
            onChange={(v) => setForm({ ...form, yearsOfExperience: typeof v === "number" ? v : null })}
          />
          <TextInput
            label="Career Level"
            placeholder="e.g. Senior, Staff, Lead"
            value={form.careerLevel}
            onChange={(e) => setForm({ ...form, careerLevel: e.target.value })}
          />
        </Group>

        <Group grow>
          <TextInput
            label="Target Role"
            placeholder="e.g. Engineering Manager"
            value={form.targetRole}
            onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
          />
          <TextInput
            label="Dream Company"
            placeholder="e.g. Google"
            value={form.dreamCompany}
            onChange={(e) => setForm({ ...form, dreamCompany: e.target.value })}
          />
        </Group>

        <Textarea
          label="Bio"
          placeholder="A short professional summary..."
          minRows={3}
          maxRows={6}
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
        />

        {error && (
          <Notification color="red" onClose={() => setError(null)}>
            {error}
          </Notification>
        )}

        <Group justify="flex-end">
          <Button onClick={handleSave} loading={saving}>
            Save Profile
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
}
