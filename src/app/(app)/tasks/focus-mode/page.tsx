import { redirect } from "next/navigation";

export default function FocusModeRedirect() {
  redirect("/tasks?tab=focus-mode");
}
