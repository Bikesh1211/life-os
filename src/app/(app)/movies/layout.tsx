import { MoviesShell } from "@/modules/movies/components/MoviesShell";

export default function MoviesLayout({ children }: { children: React.ReactNode }) {
  return <MoviesShell>{children}</MoviesShell>;
}
