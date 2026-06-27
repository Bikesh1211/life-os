import dynamic from "next/dynamic";

const BookDetailShell = dynamic(
  () => import("./BookDetailShell").then((m) => m.BookDetailShell),
  { loading: () => <div /> },
);

export default async function BookDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BookDetailShell bookId={id}>{children}</BookDetailShell>;
}
