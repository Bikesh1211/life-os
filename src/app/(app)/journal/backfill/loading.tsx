import { Skeleton, Stack } from "@mantine/core";

export default function BackfillLoading() {
  return (
    <Stack gap="md">
      <div className="flex items-center gap-2">
        <Skeleton height={24} width={24} />
        <Skeleton height={32} width={120} />
      </div>
      <Skeleton height={60} radius="md" />
      <Skeleton height={40} radius="md" />
      <Skeleton height={60} radius="md" />
      <Skeleton height={36} width={200} />
      <Skeleton height={40} radius="md" />
      <Skeleton height={400} radius="md" />
    </Stack>
  );
}
