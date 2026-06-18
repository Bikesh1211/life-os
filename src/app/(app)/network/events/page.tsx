import { getCurrentUserId } from "@/core/auth";
import { getEvents } from "@/modules/network";
import { Container, Title, Card, Group, Text, Stack, ThemeIcon, Badge } from "@mantine/core";
import { IconCalendarEvent } from "@tabler/icons-react";
import { FeaturePlaceholder } from "@/components/shared/FeaturePlaceholder";

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
  });
}

export default async function EventsPage() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const events = await getEvents(userId);
  if (events.length === 0) {
    return (
      <Container size="xl">
        <FeaturePlaceholder title="Events" description="Birthday parties, weddings, reunions and more" icon={IconCalendarEvent} />
      </Container>
    );
  }

  return (
    <Container size="xl">
      <Title order={2} mb="lg">Events</Title>
      <Stack>
        {events.map((e) => (
          <Card key={e.id} withBorder padding="md" radius="md">
            <Group>
              <ThemeIcon variant="light" color="teal" size="lg" radius="xl">
                <IconCalendarEvent size={20} />
              </ThemeIcon>
              <Stack gap={0} style={{ flex: 1 }}>
                <Text fw={500}>{e.title}</Text>
                <Group gap="xs">
                  <Badge variant="light" size="sm">{e.eventType}</Badge>
                  <Text size="sm" c="dimmed">{formatDate(e.date)}</Text>
                </Group>
              </Stack>
              <Stack gap={0} align="flex-end">
                {e.location && <Text size="sm" c="dimmed">{e.location}</Text>}
                {e.photos?.length > 0 && <Text size="xs" c="dimmed">{e.photos.length} photos</Text>}
              </Stack>
            </Group>
          </Card>
        ))}
      </Stack>
    </Container>
  );
}
