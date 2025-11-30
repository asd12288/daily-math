"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Icon } from "@iconify/react";
import { forgotPasswordSchema, type ForgotPasswordSchema } from "../../../lib/validation";
import { useForgotPassword } from "../../../hooks";

export function ForgotPasswordForm() {
  const t = useTranslations("auth");
  const [emailSent, setEmailSent] = useState(false);
  const forgotPasswordMutation = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (data: ForgotPasswordSchema) => {
    forgotPasswordMutation.mutate(data, {
      onSuccess: () => setEmailSent(true),
    });
  };

  if (emailSent) {
    return (
      <div className="text-center space-y-4 py-4">
        <div className="w-16 h-16 mx-auto bg-success-50 dark:bg-success-900/30 rounded-xl flex items-center justify-center">
          <Icon
            icon="tabler:mail-check"
            height={32}
            className="text-success-600 dark:text-success-400"
          />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t("checkEmail")}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {t("resetEmailSent")}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
      <div className="mb-4">
        <div className="mb-2 block">
          <label htmlFor="email" className="text-sm font-medium text-gray-900 dark:text-white">
            {t("email")}
          </label>
        </div>
        <input
          id="email"
          type="email"
          placeholder="you@example.com"
          {...register("email")}
          className={`block w-full rounded-lg border ${
            errors.email
              ? "border-error-500 focus:border-error-500 focus:ring-error-500"
              : "border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-primary-500"
          } bg-gray-50 dark:bg-gray-700 p-2.5 text-sm text-gray-900 dark:text-white dark:placeholder-gray-400`}
        />
        {errors.email?.message && (
          <p className="mt-1 text-sm text-error-600 dark:text-error-400">{errors.email.message}</p>
        )}
      </div>

      {forgotPasswordMutation.error && (
        <div className="p-3 rounded-lg bg-error-50 dark:bg-error-900/30 text-error-700 dark:text-error-400 text-sm flex items-center gap-2 mb-4">
          <Icon icon="tabler:alert-circle" height={18} />
          {forgotPasswordMutation.error.message}
        </div>
      )}

      <button
        type="submit"
        disabled={forgotPasswordMutation.isPending}
        className="w-full rounded-lg bg-primary-600 hover:bg-primary-700 px-5 py-2.5 text-center text-sm font-medium text-white focus:outline-none focus:ring-4 focus:ring-primary-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {forgotPasswordMutation.isPending && (
          <Icon icon="tabler:loader-2" className="animate-spin" height={18} />
        )}
        {t("sendResetLink")}
      </button>
    </form>
  );
}
