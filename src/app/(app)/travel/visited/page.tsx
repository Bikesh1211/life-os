import { redirect } from "next/navigation";

export default function VisitedRedirect() {
  redirect("/travel?tab=visited");
}
