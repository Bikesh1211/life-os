import { redirect } from "next/navigation";

export default function NetworkMemoriesRedirect() {
  redirect("/network?tab=memories");
}
