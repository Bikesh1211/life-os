import { redirect } from "next/navigation";

export default function MoviesQuotesRedirect() {
  redirect("/movies?tab=quotes");
}
