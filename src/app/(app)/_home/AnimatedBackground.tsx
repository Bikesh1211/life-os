"use client";

import { useEffect, useState } from "react";
import { useComputedColorScheme } from "@mantine/core";

export function AnimatedBackground() {
  const scheme = useComputedColorScheme();
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener("mousemove", handle);
    return () => window.removeEventListener("mousemove", handle);
  }, []);

  const isDark = scheme === "dark";

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Base gradient */}
      <div
        className={`absolute inset-0 transition-colors duration-700 ${
          isDark
            ? "bg-[#070714]"
            : "bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50/20"
        }`}
      />

      {/* Large animated gradient blob 1 */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full blur-[120px] opacity-[0.12] dark:opacity-[0.08] transition-all duration-1000"
        style={{
          background: isDark
            ? "radial-gradient(circle, #6366f1, #8b5cf6, transparent)"
            : "radial-gradient(circle, #818cf8, #a78bfa, transparent)",
          left: `${mousePos.x * 40 + 10}%`,
          top: `${mousePos.y * 30 + 5}%`,
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Blob 2 */}
      <div
        className="absolute w-[400px] h-[400px] rounded-full blur-[100px] opacity-[0.08] dark:opacity-[0.06] transition-all duration-1500"
        style={{
          background: isDark
            ? "radial-gradient(circle, #3b82f6, #06b6d4, transparent)"
            : "radial-gradient(circle, #93c5fd, #67e8f9, transparent)",
          right: `${100 - mousePos.x * 30}%`,
          bottom: `${mousePos.y * 30 + 5}%`,
          transform: "translate(50%, 50%)",
        }}
      />

      {/* Blob 3 */}
      <div
        className="absolute w-[300px] h-[300px] rounded-full blur-[80px] opacity-[0.06] dark:opacity-[0.04] transition-all duration-1200"
        style={{
          background: isDark
            ? "radial-gradient(circle, #f472b6, #a855f7, transparent)"
            : "radial-gradient(circle, #f9a8d4, #c084fc, transparent)",
          left: `${mousePos.y * 50 + 20}%`,
          bottom: `${(1 - mousePos.x) * 30}%`,
          transform: "translate(-50%, 50%)",
        }}
      />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse 60% 50% at 50% 50%, black 20%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse 60% 50% at 50% 50%, black 20%, transparent 70%)",
        }}
      />

      {/* Floating particles */}
      <Particles isDark={isDark} />
    </div>
  );
}

function Particles({ isDark }: { isDark: boolean }) {
  return (
    <div className="absolute inset-0">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 3 + 1,
            height: Math.random() * 3 + 1,
            background: isDark ? "rgba(255,255,255,0.15)" : "rgba(59,130,246,0.12)",
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `homeParticleFloat ${Math.random() * 10 + 15}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}
    </div>
  );
}