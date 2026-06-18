import { getCurrentUserId } from "@/core/auth";
import { getMeetups } from "@/modules/network";
import { Container, Title, Card, Group, Text, Stack, ThemeIcon } from "@mantine/core";
import { IconCoffee } from "@tabler/icons-react";
import { FeaturePlaceholder } from "@/components/shared/FeaturePlaceholder";

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

export default async function MeetupsPage() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const meetups = await getMeetups(userId);
  if (meetups.length === 0) {
    return (
      <Container size="xl">
        <FeaturePlaceholder title="Meetups" description="Log your gatherings with friends" icon={IconCoffee} />
      </Container>
    );
  }

  return (
    <Container size="xl">
      <Title order={2} mb="lg">Meetups</Title>
      <Stack>
        {meetups.map((m) => (
          <Card key={m.id} withBorder padding="md" radius="md">
            <Group>
              <ThemeIcon variant="light" color="orange" size="lg" radius="xl">
                <IconCoffee size={20} />
              </ThemeIcon>
              <Stack gap={0} style={{ flex: 1 }}>
                <Text fw={500}>{m.title}</Text>
                <Text size="sm" c="dimmed">{formatDate(m.date)}{m.location ? ` · ${m.location}` : ""}</Text>
              </Stack>
              <Stack gap={0} align="flex-end">
                {m.mood && <Text size="sm">{m.mood}</Text>}
                {m.photos?.length > 0 && <Text size="xs" c="dimmed">{m.photos.length} photos</Text>}
              </Stack>
            </Group>
          </Card>
        ))}
      </Stack>
    </Container>
  );
}
