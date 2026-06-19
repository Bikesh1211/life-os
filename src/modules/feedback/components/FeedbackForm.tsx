"use client";

import { useState } from "react";
import { Stack, Text, Paper, Group, Textarea, Select, Button, Checkbox } from "@mantine/core";
import { IconMessage, IconSend } from "@tabler/icons-react";

export function FeedbackForm() {
  const [category, setCategory] = useState<string | null>("general");
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          message: message.trim(),
          isAnonymous,
          pageUrl: window.location.href,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to submit feedback");
      }
      setSubmitted(true);
      setMessage("");
      setCategory("general");
      setIsAnonymous(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Paper withBorder p="lg" radius="md">
        <Group>
          <IconMessage size={24} className="text-green-600" />
          <div>
            <Text fw={500}>Feedback Sent!</Text>
            <Text size="sm" c="dimmed">Thank you — your feedback helps improve the app.</Text>
          </div>
        </Group>
      </Paper>
    );
  }

  return (
    <Paper withBorder p="lg" radius="md">
      <Group mb="sm">
        <IconMessage size={20} className="text-gray-500" />
        <Text fw={500}>Send Feedback</Text>
      </Group>
      <Text size="sm" c="dimmed" mb="md">
        Help improve the app. Report a bug, suggest a feature, or share your thoughts.
      </Text>

      <Stack gap="sm">
        <Select
          data={[
            { value: "general", label: "General Feedback" },
            { value: "bug", label: "Bug Report" },
            { value: "feature", label: "Feature Request" },
            { value: "idea", label: "Idea" },
            { value: "complaint", label: "Complaint" },
            { value: "praise", label: "Praise" },
          ]}
          value={category}
          onChange={setCategory}
          size="sm"
        />
        <Textarea
          placeholder="What's on your mind?"
          minRows={3}
          maxRows={8}
          value={message}
          onChange={(e) => setMessage(e.currentTarget.value)}
          autosize
        />
        <Group justify="space-between">
          <Checkbox
            label="Submit anonymously"
            description="Your identity won't be shown"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.currentTarget.checked)}
            size="xs"
          />
          <Button
            leftSection={<IconSend size={16} />}
            onClick={handleSubmit}
            loading={submitting}
            disabled={!message.trim()}
            size="sm"
          >
            Send
          </Button>
        </Group>
        {error && (
          <Text size="sm" c="red">{error}</Text>
        )}
      </Stack>
    </Paper>
  );
}
