"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { LoginForm } from "../components/forms/login-form";
import { SocialButtons } from "../components/social-buttons";
import { AUTH_ROUTES } from "@/modules/auth/config/routes";
import { AuthLayout } from "../layouts/auth-layout";

export function LoginView() {
  const t = useTranslations("auth");

  return (
    <AuthLayout
      title={t("welcomeBack")}
      subtitle={t("loginSubtitle")}
    >
      <SocialButtons />
      <LoginForm />
      <div className="flex gap-2 text-base font-medium mt-6 items-center justify-center text-gray-600 dark:text-gray-400">
        <p>{t("noAccount")}</p>
        <Link
          href={AUTH_ROUTES.REGISTER}
          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          {t("createAccount")}
        </Link>
      </div>
    </AuthLayout>
  );
}
