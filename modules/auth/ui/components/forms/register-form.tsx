"use client";

import { useRegister } from "@/modules/auth/hooks/mutations/use-auth-mutations";
import { registerSchema, type RegisterSchema } from "@/modules/auth/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { Icon } from "@iconify/react";

export function RegisterForm() {
  const t = useTranslations("auth");
  const { mutate: registerUser, isPending } = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterSchema) => {
    registerUser(data);
  };

  const inputClass = (hasError: boolean) =>
    `block w-full rounded-lg border ${
      hasError
        ? "border-error-500 focus:border-error-500 focus:ring-error-500"
        : "border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-primary-500"
    } bg-gray-50 dark:bg-gray-700 p-2.5 text-sm text-gray-900 dark:text-white dark:placeholder-gray-400`;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6">
      <div className="mb-4">
        <div className="mb-2 block">
          <label htmlFor="name" className="text-sm font-medium text-gray-900 dark:text-white">
            {t("name")}
          </label>
        </div>
        <input
          id="name"
          type="text"
          {...register("name")}
          className={inputClass(!!errors.name)}
        />
        {errors.name?.message && (
          <p className="mt-1 text-sm text-error-600 dark:text-error-400">{errors.name.message}</p>
        )}
      </div>
      <div className="mb-4">
        <div className="mb-2 block">
          <label htmlFor="email" className="text-sm font-medium text-gray-900 dark:text-white">
            {t("email")}
          </label>
        </div>
        <input
          id="email"
          type="email"
          {...register("email")}
          className={inputClass(!!errors.email)}
        />
        {errors.email?.message && (
          <p className="mt-1 text-sm text-error-600 dark:text-error-400">{errors.email.message}</p>
        )}
      </div>
      <div className="mb-6">
        <div className="mb-2 block">
          <label htmlFor="password" className="text-sm font-medium text-gray-900 dark:text-white">
            {t("password")}
          </label>
        </div>
        <input
          id="password"
          type="password"
          {...register("password")}
          className={inputClass(!!errors.password)}
        />
        {errors.password?.message && (
          <p className="mt-1 text-sm text-error-600 dark:text-error-400">{errors.password.message}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-primary-600 hover:bg-primary-700 px-5 py-2.5 text-center text-sm font-medium text-white focus:outline-none focus:ring-4 focus:ring-primary-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isPending && (
          <Icon icon="tabler:loader-2" className="animate-spin" height={18} />
        )}
        {t("register")}
      </button>
    </form>
  );
}
