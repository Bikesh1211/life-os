import { redirect } from "next/navigation";

export default function NetworkMeetupsRedirect() {
  redirect("/network?tab=meetups");
}
