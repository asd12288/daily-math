"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Icon } from "@iconify/react";
import { MathDisplay } from "@/shared/ui/math-display";
import AOS from "aos";
import "aos/dist/aos.css";

// Animated solution steps reveal
const SolutionSteps = ({ isVisible }: { isVisible: boolean }) => {
  const [visibleSteps, setVisibleSteps] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      const resetTimeout = setTimeout(() => setVisibleSteps(0), 0);
      return () => clearTimeout(resetTimeout);
    }

    const steps = [
      { delay: 500, step: 1 },
      { delay: 1200, step: 2 },
      { delay: 1900, step: 3 },
    ];

    const timeouts = steps.map(({ delay, step }) =>
      setTimeout(() => setVisibleSteps(step), delay)
    );

    return () => timeouts.forEach(clearTimeout);
  }, [isVisible]);

  const solutionSteps = [
    { step: "Step 1", content: "Apply the power rule: $\\frac{d}{dx}(x^n) = nx^{n-1}$" },
    { step: "Step 2", content: "$\\frac{d}{dx}(x^3) = 3x^2$, $\\frac{d}{dx}(-2x^2) = -4x$, $\\frac{d}{dx}(5x) = 5$" },
    { step: "Step 3", content: "$f'(x) = 3x^2 - 4x + 5$" },
  ];

  return (
    <div className="space-y-3">
      {solutionSteps.map((item, index) => (
        <div
          key={index}
          className={`flex gap-3 transition-all duration-500 ${
            visibleSteps > index
              ? "opacity-100 translate-x-0"
              : "opacity-0 -translate-x-4"
          }`}
        >
          <span className="text-xs font-semibold text-primary-500 whitespace-nowrap">
            {item.step}
          </span>
          <span className="text-sm text-gray-300">
            <MathDisplay content={item.content} size="sm" />
          </span>
        </div>
      ))}
    </div>
  );
};

