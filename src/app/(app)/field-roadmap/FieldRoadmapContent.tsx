"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Stack,
  Title,
  Text,
  SimpleGrid,
  Card,
  Group,
  Badge,
  Progress,
  Button,
  Modal,
  ThemeIcon,
  Checkbox,
  ActionIcon,
  Alert,
  Loader,
  Center,
  Tooltip,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useDisclosure } from "@mantine/hooks";
import {
  IconCode,
  IconStethoscope,
  IconSchool,
  IconCompass,
  IconArrowRight,
  IconBulb,
  IconPlus,
} from "@tabler/icons-react";

const FIELD_ICONS: Record<string, typeof IconCode> = {
  "software-engineer": IconCode,
  doctor: IconStethoscope,
  teacher: IconSchool,
};

type Blueprint = {
  slug: string;
  name: string;
  description: string;
  icon: string;
  color: string;
};

type DashboardData = {
  roadmap: {
    id: string;
    name: string;
    description: string | null;
    color: string | null;
    progress: {
      readiness: number;
      avgProficiency: number;
      milestoneProgress: number;
      completedCount: number;
      totalCount: number;
    };
    currentPhaseId: string | null;
    phases: Array<{
      id: string;
      name: string;
      description: string | null;
      milestones: Array<{
        id: string;
        title: string;
        description: string | null;
        isCompleted: boolean;
      }>;
    }>;
    skills: Array<{
      skill: { id: string; name: string; description: string | null };
      proficiency: number;
      evidenceCount: number;
    }>;
  } | null;
  blueprints: Blueprint[];
  raiser: { skillId: string; skillName: string; proficiency: number } | null;
};

type Suggestion = {
  entityType: string;
  entityId: string;
  label: string;
  match: string;
  strength: number;
};

