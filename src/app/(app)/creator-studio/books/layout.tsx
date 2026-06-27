import dynamic from "next/dynamic";

const BookShell = dynamic(
  () => import("./BookShell").then((m) => m.BookShell),
  { loading: () => <div /> },
);

export default function BooksLayout({ children }: { children: React.ReactNode }) {
  return <BookShell>{children}</BookShell>;
}
