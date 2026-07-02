import { redirect } from "next/navigation";

export default function MoviesFavoritesRedirect() {
  redirect("/movies?tab=favorites");
}
