// modules/courses/config/courses-data.ts
// Static course definitions

import type { Course } from "../types";

/**
 * Pre-Calculus Algebra Course
 * This is the primary (and initially only) course for MVP
 */
export const PRE_CALCULUS_COURSE: Course = {
  id: "pre-calculus-algebra",
  name: "Pre-Calculus Algebra",
  nameHe: "אלגברה קדם-אינפיניטסימלית",
  description: "Master the foundations of algebra before diving into calculus. Covers order of operations through quadratics and functions.",
  descriptionHe: "שלוט ביסודות האלגברה לפני הכניסה לחדו״א. מכסה סדר פעולות ועד משוואות ריבועיות ופונקציות.",
  icon: "tabler:math-function",
  color: "#3B82F6", // primary-500
  isActive: true,
  sortOrder: 1,
  branchIds: ["foundations", "linear", "polynomials", "quadratics", "functions"],
};

/**
 * All available courses
 * For MVP, only Pre-Calculus Algebra is active
 */
export const COURSES: Course[] = [
  PRE_CALCULUS_COURSE,
  // Future courses (inactive for now)
  {
    id: "calculus-1",
    name: "Calculus 1",
    nameHe: "חשבון אינפיניטסימלי 1",
    description: "Limits, derivatives, and basic integration",
    descriptionHe: "גבולות, נגזרות ואינטגרציה בסיסית",
    icon: "tabler:chart-area-line",
    color: "#8B5CF6", // secondary-500
    isActive: false,
    sortOrder: 2,
    branchIds: [],
  },
  {
    id: "linear-algebra",
    name: "Linear Algebra",
    nameHe: "אלגברה ליניארית",
    description: "Vectors, matrices, and linear transformations",
    descriptionHe: "וקטורים, מטריצות והעתקות ליניאריות",
    icon: "tabler:grid-3x3",
    color: "#10B981", // success-500
    isActive: false,
    sortOrder: 3,
    branchIds: [],
  },
];

/**
 * Get course by ID
 */
export function getCourseById(courseId: string): Course | undefined {
  return COURSES.find((c) => c.id === courseId);
}

/**
 * Get all active courses
 */
export function getActiveCourses(): Course[] {
  return COURSES.filter((c) => c.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Get all courses (including inactive)
 */
export function getAllCourses(): Course[] {
  return COURSES.sort((a, b) => a.sortOrder - b.sortOrder);
}
