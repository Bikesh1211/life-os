"use client";

import { useState } from "react";
import { Paper, Group, Text, Textarea, TextInput, Button, Rating, Stack } from "@mantine/core";
import { IconMoonStars } from "@tabler/icons-react";

type ReviewData = {
  whatWentWell: string;
  biggestAchievement: string;
  lessonLearned: string;
  howDoYouFeel: string;
  dayRating: number;
  tomorrowPriorities: string;
};

type Props = {
  currentReview: ReviewData | null;
  onSave: (data: ReviewData) => void;
  isLoading: boolean;
};

export function EndOfDayReview({ currentReview, onSave, isLoading }: Props) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<ReviewData>(
    currentReview ?? {
      whatWentWell: "",
      biggestAchievement: "",
      lessonLearned: "",
      howDoYouFeel: "",
      dayRating: 0,
      tomorrowPriorities: "",
    },
  );

  if (!open) {
    return (
      <Paper withBorder p="md" radius="md">
        <Group justify="space-between">
          <Group gap="sm">
            <IconMoonStars size={18} />
            <Text fw={600} size="sm">End-of-Day Review</Text>
          </Group>
          <Button variant="light" size="sm" onClick={() => setOpen(true)}>
            {currentReview?.dayRating ? "Edit Review" : "Start Review"}
          </Button>
        </Group>
        {currentReview?.dayRating ? (
          <Group gap="xs" mt="xs">
            <Text size="sm" c="dimmed">Rating: {currentReview.dayRating}/10</Text>
            {currentReview.whatWentWell && (
              <Text size="sm" c="dimmed" lineClamp={1}>
                • {currentReview.whatWentWell}
              </Text>
            )}
          </Group>
        ) : (
          <Text size="sm" c="dimmed" mt={4}>
            Reflect on your day before you sleep.
          </Text>
        )}
      </Paper>
    );
  }

  return (
    <Paper withBorder p="md" radius="md">
      <Group gap="sm" mb="md">
        <IconMoonStars size={18} />
        <Text fw={600} size="sm">End-of-Day Review</Text>
      </Group>

      <Stack gap="sm">
        <Textarea
          label="What went well today?"
          value={data.whatWentWell}
          onChange={(e) => setData({ ...data, whatWentWell: e.currentTarget.value })}
          minRows={2}
          autosize
        />
        <Textarea
          label="Biggest achievement?"
          value={data.biggestAchievement}
          onChange={(e) => setData({ ...data, biggestAchievement: e.currentTarget.value })}
          minRows={2}
          autosize
        />
        <Textarea
          label="Lesson learned?"
          value={data.lessonLearned}
          onChange={(e) => setData({ ...data, lessonLearned: e.currentTarget.value })}
          minRows={2}
          autosize
        />
        <TextInput
          label="How do you feel?"
          value={data.howDoYouFeel}
          onChange={(e) => setData({ ...data, howDoYouFeel: e.currentTarget.value })}
          placeholder="e.g. Accomplished, tired, grateful..."
        />
        <Group gap="sm">
          <Text size="sm">Day rating:</Text>
          <Rating
            value={data.dayRating}
            onChange={(v) => setData({ ...data, dayRating: v })}
            count={10}
            size="md"
          />
        </Group>
        <TextInput
          label="Tomorrow's top priorities"
          value={data.tomorrowPriorities}
          onChange={(e) => setData({ ...data, tomorrowPriorities: e.currentTarget.value })}
          placeholder="What matters most tomorrow?"
        />
        <Group justify="flex-end">
          <Button variant="subtle" size="sm" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => {
              onSave(data);
              setOpen(false);
            }}
            loading={isLoading}
          >
            Save Review
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
}