export function FieldRoadmapContent() {
  const queryClient = useQueryClient();
  const [opened, { open, close }] = useDisclosure(false);
  const [suggestFor, setSuggestFor] = useState<{ skillId: string; skillName: string; roadmapId: string } | null>(null);
  const [openedSuggest, { open: openSuggest, close: closeSuggest }] = useDisclosure(false);

  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ["field-roadmap", "dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/field-roadmap");
      if (!res.ok) throw new Error("Failed to load");
      return res.json();
    },
  });

  const pickMutation = useMutation({
    mutationFn: async (slug: string) => {
      const res = await fetch("/api/field-roadmap/pick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      if (!res.ok) throw new Error("Failed to pick field");
      return res.json();
    },
    onSuccess: () => {
      notifications.show({ title: "Roadmap started", message: "Your field roadmap is ready", color: "green" });
      close();
      queryClient.invalidateQueries({ queryKey: ["field-roadmap", "dashboard"] });
    },
    onError: () => notifications.show({ title: "Failed", message: "Could not start roadmap", color: "red" }),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const res = await fetch("/api/field-roadmap/milestones", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ milestoneId: id, completed }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["field-roadmap", "dashboard"] }),
  });

  const openSuggestions = (skillId: string, skillName: string) => {
    setSuggestFor({ skillId, skillName, roadmapId: data?.roadmap?.id ?? "" });
    openSuggest();
  };

  if (isLoading) {
    return (
      <Center h="60vh">
        <Loader />
      </Center>
    );
  }

  if (!data?.roadmap) {
    return (
      <Stack p="xl">
        <Title order={2}>Choose your field</Title>
        <Text c="dimmed" mb="md">
          Pick a path and we&apos;ll build your roadmap to becoming top-level in your field.
        </Text>
        <SimpleGrid cols={{ base: 1, sm: 3 }}>
          {data?.blueprints.map((bp) => {
            const Icon = FIELD_ICONS[bp.slug] ?? IconCompass;
            return (
              <Card key={bp.slug} withBorder shadow="sm" radius="md" padding="lg">
                <Group mb="sm">
                  <ThemeIcon size="lg" radius="md" color={bp.color || "blue"}>
                    <Icon size={22} />
                  </ThemeIcon>
                  <Text fw={600} size="lg">{bp.name}</Text>
                </Group>
                <Text size="sm" c="dimmed" mb="md">
                  {bp.description}
                </Text>
                <Button
                  variant="light"
                  color={bp.color || "blue"}
                  fullWidth
                  loading={pickMutation.isPending && pickMutation.variables === bp.slug}
                  onClick={() => pickMutation.mutate(bp.slug)}
                  rightSection={<IconArrowRight size={16} />}
                >
                  Start this path
                </Button>
              </Card>
            );
          })}
        </SimpleGrid>
      </Stack>
    );
  }

  const rm = data.roadmap;

  return (
    <Stack p="xl">
      <Group justify="space-between" align="flex-start">
        <div>
          <Group mb={4}>
            <Title order={2}>{rm.name}</Title>
            <Badge variant="light" color={rm.color || "blue"}>Active</Badge>
          </Group>
          <Text c="dimmed" size="sm">{rm.description}</Text>
        </div>
        <Button variant="light" leftSection={<IconCompass size={18} />} onClick={open}>
          Switch field
        </Button>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 3 }}>
        <Card withBorder radius="md" padding="lg">
          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Target-Role Readiness</Text>
          <Text fz={36} fw={700} mt={4}>{rm.progress.readiness}<Text span size="sm" c="dimmed"> / 100</Text></Text>
          <Progress value={rm.progress.readiness} color={rm.color || "blue"} mt="sm" radius="xl" />
        </Card>
        <Card withBorder radius="md" padding="lg">
          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Avg Skill Proficiency</Text>
          <Text fz={36} fw={700} mt={4}>{rm.progress.avgProficiency.toFixed(1)}<Text span size="sm" c="dimmed"> / 10</Text></Text>
          <Text size="xs" c="dimmed" mt={6}>Computed from confirmed evidence</Text>
        </Card>
        <Card withBorder radius="md" padding="lg">
          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Milestones</Text>
          <Text fz={36} fw={700} mt={4}>{rm.progress.completedCount}<Text span size="sm" c="dimmed"> / {rm.progress.totalCount}</Text></Text>
          <Progress value={rm.progress.milestoneProgress} color={rm.color || "blue"} mt="sm" radius="xl" />
        </Card>
      </SimpleGrid>

      {data.raiser && (
        <Alert variant="light" color="teal" icon={<IconBulb size={18} />} radius="md">
          <Text fw={600}>Next: boost &quot;{data.raiser.skillName}&quot;</Text>
          <Text size="sm" c="dimmed">
            It&apos;s the most evidence-starved skill. Find artifacts to link and raise your readiness.
          </Text>
        </Alert>
      )}

      <div>
        <Title order={3} mb="sm">Roadmap</Title>
        <Stack>
          {rm.phases.map((phase) => {
            const done = phase.milestones.filter((m) => m.isCompleted).length;
            const active = phase.id === rm.currentPhaseId;
            return (
              <Card key={phase.id} withBorder radius="md" padding="lg" style={{ borderColor: active ? undefined : undefined, boxShadow: active ? "0 0 0 1px var(--mantine-color-blue-5)" : undefined }}>
                <Group justify="space-between" mb="xs">
                  <Group>
                    <Text fw={600} size="lg">{phase.name}</Text>
                    {active && <Badge color="blue" variant="light">Current</Badge>}
                  </Group>
                  <Text size="xs" c="dimmed">{done}/{phase.milestones.length} done</Text>
                </Group>
                {phase.description && <Text size="sm" c="dimmed" mb="md">{phase.description}</Text>}
                <Stack gap="xs">
                  {phase.milestones.map((m) => (
                    <Group key={m.id} gap="sm">
                      <Checkbox
                        checked={m.isCompleted}
                        onChange={() => toggleMutation.mutate({ id: m.id, completed: !m.isCompleted })}
                        label={m.title}
                      />
                      {m.description && (
                        <Text size="xs" c="dimmed" style={{ flex: 1 }}>{m.description}</Text>
                      )}
                    </Group>
                  ))}
                </Stack>
              </Card>
            );
          })}
        </Stack>
      </div>

      <div>
        <Title order={3} mb="sm">Skills & Evidence</Title>
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          {rm.skills.map(({ skill, proficiency, evidenceCount }) => (
            <Card key={skill.id} withBorder radius="md" padding="lg">
              <Group justify="space-between" mb="xs">
                <Text fw={600}>{skill.name}</Text>
                <Group gap="xs">
                  <Badge color={proficiency >= 7 ? "green" : proficiency >= 4 ? "yellow" : "gray"} variant="light">
                    {proficiency}/10
                  </Badge>
                  <Tooltip label="Find evidence to link">
                    <ActionIcon variant="subtle" color="blue" onClick={() => openSuggestions(skill.id, skill.name)}>
                      <IconPlus size={16} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Group>
              <Progress value={proficiency * 10} color={proficiency >= 7 ? "green" : proficiency >= 4 ? "yellow" : "gray"} size="sm" radius="xl" />
              <Text size="xs" c="dimmed" mt={6}>{evidenceCount} evidence item{evidenceCount === 1 ? "" : "s"} linked</Text>
              {skill.description && <Text size="xs" c="dimmed" mt={2}>{skill.description}</Text>}
            </Card>
          ))}
        </SimpleGrid>
      </div>

      <Modal opened={opened} onClose={close} title="Switch field">
        <Stack>
          <Text size="sm" c="dimmed">Starting a new field archives the current roadmap.</Text>
          {data.blueprints.map((bp) => (
            <Button
                key={bp.slug}
                variant="light"
                color={bp.color || "blue"}
                fullWidth
                justify="space-between"
                loading={pickMutation.isPending && pickMutation.variables === bp.slug}
                onClick={() => pickMutation.mutate(bp.slug)}
                rightSection={<IconArrowRight size={16} />}
              >
                {bp.name}
              </Button>
          ))}
        </Stack>
      </Modal>

      <SuggestionsModal
        opened={openedSuggest}
        onClose={closeSuggest}
        target={suggestFor}
      />
    </Stack>
  );
}

