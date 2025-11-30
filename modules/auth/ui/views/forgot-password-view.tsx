"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ForgotPasswordForm } from "../components/forms/forgot-password-form";
import { AUTH_ROUTES } from "@/modules/auth/config/routes";
import { AuthLayout } from "../layouts/auth-layout";

export function ForgotPasswordView() {
  const t = useTranslations("auth");

  return (
    <AuthLayout
      title={t("forgotPassword")}
      subtitle={t("forgotPasswordSubtitle")}
    >
      <div className="mt-4">
        <ForgotPasswordForm />
        <Link
          href={AUTH_ROUTES.LOGIN}
          className="block w-full mt-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-5 py-2.5 text-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700"
        >
          {t("backToLogin")}
        </Link>
      </div>
    </AuthLayout>
  );
}
