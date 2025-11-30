"use client";

import React, { useEffect } from "react";
import { Button } from "flowbite-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { AUTH_ROUTES } from "@/modules/auth/config/routes";
import AOS from "aos";
import "aos/dist/aos.css";

export const CTASection = () => {
  const t = useTranslations("landing.cta");

  useEffect(() => {
    AOS.init({ once: true });
  }, []);

  return (
    <section className="bg-white dark:bg-zinc-950 md:py-20 py-12">
      <div className="container mx-auto px-4">
        <div
          className="lg:w-2/4 w-full mx-auto"
          data-aos="fade-up"
          data-aos-delay="400"
          data-aos-duration="1000"
        >
          <div
            className="bg-no-repeat bg-center p-8 md:p-12 dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
            style={{
              backgroundImage: "url('/images/landingpage/shape/line-bg.svg')",
            }}
          >
            <div className="text-center">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {t("title")}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                {t("subtitle")}
              </p>
              <div className="sm:flex justify-center gap-4">
                <Button
                  as={Link}
                  href={AUTH_ROUTES.REGISTER}
                  size="lg"
                  color="blue"
                  className="mb-3 sm:mb-0 bg-primary-600 hover:bg-primary-700"
                >
                  {t("button")}
                </Button>
                <Button
                  as={Link}
                  href="#how-it-works"
                  size="lg"
                  color="gray"
                  outline
                >
                  {t("learnMore")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
