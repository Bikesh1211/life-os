import { redirect } from "next/navigation";

export default function RecurringRedirect() {
  redirect("/tasks?tab=recurring");
}
