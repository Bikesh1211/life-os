"use client";

import { Stack, Title } from "@mantine/core";
import { FeedbackForm } from "@/modules/feedback/components/FeedbackForm";
import { FeedbackList } from "@/modules/feedback/components/FeedbackList";

export default function FeedbackPage() {
  return (
    <Stack gap="lg" maw={600}>
      <Title order={2}>Feedback</Title>
      <FeedbackForm />
      <FeedbackList />
    </Stack>
  );
}
