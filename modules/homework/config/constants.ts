// Homework Module Constants

/**
 * File upload constraints
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
export const MAX_FILE_SIZE_MB = 10;
export const MAX_PAGES = 10; // For PDFs only; images are always 1 page

/**
 * Allowed file extensions (PDF + images)
 */
export const ALLOWED_EXTENSIONS = ["pdf", "jpg", "jpeg", "png", "webp"];

/**
 * Allowed MIME types
 */
export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

/**
 * MIME type to file category mapping
 */
export const ALLOWED_MIME_TYPES: Record<string, "pdf" | "image"> = {
  "application/pdf": "pdf",
  "image/jpeg": "image",
  "image/png": "image",
  "image/webp": "image",
};

/**
 * File type category
 */
export type FileCategory = "pdf" | "image";

/**
 * Helper to get file category from MIME type
 */
export function getFileCategory(mimeType: string): FileCategory {
  return ALLOWED_MIME_TYPES[mimeType] || "pdf";
}

/**
 * Helper to get MIME type from file extension
 */
export function getMimeTypeFromExtension(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase();
  const mimeMap: Record<string, string> = {
    pdf: "application/pdf",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
  };
  return mimeMap[ext || ""] || "application/pdf";
}

/**
 * XP rewards
 */
export const XP_PER_QUESTION_VIEW = 5; // XP awarded when viewing a solution

/**
 * Processing timeouts
 */
export const PROCESSING_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
export const POLLING_INTERVAL_MS = 1500; // 1.5 seconds - fast polling for quick extraction-only processing

/**
 * Difficulty colors for UI
 */
export const DIFFICULTY_STYLES = {
  easy: {
    bg: "bg-success-100 dark:bg-success-900/30",
    text: "text-success-700 dark:text-success-400",
    label: "Easy",
    labelHe: "קל",
  },
  medium: {
    bg: "bg-warning-100 dark:bg-warning-900/30",
    text: "text-warning-700 dark:text-warning-400",
    label: "Medium",
    labelHe: "בינוני",
  },
  hard: {
    bg: "bg-error-100 dark:bg-error-900/30",
    text: "text-error-700 dark:text-error-400",
    label: "Hard",
    labelHe: "קשה",
  },
} as const;

/**
 * Status styles for UI
 */
export const STATUS_STYLES = {
  uploading: {
    bg: "bg-gray-100 dark:bg-gray-800",
    text: "text-gray-600 dark:text-gray-400",
    icon: "tabler:upload",
    label: "Uploading",
    labelHe: "מעלה",
  },
  processing: {
    bg: "bg-primary-100 dark:bg-primary-900/30",
    text: "text-primary-600 dark:text-primary-400",
    icon: "tabler:loader-2",
    label: "Processing",
    labelHe: "מעבד",
  },
  completed: {
    bg: "bg-success-100 dark:bg-success-900/30",
    text: "text-success-600 dark:text-success-400",
    icon: "tabler:check",
    label: "Completed",
    labelHe: "הושלם",
  },
  failed: {
    bg: "bg-error-100 dark:bg-error-900/30",
    text: "text-error-600 dark:text-error-400",
    icon: "tabler:alert-circle",
    label: "Failed",
    labelHe: "נכשל",
  },
} as const;

/**
 * Question type labels for UI
 */
export const QUESTION_TYPE_LABELS = {
  multiple_choice: {
    label: "Multiple Choice",
    labelHe: "רב-ברירה",
    icon: "tabler:list-check",
  },
  open_ended: {
    label: "Open Ended",
    labelHe: "פתוח",
    icon: "tabler:writing",
  },
  proof: {
    label: "Proof",
    labelHe: "הוכחה",
    icon: "tabler:math-function",
  },
  calculation: {
    label: "Calculation",
    labelHe: "חישוב",
    icon: "tabler:calculator",
  },
  word_problem: {
    label: "Word Problem",
    labelHe: "בעיית מילים",
    icon: "tabler:book",
  },
} as const;

/**
 * Common subjects detected by AI
 */
export const COMMON_SUBJECTS = [
  "Calculus 1",
  "Calculus 2",
  "Linear Algebra",
  "Physics 1",
  "Physics 2",
  "Differential Equations",
  "Probability",
  "Statistics",
  "Discrete Math",
  "Other",
] as const;

/**
 * Subject colors for UI badges
 */
export const SUBJECT_COLORS: Record<string, { bg: string; text: string }> = {
  "Calculus 1": {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-400",
  },
  "Calculus 2": {
    bg: "bg-indigo-100 dark:bg-indigo-900/30",
    text: "text-indigo-700 dark:text-indigo-400",
  },
  "Linear Algebra": {
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-700 dark:text-purple-400",
  },
  "Physics 1": {
    bg: "bg-orange-100 dark:bg-orange-900/30",
    text: "text-orange-700 dark:text-orange-400",
  },
  "Physics 2": {
    bg: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-700 dark:text-amber-400",
  },
  "Differential Equations": {
    bg: "bg-cyan-100 dark:bg-cyan-900/30",
    text: "text-cyan-700 dark:text-cyan-400",
  },
  Probability: {
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    text: "text-emerald-700 dark:text-emerald-400",
  },
  Statistics: {
    bg: "bg-teal-100 dark:bg-teal-900/30",
    text: "text-teal-700 dark:text-teal-400",
  },
  "Discrete Math": {
    bg: "bg-rose-100 dark:bg-rose-900/30",
    text: "text-rose-700 dark:text-rose-400",
  },
  Other: {
    bg: "bg-gray-100 dark:bg-gray-800",
    text: "text-gray-700 dark:text-gray-400",
  },
};

/**
 * Get subject color styles (with fallback)
 */
export function getSubjectStyles(subject: string): {
  bg: string;
  text: string;
} {
  return (
    SUBJECT_COLORS[subject] || {
      bg: "bg-gray-100 dark:bg-gray-800",
      text: "text-gray-700 dark:text-gray-400",
    }
  );
}
