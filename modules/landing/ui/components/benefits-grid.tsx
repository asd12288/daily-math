"use client";

import React, { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Icon } from "@iconify/react";
import AOS from "aos";
import "aos/dist/aos.css";

export const BenefitsGrid = () => {
  const t = useTranslations("landing.benefits");

  useEffect(() => {
    AOS.init({ once: true });
  }, []);

  const benefits = [
    {
      key: "gamification",
      icon: "tabler:trophy",
      color: "warning",
    },
    {
      key: "bilingual",
      icon: "tabler:language",
      color: "primary",
    },
    {
      key: "courses",
      icon: "tabler:books",
      color: "success",
    },
    {
      key: "time",
      icon: "tabler:clock-bolt",
      color: "secondary",
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; iconBg: string; text: string; border: string }> = {
      warning: {
        bg: "bg-warning-50 dark:bg-warning-900/20",
        iconBg: "bg-warning-100 dark:bg-warning-900/50",
        text: "text-warning-600 dark:text-warning-400",
        border: "border-warning-200 dark:border-warning-800",
      },
      primary: {
        bg: "bg-primary-50 dark:bg-primary-900/20",
        iconBg: "bg-primary-100 dark:bg-primary-900/50",
        text: "text-primary-600 dark:text-primary-400",
        border: "border-primary-200 dark:border-primary-800",
      },
      success: {
        bg: "bg-success-50 dark:bg-success-900/20",
        iconBg: "bg-success-100 dark:bg-success-900/50",
        text: "text-success-600 dark:text-success-400",
        border: "border-success-200 dark:border-success-800",
      },
      secondary: {
        bg: "bg-secondary-50 dark:bg-secondary-900/20",
        iconBg: "bg-secondary-100 dark:bg-secondary-900/50",
        text: "text-secondary-600 dark:text-secondary-400",
        border: "border-secondary-200 dark:border-secondary-800",
      },
    };
    return colors[color] || colors.primary;
  };

  return (
    <section className="py-16 bg-gray-50 dark:bg-zinc-950">
      <div className="container mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium mb-4"
            data-aos="fade-up"
          >
            <Icon icon="tabler:star" className="w-4 h-4" />
            {t("badge")}
          </span>

          <h2
            className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            {t("title")}
          </h2>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => {
            const colors = getColorClasses(benefit.color);

            return (
              <div
                key={benefit.key}
                className={`relative group p-6 rounded-2xl border ${colors.border} ${colors.bg} transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
                data-aos="fade-up"
                data-aos-delay={200 + index * 100}
              >
                {/* Icon */}
                <div
                  className={`w-14 h-14 rounded-xl ${colors.iconBg} ${colors.text} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon icon={benefit.icon} className="w-7 h-7" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {t(`${benefit.key}.title`)}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t(`${benefit.key}.desc`)}
                </p>

                {/* Decorative corner */}
                <div
                  className={`absolute top-0 right-0 w-16 h-16 ${colors.iconBg} opacity-50 rounded-bl-3xl rounded-tr-2xl -z-10`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
