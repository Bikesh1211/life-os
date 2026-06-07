import type { TablerIcon } from "@tabler/icons-react";
import {
  IconLayoutDashboard,
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
  IconArticle,
  IconBrandBlogger,
  IconVideo,
  IconBook,
  IconFilePencil,
  IconBrain,
  IconNotes,
  IconBulb,
  IconGraph,
  IconSchool,
  IconGridPattern,
  IconBooks,
  IconPackage,
  IconShirt,
  IconDeviceLaptop,
  IconBackpack,
  IconTool,
  IconShoppingCart,
  IconCoin,
  IconChartBar,
  IconArrowsLeftRight,
  IconRepeat,
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
  IconUserPlus,
  IconCake,
  IconChess,
  IconTarget,
  IconEye,
  IconScale,
  IconShieldLock,
  IconSettings,
  IconArchive,
  IconLogout,
  IconCompass,
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
    label: "Operations",
    items: [
      {
        label: "Dashboard",
        route: "/dashboard",
        description: "Overview of your life",
        icon: IconLayoutDashboard,
        featureId: "dashboard",
      },
      {
        label: "Quick Note",
        route: "/quick-note",
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
        label: "Discovery Feed",
        route: "/discovery-feed",
        description: "Explore and discover",
        icon: IconRss,
        featureId: "discovery_feed",
      },
      {
        label: "Tasks",
        route: "/tasks",
        description: "Manage your tasks",
        icon: IconChecklist,
        featureId: "tasks",
        children: [
          {
            label: "Today",
            route: "/tasks/today",
            description: "Today's tasks",
            icon: IconCalendarDue,
            featureId: "tasks_today",
          },
          {
            label: "Inbox",
            route: "/tasks/inbox",
            description: "Task inbox",
            icon: IconInbox,
            featureId: "tasks_inbox",
          },
          {
            label: "Projects",
            route: "/tasks/projects",
            description: "Task projects",
            icon: IconFolder,
            featureId: "tasks_projects",
          },
          {
            label: "Focus Mode",
            route: "/tasks/focus-mode",
            description: "Deep work mode",
            icon: IconFocusCentered,
            featureId: "tasks_focus_mode",
          },
        ],
      },
      {
        label: "Time",
        route: "/time",
        description: "Time tracking",
        icon: IconClock,
        featureId: "time",
      },
      {
        label: "Calendar",
        route: "/calendar",
        description: "Your schedule",
        icon: IconCalendar,
        featureId: "calendar",
      },
    ],
  },
  {
    label: "Knowledge & Content",
    items: [
      {
        label: "Creator Studio",
        route: "/creator-studio",
        description: "Content creation hub",
        icon: IconDeviceTv,
        featureId: "creator_studio",
        children: [
          {
            label: "Articles",
            route: "/creator-studio/articles",
            description: "Write articles",
            icon: IconArticle,
            featureId: "articles",
          },
          {
            label: "Blog Posts",
            route: "/creator-studio/blog-posts",
            description: "Blog posts",
            icon: IconBrandBlogger,
            featureId: "blog_posts",
          },
          {
            label: "Vlog Scripts",
            route: "/creator-studio/vlog-scripts",
            description: "Video scripts",
            icon: IconVideo,
            featureId: "vlog_scripts",
          },
        ],
      },
      {
        label: "Brain",
        route: "/brain",
        description: "Knowledge management",
        icon: IconBrain,
        featureId: "brain",
        children: [
          {
            label: "Notes",
            route: "/notes",
            description: "Your notes",
            icon: IconNotes,
            featureId: "notes",
          },
          {
            label: "Ideas",
            route: "/brain/ideas",
            description: "Idea board",
            icon: IconBulb,
            featureId: "ideas",
          },
          {
            label: "Graph View",
            route: "/brain/graph-view",
            description: "Knowledge graph",
            icon: IconGraph,
            featureId: "graph_view",
          },
        ],
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
        label: "Library",
        route: "/library",
        description: "Your library",
        icon: IconBooks,
        featureId: "library",
      },
    ],
  },
  {
    label: "Personal Assets",
    items: [
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
      {
        label: "Finance",
        route: "/finance",
        description: "Financial overview",
        icon: IconCoin,
        featureId: "finance",
        children: [
          {
            label: "Overview",
            route: "/finance/overview",
            description: "Financial summary",
            icon: IconChartBar,
            featureId: "finance_overview",
          },
          {
            label: "Transactions",
            route: "/finance/transactions",
            description: "All transactions",
            icon: IconArrowsLeftRight,
            featureId: "transactions",
          },
          {
            label: "Subscriptions",
            route: "/finance/subscriptions",
            description: "Manage subscriptions",
            icon: IconRepeat,
            featureId: "subscriptions",
          },
        ],
      },
    ],
  },
  {
    label: "Wellness & Lifestyle",
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
        children: [
          {
            label: "Vitals",
            route: "/health/vitals",
            description: "Vital signs",
            icon: IconActivity,
            featureId: "vitals",
          },
          {
            label: "Fitness",
            route: "/health/fitness",
            description: "Fitness tracking",
            icon: IconRun,
            featureId: "fitness",
          },
          {
            label: "Nutrition",
            route: "/health/nutrition",
            description: "Nutrition tracking",
            icon: IconApple,
            featureId: "nutrition",
          },
        ],
      },
      {
        label: "Mindset",
        route: "/mindset",
        description: "Mindfulness & reflection",
        icon: IconMoodHappy,
        featureId: "mind_set",
      },
      {
        label: "Travel",
        route: "/travel",
        description: "Travel planning",
        icon: IconPlane,
        featureId: "travel",
        children: [
          {
            label: "Itineraries",
            route: "/travel/itineraries",
            description: "Trip plans",
            icon: IconRoute,
            featureId: "itineraries",
          },
          {
            label: "Bucket List",
            route: "/travel/bucket-list",
            description: "Dream destinations",
            icon: IconStar,
            featureId: "bucket_list",
          },
        ],
      },
      {
        label: "Timeline",
        route: "/timeline",
        description: "Life timeline",
        icon: IconTimelineEvent,
        featureId: "timeline",
      },
      {
        label: "Milestones",
        route: "/milestones",
        description: "Key milestones",
        icon: IconFlag,
        featureId: "milestones",
      },
    ],
  },
  {
    label: "Strategy & Safety",
    items: [
      {
        label: "Strategy",
        route: "/strategy",
        description: "Life strategy",
        icon: IconChess,
        featureId: "strategy",
        children: [
          {
            label: "Goals",
            route: "/goals",
            description: "Your goals",
            icon: IconTarget,
            featureId: "goals",
          },
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
        label: "Network",
        route: "/network",
        description: "Your network",
        icon: IconUsers,
        featureId: "network",
        children: [
          {
            label: "Connections",
            route: "/network/connections",
            description: "People you know",
            icon: IconUserPlus,
            featureId: "connections",
          },
          {
            label: "Birthdays",
            route: "/network/birthdays",
            description: "Birthday calendar",
            icon: IconCake,
            featureId: "birthdays",
          },
        ],
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
  {
    label: "System",
    items: [
      {
        label: "Settings",
        route: "/settings",
        description: "App settings",
        icon: IconSettings,
        featureId: "settings",
      },
      {
        label: "Archive",
        route: "/archive",
        description: "Archived items",
        icon: IconArchive,
        featureId: "archive",
      },
      {
        label: "Logout",
        route: "/logout",
        description: "Sign out",
        icon: IconLogout,
        featureId: "logout",
      },
    ],
  },
];
