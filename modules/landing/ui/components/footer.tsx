"use client";

import React from "react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export const LandingFooter = () => {
  const t = useTranslations("landing.footer");

  return (
    <footer className="bg-gray-50 dark:bg-zinc-900 py-10 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 text-center">
        <div className="mb-4">
          <Link href="/" className="text-2xl font-bold text-gray-900 dark:text-white">
            DailyMath
          </Link>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          {t("rights")}
          <br />
          <span className="opacity-80">{t("madeBy")} </span>
          <a
            href="#"
            className="text-primary-600 hover:underline font-medium"
          >
            DailyMath Team
          </a>
        </p>
      </div>
    </footer>
  );
};
