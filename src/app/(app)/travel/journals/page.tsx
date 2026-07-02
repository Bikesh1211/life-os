import { redirect } from "next/navigation";

export default function JournalsRedirect() {
  redirect("/travel?tab=journals");
}
