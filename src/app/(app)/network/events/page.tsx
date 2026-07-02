import { redirect } from "next/navigation";

export default function NetworkEventsRedirect() {
  redirect("/network?tab=events");
}