export const FeatureHomework = () => {
  const t = useTranslations("landing.homeworkFeature");
  const [isAnimating, setIsAnimating] = useState(false);
  const [processingState, setProcessingState] = useState<"idle" | "uploading" | "processing" | "done">("idle");

  const startAnimation = useCallback(() => {
    setIsAnimating(true);
    setProcessingState("uploading");

    setTimeout(() => setProcessingState("processing"), 1000);
    setTimeout(() => setProcessingState("done"), 2500);
    setTimeout(() => {
      setIsAnimating(false);
      setProcessingState("idle");
    }, 8000);
  }, []);

  useEffect(() => {
    AOS.init({ once: true });
  }, []);

  // Auto-play animation when section is in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isAnimating) {
          startAnimation();
        }
      },
      { threshold: 0.5 }
    );

    const section = document.getElementById("homework-feature");
    if (section) observer.observe(section);

    return () => observer.disconnect();
  }, [isAnimating, startAnimation]);

  const benefits = [
    { key: "extract", icon: "tabler:file-search" },
    { key: "bilingual", icon: "tabler:language" },
    { key: "diagrams", icon: "tabler:chart-dots" },
    { key: "subquestions", icon: "tabler:list-tree" },
    { key: "learns", icon: "tabler:brain" },
  ];

  return (
    <section id="homework-feature" className="py-20 bg-white dark:bg-zinc-900 overflow-hidden">
      <div className="container mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Animated Mockup */}
          <div data-aos="fade-right" data-aos-delay="100">
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-primary-600/10 rounded-3xl blur-2xl" />

              {/* Main mockup container */}
              <div className="relative bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">
                {/* Header bar */}
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-800 border-b border-gray-700">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <span className="text-sm text-gray-400 ml-2">DailyMath - Homework Solver</span>
                </div>

                {/* Content area */}
                <div className="p-6 min-h-[350px]">
                  {processingState === "idle" && (
                    <div
                      className="flex flex-col items-center justify-center h-full py-8 cursor-pointer group"
                      onClick={startAnimation}
                    >
                      <div className="w-20 h-20 rounded-2xl bg-primary-500/20 flex items-center justify-center mb-4 group-hover:bg-primary-500/30 transition-colors">
                        <Icon icon="tabler:upload" className="w-10 h-10 text-primary-400" />
                      </div>
                      <p className="text-gray-400 text-center">
                        {t("demo.clickToSee")}
                      </p>
                      <p className="text-gray-500 text-sm mt-1">
                        📄 Calculus_HW_3.pdf
                      </p>
                    </div>
                  )}

                  {processingState === "uploading" && (
                    <div className="flex flex-col items-center justify-center h-full py-8">
                      <div className="w-20 h-20 rounded-2xl bg-primary-500/20 flex items-center justify-center mb-4 animate-pulse">
                        <Icon icon="tabler:cloud-upload" className="w-10 h-10 text-primary-400" />
                      </div>
                      <p className="text-gray-300">{t("demo.uploading")}</p>
                      <div className="w-48 h-2 bg-gray-700 rounded-full mt-4 overflow-hidden">
                        <div className="h-full bg-primary-500 rounded-full animate-[loading_1s_ease-in-out]" style={{ width: "100%" }} />
                      </div>
                    </div>
                  )}

                  {processingState === "processing" && (
                    <div className="flex flex-col items-center justify-center h-full py-8">
                      <div className="w-20 h-20 rounded-2xl bg-primary-500/20 flex items-center justify-center mb-4">
                        <Icon icon="tabler:brain" className="w-10 h-10 text-primary-400 animate-pulse" />
                      </div>
                      <p className="text-gray-300">{t("demo.extracting")}</p>
                      <div className="flex gap-1 mt-4">
                        <span className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  )}

                  {processingState === "done" && (
                    <div className="space-y-4">
                      {/* Question header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-success-500/20 text-success-400 text-xs rounded-full">
                            {t("demo.solved")}
                          </span>
                          <span className="text-gray-400 text-sm">{t("demo.question")} 1</span>
                        </div>
                        <span className="text-primary-400 text-sm">+5 XP</span>
                      </div>

                      {/* Question */}
                      <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                        <p className="text-gray-300 text-sm">
                          <MathDisplay content="Find the derivative of: $f(x) = x^3 - 2x^2 + 5x - 3$" size="sm" />
                        </p>
                      </div>

                      {/* Solution */}
                      <div className="p-4 bg-gray-800/30 rounded-lg border border-primary-500/30">
                        <div className="flex items-center gap-2 mb-3">
                          <Icon icon="tabler:sparkles" className="w-4 h-4 text-primary-400" />
                          <span className="text-primary-400 text-sm font-medium">{t("demo.aiSolution")}</span>
                        </div>
                        <SolutionSteps isVisible={processingState === "done"} />
                      </div>

                      {/* Answer */}
                      <div className="flex items-center gap-2 p-3 bg-success-500/10 rounded-lg border border-success-500/30">
                        <Icon icon="tabler:check" className="w-5 h-5 text-success-400" />
                        <span className="text-success-400">
                          {t("demo.answer")}: <MathDisplay content="$f'(x) = 3x^2 - 4x + 5$" size="sm" />
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Content */}
          <div data-aos="fade-left" data-aos-delay="200">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-sm font-medium mb-4">
              <Icon icon="tabler:file-text" className="w-4 h-4" />
              {t("badge")}
            </span>

            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t("title")}
            </h2>

            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              {t("subtitle")}
            </p>

            {/* Benefits list */}
            <ul className="space-y-4">
              {benefits.map((benefit, index) => (
                <li
                  key={benefit.key}
                  className="flex items-start gap-3"
                  data-aos="fade-up"
                  data-aos-delay={300 + index * 100}
                >
                  <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon icon={benefit.icon} className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">
                    {t(`benefits.${benefit.key}`)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
