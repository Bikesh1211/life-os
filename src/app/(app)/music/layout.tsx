import dynamic from "next/dynamic";

const MusicShell = dynamic(
  () => import("./MusicShell").then((m) => m.MusicShell),
  { loading: () => <div /> },
);

export default function MusicLayout({ children }: { children: React.ReactNode }) {
  return <MusicShell>{children}</MusicShell>;
}
