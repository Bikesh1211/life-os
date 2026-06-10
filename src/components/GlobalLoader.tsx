"use client";

import { useEffect, useRef, useState } from "react";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";

function ProgressBar() {
  const [visible, setVisible] = useState(false);
  const progress = useMotionValue(0);
  const smoothProgress = useSpring(progress, { stiffness: 100, damping: 30, mass: 0.5 });
  const width = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);
  const opacity = useTransform(smoothProgress, [0.9, 1], [1, 0]);

  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const isActive = isFetching > 0 || isMutating > 0;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isActive) {
      setVisible(true);
      progress.set(0.3);
    } else {
      progress.set(1);
      timerRef.current = setTimeout(() => {
        setVisible(false);
        progress.set(0);
      }, 400);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isActive, progress]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none"
        >
          <div className="relative h-[3px] w-full overflow-hidden">
            {/* Glow underneath */}
            <motion.div
              className="absolute inset-0"
              style={{
                width,
                opacity,
              }}
            >
              <div
                className="h-full w-full rounded-full"
                style={{
                  background: "linear-gradient(90deg, #3b82f6, #6366f1, #8b5cf6)",
                  boxShadow: "0 0 10px rgba(59,130,246,0.4), 0 0 20px rgba(99,102,241,0.2)",
                }}
              />
            </motion.div>

            {/* Shimmer overlay */}
            <motion.div
              className="absolute inset-0 w-[200px]"
              style={{
                width,
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                transform: "skewX(-20deg)",
              }}
              animate={{
                x: [0, 400],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function GlobalLoader() {
  return <ProgressBar />;
}
