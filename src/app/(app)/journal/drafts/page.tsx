import { FeaturePlaceholder } from "@/components/shared/FeaturePlaceholder";
import { IconFilePencil } from "@tabler/icons-react";

export default function DraftsPage() {
  return (
    <FeaturePlaceholder
      title="Journal Drafts"
      description="Draft journal entries"
      icon={IconFilePencil}
    />
  );
}
