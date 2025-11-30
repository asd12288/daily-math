"use client";

import { Icon } from "@iconify/react";
import { useTranslations, useLocale } from "next-intl";
import { COMING_SOON_FEATURES } from "../../types";

export function ComingSoonSection() {
  const t = useTranslations("settings");
  const locale = useLocale();

  return (
    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-4">
        <Icon icon="tabler:rocket" className="text-gray-400" />
        <h3 className="text-sm font-medium text-gray-500">{t("comingSoon")}</h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {COMING_SOON_FEATURES.map((feature) => (
          <div
            key={feature.id}
            className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm text-gray-500 flex items-center gap-2"
          >
            <Icon icon={feature.icon} className="shrink-0" />
            <span className="truncate">
              {locale === "he" ? feature.nameHe : feature.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
