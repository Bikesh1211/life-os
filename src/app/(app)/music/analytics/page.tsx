import { redirect } from "next/navigation";

export default function MusicAnalyticsRedirect() {
  redirect("/music?tab=analytics");
}
