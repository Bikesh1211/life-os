import { getCurrentUserId } from "@/core/auth";
import { computeInsights } from "@/modules/network";
import { Container, Title, Stack, Alert } from "@mantine/core";
import { IconInfoCircle, IconAlertTriangle, IconReportAnalytics } from "@tabler/icons-react";
import { FeaturePlaceholder } from "@/components/shared/FeaturePlaceholder";

export default async function InsightsPage() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const insights = await computeInsights(userId);
  if (insights.length === 0) {
    return (
      <Container size="xl">
        <FeaturePlaceholder title="Insights" description="Relationship insights will appear as you add more data" icon={IconReportAnalytics} />
      </Container>
    );
  }

  return (
    <Container size="xl">
      <Title order={2} mb="lg">Insights</Title>
      <Stack>
        {insights.map((insight, i) => (
          <Alert
            key={`${insight.type}-${i}`}
            variant="light"
            color={insight.severity === "warning" ? "red" : "blue"}
            title={insight.severity === "warning" ? "Attention needed" : "Did you know?"}
            icon={insight.severity === "warning" ? <IconAlertTriangle size={20} /> : <IconInfoCircle size={20} />}
          >
            {insight.message}
          </Alert>
        ))}
      </Stack>
    </Container>
  );
}
