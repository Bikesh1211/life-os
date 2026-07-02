import { redirect } from "next/navigation";

export default function NetworkTimelineRedirect() {
  redirect("/network?tab=timeline");
}
