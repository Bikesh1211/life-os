import { AppShellNavbarProvider } from "./AppShellProvider";
import { AppShellInner } from "./AppShellInner";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShellNavbarProvider>
      <AppShellInner>{children}</AppShellInner>
    </AppShellNavbarProvider>
  );
}
