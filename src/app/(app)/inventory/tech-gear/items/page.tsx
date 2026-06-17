import { Suspense } from "react";
import { Skeleton } from "@mantine/core";
import { TechGearItemsContent } from "./TechGearItemsContent";

export default function TechGearItemsPage() {
  return (
    <Suspense fallback={<Skeleton height={400} radius="md" />}>
      <TechGearItemsContent />
    </Suspense>
  );
}
