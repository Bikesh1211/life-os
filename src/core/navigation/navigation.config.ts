import type { TablerIcon } from "@tabler/icons-react";
import {
  IconLayoutDashboard,
  IconTrophy,
  IconPencilBolt,
  IconRss,
  IconChecklist,
  IconCalendarDue,
  IconInbox,
  IconFolder,
  IconFocusCentered,
  IconClock,
  IconCalendar,
  IconDeviceTv,
  IconBook,
  IconBrain,
  IconNotes,
  IconBulb,
  IconGraph,
  IconSchool,
  IconGridPattern,
  IconBooks,
  IconMusic,
  IconMovie,
  IconPackage,
  IconShirt,
  IconDeviceLaptop,
  IconBackpack,
  IconTool,
  IconShoppingCart,
  IconCoin,
  IconArrowsLeftRight,
  IconRepeat,
  IconWallet,
  IconPigMoney,
  IconReportAnalytics,
  IconHeart,
  IconActivity,
  IconRun,
  IconApple,
  IconMoodHappy,
  IconPlane,
  IconRoute,
  IconStar,
  IconTimelineEvent,
  IconFlag,
  IconUsers,
  IconChess,
  IconTarget,
  IconEye,
  IconScale,
  IconShieldLock,
  IconCompass,
  IconSearch,
  IconSun,
  IconMoon,
  IconScissors,
  IconTags,
  IconHourglassEmpty,
  IconBriefcase,
} from "@tabler/icons-react";

