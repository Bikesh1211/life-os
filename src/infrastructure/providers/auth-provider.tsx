"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
}

type AuthContext = {
  user: AuthUser | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
};

const Context = createContext<AuthContext | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user ?? null);
        }
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();
  }, []);

  const signOut = async () => {
    setUser(null);
    window.location.replace("/sign-in");
    try {
      await fetch("/api/auth/sign-out", { method: "POST", keepalive: true });
    } catch {
    }
  };

  return (
    <Context.Provider value={{ user, isLoading, signOut }}>
      {children}
    </Context.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
