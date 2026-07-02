import { redirect } from "next/navigation";

export default function MoviesWatchlistRedirect() {
  redirect("/movies?tab=watchlist");
}
