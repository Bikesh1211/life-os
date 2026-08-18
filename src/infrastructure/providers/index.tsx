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
import { SupabaseProvider, useSupabase } from "./supabase-provider";

/**
 * See ADR-0011. The client query cache is not user-namespaced (keys are
 * module-scoped), and LifeOS auth transitions are client-side soft
 * navigations, so without this the previous user's cached responses could
 * render for the next user until a background refetch happened to overwrite
 * them. Wipe the whole cache whenever the session's effective `user.id`
 * changes. Must live inside QueryClientProvider to reach the query client.
 */
function AuthCacheGuard() {
  const queryClient = useQueryClient();
  const { user } = useSupabase();
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
    <SupabaseProvider>
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
    </SupabaseProvider>
  );
}
