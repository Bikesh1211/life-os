import { FinanceShell } from "./_components/FinanceShell";

export default function FinanceLayout({ children }: { children: React.ReactNode }) {
  return <FinanceShell>{children}</FinanceShell>;
}
