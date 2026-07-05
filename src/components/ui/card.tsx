"use client";

import { Card as MantineCard, type CardProps as MantineCardProps } from "@mantine/core";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/core/utils";

type CardVariant = "default" | "interactive" | "gradient" | "compact";

export interface PremiumCardProps extends Omit<MantineCardProps, "children"> {
  variant?: CardVariant;
  gradient?: { from: string; to: string };
  motionProps?: HTMLMotionProps<"div">;
  children?: React.ReactNode;
}

const variantStyles: Record<CardVariant, string> = {
  default: "",
  interactive: "cursor-pointer hover:-translate-y-0.5 hover:shadow-card-hover dark:hover:shadow-dark-card-hover",
  gradient: "border-0",
  compact: "p-4",
};

export function PremiumCard({
  variant = "default",
  gradient,
  className,
  children,
  padding,
  motionProps,
  ...props
}: PremiumCardProps) {
  const isGradient = variant === "gradient" && gradient;
  const content = (
    <MantineCard
      className={cn(variantStyles[variant], isGradient && "relative overflow-hidden", className)}
      padding={variant === "compact" ? "md" : padding ?? "lg"}
      {...props}
    >
      {isGradient && (
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
          style={{
            background: `linear-gradient(135deg, ${gradient!.from}, ${gradient!.to})`,
          }}
        />
      )}
      <div className={cn(isGradient && "relative z-0")}>{children}</div>
    </MantineCard>
  );

  if (variant === "interactive") {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        style={{ height: "100%" }}
        {...motionProps}
      >
        {content}
      </motion.div>
    );
  }

  return content;
}
