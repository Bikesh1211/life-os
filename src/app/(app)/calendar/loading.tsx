import { Skeleton, Stack } from "@mantine/core";

export default function CalendarLoading() {
  return (
    <Stack gap="md">
      <Skeleton height={36} width={200} />
      <Skeleton height={500} radius="md" />
    </Stack>
  );
}