export type NavItem = {
  label: string;
  route: string;
  description: string;
  icon: TablerIcon;
  featureId: string;
  children?: NavItem[];
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export function findNavItemByFeatureId(featureId: string): NavItem | undefined {
  for (const group of navigation) {
    for (const item of group.items) {
      if (item.featureId === featureId) return item;
      if (item.children) {
        const child = item.children.find((c) => c.featureId === featureId);
        if (child) return child;
      }
    }
  }
  return undefined;
}

export const navigation: NavGroup[] = [
  {
    label: "Favorites",
    items: [],
  },

  {
    label: "Overview",
    items: [
      {
        label: "Dashboard",
        route: "/",
        description: "Overview of your life",
        icon: IconLayoutDashboard,
        featureId: "dashboard",
      },
      {
        label: "Gamification",
        route: "/gamification",
        description: "XP, levels, achievements & badges",
        icon: IconTrophy,
        featureId: "gamification",
      },
    ],
  },

  {
    label: "Daily Life",
    items: [
      {
        label: "Quick Notes",
        route: "/notes",
        description: "Capture ideas fast",
        icon: IconPencilBolt,
        featureId: "quick_note",
      },
      {
        label: "Journal",
        route: "/journal",
        description: "Daily journal & reflection",
        icon: IconBook,
        featureId: "journal",
      },
      {
        label: "Calendar",
        route: "/calendar",
        description: "Your schedule",
        icon: IconCalendar,
        featureId: "calendar",
      },
      {
        label: "Countdown",
        route: "/countdown",
        description: "Event countdowns & anticipation",
        icon: IconHourglassEmpty,
        featureId: "countdown",
      },
      {
        label: "Routines",
        route: "/routines",
        description: "Daily schedules & routines",
        icon: IconRepeat,
        featureId: "routines",
      },
      {
        label: "Timeline",
        route: "/timeline",
        description: "Life timeline & activity history",
        icon: IconTimelineEvent,
        featureId: "timeline",
      },
      {
        label: "Tasks",
        route: "/tasks",
        description: "Manage your tasks",
        icon: IconChecklist,
        featureId: "tasks",
      },
      {
        label: "Time",
        route: "/time",
        description: "Time tracking & productivity",
        icon: IconClock,
        featureId: "time",
      },
    ],
  },

  {
    label: "Knowledge & Creation",
    items: [
      {
        label: "Brain",
        route: "/brain",
        description: "Knowledge management",
        icon: IconBrain,
        featureId: "brain",
        children: [
          {
            label: "Ideas",
            route: "/brain",
            description: "Idea board",
            icon: IconBulb,
            featureId: "ideas",
          },
          {
            label: "Graph View",
            route: "/brain?tab=graph-view",
            description: "Knowledge graph",
            icon: IconGraph,
            featureId: "graph_view",
          },
        ],
      },
      {
        label: "Knowledge Vault",
        route: "/knowledge",
        description: "Capture & organize learning",
        icon: IconSchool,
        featureId: "knowledge",
      },
      {
        label: "Learning",
        route: "/learning",
        description: "Learning hub",
        icon: IconSchool,
        featureId: "learning",
        children: [
          {
            label: "Skill Matrix",
            route: "/learning/skill-matrix",
            description: "Track your skills",
            icon: IconGridPattern,
            featureId: "skill_matrix",
          },
          {
            label: "Courses",
            route: "/learning/courses",
            description: "Your courses",
            icon: IconBooks,
            featureId: "courses",
          },
        ],
      },
      {
        label: "Creator Studio",
        route: "/creator-studio",
        description: "Write articles, blog posts, vlog scripts & books",
        icon: IconDeviceTv,
        featureId: "creator_studio",
      },
      {
        label: "Library",
        route: "/library",
        description: "Your digital library",
        icon: IconBooks,
        featureId: "library",
      },
    ],
  },

  {
    label: "Media & Memories",
    items: [
      {
        label: "Music",
        route: "/music",
        description: "Music memories & discovery",
        icon: IconMusic,
        featureId: "music",
      },
      {
        label: "Movies",
        route: "/movies",
        description: "Movie & TV memories",
        icon: IconMovie,
        featureId: "movies",
      },
      {
        label: "Discovery Feed",
        route: "/discovery-feed",
        description: "Explore and discover",
        icon: IconRss,
        featureId: "discovery_feed",
      },
    ],
  },

  {
    label: "Finance & Assets",
    items: [
      {
        label: "Finance",
        route: "/finance",
        description: "Financial overview and management",
        icon: IconCoin,
        featureId: "finance",
      },
      {
        label: "Inventory",
        route: "/inventory",
        description: "Track your belongings",
        icon: IconPackage,
        featureId: "inventory",
        children: [
          {
            label: "Wardrobe",
            route: "/inventory/wardrobe",
            description: "Clothing inventory",
            icon: IconShirt,
            featureId: "wardrobe",
          },
          {
            label: "Tech Gear",
            route: "/inventory/tech-gear",
            description: "Technology gear",
            icon: IconDeviceLaptop,
            featureId: "tech_gear",
          },
          {
            label: "Everyday Carry",
            route: "/inventory/everyday-carry",
            description: "Daily carry items",
            icon: IconBackpack,
            featureId: "everyday_carry",
          },
          {
            label: "Maintenance",
            route: "/inventory/maintenance",
            description: "Item maintenance",
            icon: IconTool,
            featureId: "maintenance",
          },
        ],
      },
      {
        label: "Purchases",
        route: "/purchases",
        description: "Purchase history",
        icon: IconShoppingCart,
        featureId: "purchases",
      },
    ],
  },

  {
    label: "Health & Lifestyle",
    items: [
      {
        label: "Habits",
        route: "/habits",
        description: "Track your habits",
        icon: IconRepeat,
        featureId: "habits",
      },
      {
        label: "Health",
        route: "/health",
        description: "Health tracking",
        icon: IconHeart,
        featureId: "health",
      },
      {
        label: "Mindset",
        route: "/mindset",
        description: "Mindfulness & reflection",
        icon: IconMoodHappy,
        featureId: "mindset",
      },
      {
        label: "Wellness",
        route: "/wellness",
        description: "Mood, sleep, hydration & self-care",
        icon: IconSun,
        featureId: "wellness",
        children: [
          {
            label: "Grooming",
            route: "/wellness/grooming",
            description: "Grooming & self-care routines",
            icon: IconScissors,
            featureId: "grooming",
          },
          {
            label: "Sleep",
            route: "/wellness/sleep",
            description: "Sleep tracking, analytics & insights",
            icon: IconMoon,
            featureId: "sleep",
          },
        ],
      },
      {
        label: "Travel",
        route: "/travel",
        description: "Plan, track & remember your travels",
        icon: IconPlane,
        featureId: "travel",
      },
    ],
  },

  {
    label: "Life Management",
    items: [
      {
        label: "Goals",
        route: "/goals",
        description: "Your goals",
        icon: IconTarget,
        featureId: "goals",
      },
      {
        label: "Strategy",
        route: "/strategy",
        description: "Life strategy",
        icon: IconChess,
        featureId: "strategy",
        children: [
          {
            label: "Vision",
            route: "/strategy/vision",
            description: "Life vision",
            icon: IconEye,
            featureId: "vision",
          },
          {
            label: "Decisions",
            route: "/strategy/decisions",
            description: "Decision log",
            icon: IconScale,
            featureId: "decisions",
          },
          {
            label: "Principles",
            route: "/strategy/principles",
            description: "Life principles",
            icon: IconCompass,
            featureId: "principles",
          },
        ],
      },
      {
        label: "Career",
        route: "/career",
        description: "Professional career management",
        icon: IconBriefcase,
        featureId: "career",
      },
      {
        label: "Network",
        route: "/network",
        description: "Your network",
        icon: IconUsers,
        featureId: "network",
      },
      {
        label: "Integrity",
        route: "/integrity",
        description: "Promise tracker & accountability",
        icon: IconScale,
        featureId: "integrity",
      },
      {
        label: "Vault",
        route: "/vault",
        description: "Secure storage",
        icon: IconShieldLock,
        featureId: "vault",
      },
    ],
  },
];
