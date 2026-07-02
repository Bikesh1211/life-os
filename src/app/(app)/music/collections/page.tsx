import { redirect } from "next/navigation";

export default function MusicCollectionsRedirect() {
  redirect("/music?tab=collections");
}
