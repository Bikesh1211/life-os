import { redirect } from "next/navigation";

export default function MusicLibraryRedirect() {
  redirect("/music?tab=library");
}
