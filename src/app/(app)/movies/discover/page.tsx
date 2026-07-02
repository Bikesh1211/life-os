import { redirect } from "next/navigation";

export default function MoviesDiscoverRedirect() {
  redirect("/movies?tab=discover");
}
