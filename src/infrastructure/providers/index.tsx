"use client";

import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { useRef, useState, type ReactNode } from "react";
import { theme } from "@/core/design-system";
import { createQueryClient } from "@/infrastructure/cache/query-client";
import { ServiceWorkerRegister } from "./ServiceWorkerRegister";
import { PrefetchProvider } from "./PrefetchProvider";
import { CommandPalette } from "@/components/CommandPalette";
import { AuthProvider, useAuth } from "./auth-provider";

function AuthCacheGuard() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const lastUserId = useRef<string | null>(null);

  const currentId = user?.id ?? null;
  if (currentId !== lastUserId.current) {
    lastUserId.current = currentId;
    queryClient.clear();
  }

  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <AuthCacheGuard />
        <PrefetchProvider>
          <MantineProvider theme={theme} defaultColorScheme="auto">
            <Notifications position="top-center" containerWidth={400} zIndex={9999} />
            <ServiceWorkerRegister />
            <CommandPalette />
            {children}
          </MantineProvider>
        </PrefetchProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}
