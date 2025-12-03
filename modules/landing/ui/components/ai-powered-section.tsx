"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Icon } from "@iconify/react";
import { MathInline } from "@/shared/ui/math-display";
import AOS from "aos";
import "aos/dist/aos.css";

// Typewriter effect component for AI animations
const TypewriterText = ({ text, delay = 0, isMath = false }: { text: string; delay?: number; isMath?: boolean }) => {
  const [displayText, setDisplayText] = useState("");
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const startTimeout = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(startTimeout);
  }, [delay]);

  useEffect(() => {
    if (!started) return;

    let index = 0;
    const interval = setInterval(() => {
      if (index <= text.length) {
        setDisplayText(text.slice(0, index));
        index++;
      } else {
        setCompleted(true);
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [text, started]);

  // For math content, show the full LaTeX only when complete
  if (isMath && completed) {
    return <MathInline content={text} className="text-sm" />;
  }

  return (
    <span className="font-mono text-sm">
      {displayText}
      {displayText.length < text.length && started && (
        <span className="animate-pulse">|</span>
      )}
    </span>
  );
};

// AI Processing animation
const AIProcessingDot = () => (
  <span className="inline-flex gap-1">
    <span className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: "0ms" }} />
    <span className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: "150ms" }} />
    <span className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: "300ms" }} />
  </span>
);

export const AIPoweredSection = () => {
  const t = useTranslations("landing.aiPowered");
  const [activeCard, setActiveCard] = useState<number | null>(null);

  useEffect(() => {
    AOS.init({ once: true });
  }, []);

  const features = [
    {
      icon: "tabler:file-text",
      title: t("homework.title"),
      desc: t("homework.desc"),
      action: t("homework.action"),
      color: "primary",
      mockup: {
        before: `📄 ${t("homework.mockup.before")}`,
        processing: t("homework.mockup.processing"),
        after: "f'(x) = 3x^2 - 4x + 5",
        isMath: true,
      },
    },
    {
      icon: "tabler:target-arrow",
      title: t("practice.title"),
      desc: t("practice.desc"),
      action: t("practice.action"),
      color: "success",
      mockup: {
        before: t("practice.mockup.before"),
        processing: t("practice.mockup.processing"),
        after: t("practice.mockup.after"),
        isMath: false,
      },
    },
    {
      icon: "tabler:bulb",
      title: t("hints.title"),
      desc: t("hints.desc"),
      action: t("hints.action"),
      color: "secondary",
      mockup: {
        before: t("hints.mockup.before"),
        processing: t("hints.mockup.processing"),
        after: "\\frac{d}{dx}(x^n) = nx^{n-1}",
        isMath: true,
      },
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string; glow: string }> = {
      primary: {
        bg: "bg-primary-100 dark:bg-primary-900/30",
        text: "text-primary-600 dark:text-primary-400",
        border: "border-primary-200 dark:border-primary-800",
        glow: "shadow-primary-500/20",
      },
      success: {
        bg: "bg-success-100 dark:bg-success-900/30",
        text: "text-success-600 dark:text-success-400",
        border: "border-success-200 dark:border-success-800",
        glow: "shadow-success-500/20",
      },
      secondary: {
        bg: "bg-secondary-100 dark:bg-secondary-900/30",
        text: "text-secondary-600 dark:text-secondary-400",
        border: "border-secondary-200 dark:border-secondary-800",
        glow: "shadow-secondary-500/20",
      },
    };
    return colors[color] || colors.primary;
  };

  return (
    <section className="py-20 bg-gray-900 dark:bg-black relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/20 text-primary-400 text-sm font-medium mb-4"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            <Icon icon="tabler:sparkles" className="w-4 h-4" />
            {t("badge")}
          </span>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            {t("title")}
          </h2>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => {
            const colors = getColorClasses(feature.color);
            const isActive = activeCard === index;

            return (
              <div
                key={index}
                className="relative group cursor-pointer pb-2"
                data-aos="fade-up"
                data-aos-delay={200 + index * 100}
                onMouseEnter={() => setActiveCard(index)}
                onMouseLeave={() => setActiveCard(null)}
              >
                <div
                  className={`h-full rounded-2xl border ${colors.border} bg-gray-800/50 dark:bg-gray-900/50 backdrop-blur-sm p-6 transition-all duration-300 ${
                    isActive ? `transform -translate-y-2 shadow-2xl ${colors.glow}` : ""
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`w-14 h-14 rounded-xl ${colors.bg} ${colors.text} flex items-center justify-center mb-4`}
                  >
                    <Icon icon={feature.icon} className="w-7 h-7" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 mb-4">{feature.desc}</p>

                  {/* Animated Mockup Area */}
                  <div className="mt-4 p-4 rounded-xl bg-gray-900/80 border border-gray-700/50 min-h-[120px] flex flex-col justify-center">
                    {!isActive ? (
                      <div className="text-gray-500 text-sm text-center">
                        <Icon icon="tabler:click" className="w-5 h-5 mx-auto mb-2 opacity-50" />
                        {t("hoverPrompt")}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Input */}
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                          <Icon icon="tabler:arrow-right" className="w-4 h-4" />
                          <span>{feature.mockup.before}</span>
                        </div>

                        {/* Processing */}
                        <div className="flex items-center gap-2 text-sm">
                          <AIProcessingDot />
                          <span className={colors.text}>{feature.mockup.processing}</span>
                        </div>

                        {/* Output */}
                        <div className={`flex items-center gap-2 text-sm ${colors.text}`}>
                          <Icon icon="tabler:check" className="w-4 h-4" />
                          <TypewriterText text={feature.mockup.after} delay={800} isMath={feature.mockup.isMath} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action text */}
                  <div className={`mt-4 text-sm font-medium ${colors.text} flex items-center gap-2`}>
                    <Icon icon="tabler:sparkles" className="w-4 h-4" />
                    {feature.action}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
