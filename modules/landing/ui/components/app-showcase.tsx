"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import AOS from "aos";
import "aos/dist/aos.css";

import SliderGroup from "@/public/images/landingpage/background/slider-group.png";

export const AppShowcase = () => {
  const t = useTranslations("landing.showcase");

  useEffect(() => {
    AOS.init({ once: true });
  }, []);

  return (
    <section className="bg-gray-50 dark:bg-zinc-900 md:py-20 py-12 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div
          className="lg:w-3/5 w-full mx-auto text-center mb-12"
          data-aos="fade-up"
          data-aos-duration="500"
        >
          <p
            className="text-sm font-medium text-primary-600 uppercase tracking-wider mb-3"
            data-aos="fade-up"
            data-aos-delay="100"
            data-aos-duration="1000"
          >
            {t("badge")}
          </p>
          <h2
            className="text-center text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white sm:leading-[45px]"
            data-aos="fade-up"
            data-aos-delay="200"
            data-aos-duration="1000"
          >
            {t("title")}
          </h2>
        </div>
      </div>

      {/* Full Width Infinite Slider */}
      <div className="flex flex-row w-full position-relative overflow-hidden pt-8">
        <div className="slider-group">
          <Image
            src={SliderGroup}
            alt="DailyMath Dashboard Screenshots"
            className="max-w-max"
          />
        </div>
        <div className="slider-group">
          <Image
            src={SliderGroup}
            alt="DailyMath Dashboard Screenshots"
            className="max-w-max"
          />
        </div>
      </div>
    </section>
  );
};
