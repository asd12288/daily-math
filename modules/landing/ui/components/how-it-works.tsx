"use client";

import React, { useEffect } from "react";
import { useTranslations } from "next-intl";
import { IconSettings, IconPencil, IconTrophy } from "@tabler/icons-react";
import AOS from "aos";
import "aos/dist/aos.css";

const steps = [
  {
    icon: IconSettings,
    number: "01",
    titleKey: "step1.title",
    descKey: "step1.desc",
    color: "primary",
  },
  {
    icon: IconPencil,
    number: "02",
    titleKey: "step2.title",
    descKey: "step2.desc",
    color: "secondary",
  },
  {
    icon: IconTrophy,
    number: "03",
    titleKey: "step3.title",
    descKey: "step3.desc",
    color: "success",
  },
];

export const HowItWorks = () => {
  const t = useTranslations("landing.howItWorks");

  useEffect(() => {
    AOS.init({ once: true });
  }, []);

  return (
    <section id="how-it-works" className="bg-white dark:bg-zinc-950 py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="lg:w-3/5 w-full mx-auto text-center mb-16">
          <p
            className="text-sm font-medium text-primary-600 uppercase tracking-wider mb-3"
            data-aos="fade-up"
            data-aos-delay="100"
            data-aos-duration="1000"
          >
            {t("badge")}
          </p>
          <h2
            className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white sm:leading-[45px]"
            data-aos="fade-up"
            data-aos-delay="200"
            data-aos-duration="1000"
          >
            {t("title")}
          </h2>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="relative text-center"
                data-aos="fade-up"
                data-aos-delay={200 + index * 200}
                data-aos-duration="1000"
              >
                {/* Connector Line (hidden on mobile and last item) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-[2px] bg-gray-200 dark:bg-gray-700" />
                )}

                {/* Step Number Badge */}
                <div className="relative inline-block mb-6">
                  <div
                    className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto
                      ${step.color === "primary" ? "bg-primary-100 dark:bg-primary-900/30" : ""}
                      ${step.color === "secondary" ? "bg-secondary-100 dark:bg-secondary-900/30" : ""}
                      ${step.color === "success" ? "bg-success-100 dark:bg-success-900/30" : ""}
                    `}
                  >
                    <Icon
                      size={40}
                      className={`
                        ${step.color === "primary" ? "text-primary-600" : ""}
                        ${step.color === "secondary" ? "text-secondary-600" : ""}
                        ${step.color === "success" ? "text-success-600" : ""}
                      `}
                    />
                  </div>
                  <span
                    className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold
                      ${step.color === "primary" ? "bg-primary-600" : ""}
                      ${step.color === "secondary" ? "bg-secondary-600" : ""}
                      ${step.color === "success" ? "bg-success-600" : ""}
                    `}
                  >
                    {step.number}
                  </span>
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {t(step.titleKey)}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-xs mx-auto">
                  {t(step.descKey)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
