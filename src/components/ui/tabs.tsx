"use client";

import { Tabs as MantineTabs, type TabsProps as MantineTabsProps } from "@mantine/core";
import { cn } from "@/core/utils";

export interface PremiumTabsProps extends MantineTabsProps {
  variant?: "default" | "pills" | "outline";
}

export function PremiumTabs({
  variant = "default",
  className,
  children,
  ...props
}: PremiumTabsProps) {
  return (
    <MantineTabs
      variant={variant}
      className={cn(className)}
      {...props}
    >
      {children}
    </MantineTabs>
  );
}

export { MantineTabs as Tabs };
