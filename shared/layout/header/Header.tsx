"use client";

import React, { useContext, useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { DashboardContext, useTheme, useUser } from "@/shared/context";
import { useLogout } from "@/modules/auth/hooks/mutations/use-auth-mutations";
import Logo from "../Logo";

export function Header() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isSticky, setIsSticky] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const { isCollapsed, setIsCollapsed, setIsMobileSidebarOpen } =
    useContext(DashboardContext);

  const { activeMode, toggleMode } = useTheme();
  const { mutate: logout, isPending: isLogoutPending } = useLogout();

  // Get user data from context
  const { profile, displayName, initials, isLoading } = useUser();

  // Handle scroll for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Toggle language
  const toggleLanguage = () => {
    const newLocale = locale === "en" ? "he" : "en";
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <header
      className={`sticky top-0 z-[5] transition-all duration-200 ${
        isSticky
          ? "bg-white dark:bg-gray-900 shadow-md"
          : "bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"
      }`}
    >
      <nav className="flex items-center justify-between py-3 px-4 sm:px-6">
        {/* Left Side - Mobile menu & Toggle */}
        <div className="flex items-center gap-2">
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="xl:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
            aria-label="Open mobile menu"
          >
            <Icon icon="tabler:menu-2" height={22} />
          </button>

          {/* Desktop Sidebar Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden xl:flex p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
            aria-label="Toggle sidebar"
          >
            <Icon icon="tabler:menu-2" height={22} />
          </button>

          {/* Search */}
          <div className="hidden sm:flex items-center">
            <div className="relative">
              <Icon
                icon="tabler:search"
                className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400"
                height={18}
              />
              <input
                type="text"
                placeholder="Search..."
                className="ps-10 pe-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border-0 text-sm focus:ring-2 focus:ring-primary-500 w-48 lg:w-64 text-gray-900 dark:text-white placeholder-gray-500"
              />
            </div>
          </div>
        </div>

        {/* Mobile Logo */}
        <div className="xl:hidden">
          <Logo />
        </div>

        {/* Right Side - Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleMode}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
            aria-label={activeMode === "light" ? "Switch to dark mode" : "Switch to light mode"}
          >
            {activeMode === "light" ? (
              <Icon icon="tabler:moon" height={20} />
            ) : (
              <Icon icon="tabler:sun" height={20} />
            )}
          </button>

          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
            title={locale === "en" ? "עברית" : "English"}
          >
            <Icon icon="tabler:language" height={20} />
          </button>

          {/* XP Display */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-lightsuccess dark:bg-success-900/30 rounded-lg">
            <Icon
              icon="tabler:star-filled"
              className="text-success-500"
              height={16}
            />
            <span className="text-sm font-semibold text-success-700 dark:text-success-400">
              {isLoading ? "..." : `${profile?.totalXp ?? 0} XP`}
            </span>
          </div>

          {/* Streak Display */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-lightwarning dark:bg-warning-900/30 rounded-lg">
            <Icon
              icon="tabler:flame"
              className={`text-warning-500 ${(profile?.currentStreak ?? 0) > 0 ? "streak-fire" : ""}`}
              height={16}
            />
            <span className="text-sm font-semibold text-warning-700 dark:text-warning-400">
              {isLoading ? "..." : profile?.currentStreak ?? 0}
            </span>
          </div>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 relative transition-colors"
              aria-label="Notifications"
            >
              <Icon icon="tabler:bell" height={20} />
              <span className="absolute top-1.5 end-1.5 w-2 h-2 bg-error-500 rounded-full"></span>
            </button>

            {notifOpen && (
              <div className="absolute end-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Notifications
                  </h3>
                </div>
                <div className="p-6 text-center">
                  <Icon
                    icon="tabler:bell-off"
                    height={32}
                    className="mx-auto text-gray-300 dark:text-gray-600 mb-2"
                  />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    No new notifications
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Profile menu"
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                {isLoading ? "..." : initials}
              </div>
            </button>

            {profileOpen && (
              <div className="absolute end-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {displayName}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {profile?.email ?? ""}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="py-2">
                  <Link
                    href="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Icon icon="tabler:user" height={18} />
                    {t("nav.profile")}
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Icon icon="tabler:settings" height={18} />
                    {t("nav.settings")}
                  </Link>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 py-2">
                  <button
                    onClick={() => logout()}
                    disabled={isLogoutPending}
                    className="flex items-center gap-3 px-4 py-2.5 text-error-600 dark:text-error-400 hover:bg-gray-100 dark:hover:bg-gray-700 w-full transition-colors disabled:opacity-50"
                  >
                    <Icon icon="tabler:logout" height={18} />
                    {isLogoutPending ? "Logging out..." : t("auth.logout")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;
