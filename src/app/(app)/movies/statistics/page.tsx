import { redirect } from "next/navigation";

export default function MoviesStatisticsRedirect() {
  redirect("/movies?tab=statistics");
}
