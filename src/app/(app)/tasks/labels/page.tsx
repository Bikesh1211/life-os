import { redirect } from "next/navigation";

export default function LabelsRedirect() {
  redirect("/tasks?tab=labels");
}
