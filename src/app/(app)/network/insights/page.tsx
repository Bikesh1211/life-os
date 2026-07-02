import { redirect } from "next/navigation";

export default function NetworkInsightsRedirect() {
  redirect("/network?tab=insights");
}
