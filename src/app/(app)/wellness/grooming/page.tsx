import { getCurrentUserId } from "@/core/auth";
import { GroomingContent } from "./GroomingContent";

export default async function GroomingPage() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  return <GroomingContent />;
}
