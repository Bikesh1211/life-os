import { FeaturePlaceholder } from "@/components/shared/FeaturePlaceholder";
import { IconClock } from "@tabler/icons-react";

export default function TimePage() {
  return (
    <FeaturePlaceholder
      title="Time Tracking"
      description="Track how you spend your time"
      icon={IconClock}
    />
  );
}
