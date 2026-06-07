import { Skeleton, Stack } from "@mantine/core";

export default function JournalLoading() {
  return (
    <Stack gap="md">
      <div className="flex justify-between">
        <Skeleton height={32} width={120} />
        <Skeleton height={36} width={120} radius="md" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
        <Skeleton height={80} radius="md" />
        <Skeleton height={80} radius="md" />
        <Skeleton height={80} radius="md" />
      </div>
      <div className="flex gap-2">
        <Skeleton height={36} className="flex-1" radius="md" />
        <Skeleton height={36} width={160} radius="md" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} height={72} radius="md" />
      ))}
    </Stack>
  );
}
