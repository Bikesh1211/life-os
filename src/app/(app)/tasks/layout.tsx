import { TasksShell } from "./TasksShell";

export default function TasksLayout({ children }: { children: React.ReactNode }) {
  return <TasksShell>{children}</TasksShell>;
}