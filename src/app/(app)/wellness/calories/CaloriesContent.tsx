"use client";

import { useState, useCallback } from "react";
import {
  Stack, Group, Text, Paper, SimpleGrid, NumberInput, Button, Anchor, Table, Badge, ActionIcon
} from "@mantine/core";
import { IconFlame, IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";
import { apiFetch } from "@/core/api/http";
import type { WellnessCalorieEntry } from "@/modules/wellness";

const mealColors: Record<string, string> = {
  breakfast: "yellow",
  lunch: "orange",
  dinner: "red",
  snacks: "grape",
};

export function CaloriesContent({ entries }: { entries: WellnessCalorieEntry[] }) {
  const [mealType, setMealType] = useState("lunch");
  const [calories, setCalories] = useState<number | "">(0);
  const [proteinG, setProteinG] = useState<number | "">("");
  const [carbsG, setCarbsG] = useState<number | "">("");
  const [fatG, setFatG] = useState<number | "">("");
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async () => {
    if (!calories) return;
    setSaving(true);
    try {
      await apiFetch("/api/wellness/calories", {
        method: "POST",
        body: JSON.stringify({
          mealType, calories: Number(calories),
          proteinG: proteinG ? Number(proteinG) : undefined,
          carbsG: carbsG ? Number(carbsG) : undefined,
          fatG: fatG ? Number(fatG) : undefined,
          date: new Date().toISOString().slice(0, 10),
        }),
      });
      window.location.reload();
    } catch { } finally {
      setSaving(false);
    }
  }, [mealType, calories, proteinG, carbsG, fatG]);

  const sorted = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const totalCal = entries.reduce((s, e) => s + e.calories, 0);
  const totalProtein = entries.reduce((s, e) => s + Number(e.proteinG ?? 0), 0);
  const totalCarbs = entries.reduce((s, e) => s + Number(e.carbsG ?? 0), 0);
  const totalFat = entries.reduce((s, e) => s + Number(e.fatG ?? 0), 0);

  return (
    <Stack gap="md" p="lg">
      <Group>
        <Anchor component={Link} href="/wellness">
          <ActionIcon variant="subtle"><IconArrowLeft size={18} /></ActionIcon>
        </Anchor>
        <IconFlame size={24} />
        <Text size="xl" fw={700}>Calorie Tracking</Text>
      </Group>

      <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md">
        <Paper withBorder p="md" className="text-center">
          <Text size="2rem" fw={700}>{totalCal}</Text>
          <Text size="xs" c="dimmed">Total Cal</Text>
        </Paper>
        <Paper withBorder p="md" className="text-center">
          <Text size="2rem" fw={700}>{Math.round(totalProtein)}</Text>
          <Text size="xs" c="dimmed">Protein (g)</Text>
        </Paper>
        <Paper withBorder p="md" className="text-center">
          <Text size="2rem" fw={700}>{Math.round(totalCarbs)}</Text>
          <Text size="xs" c="dimmed">Carbs (g)</Text>
        </Paper>
        <Paper withBorder p="md" className="text-center">
          <Text size="2rem" fw={700}>{Math.round(totalFat)}</Text>
          <Text size="xs" c="dimmed">Fat (g)</Text>
        </Paper>
      </SimpleGrid>

      <Paper withBorder p="md">
        <Group gap="xs" mb="sm">
          {["breakfast", "lunch", "dinner", "snacks"].map((type) => (
            <Button key={type} variant={mealType === type ? "filled" : "light"} size="sm" onClick={() => setMealType(type)}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Button>
          ))}
        </Group>
        <Group align="end" gap="sm">
          <NumberInput label="Calories" value={calories} onChange={(v) => setCalories(v as number)} min={0} w={120} />
          <NumberInput label="Protein (g)" value={proteinG} onChange={(v) => setProteinG(v as number)} min={0} w={100} />
          <NumberInput label="Carbs (g)" value={carbsG} onChange={(v) => setCarbsG(v as number)} min={0} w={100} />
          <NumberInput label="Fat (g)" value={fatG} onChange={(v) => setFatG(v as number)} min={0} w={100} />
          <Button onClick={handleSave} loading={saving}>Log Meal</Button>
        </Group>
      </Paper>

      <Paper withBorder p="md">
        <Text size="sm" fw={600} mb="sm">History</Text>
        {sorted.length === 0 ? (
          <Text size="sm" c="dimmed">No calorie entries yet.</Text>
        ) : (
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Date</Table.Th>
                <Table.Th>Meal</Table.Th>
                <Table.Th>Cal</Table.Th>
                <Table.Th>Protein</Table.Th>
                <Table.Th>Carbs</Table.Th>
                <Table.Th>Fat</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {sorted.slice(0, 50).map((e) => (
                <Table.Tr key={e.id}>
                  <Table.Td>{new Date(e.date).toLocaleDateString()}</Table.Td>
                  <Table.Td><Badge color={mealColors[e.mealType]}>{e.mealType}</Badge></Table.Td>
                  <Table.Td><Text fw={500}>{e.calories}</Text></Table.Td>
                  <Table.Td>{e.proteinG ?? "—"}</Table.Td>
                  <Table.Td>{e.carbsG ?? "—"}</Table.Td>
                  <Table.Td>{e.fatG ?? "—"}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Paper>
    </Stack>
  );
}
