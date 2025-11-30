"use client";

import { Icon } from "@iconify/react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/ui";

export function LanguageSection() {
  const t = useTranslations("settings");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (newLocale: "en" | "he") => {
    // Replace the locale in the pathname
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/"));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-warning-100 dark:bg-warning-900/30 flex items-center justify-center">
            <Icon icon="tabler:language" className="text-xl text-warning-600" />
          </div>
          <div>
            <CardTitle>{t("language.title")}</CardTitle>
            <p className="text-sm text-gray-500">{t("language.description")}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3">
          <button
            onClick={() => handleLanguageChange("en")}
            className={`flex-1 p-4 rounded-lg border-2 transition-all ${
              locale === "en"
                ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
            }`}
          >
            <div className="text-2xl mb-2">🇺🇸</div>
            <p className="font-medium">English</p>
            <p className="text-xs text-gray-500">Left-to-Right</p>
          </button>
          <button
            onClick={() => handleLanguageChange("he")}
            className={`flex-1 p-4 rounded-lg border-2 transition-all ${
              locale === "he"
                ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
            }`}
          >
            <div className="text-2xl mb-2">🇮🇱</div>
            <p className="font-medium">עברית</p>
            <p className="text-xs text-gray-500">Right-to-Left</p>
          </button>
        </div>

        {/* Theme toggle - coming soon */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between opacity-50">
            <div>
              <h4 className="font-medium">{t("language.theme")}</h4>
              <p className="text-sm text-gray-500">{t("language.themeDesc")}</p>
            </div>
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 text-xs rounded-full">
              {t("comingSoon")}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
