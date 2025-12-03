// modules/session/config/constants.ts
// Session configuration constants

import type { SessionPreset, SessionFilters, SessionMode, SessionDifficulty } from "../types/session.types";

/**
 * XP rewards configuration
 */
export const SESSION_XP = {
  /** Base XP by difficulty */
  base: {
    easy: 10,
    medium: 15,
    hard: 20,
  } as const satisfies Record<SessionDifficulty, number>,

  /** XP multiplier by mode */
  modeMultiplier: {
    learn: 0.5,    // 50% XP for viewing solutions
    review: 0.5,   // 50% XP for homework review
    practice: 1.0, // 100% XP for answering correctly
  } as const satisfies Record<SessionMode, number>,

  /** Completion bonus */
  completionBonus: 15,
} as const;

/**
 * Calculate XP for a question based on difficulty and mode
 */
export function calculateQuestionXp(
  difficulty: SessionDifficulty,
  mode: SessionMode
): number {
  const base = SESSION_XP.base[difficulty];
  const multiplier = SESSION_XP.modeMultiplier[mode];
  return Math.round(base * multiplier);
}

/**
 * Session length options
 */
export const SESSION_LENGTHS = {
  quick: {
    count: 3,
    estimatedMinutes: 5,
  },
  normal: {
    count: 5,
    estimatedMinutes: 10,
  },
  extended: {
    count: 10,
    estimatedMinutes: 20,
  },
} as const;

/**
 * Default session length
 */
export const DEFAULT_SESSION_LENGTH = "normal" as const;

/**
 * Session presets for quick start
 */
export const SESSION_PRESETS: SessionPreset[] = [
  {
    id: "warmup",
    name: "Warm Up",
    nameHe: "חימום",
    description: "3 easy questions to get started",
    descriptionHe: "3 שאלות קלות להתחלה",
    icon: "tabler:sun",
    filters: {
      difficulty: "easy",
      count: 3,
    },
  },
  {
    id: "practice",
    name: "Practice",
    nameHe: "תרגול",
    description: "5 mixed questions for regular practice",
    descriptionHe: "5 שאלות מעורבות לתרגול רגיל",
    icon: "tabler:target",
    filters: {
      difficulty: "all",
      count: 5,
    },
  },
  {
    id: "challenge",
    name: "Challenge",
    nameHe: "אתגר",
    description: "5 hard questions to test yourself",
    descriptionHe: "5 שאלות קשות לבחון את עצמך",
    icon: "tabler:flame",
    filters: {
      difficulty: "hard",
      count: 5,
    },
  },
  {
    id: "deep-dive",
    name: "Deep Dive",
    nameHe: "צלילה עמוקה",
    description: "10 mixed questions for intensive practice",
    descriptionHe: "10 שאלות מעורבות לתרגול אינטנסיבי",
    icon: "tabler:scuba-mask",
    filters: {
      difficulty: "all",
      count: 10,
    },
  },
];

/**
 * Default filters
 */
export const DEFAULT_FILTERS: SessionFilters = {
  difficulty: "all",
  questionType: undefined,
  count: SESSION_LENGTHS.normal.count,
};

/**
 * Session auto-save interval (milliseconds)
 */
export const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

/**
 * Maximum number of active sessions per user
 */
export const MAX_ACTIVE_SESSIONS = 5;

/**
 * Session expiry time (milliseconds) - sessions older than this can be cleaned up
 */
export const SESSION_EXPIRY_TIME = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Difficulty display configuration
 */
export const DIFFICULTY_CONFIG: Record<SessionDifficulty, {
  color: string;
  bgClass: string;
  textClass: string;
  icon: string;
  label: { en: string; he: string };
}> = {
  easy: {
    color: "success",
    bgClass: "bg-success-100 dark:bg-success-900/30",
    textClass: "text-success-700 dark:text-success-400",
    icon: "tabler:star",
    label: { en: "Easy", he: "קל" },
  },
  medium: {
    color: "warning",
    bgClass: "bg-warning-100 dark:bg-warning-900/30",
    textClass: "text-warning-700 dark:text-warning-400",
    icon: "tabler:star-half-filled",
    label: { en: "Medium", he: "בינוני" },
  },
  hard: {
    color: "error",
    bgClass: "bg-error-100 dark:bg-error-900/30",
    textClass: "text-error-700 dark:text-error-400",
    icon: "tabler:stars",
    label: { en: "Hard", he: "קשה" },
  },
};

/**
 * Session mode display configuration
 */
export const MODE_CONFIG: Record<SessionMode, {
  icon: string;
  label: { en: string; he: string };
  description: { en: string; he: string };
}> = {
  learn: {
    icon: "tabler:book",
    label: { en: "Learn", he: "למידה" },
    description: { en: "View solutions to learn", he: "צפה בפתרונות ללמידה" },
  },
  review: {
    icon: "tabler:eye",
    label: { en: "Review", he: "סקירה" },
    description: { en: "Review homework solutions", he: "סקירת פתרונות שיעורי בית" },
  },
  practice: {
    icon: "tabler:pencil",
    label: { en: "Practice", he: "תרגול" },
    description: { en: "Answer questions first", he: "ענה על השאלות קודם" },
  },
};
