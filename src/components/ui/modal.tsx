"use client";

import { Modal as MantineModal, type ModalProps as MantineModalProps } from "@mantine/core";
import { cn } from "@/core/utils";

export interface PremiumModalProps extends MantineModalProps {
  size?: MantineModalProps["size"];
}

export function PremiumModal({
  className,
  children,
  size = "lg",
  ...props
}: PremiumModalProps) {
  return (
    <MantineModal
      size={size}
      className={cn(className)}
      {...props}
    >
      {children}
    </MantineModal>
  );
}
