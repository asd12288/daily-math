"use client";

import { Icon } from "@iconify/react";

// Dashboard Components
import { WelcomeCard } from "@/components/design-showcase/dashboard/WelcomeCard";
import { StatsCards } from "@/components/design-showcase/dashboard/StatsCards";
import { ProgressCard } from "@/components/design-showcase/dashboard/ProgressCard";

// Gamification Components
import { XPBadgeShowcase } from "@/components/design-showcase/gamification/XPBadge";
import { StreakCounterShowcase } from "@/components/design-showcase/gamification/StreakCounter";
import { LevelBadgeShowcase } from "@/components/design-showcase/gamification/LevelBadge";
import { XPToastShowcase } from "@/components/design-showcase/gamification/XPToast";

// Course Components
import { CourseCardShowcase } from "@/components/design-showcase/courses/CourseCard";
import { TopicBadgeShowcase } from "@/components/design-showcase/courses/TopicBadge";

// Exercise Components
import { DifficultyBadgeShowcase } from "@/components/design-showcase/exercises/DifficultyBadge";
import { ExerciseCardShowcase } from "@/components/design-showcase/exercises/ExerciseCard";
import { ExerciseListShowcase } from "@/components/design-showcase/exercises/ExerciseList";

// AI Components
import { AIAnalysisCardShowcase } from "@/components/design-showcase/ai/AIAnalysisCard";
import { UploadZoneShowcase } from "@/components/design-showcase/ai/UploadZone";
import { SolutionRevealShowcase } from "@/components/design-showcase/ai/SolutionReveal";
import { TipCardShowcase } from "@/components/design-showcase/ai/TipCard";

// Settings Components
import { ExerciseCountSliderShowcase } from "@/components/design-showcase/settings/ExerciseCountSlider";
import { NotificationToggleShowcase } from "@/components/design-showcase/settings/NotificationToggle";

// Skill Tree Components
import { SkillTreeShowcase } from "@/components/design-showcase/skill-tree";

interface SectionProps {
  id: string;
  title: string;
  icon: string;
  children: React.ReactNode;
}

function Section({ id, title, icon, children }: SectionProps) {
  return (
    <section id={id} className="mb-12 scroll-mt-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
          <Icon icon={icon} className="text-xl text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>
      <div className="ps-13">{children}</div>
    </section>
  );
}

interface SubSectionProps {
  title: string;
  children: React.ReactNode;
}

function SubSection({ title, children }: SubSectionProps) {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">{title}</h3>
      {children}
    </div>
  );
}

// Table of contents
function TableOfContents() {
  const sections = [
    { id: "dashboard", title: "Dashboard", icon: "tabler:layout-dashboard" },
    { id: "gamification", title: "Gamification", icon: "tabler:trophy" },
    { id: "skill-tree", title: "Skill Tree", icon: "tabler:binary-tree" },
    { id: "courses", title: "Courses", icon: "tabler:book" },
    { id: "exercises", title: "Exercises", icon: "tabler:list-check" },
    { id: "ai", title: "AI Features", icon: "tabler:sparkles" },
    { id: "settings", title: "Settings", icon: "tabler:settings" },
  ];

  return (
    <div className="sticky top-6 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <h4 className="font-semibold mb-3 text-sm text-gray-500 uppercase tracking-wide">
        Contents
      </h4>
      <nav className="space-y-1">
        {sections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Icon icon={section.icon} className="text-gray-400" />
            {section.title}
          </a>
        ))}
      </nav>
    </div>
  );
}

export default function DevDesignPage() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Icon icon="tabler:palette" className="text-3xl text-primary-600" />
          <h1 className="text-3xl font-bold">Design System</h1>
        </div>
        <p className="text-gray-500">
          Visual reference for all DailyMath UI components. These are design mockups with static
          data.
        </p>
      </div>

      <div className="flex gap-8">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Dashboard Section */}
          <Section id="dashboard" title="Dashboard Components" icon="tabler:layout-dashboard">
            <SubSection title="Welcome Card">
              <WelcomeCard />
            </SubSection>

            <SubSection title="Stats Cards">
              <StatsCards />
            </SubSection>

            <SubSection title="Level Progress">
              <ProgressCard />
            </SubSection>
          </Section>

          {/* Gamification Section */}
          <Section id="gamification" title="Gamification" icon="tabler:trophy">
            <SubSection title="XP Badge">
              <XPBadgeShowcase />
            </SubSection>

            <SubSection title="Streak Counter">
              <StreakCounterShowcase />
            </SubSection>

            <SubSection title="Level Badge">
              <LevelBadgeShowcase />
            </SubSection>

            <SubSection title="XP Toast Notifications">
              <XPToastShowcase />
            </SubSection>
          </Section>

          {/* Skill Tree Section */}
          <Section id="skill-tree" title="Skill Tree" icon="tabler:binary-tree">
            <SubSection title="React Flow Visualization">
              <SkillTreeShowcase />
            </SubSection>
          </Section>

          {/* Courses Section */}
          <Section id="courses" title="Courses" icon="tabler:book">
            <SubSection title="Course Cards">
              <CourseCardShowcase />
            </SubSection>

            <SubSection title="Topic Badges & Progress">
              <TopicBadgeShowcase />
            </SubSection>
          </Section>

          {/* Exercises Section */}
          <Section id="exercises" title="Exercises" icon="tabler:list-check">
            <SubSection title="Difficulty Badges">
              <DifficultyBadgeShowcase />
            </SubSection>

            <SubSection title="Exercise List">
              <ExerciseListShowcase />
            </SubSection>

            <SubSection title="Exercise Card (Full View)">
              <ExerciseCardShowcase />
            </SubSection>
          </Section>

          {/* AI Section */}
          <Section id="ai" title="AI Features" icon="tabler:sparkles">
            <SubSection title="Upload Zone">
              <UploadZoneShowcase />
            </SubSection>

            <SubSection title="AI Analysis">
              <AIAnalysisCardShowcase />
            </SubSection>

            <SubSection title="Solution Reveal">
              <SolutionRevealShowcase />
            </SubSection>

            <SubSection title="Tips & Hints">
              <TipCardShowcase />
            </SubSection>
          </Section>

          {/* Settings Section */}
          <Section id="settings" title="Settings" icon="tabler:settings">
            <SubSection title="Exercise Count Slider">
              <ExerciseCountSliderShowcase />
            </SubSection>

            <SubSection title="Notification Settings">
              <NotificationToggleShowcase />
            </SubSection>
          </Section>
        </div>

        {/* Sidebar - Table of Contents */}
        <div className="hidden xl:block w-64 shrink-0">
          <TableOfContents />
        </div>
      </div>
    </div>
  );
}
