import { Suspense } from "react";
import { Skeleton } from "@mantine/core";
import { WardrobeItemsContent } from "./WardrobeItemsContent";

export default function WardrobeItemsPage() {
  return (
    <Suspense fallback={<Skeleton height={400} radius="md" />}>
      <WardrobeItemsContent />
    </Suspense>
  );
}
