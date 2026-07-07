"use client";

import { useAppLock } from "./use-app-lock";
import { LockScreen } from "./lock-screen";

export function AppLockGate({ children }: { children: React.ReactNode }) {
  useAppLock();
  return (
    <>
      <LockScreen />
      {children}
    </>
  );
}
