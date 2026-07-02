import { redirect } from "next/navigation";

export default function RoutinesAnalyticsRedirect() {
  redirect("/routines?tab=analytics");
}
