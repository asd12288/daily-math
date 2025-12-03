"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Icon } from "@iconify/react";
import { MathDisplay } from "@/shared/ui/math-display";
import AOS from "aos";
import "aos/dist/aos.css";

// Typing indicator animation
const TypingIndicator = () => (
  <div className="flex items-center gap-1 px-3 py-2">
    <span className="w-2 h-2 rounded-full bg-secondary-400 animate-bounce" style={{ animationDelay: "0ms" }} />
    <span className="w-2 h-2 rounded-full bg-secondary-400 animate-bounce" style={{ animationDelay: "150ms" }} />
    <span className="w-2 h-2 rounded-full bg-secondary-400 animate-bounce" style={{ animationDelay: "300ms" }} />
  </div>
);

// Chat message component
const ChatMessage = ({
  type,
  content,
  delay,
  isVisible,
  hasMath = false,
}: {
  type: "user" | "ai";
  content: string;
  delay: number;
  isVisible: boolean;
  hasMath?: boolean;
}) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!isVisible) {
      const resetTimeout = setTimeout(() => setShow(false), 0);
      return () => clearTimeout(resetTimeout);
    }
    const timeout = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(timeout);
  }, [delay, isVisible]);

  if (!show) return null;

  return (
    <div
      className={`flex ${type === "user" ? "justify-end" : "justify-start"} animate-fadeIn`}
    >
      <div
        className={`max-w-[85%] px-4 py-3 rounded-2xl ${
          type === "user"
            ? "bg-gray-700 text-white rounded-br-md"
            : "bg-secondary-500/20 text-secondary-100 border border-secondary-500/30 rounded-bl-md"
        }`}
      >
        {type === "ai" && (
          <div className="flex items-center gap-2 mb-1">
            <Icon icon="tabler:sparkles" className="w-4 h-4 text-secondary-400" />
            <span className="text-xs text-secondary-400 font-medium">AI Tutor</span>
          </div>
        )}
        <p className="text-sm">
          {hasMath ? <MathDisplay content={content} size="sm" /> : content}
        </p>
      </div>
    </div>
  );
};

