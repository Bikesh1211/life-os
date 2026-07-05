"use client";

import { Button as MantineButton } from "@mantine/core";
import { cn } from "@/core/utils";

export function PremiumButton({
  isGradient = false,
  className,
  children,
  ...props
}: {
  isGradient?: boolean;
  className?: string;
  children?: React.ReactNode;
} & Record<string, any>) {
  if (isGradient) {
    return (
      <MantineButton
        className={cn(
          "bg-gradient-to-r from-blue-600 to-violet-600 text-white",
          "hover:from-blue-500 hover:to-violet-500",
          "shadow-sm hover:shadow-md",
          "active:scale-[0.98] transition-all duration-150",
          "border-0",
          className,
        )}
        {...props}
      >
        {children}
      </MantineButton>
    );
  }

  return (
    <MantineButton
      className={cn(
        "active:scale-[0.98] transition-all duration-150",
        className,
      )}
      {...props}
    >
      {children}
    </MantineButton>
  );
}
