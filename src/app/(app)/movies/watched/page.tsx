import { redirect } from "next/navigation";

export default function MoviesWatchedRedirect() {
  redirect("/movies?tab=watched");
}
