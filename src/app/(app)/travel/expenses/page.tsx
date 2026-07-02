import { redirect } from "next/navigation";

export default function ExpensesRedirect() {
  redirect("/travel?tab=expenses");
}
