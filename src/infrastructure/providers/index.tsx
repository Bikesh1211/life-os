"use client";

import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { theme } from "@/core/design-system";
import { ServiceWorkerRegister } from "./ServiceWorkerRegister";
import { PrefetchProvider } from "./PrefetchProvider";
import { CommandPalette } from "@/components/CommandPalette";
import { SupabaseProvider } from "./supabase-provider";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            gcTime: 5 * 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <SupabaseProvider>
      <QueryClientProvider client={queryClient}>
        <PrefetchProvider>
          <MantineProvider theme={theme} defaultColorScheme="auto">
            <Notifications position="top-center" containerWidth={400} zIndex={9999} />
            <ServiceWorkerRegister />
            <CommandPalette />
            {children}
          </MantineProvider>
        </PrefetchProvider>
      </QueryClientProvider>
    </SupabaseProvider>
  );
}
