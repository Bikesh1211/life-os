"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { theme } from "@/core/design-system";
import { ServiceWorkerRegister } from "./ServiceWorkerRegister";
import { CommandPalette } from "@/components/CommandPalette";
  const localization = {
    signIn: {
      start: {
        title: "Sign in",
        subtitle: "Welcome back",
      },
    },
  } as const;
export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      }),
  );

  return (
      <ClerkProvider localization={localization}>
      <QueryClientProvider client={queryClient}>
        <MantineProvider theme={theme} defaultColorScheme="auto">
          <Notifications />
          <ServiceWorkerRegister />
          <CommandPalette />
          {children}
        </MantineProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
