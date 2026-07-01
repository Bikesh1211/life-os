import { redirect } from "next/navigation";

export default function TimelineRedirect() {
  redirect("/journal?tab=timeline");
}
