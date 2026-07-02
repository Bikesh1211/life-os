import { redirect } from "next/navigation";

export default function NetworkBirthdaysRedirect() {
  redirect("/network?tab=birthdays");
}
