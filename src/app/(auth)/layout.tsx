"use client";

import { MantineProvider } from "@mantine/core";
import { theme } from "@/core/design-system";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider theme={theme} forceColorScheme="dark">
      <div className="auth-layout">
        <div className="auth-bg" />
        <div className="auth-blob auth-blob-1" />
        <div className="auth-blob auth-blob-2" />
        <div className="auth-blob auth-blob-3" />
        <div className="auth-grid" />
        {children}
      </div>
    </MantineProvider>
  );
}
