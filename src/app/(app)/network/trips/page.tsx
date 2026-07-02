import { redirect } from "next/navigation";

export default function NetworkTripsRedirect() {
  redirect("/network?tab=trips");
}
