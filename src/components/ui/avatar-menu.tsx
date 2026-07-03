"use client";

import { Avatar as MantineAvatar, type AvatarProps as MantineAvatarProps } from "@mantine/core";
import { cn } from "@/core/utils";

export interface PremiumAvatarProps extends MantineAvatarProps {
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "w-7 h-7 text-xs",
  md: "w-9 h-9 text-sm",
  lg: "w-11 h-11 text-base",
  xl: "w-14 h-14 text-lg",
};

export function PremiumAvatar({ size = "md", className, ...props }: PremiumAvatarProps) {
  return (
    <MantineAvatar
      className={cn("rounded-full ring-2 ring-white dark:ring-dark-surface", sizeClasses[size], className)}
      size={size}
      {...props}
    >
      {props.children}
    </MantineAvatar>
  );
}
