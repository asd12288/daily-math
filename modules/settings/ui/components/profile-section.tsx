"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import { Card, CardHeader, CardTitle, CardContent, Input } from "@/shared/ui";
import { useAutoSaveSetting } from "../../hooks";

interface ProfileSectionProps {
  displayName: string;
  email: string;
  avatarUrl?: string;
}

export function ProfileSection({
  displayName: initialName,
  email,
}: ProfileSectionProps) {
  const t = useTranslations("settings");
  const [displayName, setDisplayName] = useState(initialName);
  const { save, isPending } = useAutoSaveSetting();

  // Sync with props
  useEffect(() => {
    setDisplayName(initialName);
  }, [initialName]);

  // Auto-save on blur
  const handleBlur = () => {
    if (displayName !== initialName && displayName.length >= 2) {
      save("displayName", displayName);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <Icon icon="tabler:user" className="text-xl text-primary-600" />
          </div>
          <div>
            <CardTitle>{t("profile.title")}</CardTitle>
            <p className="text-sm text-gray-500">{t("profile.description")}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Avatar placeholder - coming soon */}
        <div className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-2xl font-bold">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="text-sm text-gray-500">
            <Icon icon="tabler:camera" className="inline me-1" />
            {t("comingSoon")}
          </div>
        </div>

        {/* Display Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t("profile.displayName")}
          </label>
          <div className="relative">
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              onBlur={handleBlur}
              placeholder={t("profile.displayName")}
              className="pe-10"
            />
            {isPending && (
              <div className="absolute end-3 top-1/2 -translate-y-1/2">
                <Icon
                  icon="tabler:loader-2"
                  className="text-primary-500 animate-spin"
                />
              </div>
            )}
          </div>
        </div>

        {/* Email (read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t("profile.email")}
          </label>
          <Input value={email} disabled className="bg-gray-50 dark:bg-gray-800" />
          <p className="text-xs text-gray-500 mt-1">
            <Icon icon="tabler:lock" className="inline me-1" />
            {t("profile.emailLocked")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
