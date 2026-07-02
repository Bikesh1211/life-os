import { redirect } from "next/navigation";

export default function ItinerariesRedirect() {
  redirect("/travel?tab=dashboard");
}
