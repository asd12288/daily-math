import type { UserRole } from "@/lib/appwrite/types";

export interface SidebarItem {
  id: string;
  name: string;
  icon: string;
  url: string;
  badge?: string;
  badgeColor?: string;
  requiredRole?: UserRole; // If set, only users with this role can see this item
}

export interface SidebarSection {
  heading: string;
  children: SidebarItem[];
  requiredRole?: UserRole; // If set, only users with this role can see this section
}

export const SidebarContent: SidebarSection[] = [
  {
    heading: "main",
    children: [
      {
        id: "dashboard",
        name: "nav.home",
        icon: "tabler:smart-home",
        url: "/dashboard",
      },
      {
        id: "practice",
        name: "dashboard.startPractice",
        icon: "tabler:pencil",
        url: "/practice",
        badge: "5",
        badgeColor: "primary",
      },
    ],
  },
  {
    heading: "learning",
    children: [
      {
        id: "courses",
        name: "nav.courses",
        icon: "tabler:book",
        url: "/courses",
      },
      {
        id: "history",
        name: "nav.history",
        icon: "tabler:history",
        url: "/history",
      },
    ],
  },
  {
    heading: "account",
    children: [
      {
        id: "settings",
        name: "nav.settings",
        icon: "tabler:settings",
        url: "/settings",
      },
      {
        id: "profile",
        name: "nav.profile",
        icon: "tabler:user",
        url: "/profile",
      },
    ],
  },
  {
    heading: "admin",
    requiredRole: "admin",
    children: [
      {
        id: "admin-questions",
        name: "nav.adminQuestions",
        icon: "tabler:database",
        url: "/admin/questions",
        requiredRole: "admin",
      },
    ],
  },
  {
    heading: "developer",
    children: [
      {
        id: "dev-design",
        name: "nav.devDesign",
        icon: "tabler:palette",
        url: "/dev-design",
        badge: "DEV",
        badgeColor: "secondary",
      },
      {
        id: "dev-ai",
        name: "nav.devAI",
        icon: "tabler:brain",
        url: "/dev-ai",
        badge: "AI",
        badgeColor: "primary",
      },
    ],
  },
];

export default SidebarContent;
