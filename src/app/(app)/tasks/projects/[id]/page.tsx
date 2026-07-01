import { redirect } from "next/navigation";

export default function ProjectDetailRedirect() {
  redirect("/tasks?tab=projects");
}
