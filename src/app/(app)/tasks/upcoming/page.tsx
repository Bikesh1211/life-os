import { redirect } from "next/navigation";

export default function UpcomingRedirect() {
  redirect("/tasks?tab=upcoming");
}
