import dynamic from "next/dynamic";

const CreatorStudioShell = dynamic(
  () => import("./CreatorStudioShell").then((m) => m.CreatorStudioShell),
  { loading: () => <div /> },
);

export default function CreatorStudioLayout({ children }: { children: React.ReactNode }) {
  return <CreatorStudioShell>{children}</CreatorStudioShell>;
}
