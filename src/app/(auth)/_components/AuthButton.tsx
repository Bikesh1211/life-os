"use client";

import { type ButtonHTMLAttributes } from "react";

type AuthButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
};

export function AuthButton({ loading, children, className, disabled, ...props }: AuthButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className="relative w-full rounded-xl py-3 text-sm font-semibold text-white transition-all duration-200
        bg-gradient-to-br from-blue-500 to-blue-700
        shadow-lg shadow-blue-500/25
        hover:shadow-xl hover:shadow-blue-500/30 hover:brightness-110
        active:scale-[0.98]
        focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/40
        disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:brightness-100 disabled:active:scale-100"
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
