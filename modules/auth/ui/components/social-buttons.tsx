"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { signInWithGoogle, signInWithFacebook } from "../../lib/oauth";

interface SocialButtonsProps {
  title?: string;
}

export function SocialButtons({ title }: SocialButtonsProps) {
  const t = useTranslations("auth");
  const dividerText = title || t("orSignInWith");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isFacebookLoading, setIsFacebookLoading] = useState(false);

  const handleGoogleSignIn = () => {
    setIsGoogleLoading(true);
    signInWithGoogle();
  };

  const handleFacebookSignIn = () => {
    setIsFacebookLoading(true);
    signInWithFacebook();
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3 my-6">
        {/* Google Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading || isFacebookLoading}
          className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 flex gap-2 items-center w-full rounded-lg text-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGoogleLoading ? (
            <div className="w-[18px] h-[18px] border-2 border-gray-300 border-t-primary-500 rounded-full animate-spin" />
          ) : (
            <Image
              src="/images/svgs/google-icon.svg"
              alt="Google"
              height={18}
              width={18}
            />
          )}
          {t("signInWithGoogle")}
        </button>

        {/* Facebook Button */}
        <button
          type="button"
          onClick={handleFacebookSignIn}
          disabled={isGoogleLoading || isFacebookLoading}
          className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 flex gap-2 items-center w-full rounded-lg text-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isFacebookLoading ? (
            <div className="w-[18px] h-[18px] border-2 border-gray-300 border-t-primary-500 rounded-full animate-spin" />
          ) : (
            <Image
              src="/images/svgs/facebook-icon.svg"
              alt="Facebook"
              height={18}
              width={18}
            />
          )}
          {t("signInWithFacebook")}
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
