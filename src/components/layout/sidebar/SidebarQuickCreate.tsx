"use client";

import { Menu } from "@mantine/core";
import { useRouter } from "next/navigation";
import { IconPlus, IconChecklist, IconNotes, IconBook, IconCoin, IconRepeat, IconLayoutDashboard } from "@tabler/icons-react";

const quickActions = [
  { label: "Task", icon: IconChecklist, route: "/tasks" },
  { label: "Note", icon: IconNotes, route: "/notes" },
  { label: "Journal", icon: IconBook, route: "/journal" },
  { label: "Expense", icon: IconCoin, route: "/finance" },
  { label: "Habit", icon: IconRepeat, route: "/habits" },
  { label: "Dashboard", icon: IconLayoutDashboard, route: "/" },
];

export function SidebarQuickCreate({ collapsed }: { collapsed: boolean }) {
  const router = useRouter();

  const button = (
    <button className="flex items-center justify-center w-full h-9 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm hover:from-blue-400 hover:to-blue-500 active:scale-[0.98] transition-all duration-150 font-semibold gap-2">
      <IconPlus size={16} strokeWidth={2.5} />
      {!collapsed && <span>Quick Create</span>}
    </button>
  );

  if (collapsed) {
    return (
      <div className="px-2 py-0.5">
        <Menu position="right-start" offset={8} withArrow shadow="xl" width={180}>
          <Menu.Target>
            {button}
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>Create</Menu.Label>
            {quickActions.map((action) => (
              <Menu.Item
                key={action.label}
                leftSection={<action.icon size={16} />}
                onClick={() => router.push(action.route)}
              >
                {action.label}
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>
      </div>
    );
  }

  return (
    <div className="px-3 py-0.5">
      <Menu position="bottom-start" offset={4} withArrow shadow="xl" width={200}>
        <Menu.Target>
          {button}
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Label>Create</Menu.Label>
          {quickActions.map((action) => (
            <Menu.Item
              key={action.label}
              leftSection={<action.icon size={16} />}
              onClick={() => router.push(action.route)}
            >
              {action.label}
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      </Menu>
    </div>
  );
}
