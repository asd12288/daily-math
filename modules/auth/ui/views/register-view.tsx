"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { RegisterForm } from "../components/forms/register-form";
import { SocialButtons } from "../components/social-buttons";
import { AUTH_ROUTES } from "@/modules/auth/config/routes";
import { AuthLayout } from "../layouts/auth-layout";

export function RegisterView() {
  const t = useTranslations("auth");

  return (
    <AuthLayout
      title={t("createAccount")}
      subtitle={t("registerSubtitle")}
    >
      <SocialButtons />
      <RegisterForm />
      <div className="flex gap-2 text-base font-medium mt-6 items-center justify-center text-gray-600 dark:text-gray-400">
        <p>{t("hasAccount")}</p>
        <Link
          href={AUTH_ROUTES.LOGIN}
          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          {t("signIn")}
        </Link>
      </div>
    </AuthLayout>
  );
}
