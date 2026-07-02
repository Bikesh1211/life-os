import { redirect } from "next/navigation";

export default function RoutinesTemplatesRedirect() {
  redirect("/routines?tab=templates");
}
