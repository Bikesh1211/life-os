import { redirect } from "next/navigation";

export default function MusicJournalRedirect() {
  redirect("/music?tab=journal");
}
