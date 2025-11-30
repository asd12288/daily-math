"use client";

import React, { useEffect } from "react";
import { Button } from "flowbite-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { AUTH_ROUTES } from "@/modules/auth/config/routes";
import { Icon } from "@iconify/react";
import { CardBox } from "@/shared/ui";
import AOS from "aos";
import "aos/dist/aos.css";

const plans = [
  {
    nameKey: "free.name",
    priceKey: "free.price",
    periodKey: "free.period",
    descKey: "free.desc",
    features: [
      "free.features.0",
      "free.features.1",
      "free.features.2",
      "free.features.3",
    ],
    buttonKey: "free.button",
    popular: false,
    href: AUTH_ROUTES.REGISTER,
  },
  {
    nameKey: "premium.name",
    priceKey: "premium.price",
    periodKey: "premium.period",
    descKey: "premium.desc",
    features: [
      "premium.features.0",
      "premium.features.1",
      "premium.features.2",
      "premium.features.3",
      "premium.features.4",
      "premium.features.5",
    ],
    buttonKey: "premium.button",
    popular: true,
    href: AUTH_ROUTES.REGISTER,
  },
];

export const Pricing = () => {
  const t = useTranslations("landing.pricing");

  useEffect(() => {
    AOS.init({ once: true });
  }, []);

  return (
    <section id="pricing" className="bg-gray-50 dark:bg-zinc-900 md:py-20 py-12">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="lg:w-2/5 w-full mx-auto text-center mb-16">
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
          <p
            className="text-gray-600 dark:text-gray-400 mt-4"
            data-aos="fade-up"
            data-aos-delay="300"
            data-aos-duration="1000"
          >
            {t("subtitle")}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              data-aos="fade-up"
              data-aos-delay={200 + index * 200}
              data-aos-duration="1000"
            >
              <CardBox
                className={`p-8 h-full relative dark:bg-zinc-800 ${
                  plan.popular
                    ? "border-2 border-primary-500 shadow-xl"
                    : "border border-gray-200 dark:border-gray-700"
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-primary-600 text-white text-sm font-semibold px-4 py-1 rounded-full">
                      {t("popular")}
                    </span>
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-8">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {t(plan.nameKey)}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    {t(plan.descKey)}
                  </p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      {t(plan.priceKey)}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {t(plan.periodKey)}
                    </span>
                  </div>
                </div>

                {/* Features List */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Icon
                        icon="tabler:check"
                        className={`flex-shrink-0 mt-0.5 ${
                          plan.popular ? "text-primary-600" : "text-success-600"
                        }`}
                        height={20}
                      />
                      <span className="text-gray-700 dark:text-gray-300 text-sm">
                        {t(feature)}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  as={Link}
                  href={plan.href}
                  size="lg"
                  color={plan.popular ? "blue" : "gray"}
                  className={`w-full ${
                    plan.popular
                      ? "bg-primary-600 hover:bg-primary-700"
                      : ""
                  }`}
                  outline={!plan.popular}
                >
                  {t(plan.buttonKey)}
                </Button>
              </CardBox>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
