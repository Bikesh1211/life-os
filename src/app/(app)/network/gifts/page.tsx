import { getCurrentUserId } from "@/core/auth";
import { getGifts, getConnections } from "@/modules/network";
import { Container, Title, Card, Group, Text, Stack, ThemeIcon, Badge } from "@mantine/core";
import { IconGift } from "@tabler/icons-react";
import { FeaturePlaceholder } from "@/components/shared/FeaturePlaceholder";

export default async function GiftsPage() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const [gifts, connections] = await Promise.all([
    getGifts(userId),
    getConnections(userId),
  ]);

  if (gifts.length === 0) {
    return (
      <Container size="xl">
        <FeaturePlaceholder title="Gifts" description="Track gifts you've given and received" icon={IconGift} />
      </Container>
    );
  }

  const connMap = new Map(connections.map((c) => [c.id, c.name]));

  return (
    <Container size="xl">
      <Title order={2} mb="lg">Gifts</Title>
      <Stack>
        {gifts.map((g) => (
          <Card key={g.id} withBorder padding="md" radius="md">
            <Group>
              <ThemeIcon variant="light" color={g.direction === "given" ? "red" : "teal"} size="lg" radius="xl">
                <IconGift size={20} />
              </ThemeIcon>
              <Stack gap={0} style={{ flex: 1 }}>
                <Text fw={500}>{g.giftName}</Text>
                <Text size="sm" c="dimmed">
                  {g.direction === "given" ? "To" : "From"}: {connMap.get(g.connectionId) ?? "Unknown"}
                  {g.occasion ? ` · ${g.occasion}` : ""}
                </Text>
              </Stack>
              <Stack gap={0} align="flex-end">
                <Badge variant="light" color={g.direction === "given" ? "red" : "teal"} size="sm">
                  {g.direction}
                </Badge>
                {g.price != null && g.direction === "given" && (
                  <Text size="sm" fw={500}>Rs. {g.price}</Text>
                )}
              </Stack>
            </Group>
          </Card>
        ))}
      </Stack>
    </Container>
  );
}
