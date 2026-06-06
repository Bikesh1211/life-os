import { FeaturePlaceholder } from "@/components/shared/FeaturePlaceholder";
import { IconInbox } from "@tabler/icons-react";

export default function TasksInboxPage() {
  return (
    <FeaturePlaceholder
      title="Task Inbox"
      description="Capture new tasks"
      icon={IconInbox}
    />
  );
}
