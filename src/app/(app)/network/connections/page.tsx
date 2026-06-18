import { getCurrentUserId } from "@/core/auth";
import { getConnections } from "@/modules/network";
import { Container, Title, Card, Group, Text, Stack, Badge, ThemeIcon, SimpleGrid } from "@mantine/core";
import { IconUserPlus, IconHeart } from "@tabler/icons-react";
import { FeaturePlaceholder } from "@/components/shared/FeaturePlaceholder";

function daysSince(dateStr: string): number {
  const d = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
}

export default async function ConnectionsPage() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const connections = await getConnections(userId);
  if (connections.length === 0) {
    return (
      <Container size="xl">
        <FeaturePlaceholder title="Connections" description="People you know will appear here" icon={IconUserPlus} />
      </Container>
    );
  }

  return (
    <Container size="xl">
      <Title order={2} mb="lg">Connections ({connections.length})</Title>
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
        {connections.map((c) => (
          <Card key={c.id} withBorder padding="md" radius="md">
            <Stack>
              <Group>
                <ThemeIcon variant="light" color={c.isFavorite ? "yellow" : "blue"} size="lg" radius="xl">
                  {c.isFavorite ? <IconHeart size={20} /> : <IconUserPlus size={20} />}
                </ThemeIcon>
                <Stack gap={0}>
                  <Text fw={500}>{c.name}</Text>
                  {c.nickname && <Text size="sm" c="dimmed">{c.nickname}</Text>}
                </Stack>
              </Group>
              <Group gap="xs">
                {c.relationshipTypes?.map((t) => (
                  <Badge key={t} variant="light" size="sm">{t}</Badge>
                ))}
              </Group>
              <Stack gap="xs">
                {c.birthday && <Text size="sm" c="dimmed">Birthday: {c.birthday}</Text>}
                {c.lastMetDate && (
                  <Text size="sm" c="dimmed">Last met: {daysSince(c.lastMetDate)} days ago</Text>
                )}
                {c.city && <Text size="sm" c="dimmed">{c.city}{c.country ? `, ${c.country}` : ""}</Text>}
              </Stack>
            </Stack>
          </Card>
        ))}
      </SimpleGrid>
    </Container>
  );
}
