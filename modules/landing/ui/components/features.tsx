"use client";

import React, { useEffect } from "react";
import { CardBox } from "@/shared/ui";
import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import AOS from "aos";
import "aos/dist/aos.css";

const featureItems = [
  {
    icon: "tabler:calendar",
    titleKey: "items.daily.title",
    descKey: "items.daily.desc",
  },
  {
    icon: "tabler:brain",
    titleKey: "items.ai.title",
    descKey: "items.ai.desc",
  },
  {
    icon: "tabler:camera",
    titleKey: "items.handwork.title",
    descKey: "items.handwork.desc",
  },
  {
    icon: "tabler:trophy",
    titleKey: "items.xp.title",
    descKey: "items.xp.desc",
  },
  {
    icon: "tabler:flame",
    titleKey: "items.streak.title",
    descKey: "items.streak.desc",
  },
  {
    icon: "tabler:language",
    titleKey: "items.bilingual.title",
    descKey: "items.bilingual.desc",
  },
];

export const LandingFeatures = () => {
  const t = useTranslations("landing.features");

  useEffect(() => {
    AOS.init({ once: true });
  }, []);

  return (
    <section id="features" className="md:py-20 py-12 relative bg-white dark:bg-zinc-950">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="lg:w-2/5 w-full mx-auto text-center mb-16">
          <p
            className="text-sm font-medium text-primary-600 uppercase tracking-wider mb-3"
            data-aos="fade-left"
            data-aos-delay="200"
            data-aos-duration="1000"
          >
            {t("badge")}
          </p>
          <h2
            className="text-center text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white sm:leading-[45px]"
            data-aos="fade-right"
            data-aos-delay="200"
            data-aos-duration="1000"
          >
            {t("title")}
          </h2>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-12 gap-[30px]">
          {featureItems.map((item, index) => (
            <div
              className="xl:col-span-4 lg:col-span-4 md:col-span-6 col-span-12"
              key={index}
              data-aos="fade-up"
              data-aos-delay={200 + (index % 3) * 100}
              data-aos-duration="1000"
            >
              <CardBox className="p-6 text-center !shadow-none hover:shadow-lg transition-shadow duration-300 h-full dark:bg-zinc-900">
                <span className="mx-auto flex justify-center">
                  <Icon
                    icon={item.icon}
                    height={40}
                    className="text-primary-600"
                  />
                </span>
                <h5 className="font-semibold text-lg text-gray-900 dark:text-white mt-4">
                  {t(item.titleKey)}
                </h5>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {t(item.descKey)}
                </p>
              </CardBox>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
