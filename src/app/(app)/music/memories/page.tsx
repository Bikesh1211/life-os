import { redirect } from "next/navigation";

export default function MusicMemoriesRedirect() {
  redirect("/music?tab=memories");
}
