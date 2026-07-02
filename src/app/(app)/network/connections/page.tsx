import { redirect } from "next/navigation";

export default function NetworkConnectionsRedirect() {
  redirect("/network?tab=connections");
}
