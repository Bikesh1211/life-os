import { redirect } from "next/navigation";

export default function NetworkGiftsRedirect() {
  redirect("/network?tab=gifts");
}
