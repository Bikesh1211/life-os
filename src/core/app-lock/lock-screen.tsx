"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  STORAGE_KEYS,
  MIN_PIN_LENGTH,
  DISABLE_DURATIONS,
  hashPin,
  loadFromStorage,
  saveToStorage,
  removeFromStorage,
} from "./utils";
import { useAppLockStore } from "./store";

const MAX_PIN_LENGTH = 10;

function Dot({ filled }: { filled: boolean }) {
  return (
    <span
      className={`inline-block h-3 w-3 rounded-full transition-all duration-150 ${
        filled ? "bg-white scale-100" : "bg-white/30 scale-75"
      }`}
    />
  );
}

function Key({ value, onPress, onDelete }: { value: string; onPress: (v: string) => void; onDelete?: () => void }) {
  if (value === "delete") {
    return (
      <button
        type="button"
        onClick={onDelete}
        className="flex h-16 w-16 items-center justify-center rounded-full text-xl text-white/70 hover:bg-white/10 active:bg-white/20 transition-colors sm:h-20 sm:w-20 sm:text-2xl"
        aria-label="Delete"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
          <line x1="18" y1="9" x2="12" y2="15" />
          <line x1="12" y1="9" x2="18" y2="15" />
        </svg>
      </button>
    );
  }

  if (value === "empty") {
    return <div className="h-16 w-16 sm:h-20 sm:w-20" />;
  }

  return (
    <button
      type="button"
      onClick={() => onPress(value)}
      className="flex h-16 w-16 items-center justify-center rounded-full text-2xl font-light text-white hover:bg-white/10 active:bg-white/20 transition-colors sm:h-20 sm:w-20 sm:text-3xl"
      aria-label={value}
    >
      {value}
    </button>
  );
}

function CreatePinFlow({ onComplete }: { onComplete: () => void }) {
  const [first, setFirst] = useState("");
  const [second, setSecond] = useState("");
  const [step, setStep] = useState<"first" | "second">("first");
  const [error, setError] = useState("");
  const firstRef = useRef(first);
  firstRef.current = first;

  const handlePress = useCallback(
    async (v: string) => {
      setError("");
      if (step === "first") {
        const next = first + v;
        if (next.length > MAX_PIN_LENGTH) return;
        setFirst(next);
        if (next.length >= MIN_PIN_LENGTH) {
          setStep("second");
        }
      } else {
        const next = second + v;
        if (next.length > MAX_PIN_LENGTH) return;
        setSecond(next);
        if (next.length >= MIN_PIN_LENGTH && next.length === firstRef.current.length) {
          if (next === firstRef.current) {
            const hashed = await hashPin(next);
            saveToStorage(STORAGE_KEYS.pin, hashed);
            saveToStorage(STORAGE_KEYS.enabled, true);
            onComplete();
          } else {
            setError("PINs don't match");
            setSecond("");
          }
        }
      }
    },
    [step, first, second, onComplete],
  );

  const handleDelete = useCallback(() => {
    setError("");
    if (step === "first") {
      setFirst((p) => p.slice(0, -1));
    } else {
      setSecond((p) => p.slice(0, -1));
    }
  }, [step]);

  const currentPin = step === "first" ? first : second;
  const label = step === "first" ? "Create your PIN" : "Confirm your PIN";

  return (
    <div className="flex flex-col items-center gap-8">
      <p className="text-lg text-white/80">{label}</p>
      <div className="flex gap-3">
        {Array.from({ length: MIN_PIN_LENGTH }).map((_, i) => (
          <Dot key={i} filled={i < currentPin.length} />
        ))}
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "empty", "0", "delete"].map((k) => (
          <Key key={k} value={k} onPress={handlePress} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
}

function UnlockFlow() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [showDisableOptions, setShowDisableOptions] = useState(false);
  const setLocked = useAppLockStore((s) => s.setLocked);

  const handlePress = useCallback(
    async (v: string) => {
      setError("");
      const next = pin + v;
      if (next.length > MAX_PIN_LENGTH) return;
      setPin(next);
      if (next.length >= MIN_PIN_LENGTH) {
        const stored = loadFromStorage(STORAGE_KEYS.pin, "");
        const hashed = await hashPin(next);
        if (hashed === stored) {
          setLocked(false);
          setPin("");
        } else {
          setError("Wrong PIN");
          setPin("");
        }
      }
    },
    [pin, setLocked],
  );

  const handleDelete = useCallback(() => {
    setError("");
    setPin((p) => p.slice(0, -1));
  }, []);

  const handleDisable = useCallback(
    (durationMin: number) => {
      const disabledUntil =
        durationMin === -1
          ? "tab-close"
          : new Date(Date.now() + durationMin * 60 * 1000).toISOString();
      saveToStorage(STORAGE_KEYS.disabledUntil, disabledUntil);
      setLocked(false);
      setPin("");
      setShowDisableOptions(false);
    },
    [setLocked],
  );

  return (
    <div className="flex flex-col items-center gap-8">
      <p className="text-lg text-white/80">Enter PIN</p>
      <div className="flex gap-3">
        {Array.from({ length: MIN_PIN_LENGTH }).map((_, i) => (
          <Dot key={i} filled={i < pin.length} />
        ))}
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "empty", "0", "delete"].map((k) => (
          <Key key={k} value={k} onPress={handlePress} onDelete={handleDelete} />
        ))}
      </div>

      {showDisableOptions && (
        <div className="flex flex-wrap justify-center gap-2">
          {DISABLE_DURATIONS.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => handleDisable(d.value)}
              className="rounded-lg border border-white/20 px-3 py-1.5 text-sm text-white/70 hover:bg-white/10 transition-colors"
            >
              {d.label}
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowDisableOptions((v) => !v)}
        className="text-sm text-white/50 hover:text-white/80 transition-colors"
      >
        {showDisableOptions ? "Hide" : "Keep unlocked for a while"}
      </button>
    </div>
  );
}

export function LockScreen() {
  const isLocked = useAppLockStore((s) => s.isLocked);
  const isInitialized = useAppLockStore((s) => s.isInitialized);
  const enabled = useAppLockStore((s) => s.enabled);
  const setEnabled = useAppLockStore((s) => s.setEnabled);
  const [needsSetup, setNeedsSetup] = useState(false);

  useEffect(() => {
    if (!isInitialized) return;
    const hasPin = loadFromStorage(STORAGE_KEYS.pin, "");
    if (enabled && !hasPin) {
      setNeedsSetup(true);
    } else {
      setNeedsSetup(false);
    }
  }, [isInitialized, enabled]);

  const handleSetupComplete = useCallback(() => {
    setNeedsSetup(false);
    useAppLockStore.getState().setLocked(false);
  }, []);

  const handleDisablePermanent = useCallback(() => {
    setEnabled(false);
    removeFromStorage(STORAGE_KEYS.pin);
    useAppLockStore.getState().setLocked(false);
  }, [setEnabled]);

  if (!isInitialized) return null;
  if (!enabled && !needsSetup) return null;
  if (!isLocked && !needsSetup) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gray-950">
      <div className="mb-12 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-white">Life OS</h1>
      </div>

      {needsSetup ? (
        <CreatePinFlow onComplete={handleSetupComplete} />
      ) : (
        <UnlockFlow />
      )}

      {needsSetup && (
        <button
          type="button"
          onClick={handleDisablePermanent}
          className="mt-8 text-sm text-white/50 hover:text-white/80 transition-colors"
        >
          Cancel — don't lock the app
        </button>
      )}
    </div>
  );
}
