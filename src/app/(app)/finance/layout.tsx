import dynamic from "next/dynamic";

const FinanceShell = dynamic(
  () => import("./_components/FinanceShell").then((m) => m.FinanceShell),
  { loading: () => <div /> },
);

export default function FinanceLayout({ children }: { children: React.ReactNode }) {
  return <FinanceShell>{children}</FinanceShell>;
}
