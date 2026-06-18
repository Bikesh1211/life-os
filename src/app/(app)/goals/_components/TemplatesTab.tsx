"use client";

import { FeaturePlaceholder } from "@/components/shared/FeaturePlaceholder";
import { IconTemplate } from "@tabler/icons-react";

export default function TemplatesTab() {
  return (
    <FeaturePlaceholder
      title="Goal Templates"
      description="Start with pre-built goal templates for common life objectives"
      icon={IconTemplate}
    />
  );
}
