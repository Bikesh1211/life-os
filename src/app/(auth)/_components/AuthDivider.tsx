"use client";

export function AuthDivider() {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-[var(--mantine-color-default-border)]" />
      </div>
      <div className="relative flex justify-center text-xs">
        <span
          className="px-3 text-[var(--mantine-color-dimmed)]"
          style={{ backgroundColor: "var(--mantine-color-body)" }}
        >
          or continue with
        </span>
      </div>
    </div>
  );
}
