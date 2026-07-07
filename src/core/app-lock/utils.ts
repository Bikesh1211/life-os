const STORAGE_PREFIX = "life-os:app-lock";

export const STORAGE_KEYS = {
  pin: `${STORAGE_PREFIX}:pin`,
  enabled: `${STORAGE_PREFIX}:enabled`,
  timeoutMin: `${STORAGE_PREFIX}:timeout-min`,
  disabledUntil: `${STORAGE_PREFIX}:disabled-until`,
} as const;

export const DEFAULT_TIMEOUT_MIN = 5;
export const TIMEOUT_OPTIONS = [1, 5, 15, 30] as const;
export const DISABLE_DURATIONS = [
  { label: "5 minutes", value: 5 },
  { label: "30 minutes", value: 30 },
  { label: "1 hour", value: 60 },
  { label: "Until I close this tab", value: -1 },
] as const;
export const MIN_PIN_LENGTH = 6;

export async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveToStorage(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function removeFromStorage(key: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(key);
  } catch {}
}
