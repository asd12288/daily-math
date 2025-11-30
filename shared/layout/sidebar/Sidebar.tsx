"use client";

import React, { useContext } from "react";
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

export function Sidebar() {
  const t = useTranslations();
  const pathname = usePathname();
  const { isCollapsed, setIsMobileSidebarOpen } = useContext(DashboardContext);
  const logoutMutation = useLogout();

  // Get user data from context
  const { displayName, initials, levelTitle, isLoading, profile, role } = useUser();

  // Remove locale prefix from pathname for comparison
  const currentPath = pathname.replace(/^\/(en|he)/, "") || "/dashboard";

  // Filter sidebar content based on user role
  const filteredSidebarContent = SidebarContent
    .filter((section) => !section.requiredRole || section.requiredRole === role)
    .map((section) => ({
      ...section,
      children: section.children.filter(
        (item) => !item.requiredRole || item.requiredRole === role
      ),
    }))
    .filter((section) => section.children.length > 0);

  return (
    <div className="hidden xl:block">
      <aside
        className={`fixed top-0 start-0 h-screen bg-white dark:bg-gray-900 z-[6] border-e border-gray-200 dark:border-gray-700 transition-all duration-200 ${
          isCollapsed ? "w-[75px]" : "w-[270px]"
        }`}
      >
        {/* Logo */}
        <div
          className={`${
            isCollapsed ? "px-3" : "px-5"
          } flex items-center min-h-[70px] overflow-hidden border-b border-gray-200 dark:border-gray-700`}
        >
          <Logo collapsed={isCollapsed} />
        </div>

        {/* Sidebar Content */}
        <SimpleBar className="h-[calc(100vh-170px)]">
          <nav className={`py-4 ${isCollapsed ? "px-2" : "px-3"}`}>
            {filteredSidebarContent.map((section, sectionIndex) => (
              <div key={sectionIndex} className="mb-6">
                {/* Section Heading */}
                <h5 className="text-gray-400 dark:text-gray-500 font-semibold text-xs uppercase tracking-wider mb-3 px-3">
                  {isCollapsed ? (
                    <Icon
                      icon="tabler:dots"
                      className="mx-auto"
                      height={18}
                    />
                  ) : (
                    t(`sidebar.${section.heading}` as Parameters<typeof t>[0])
                  )}
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
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 ${
                          isActive
                            ? "bg-primary-600 text-white shadow-md"
                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        } ${isCollapsed ? "justify-center" : ""}`}
                        title={isCollapsed ? t(item.name as Parameters<typeof t>[0]) : undefined}
                      >
                        <Icon
                          icon={item.icon}
                          height={20}
                          className="flex-shrink-0"
                        />
                        {!isCollapsed && (
                          <>
                            <span className="flex-1 truncate">
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
                          </>
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
        <div
          className={`absolute bottom-0 start-0 end-0 p-3 border-t border-gray-200 dark:border-gray-700`}
        >
          <div
            className={`py-3 ${
              isCollapsed ? "px-2" : "px-3"
            } bg-gray-50 dark:bg-gray-800 rounded-xl`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold shadow-md">
                  {isLoading ? "..." : initials}
                </div>
                {!isCollapsed && (
                  <div className="overflow-hidden">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {isLoading ? "Loading..." : displayName}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {isLoading ? "..." : `Level ${profile?.currentLevel ?? 1} - ${levelTitle}`}
                    </p>
                  </div>
                )}
              </div>
              {!isCollapsed && (
                <button
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                  className="p-2 rounded-lg text-gray-500 hover:text-error-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                  title={t("auth.logout")}
                >
                  <Icon icon={logoutMutation.isPending ? "tabler:loader-2" : "tabler:logout"} height={18} className={logoutMutation.isPending ? "animate-spin" : ""} />
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default Sidebar;
