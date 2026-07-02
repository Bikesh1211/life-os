import { redirect } from "next/navigation";

export default function RoutinesTimelineRedirect() {
  redirect("/routines?tab=timeline");
}
