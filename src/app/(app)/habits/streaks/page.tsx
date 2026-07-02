import { redirect } from "next/navigation";

export default function StreaksRedirect() {
  redirect("/habits?tab=streaks");
}
