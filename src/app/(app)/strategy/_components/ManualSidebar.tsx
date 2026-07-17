"use client";

import { memo } from "react";
import { NavLink, Text, useComputedColorScheme } from "@mantine/core";
import {
  IconDashboard,
  IconUser,
  IconHeart,
  IconCompass,
  IconMoodSmile,
  IconMoodSad,
  IconEye,
  IconScale,
  IconFence,
  IconBolt,
  IconBriefcase,
  IconNotes,
  IconCalendarTime,
  IconVersions,
} from "@tabler/icons-react";

type NavEntry = {
  label: string;
  section: string;
  icon: React.ComponentType<any>;
};

const navGroups: { label: string; items: NavEntry[] }[] = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", section: "dashboard", icon: IconDashboard }],
  },
  {
    label: "Identity",
    items: [{ label: "About Me", section: "about_me", icon: IconUser }],
  },
  {
    label: "Values & Principles",
    items: [
      { label: "Core Values", section: "core_values", icon: IconHeart },
      { label: "Life Principles", section: "life_principles", icon: IconCompass },
    ],
  },
  {
    label: "Self-Awareness",
    items: [
      { label: "Strengths", section: "strengths", icon: IconMoodSmile },
      { label: "Weaknesses", section: "weaknesses", icon: IconMoodSad },
      { label: "Energy Patterns", section: "energy_patterns", icon: IconBolt },
    ],
  },
  {
    label: "Direction",
    items: [
      { label: "Long-Term Vision", section: "long_term_vision", icon: IconEye },
      { label: "Work Style", section: "work_style", icon: IconBriefcase },
    ],
  },
  {
    label: "Rules & Boundaries",
    items: [
      { label: "Rules", section: "rules", icon: IconScale },
      { label: "Boundaries", section: "boundaries", icon: IconFence },
    ],
  },
  {
    label: "Reflection",
    items: [{ label: "Reflection Notes", section: "reflection_notes", icon: IconNotes }],
  },
  {
    label: "Settings",
    items: [
      { label: "Review Schedule", section: "review_schedule", icon: IconCalendarTime },
      { label: "Version History", section: "versions", icon: IconVersions },
    ],
  },
];

type Props = {
  activeSection: string;
  onSectionChange: (section: string) => void;
};

export const ManualSidebar = memo(function ManualSidebar({ activeSection, onSectionChange }: Props) {
  const isDark = useComputedColorScheme() === "dark";

  return (
    <nav
      style={{
        width: 260,
        flexShrink: 0,
        borderRight: `1px solid ${isDark ? "#373A40" : "#dee2e6"}`,
        paddingRight: 12,
        overflowY: "auto",
      }}
    >
      {navGroups.map((group) => (
        <div key={group.label} style={{ marginBottom: 8 }}>
          <Text size="xs" tt="uppercase" c="dimmed" fw={600} mb={4} px={8}>
            {group.label}
          </Text>
          {group.items.map((item) => (
            <NavLink
              key={item.section}
              label={item.label}
              leftSection={<item.icon size={18} />}
              active={activeSection === item.section}
              onClick={() => onSectionChange(item.section)}
              variant="light"
              style={{ borderRadius: 8 }}
              pb={4}
              pt={4}
            />
          ))}
        </div>
      ))}
    </nav>
  );
});
