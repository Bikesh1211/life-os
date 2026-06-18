"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { createBrowserSupabaseClient } from "@/core/supabase/browser";

type SupabaseContext = {
  supabase: ReturnType<typeof createBrowserSupabaseClient>;
  session: Session | null;
  user: User | null;
  isLoading: boolean;
};

const Context = createContext<SupabaseContext | undefined>(undefined);

let supabaseInstance: ReturnType<typeof createBrowserSupabaseClient> | null = null;

function getSupabase() {
  if (!supabaseInstance) {
    supabaseInstance = createBrowserSupabaseClient();
  }
  return supabaseInstance;
}

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const supabase = getSupabase();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      setIsLoading(false);
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  return (
    <Context.Provider value={{ supabase, session, user, isLoading }}>
      {children}
    </Context.Provider>
  );
}

export function useSupabase() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("useSupabase must be used within SupabaseProvider");
  return ctx;
}
