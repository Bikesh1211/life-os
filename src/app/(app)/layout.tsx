import { AppShellNavbarProvider } from "./AppShellProvider";
import { AppShellInner } from "./AppShellInner";

export const dynamic = "force-dynamic";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShellNavbarProvider>
      <AppShellInner>{children}</AppShellInner>
    </AppShellNavbarProvider>
  );
}