function SuggestionsModal({
  opened,
  onClose,
  target,
}: {
  opened: boolean;
  onClose: () => void;
  target: { skillId: string; skillName: string; roadmapId: string } | null;
}) {
  const [linked, setLinked] = useState<Set<string>>(new Set());

  const { data: suggestions, isLoading } = useQuery<Suggestion[]>({
    queryKey: ["field-roadmap", "suggestions", target?.skillId],
    queryFn: async () => {
      if (!target) return [];
      const res = await fetch(`/api/field-roadmap/evidence/suggestions?skillId=${target.skillId}&roadmapId=${target.roadmapId}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: opened && !!target,
  });

  const addMutation = useMutation({
    mutationFn: async (s: Suggestion) => {
      if (!target) return;
      const res = await fetch("/api/field-roadmap/evidence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillId: target.skillId, entityType: s.entityType, entityId: s.entityId }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: (_, s) => {
      setLinked((prev) => new Set(prev).add(`${s.entityType}:${s.entityId}`));
      notifications.show({ title: "Evidence linked", message: "Proficiency will update", color: "green" });
    },
  });

  return (
    <Modal opened={opened} onClose={onClose} title={target ? `Link evidence for "${target.skillName}"` : "Link evidence"}>
      {isLoading ? (
        <Center py="xl"><Loader size="sm" /></Center>
      ) : suggestions && suggestions.length === 0 ? (
        <Text c="dimmed" size="sm">
          No matching artifacts found. Add a Knowledge entry, interview prep item, or portfolio project with a keyword that matches this skill.
        </Text>
      ) : (
        <Stack>
          {suggestions?.map((s) => {
            const key = `${s.entityType}:${s.entityId}`;
            const isLinked = linked.has(key);
            return (
              <Card key={key} withBorder radius="md" padding="sm">
                <Group justify="space-between" align="flex-start">
                  <div style={{ flex: 1 }}>
                    <Text size="sm" fw={500}>{s.label}</Text>
                    <Text size="xs" c="dimmed">{s.match}</Text>
                  </div>
                  <Button
                    size="xs"
                    variant="light"
                    color={isLinked ? "green" : "blue"}
                    leftSection={isLinked ? undefined : <IconPlus size={14} />}
                    loading={addMutation.isPending}
                    disabled={isLinked}
                    onClick={() => addMutation.mutate(s)}
                  >
                    {isLinked ? "Linked" : "Link"}
                  </Button>
                </Group>
              </Card>
            );
          })}
        </Stack>
      )}
    </Modal>
  );
}