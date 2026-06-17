import dynamic from "next/dynamic";

const TravelShell = dynamic(
  () => import("./TravelShell").then((m) => m.TravelShell),
  { loading: () => <div /> },
);

export default function TravelLayout({ children }: { children: React.ReactNode }) {
  return <TravelShell>{children}</TravelShell>;
}
