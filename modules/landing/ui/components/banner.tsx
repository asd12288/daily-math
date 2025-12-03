"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { Button } from "flowbite-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { AUTH_ROUTES } from "@/modules/auth/config/routes";
import { IconSparkles, IconFileText, IconTargetArrow, IconBulb } from "@tabler/icons-react";
import AOS from "aos";
import "aos/dist/aos.css";

import Banner1 from "@/public/images/landingpage/background/bannerimg1.svg";
import Banner2 from "@/public/images/landingpage/background/bannerimg2.svg";

export const LandingBanner = () => {
  const t = useTranslations("landing.hero");

  useEffect(() => {
    AOS.init({
      once: true,
    });
  }, []);

  return (
    <div className="bg-gray-50 dark:bg-zinc-900 relative overflow-hidden">
      <div className="container mx-auto px-4 relative">
        <div className="grid grid-cols-12 gap-6 items-center">
          {/* Left Content */}
          <div className="xl:col-span-6 col-span-12 xl:py-0 py-12 xl:px-0 sm:px-6 px-3">
            <h6
              className="flex items-center gap-2 text-base font-medium text-primary-600 mb-3"
              data-aos="fade-up"
              data-aos-delay="200"
              data-aos-duration="1000"
            >
              <IconSparkles className="text-secondary-500" size={17} /> {t("badge")}
            </h6>
            <h1
              className="font-bold mb-7 text-4xl sm:text-5xl lg:text-[55px] leading-tight sm:leading-[55px] text-gray-900 dark:text-white"
              data-aos="fade-up"
              data-aos-delay="400"
              data-aos-duration="1000"
            >
              {t("title")}{" "}
              <span className="text-primary-600">{t("titleHighlight")}</span>
            </h1>
            <p
              data-aos="fade-up"
              data-aos-delay="600"
              data-aos-duration="1000"
              className="text-lg text-gray-600 dark:text-gray-400"
            >
              {t("subtitle")}
            </p>

            {/* AI Feature Micro-Badges */}
            <div
              className="flex flex-wrap gap-3 mt-6"
              data-aos="fade-up"
              data-aos-delay="700"
              data-aos-duration="1000"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium">
                <IconFileText size={16} />
                {t("badges.homework")}
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-300 text-sm font-medium">
                <IconTargetArrow size={16} />
                {t("badges.practice")}
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary-100 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-300 text-sm font-medium">
                <IconBulb size={16} />
                {t("badges.hints")}
              </span>
            </div>

            <div
              className="sm:flex gap-3 mt-8"
              data-aos="fade-up"
              data-aos-delay="800"
              data-aos-duration="1000"
            >
              <Button
                as={Link}
                href={AUTH_ROUTES.REGISTER}
                size="lg"
                color="blue"
                className="sm:mb-0 mb-3 bg-primary-600 hover:bg-primary-700"
              >
                {t("getStarted")}
              </Button>
              <Button
                as={Link}
                href="#how-it-works"
                color="gray"
                size="lg"
                outline
              >
                {t("learnMore")}
              </Button>
            </div>
          </div>

          {/* Right Side - Animated Banner */}
          <div className="lg:col-span-6 col-span-12 xl:block hidden">
            <div className="bannerSlider bg-lightprimary dark:bg-primary-900/20 overflow-hidden">
              <div className="flex flex-row">
                <div>
                  <div className="animateUp">
                    <Image src={Banner1} alt="DailyMath Dashboard" />
                  </div>
                  <div className="animateUp">
                    <Image src={Banner1} alt="DailyMath Dashboard" />
                  </div>
                </div>
                <div>
                  <div className="animateDown">
                    <Image src={Banner2} alt="DailyMath Features" />
                  </div>
                  <div className="animateDown">
                    <Image src={Banner2} alt="DailyMath Features" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
