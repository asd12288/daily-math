"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Icon } from "@iconify/react";
import AOS from "aos";
import "aos/dist/aos.css";

// Animated XP counter
const XPCounter = ({ target, isActive }: { target: number; isActive: boolean }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isActive) {
      const resetTimeout = setTimeout(() => setCount(0), 0);
      return () => clearTimeout(resetTimeout);
    }

    let current = 0;
    const increment = target / 30;
    const interval = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(interval);
      } else {
        setCount(Math.floor(current));
      }
    }, 50);

    return () => clearInterval(interval);
  }, [target, isActive]);

  return <span>{count}</span>;
};

// Animated progress bar
const ProgressBar = ({ progress, delay = 0 }: { progress: number; delay?: number }) => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => setWidth(progress), delay);
    return () => clearTimeout(timeout);
  }, [progress, delay]);

  return (
    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-success-500 to-success-400 rounded-full transition-all duration-1000 ease-out"
        style={{ width: `${width}%` }}
      />
    </div>
  );
};

export const FeaturePractice = () => {
  const t = useTranslations("landing.practiceFeature");
  const [isInView, setIsInView] = useState(false);

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

    const section = document.getElementById("practice-feature");
    if (section) observer.observe(section);

    return () => observer.disconnect();
  }, []);

  const benefits = [
    { key: "count", icon: "tabler:adjustments" },
    { key: "adaptive", icon: "tabler:trending-up" },
    { key: "photo", icon: "tabler:camera" },
    { key: "review", icon: "tabler:refresh" },
    { key: "streak", icon: "tabler:flame" },
  ];

  const mockExercises = [
    { id: 1, topic: "Derivatives", difficulty: "Medium", status: "completed", xp: 15 },
    { id: 2, topic: "Derivatives", difficulty: "Easy", status: "completed", xp: 10 },
    { id: 3, topic: "Limits", difficulty: "Medium", status: "current", xp: 15 },
    { id: 4, topic: "Integration", difficulty: "Hard", status: "pending", xp: 20 },
    { id: 5, topic: "Derivatives", difficulty: "Easy", status: "pending", xp: 10 },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "text-success-400 bg-success-500/20";
      case "Medium":
        return "text-warning-400 bg-warning-500/20";
      case "Hard":
        return "text-error-400 bg-error-500/20";
      default:
        return "text-gray-400 bg-gray-500/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <Icon icon="tabler:check" className="w-4 h-4 text-success-400" />;
      case "current":
        return <Icon icon="tabler:player-play-filled" className="w-4 h-4 text-primary-400 animate-pulse" />;
      default:
        return <Icon icon="tabler:circle" className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <section id="practice-feature" className="py-20 bg-gray-50 dark:bg-zinc-950 overflow-hidden">
      <div className="container mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div className="order-2 lg:order-1" data-aos="fade-right" data-aos-delay="100">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success-100 dark:bg-success-900/30 text-success-600 dark:text-success-400 text-sm font-medium mb-4">
              <Icon icon="tabler:target-arrow" className="w-4 h-4" />
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
                  data-aos-delay={200 + index * 100}
                >
                  <div className="w-8 h-8 rounded-lg bg-success-100 dark:bg-success-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon icon={benefit.icon} className="w-4 h-4 text-success-600 dark:text-success-400" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">
                    {t(`benefits.${benefit.key}`)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Animated Mockup */}
          <div className="order-1 lg:order-2" data-aos="fade-left" data-aos-delay="200">
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-success-500/20 to-success-600/10 rounded-3xl blur-2xl" />

              {/* Main mockup container */}
              <div className="relative bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="px-6 py-4 bg-gray-800 border-b border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-semibold">{t("demo.todaysPractice")}</h3>
                      <p className="text-gray-400 text-sm">{t("demo.exercisesTime")}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      {/* Streak */}
                      <div className="flex items-center gap-1.5 text-warning-400">
                        <Icon icon="tabler:flame" className="w-5 h-5" />
                        <span className="font-semibold">7</span>
                      </div>
                      {/* XP */}
                      <div className="flex items-center gap-1.5 text-success-400">
                        <Icon icon="tabler:star-filled" className="w-5 h-5" />
                        <span className="font-semibold">
                          +<XPCounter target={isInView ? 40 : 0} isActive={isInView} /> XP
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mt-3">
                    <div className="flex justify-between text-sm text-gray-400 mb-1">
                      <span>{t("demo.progress")}</span>
                      <span>2/5 {t("demo.completed")}</span>
                    </div>
                    <ProgressBar progress={isInView ? 40 : 0} delay={500} />
                  </div>
                </div>

                {/* Exercise list */}
                <div className="p-4 space-y-2">
                  {mockExercises.map((exercise, index) => (
                    <div
                      key={exercise.id}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                        exercise.status === "current"
                          ? "bg-primary-500/10 border border-primary-500/30"
                          : exercise.status === "completed"
                          ? "bg-gray-800/50"
                          : "bg-gray-800/30"
                      }`}
                      style={{
                        opacity: isInView ? 1 : 0,
                        transform: isInView ? "translateX(0)" : "translateX(-20px)",
                        transition: `all 0.5s ease ${index * 100}ms`,
                      }}
                    >
                      {/* Status */}
                      <div className="flex-shrink-0">{getStatusIcon(exercise.status)}</div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-white truncate">{t("demo.exercise")} {exercise.id}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getDifficultyColor(exercise.difficulty)}`}>
                            {exercise.difficulty}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">{exercise.topic}</span>
                      </div>

                      {/* XP */}
                      <span
                        className={`text-sm font-medium ${
                          exercise.status === "completed" ? "text-success-400" : "text-gray-500"
                        }`}
                      >
                        {exercise.status === "completed" ? `+${exercise.xp}` : exercise.xp} XP
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="px-4 py-3 bg-gray-800/50 border-t border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">{t("demo.personalizedLevel")}</span>
                    <div className="flex items-center gap-1 text-primary-400 text-sm">
                      <Icon icon="tabler:sparkles" className="w-4 h-4" />
                      {t("demo.aiGenerated")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
