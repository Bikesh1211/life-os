import { FeaturePlaceholder } from "@/components/shared/FeaturePlaceholder";
import { IconShieldLock } from "@tabler/icons-react";

export default function VaultPage() {
  return (
    <FeaturePlaceholder
      title="Vault"
      description="Secure storage for sensitive information"
      icon={IconShieldLock}
    />
  );
}
