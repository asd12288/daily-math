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
        name: "nav.dailyPractice",
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
      {
        id: "homework",
        name: "nav.homework",
        icon: "tabler:clipboard-list",
        url: "/homework",
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
];

export default SidebarContent;
