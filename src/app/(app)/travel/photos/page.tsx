import { redirect } from "next/navigation";

export default function PhotosRedirect() {
  redirect("/travel?tab=photos");
}
