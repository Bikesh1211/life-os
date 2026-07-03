"use client";

import { Badge as MantineBadge, type BadgeProps as MantineBadgeProps } from "@mantine/core";
import { cn } from "@/core/utils";

export interface PremiumBadgeProps extends MantineBadgeProps {
  dot?: boolean;
}

const dotColors: Record<string, string> = {
  blue: "bg-blue-500",
  green: "bg-green-500",
  red: "bg-red-500",
  yellow: "bg-yellow-500",
  violet: "bg-violet-500",
  cyan: "bg-cyan-500",
  teal: "bg-teal-500",
  pink: "bg-pink-500",
  gray: "bg-gray-400 dark:bg-gray-500",
};

export function PremiumBadge({ dot, color = "gray", className, children, ...props }: PremiumBadgeProps) {
  return (
    <MantineBadge
      color={color}
      className={cn(
        "font-medium uppercase tracking-wider text-[10px] px-2.5 py-1",
        dot && "pl-2",
        className,
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            "inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle",
            dotColors[color] ?? dotColors.gray,
          )}
        />
      )}
      {children}
    </MantineBadge>
  );
}
