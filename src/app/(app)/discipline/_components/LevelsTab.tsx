"use client";

import { Card, Text, Group, Badge, Stack, RingProgress, Progress } from "@mantine/core";
import { IconShield, IconLock } from "@tabler/icons-react";
import { DISCIPLINE_LEVELS } from "@/modules/integrity/constants";

export default function LevelsTab() {
  const score = 87;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--mantine-color-text,#c1c2c5)] sm:text-4xl">
          Discipline Levels
        </h1>
        <p className="mt-1 text-[var(--mantine-color-dimmed,#5c5f66)]">
          Progress through 7 levels of mastery
        </p>
      </div>

      <Stack gap="md">
        {DISCIPLINE_LEVELS.map((level) => {
          const isUnlocked = score >= level.minScore;
          const nextLevel = DISCIPLINE_LEVELS.find((l) => l.level === level.level + 1);
          const progress = nextLevel
            ? Math.round(
                ((score - level.minScore) / (nextLevel.minScore - level.minScore)) * 100,
              )
            : 100;

          return (
            <Card
              key={level.level}
              shadow="sm"
              padding="lg"
              radius="md"
              withBorder
              className={!isUnlocked ? "opacity-60" : ""}
            >
              <Group justify="space-between" mb="xs">
                <Group gap="sm">
                  {isUnlocked ? (
                    <IconShield size={28} style={{ color: "var(--mantine-color-violet-6)" }} />
                  ) : (
                    <IconLock size={28} style={{ color: "var(--mantine-color-dimmed)" }} />
                  )}
                  <div>
                    <Text fw={600} size="lg">
                      Level {level.level}: {level.title}
                    </Text>
                    <Text size="xs" c="dimmed">
                      Minimum score: {level.minScore}
                    </Text>
                  </div>
                </Group>
                <Badge
                  size="lg"
                  variant={isUnlocked ? "gradient" : "light"}
                  gradient={isUnlocked ? { from: "violet", to: "indigo" } : undefined}
                  color={isUnlocked ? undefined : "gray"}
                >
                  {isUnlocked ? "Unlocked" : "Locked"}
                </Badge>
              </Group>

              {!isUnlocked && nextLevel && (
                <div className="mt-2">
                  <Group justify="space-between" mb={4}>
                    <Text size="xs" c="dimmed">Progress to next level</Text>
                    <Text size="xs" fw={500}>{Math.min(progress, 100)}%</Text>
                  </Group>
                  <Progress value={Math.min(progress, 100)} size="sm" color="violet" />
                </div>
              )}

              {isUnlocked && nextLevel && (
                <div className="mt-2">
                  <Text size="xs" c="dimmed">
                    Next: Level {nextLevel.level} — {nextLevel.title} (score {nextLevel.minScore})
                  </Text>
                </div>
              )}

              {!nextLevel && (
                <div className="mt-2">
                  <Text size="xs" c="dimmed">Maximum level reached</Text>
                </div>
              )}
            </Card>
          );
        })}
      </Stack>
    </div>
  );
}
