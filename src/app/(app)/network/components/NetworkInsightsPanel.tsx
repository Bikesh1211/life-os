"use client";

import { useEffect, useState } from "react";
import { Container, Title, Stack, Alert, Skeleton } from "@mantine/core";
import { IconInfoCircle, IconAlertTriangle, IconReportAnalytics } from "@tabler/icons-react";
import { FeaturePlaceholder } from "@/components/shared/FeaturePlaceholder";

type Insight = {
  type: string;
  severity: string;
  message: string;
};

export function NetworkInsightsPanel() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/network/insights")
      .then(r => r.ok ? r.json() : [])
      .then(data => { setInsights(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <Stack>{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} height={60} radius="md" />)}</Stack>;
  }

  if (insights.length === 0) {
    return <FeaturePlaceholder title="Insights" description="Relationship insights will appear as you add more data" icon={IconReportAnalytics} />;
  }

  return (
    <>
      <Title order={2} mb="lg">Insights</Title>
      <Stack>
        {insights.map((insight, i) => (
          <Alert key={`${insight.type}-${i}`} variant="light"
            color={insight.severity === "warning" ? "red" : "blue"}
            title={insight.severity === "warning" ? "Attention needed" : "Did you know?"}
            icon={insight.severity === "warning" ? <IconAlertTriangle size={20} /> : <IconInfoCircle size={20} />}>
            {insight.message}
          </Alert>
        ))}
      </Stack>
    </>
  );
}
