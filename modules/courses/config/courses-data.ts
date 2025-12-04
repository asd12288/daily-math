// modules/courses/config/courses-data.ts
// Course definitions - All data comes from database

import type { Course } from "../types";

/**
 * All available courses - loaded from database
 * This array is kept empty as courses are managed in Appwrite
 */
export const COURSES: Course[] = [];

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
