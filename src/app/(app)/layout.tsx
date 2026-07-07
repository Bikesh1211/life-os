import { AppShellNavbarProvider } from "./AppShellProvider";
import { AppShellInner } from "./AppShellInner";
import { AppLockGate } from "@/core/app-lock/app-lock-gate";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShellNavbarProvider>
      <AppLockGate>
        <AppShellInner>{children}</AppShellInner>
      </AppLockGate>
    </AppShellNavbarProvider>
  );
}
