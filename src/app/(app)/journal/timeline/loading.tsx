import { Skeleton } from "@mantine/core";

export default function TimelineLoading() {
  return (
    <div>
      <Skeleton height={32} width={180} className="mb-4" />
      <Skeleton height={16} width={240} className="mb-6" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="mb-6">
          <Skeleton height={20} width={120} className="mb-3" />
          <div className="ml-2 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
            <Skeleton height={64} className="mb-3" radius="md" />
            <Skeleton height={64} className="mb-3" radius="md" />
            <Skeleton height={64} radius="md" />
          </div>
        </div>
      ))}
    </div>
  );
}
