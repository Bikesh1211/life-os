"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { IconTimelineEvent, IconHome2, IconPencilBolt, IconUser, IconCoin } from "@tabler/icons-react";
import { motion } from "framer-motion";
import { useAppShell } from "@/app/(app)/AppShellProvider";

interface Tab {
  id: string;
  label: string;
  href: string;
  icon: typeof IconHome2;
}

const tabs: Tab[] = [
  { id: "dashboard", label: "Home", href: "/", icon: IconHome2 },
  { id: "finance", label: "Finance", href: "/finance/dashboard", icon: IconCoin },
  { id: "quick_note", label: "Quick Note", href: "/quick-note", icon: IconPencilBolt },
  { id: "profile", label: "Timeline", href: "/timeline", icon: IconTimelineEvent },
  { id: "profile", label: "Profile", href: "/settings", icon: IconUser },

];

function useActiveTab(pathname: string) {
  return useMemo(() => {
    for (const t of tabs) {
      if (t.href === "/" && pathname === "/") return t.id;
      if (t.href !== "/" && pathname.startsWith(t.href)) return t.id;
    }
    return undefined;
  }, [pathname]);
}

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { toggleMobile } = useAppShell();
  const activeTab = useActiveTab(pathname);

  const onNavigate = useCallback((href: string) => {
    router.push(href);
  }, [router]);

  return (
    <nav className="mobile-nav" role="tablist" aria-label="Main navigation">
      <div className="mobile-nav-inner">
        <div className="mobile-nav-grid">
          {/* <motion.button
            onClick={toggleMobile}
            className="mobile-nav-btn"
            whileTap={{ scale: 0.92 }}
            aria-label="Open navigation menu"
          >
            <IconMenu2 size={22} strokeWidth={1.75} />
          </motion.button> */}

          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <motion.button
                key={tab.id}
                onClick={() => onNavigate(tab.href)}
                className="mobile-nav-btn"
                whileTap={{ scale: 0.96 }}
                aria-label={tab.label}
                aria-current={isActive ? "page" : undefined}
                role="tab"
              >
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 1.75}
                  className={isActive ? "mobile-nav-icon-active" : "mobile-nav-icon"}
                />
                {isActive && <div className="mobile-nav-dot" />}
              </motion.button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
