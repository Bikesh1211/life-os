"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { IconChevronRight } from "@tabler/icons-react";
import { cn } from "@/core/utils";
import { SidebarItemLink } from "./SidebarItem";
import { SidebarItemParent } from "./SidebarItemParent";
import type { NavGroup } from "@/core/navigation";

type SidebarGroupSectionProps = {
  group: NavGroup;
  collapsed?: boolean;
};

export function SidebarGroupSection({
  group,
  collapsed = false,
}: SidebarGroupSectionProps) {
  const pathname = usePathname();
  const hasActiveItem = group.items.some((item) => {
    if (pathname === item.route || pathname.startsWith(item.route + "/"))
      return true;
    return (
      item.children?.some(
        (c) => pathname === c.route || pathname.startsWith(c.route + "/"),
      ) ?? false
    );
  });

  const [open, setOpen] = useState(hasActiveItem);

  if (collapsed) {
    return (
      <div className="py-1 space-y-0.5">
        {group.items.map((item) =>
          item.children ? (
            <SidebarItemParent key={item.featureId} item={item} collapsed />
          ) : (
            <SidebarItemLink key={item.featureId} item={item} collapsed />
          ),
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="px-3 pt-3 pb-0.5">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1.5 text-left transition-colors group hover:opacity-80 w-full"
        >
          <IconChevronRight
            size={9}
            strokeWidth={1.5}
            className={cn(
              "flex-shrink-0 transition-transform duration-200",
              open && "rotate-90",
              "text-gray-400 dark:text-gray-500",
            )}
          />
          <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400 dark:text-gray-500 cursor-pointer">
            {group.label}
          </span>
        </button>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="group-children"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-0.5 space-y-0.5">
              {group.items.map((item) =>
                item.children ? (
                  <SidebarItemParent key={item.featureId} item={item} />
                ) : (
                  <SidebarItemLink key={item.featureId} item={item} />
                ),
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
