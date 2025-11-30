"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

interface SocialButtonsProps {
  title?: string;
}

export function SocialButtons({ title }: SocialButtonsProps) {
  const t = useTranslations("auth");
  const dividerText = title || t("orSignInWith");

  return (
    <>
      <div className="flex justify-between gap-4 my-6">
        <button
          type="button"
          className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 flex gap-2 items-center w-full rounded-lg text-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <Image
            src="/images/svgs/google-icon.svg"
            alt="Google"
            height={18}
            width={18}
          />
          Google
        </button>
      </div>
      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
            {dividerText}
          </span>
        </div>
      </div>
    </>
  );
}

export default SocialButtons;
