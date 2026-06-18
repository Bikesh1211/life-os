import { getCurrentUserId } from "@/core/auth";
import { getMemories } from "@/modules/network";
import { Container, Title, Card, Group, Text, Stack, ThemeIcon, Badge, SimpleGrid } from "@mantine/core";
import { IconPhotoHeart, IconHeart } from "@tabler/icons-react";
import { FeaturePlaceholder } from "@/components/shared/FeaturePlaceholder";

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

export default async function MemoriesPage() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const memories = await getMemories(userId);
  if (memories.length === 0) {
    return (
      <Container size="xl">
        <FeaturePlaceholder title="Memories" description="Capture memories with the people who matter" icon={IconPhotoHeart} />
      </Container>
    );
  }

  return (
    <Container size="xl">
      <Title order={2} mb="lg">Memories</Title>
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
        {memories.map((m) => (
          <Card key={m.id} withBorder padding="md" radius="md">
            <Stack>
              <Group>
                <ThemeIcon variant="light" color="violet" size="lg" radius="xl">
                  <IconPhotoHeart size={20} />
                </ThemeIcon>
                <Text fw={500} style={{ flex: 1 }}>{m.title}</Text>
                {m.isFavorite && <IconHeart size={16} color="red" />}
              </Group>
              {m.description && (
                <Text size="sm" c="dimmed" lineClamp={2}>{m.description}</Text>
              )}
              <Group gap="xs">
                {formatDate(m.memoryDate) && (
                  <Text size="xs" c="dimmed">{formatDate(m.memoryDate)}</Text>
                )}
                {m.photoUrls?.length > 0 && (
                  <Badge variant="light" size="sm">{m.photoUrls.length} photos</Badge>
                )}
                {m.location && <Badge variant="light" size="sm">{m.location}</Badge>}
              </Group>
              {m.tags?.length > 0 && (
                <Group gap="xs">
                  {m.tags.map((t) => <Badge key={t} variant="dot" size="sm">{t}</Badge>)}
                </Group>
              )}
            </Stack>
          </Card>
        ))}
      </SimpleGrid>
    </Container>
  );
}
