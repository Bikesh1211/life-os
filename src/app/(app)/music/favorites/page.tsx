import { redirect } from "next/navigation";

export default function MusicFavoritesRedirect() {
  redirect("/music?tab=favorites");
}
