import { FeaturePlaceholder } from "@/components/shared/FeaturePlaceholder";
import { IconShoppingCart } from "@tabler/icons-react";

export default function PurchasesPage() {
  return (
    <FeaturePlaceholder
      title="Purchases"
      description="Track your purchase history"
      icon={IconShoppingCart}
    />
  );
}
