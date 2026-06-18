import { getCurrentUserId } from "@/core/auth";
import { getDashboardStats } from "@/modules/network";
import { Container, Title, Text } from "@mantine/core";
import { IconPlane } from "@tabler/icons-react";
import { FeaturePlaceholder } from "@/components/shared/FeaturePlaceholder";

export default async function TripsPage() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const stats = await getDashboardStats(userId);

  return (
    <Container size="xl">
      <Title order={2} mb="lg">Trips Together</Title>
      <Text size="sm" c="dimmed" mb="md">
        Trips you've taken with connections ({stats.totalTrips} recorded)
      </Text>
      <FeaturePlaceholder
        title="Trips with Friends"
        description="Trips are managed in the Travel module. Link connections to your trips there."
        icon={IconPlane}
      />
    </Container>
  );
}
