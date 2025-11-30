"use client";

import React, { useState, useEffect } from "react";
import { Navbar, NavbarBrand, NavbarToggle } from "flowbite-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { AUTH_ROUTES } from "@/modules/auth/config/routes";
import { Icon } from "@iconify/react";
import { useTheme } from "@/shared/context";

export const LandingHeader = () => {
  const t = useTranslations("landing.header");
  const { activeMode, toggleMode } = useTheme();
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isSticky
          ? "bg-white dark:bg-zinc-900 shadow-md py-2"
          : "bg-transparent py-4"
      }`}
    >
      <Navbar fluid className="bg-transparent dark:bg-transparent">
        <NavbarBrand as={Link} href="/">
          <span className="self-center whitespace-nowrap text-xl font-bold dark:text-white">
            DailyMath
          </span>
        </NavbarBrand>

        <div className="flex md:order-2 gap-2 items-center">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleMode}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-300"
            aria-label={activeMode === "light" ? "Switch to dark mode" : "Switch to light mode"}
          >
            {activeMode === "light" ? (
              <Icon icon="tabler:moon" width={20} height={20} />
            ) : (
              <Icon icon="tabler:sun" width={20} height={20} />
            )}
          </button>

          <Link
            href={AUTH_ROUTES.LOGIN}
            className="text-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2 md:px-5 md:py-2.5 focus:outline-none dark:focus:ring-gray-800 transition-colors"
          >
            {t("login")}
          </Link>
          <Link
            href={AUTH_ROUTES.REGISTER}
            className="text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-4 py-2 md:px-5 md:py-2.5 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800 transition-colors"
          >
            {t("register")}
          </Link>
          <NavbarToggle />
        </div>
      </Navbar>
    </header>
  );
};