export const FeatureHints = () => {
  const t = useTranslations("landing.hintsFeature");
  const [isInView, setIsInView] = useState(false);
  const [showTyping, setShowTyping] = useState(false);

  useEffect(() => {
    AOS.init({ once: true });

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.3 }
    );

    const section = document.getElementById("hints-feature");
    if (section) observer.observe(section);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isInView) return;

    // Show typing indicator before AI responses
    const typingTimers = [
      setTimeout(() => setShowTyping(true), 1500),
      setTimeout(() => setShowTyping(false), 2500),
      setTimeout(() => setShowTyping(true), 4500),
      setTimeout(() => setShowTyping(false), 5500),
    ];

    return () => typingTimers.forEach(clearTimeout);
  }, [isInView]);

  const benefits = [
    { key: "socratic", icon: "tabler:message-question" },
    { key: "levels", icon: "tabler:stairs" },
    { key: "encourage", icon: "tabler:heart" },
    { key: "partial", icon: "tabler:chart-pie" },
  ];

  const chatMessages = [
    { type: "user" as const, content: t("demo.chat1User"), delay: 500, hasMath: true },
    { type: "ai" as const, content: t("demo.chat2Ai"), delay: 2500, hasMath: true },
    { type: "user" as const, content: t("demo.chat3User"), delay: 4000, hasMath: true },
    { type: "ai" as const, content: t("demo.chat4Ai"), delay: 5500, hasMath: true },
  ];

  return (
    <section id="hints-feature" className="py-20 bg-white dark:bg-zinc-900 overflow-hidden">
      <div className="container mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary-100 dark:bg-secondary-900/30 text-secondary-600 dark:text-secondary-400 text-sm font-medium mb-4"
            data-aos="fade-up"
          >
            <Icon icon="tabler:bulb" className="w-4 h-4" />
            {t("badge")}
          </span>

          <h2
            className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            {t("title")}
          </h2>

          <p
            className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            {t("subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Chat Mockup */}
          <div data-aos="fade-right" data-aos-delay="100">
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-secondary-500/20 to-secondary-600/10 rounded-3xl blur-2xl" />

              {/* Main mockup container */}
              <div className="relative bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden shadow-2xl max-w-md mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-800 border-b border-gray-700">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary-400 to-secondary-600 flex items-center justify-center">
                    <Icon icon="tabler:robot" className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium text-sm">{t("demo.aiTutor")}</h4>
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-success-400" />
                      <span className="text-xs text-gray-400">{t("demo.alwaysHere")}</span>
                    </div>
                  </div>
                </div>

                {/* Chat area */}
                <div className="p-4 min-h-[320px] space-y-4">
                  {/* Problem context */}
                  <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                      <Icon icon="tabler:math" className="w-4 h-4" />
                      <span>{t("demo.currentProblem")}</span>
                    </div>
                    <p className="text-gray-300 text-sm">
                      <MathDisplay content="Find the derivative: $f(x) = x^3 - 2x^2 + 5x$" size="sm" />
                    </p>
                  </div>

                  {/* Chat messages */}
                  {chatMessages.map((msg, index) => (
                    <ChatMessage
                      key={index}
                      type={msg.type}
                      content={msg.content}
                      delay={msg.delay}
                      isVisible={isInView}
                      hasMath={msg.hasMath}
                    />
                  ))}

                  {/* Typing indicator */}
                  {showTyping && (
                    <div className="flex justify-start">
                      <div className="bg-secondary-500/20 border border-secondary-500/30 rounded-2xl rounded-bl-md">
                        <TypingIndicator />
                      </div>
                    </div>
                  )}
                </div>

                {/* Input area */}
                <div className="px-4 py-3 bg-gray-800/50 border-t border-gray-700">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-700 rounded-full px-4 py-2 text-gray-400 text-sm">
                      {t("demo.askHint")}
                    </div>
                    <button className="w-10 h-10 rounded-full bg-secondary-500 flex items-center justify-center hover:bg-secondary-600 transition-colors">
                      <Icon icon="tabler:send" className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-secondary-500/10 rounded-full blur-xl" />
              <div className="absolute -top-4 -left-4 w-32 h-32 bg-secondary-500/10 rounded-full blur-xl" />
            </div>
          </div>

          {/* Right: Benefits */}
          <div data-aos="fade-left" data-aos-delay="200">
            <div className="space-y-6">
              {/* Key point */}
              <div className="flex items-start gap-4 p-4 bg-secondary-50 dark:bg-secondary-900/20 rounded-xl border border-secondary-200 dark:border-secondary-800">
                <div className="w-12 h-12 rounded-xl bg-secondary-100 dark:bg-secondary-900/50 flex items-center justify-center flex-shrink-0">
                  <Icon icon="tabler:bulb" className="w-6 h-6 text-secondary-600 dark:text-secondary-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {t("demo.socraticMethod")}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t("demo.socraticDesc")}
                  </p>
                </div>
              </div>

              {/* Benefits list */}
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li
                    key={benefit.key}
                    className="flex items-start gap-3"
                    data-aos="fade-up"
                    data-aos-delay={300 + index * 100}
                  >
                    <div className="w-8 h-8 rounded-lg bg-secondary-100 dark:bg-secondary-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon icon={benefit.icon} className="w-4 h-4 text-secondary-600 dark:text-secondary-400" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">
                      {t(`benefits.${benefit.key}`)}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Quote */}
              <blockquote className="border-l-4 border-secondary-500 pl-4 italic text-gray-600 dark:text-gray-400">
                &ldquo;I cannot teach anybody anything. I can only make them think.&rdquo;
                <footer className="text-sm text-gray-500 mt-1">— Socrates</footer>
              </blockquote>
            </div>
          </div>
        </div>
      </div>

      {/* Add CSS for fadeIn animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </section>
  );
};
