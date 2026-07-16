import { Skeleton } from "@mantine/core";

export default function CurbLoading() {
  return (
    <div className="space-y-4 p-6">
      <Skeleton height={36} width={200} radius="md" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} height={100} radius="lg" />
        ))}
      </div>
      <Skeleton height={200} radius="lg" />
    </div>
  );
}
