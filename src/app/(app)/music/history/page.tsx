import { redirect } from "next/navigation";

export default function MusicHistoryRedirect() {
  redirect("/music?tab=history");
}
