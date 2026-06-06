import { AppShell, AppShellMain } from "@mantine/core";
import { Sidebar, Header } from "@/components/layout";
import { AppShellNavbarProvider } from "./AppShellProvider";

export const dynamic = "force-dynamic";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShellNavbarProvider>
      <AppShell
        padding="md"
        navbar={{ width: 280, breakpoint: "sm", collapsed: { mobile: false } }}
        header={{ height: 56 }}
      >
        <Header />
        <Sidebar />
        <AppShellMain>{children}</AppShellMain>
      </AppShell>
    </AppShellNavbarProvider>
  );
}
