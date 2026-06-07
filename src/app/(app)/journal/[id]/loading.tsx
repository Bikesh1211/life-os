import { Skeleton, Stack } from "@mantine/core";

export default function EditEntryLoading() {
  return (
    <Stack gap="md">
      <div className="flex items-center justify-between">
        <Skeleton height={36} width={80} radius="md" />
        <Skeleton height={16} width={120} />
      </div>
      <Skeleton height={60} radius="md" />
      <Skeleton height={40} radius="md" />
      <Skeleton height={60} radius="md" />
      <Skeleton height={36} width={200} />
      <Skeleton height={400} radius="md" />
    </Stack>
  );
}
