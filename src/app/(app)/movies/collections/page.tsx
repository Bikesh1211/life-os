import { redirect } from "next/navigation";

export default function MoviesCollectionsRedirect() {
  redirect("/movies?tab=collections");
}
