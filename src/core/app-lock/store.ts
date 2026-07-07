"use client";

import { create } from "zustand";
import {
  STORAGE_KEYS,
  DEFAULT_TIMEOUT_MIN,
  loadFromStorage,
  saveToStorage,
} from "./utils";

type AppLockStore = {
  isLocked: boolean;
  isInitialized: boolean;
  enabled: boolean;
  timeoutMin: number;

  setLocked: (v: boolean) => void;
  setInitialized: (v: boolean) => void;
  setEnabled: (v: boolean) => void;
  setTimeoutMin: (v: number) => void;
  initialize: () => void;
};

export const useAppLockStore = create<AppLockStore>((set) => ({
  isLocked: true,
  isInitialized: false,
  enabled: loadFromStorage(STORAGE_KEYS.enabled, false),
  timeoutMin: loadFromStorage(STORAGE_KEYS.timeoutMin, DEFAULT_TIMEOUT_MIN),

  setLocked: (isLocked) => set({ isLocked }),
  setInitialized: (isInitialized) => set({ isInitialized }),
  setEnabled: (enabled) => {
    saveToStorage(STORAGE_KEYS.enabled, enabled);
    set({ enabled });
  },
  setTimeoutMin: (timeoutMin) => {
    saveToStorage(STORAGE_KEYS.timeoutMin, timeoutMin);
    set({ timeoutMin });
  },
  initialize: () => {
    const enabled = loadFromStorage(STORAGE_KEYS.enabled, false);
    const disabledUntil = loadFromStorage(STORAGE_KEYS.disabledUntil, "");
    const isExpired =
      disabledUntil !== "" && Date.now() > new Date(disabledUntil).getTime();
    const isDisabledTemporarily =
      disabledUntil !== "" && !isExpired;
    const shouldLock = enabled && !isDisabledTemporarily;
    set({
      isLocked: shouldLock,
      isInitialized: true,
      enabled,
    });
  },
}));
