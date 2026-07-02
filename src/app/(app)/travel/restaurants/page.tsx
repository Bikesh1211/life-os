import { redirect } from "next/navigation";

export default function RestaurantsRedirect() {
  redirect("/travel?tab=restaurants");
}
