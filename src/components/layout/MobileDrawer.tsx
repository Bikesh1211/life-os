"use client";

import { useEffect, useCallback, useRef, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const drawerVariants = {
  hidden: { x: "-100%" },
  visible: {
    x: 0,
    transition: { type: "spring", stiffness: 300, damping: 30, mass: 0.8 },
  },
  exit: {
    x: "-100%",
    transition: { type: "spring", stiffness: 400, damping: 35, mass: 0.8 },
  },
};

type MobileDrawerProps = {
  opened: boolean;
  onClose: () => void;
  children: ReactNode;
};

export function MobileDrawer({ opened, onClose, children }: MobileDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (opened) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [opened, handleKeyDown]);

  return (
    <AnimatePresence>
      {opened && (
        <>
          <motion.div
            key="drawer-backdrop"
            className="fixed inset-0 z-[201]"
            style={{
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            ref={drawerRef}
            key="drawer-panel"
            className="fixed left-0 top-0 z-[201] h-full overflow-y-auto"
            style={{
              width: "min(80%, 320px)",
              background: "var(--mantine-color-body)",
              borderRight: "1px solid var(--mantine-color-default-border)",
              boxShadow: "4px 0 32px rgba(0,0,0,0.3)",
              paddingTop: 56,
            }}
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
