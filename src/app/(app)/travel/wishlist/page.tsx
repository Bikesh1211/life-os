import { redirect } from "next/navigation";

export default function WishlistRedirect() {
  redirect("/travel?tab=wishlist");
}
