import { FeaturePlaceholder } from "@/components/shared/FeaturePlaceholder";
import { IconCalendarDue } from "@tabler/icons-react";

export default function TasksTodayPage() {
  return (
    <FeaturePlaceholder
      title="Today's Tasks"
      description="What needs to be done today"
      icon={IconCalendarDue}
    />
  );
}
