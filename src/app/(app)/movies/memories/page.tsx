import { redirect } from "next/navigation";

export default function MoviesMemoriesRedirect() {
  redirect("/movies?tab=memories");
}
