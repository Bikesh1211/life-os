import { redirect } from "next/navigation";

export default function BucketListRedirect() {
  redirect("/travel?tab=wishlist");
}
