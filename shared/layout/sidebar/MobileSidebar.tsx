"use client";

import React, { useContext, useMemo } from "react";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { DashboardContext, useUser } from "@/shared/context";
import SidebarContent from "./SidebarItems";
import Logo from "../Logo";
import { useLogout } from "@/modules/auth";
import { useIncompleteCount } from "@/modules/practice/hooks";

export function MobileSidebar() {
  const t = useTranslations();
  const pathname = usePathname();
  const { isMobileSidebarOpen, setIsMobileSidebarOpen } =
    useContext(DashboardContext);
  const logoutMutation = useLogout();

  // Get user data from context
  const { displayName, initials, levelTitle, isLoading, profile, role } = useUser();

  // Get incomplete questions count for dynamic badge
  const { count: incompleteCount } = useIncompleteCount();

  // Filter sidebar content based on user role and add dynamic badges
  const filteredSidebarContent = useMemo(() => {
    return SidebarContent
      .filter((section) => !section.requiredRole || section.requiredRole === role)
      .map((section) => ({
        ...section,
        children: section.children
          .filter((item) => !item.requiredRole || item.requiredRole === role)
          .map((item) => {
            // Override the "practice" item badge with dynamic count
            if (item.id === "practice") {
              return {
                ...item,
                badge: incompleteCount > 0 ? String(incompleteCount) : undefined,
              };
            }
            return item;
          }),
      }))
      .filter((section) => section.children.length > 0);
  }, [role, incompleteCount]);

  // Remove locale prefix from pathname for comparison
  const currentPath = pathname.replace(/^\/(en|he)/, "") || "/dashboard";

  if (!isMobileSidebarOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 xl:hidden transition-opacity"
        onClick={() => setIsMobileSidebarOpen(false)}
      />

      {/* Drawer */}
      <aside className="fixed top-0 start-0 h-screen w-[280px] bg-white dark:bg-gray-900 z-50 xl:hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-700">
          <Logo />
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
            aria-label="Close menu"
          >
            <Icon icon="tabler:x" height={20} />
          </button>
        </div>

        {/* Sidebar Content */}
        <SimpleBar className="h-[calc(100vh-180px)]">
          <nav className="px-3 py-4">
            {filteredSidebarContent.map((section, sectionIndex) => (
              <div key={sectionIndex} className="mb-6">
                {/* Section Heading */}
                <h5 className="text-gray-400 dark:text-gray-500 font-semibold text-xs uppercase tracking-wider mb-3 px-3">
                  {t(`sidebar.${section.heading}` as Parameters<typeof t>[0])}
                </h5>

                {/* Section Items */}
                <div className="flex flex-col gap-1">
                  {section.children.map((item) => {
                    const isActive = currentPath === item.url;
                    return (
                      <Link
                        key={item.id}
                        href={item.url}
                        onClick={() => setIsMobileSidebarOpen(false)}
                        className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-150 ${
                          isActive
                            ? "bg-primary-600 text-white shadow-md"
                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                      >
                        <Icon
                          icon={item.icon}
                          height={20}
                          className="flex-shrink-0"
                        />
                        <span className="flex-1">
                          {t(item.name as Parameters<typeof t>[0])}
                        </span>
                        {item.badge && (
                          <span
                            className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                              isActive
                                ? "bg-white/20 text-white"
                                : "bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </SimpleBar>

        {/* User Profile Section */}
        <div className="absolute bottom-0 start-0 end-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold shadow-md">
                {isLoading ? "..." : initials}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  {isLoading ? "Loading..." : displayName}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {isLoading ? "..." : `Level ${profile?.currentLevel ?? 1} - ${levelTitle}`}
                </p>
              </div>
            </div>
            <button
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="p-2 rounded-lg text-gray-500 hover:text-error-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              title={t("auth.logout")}
            >
              <Icon icon={logoutMutation.isPending ? "tabler:loader-2" : "tabler:logout"} height={20} className={logoutMutation.isPending ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default MobileSidebar;
