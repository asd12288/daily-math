// modules/courses/server/services/courses.service.ts
// Business logic for courses

import { createAdminClient } from "@/lib/appwrite/server";
import { APPWRITE_CONFIG } from "@/lib/appwrite/config";
import { Query } from "node-appwrite";
import { getCourseById, getActiveCourses } from "../../config";
import { BRANCHES, TOPICS } from "@/modules/skill-tree/config";
import type { Course, CourseWithProgress, CourseDetailData, Exercise } from "../../types";
import type { TopicProgress } from "@/modules/skill-tree/types";

// Types for database course/topic structure (for future use with Appwrite)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface DBCourse {
  $id: string;
  name: string;
  nameHe: string;
  description: string;
  descriptionHe: string;
  icon: string;
  color: string;
  topics: string; // JSON string
  isActive: boolean;
  sortOrder: number;
}

interface DBTopic {
  id: string;
  name: string;
  nameHe: string;
}

export class CoursesService {
  /**
   * Get all courses directly from the database
   */
  async getCoursesFromDB(): Promise<{ id: string; name: string; nameHe: string }[]> {
    try {
      const { databases } = await createAdminClient();

      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.courses,
        [Query.equal("isActive", true), Query.orderAsc("sortOrder")]
      );

      return response.documents.map((doc) => ({
        id: doc.$id,
        name: doc.name,
        nameHe: doc.nameHe,
      }));
    } catch (error) {
      console.error("Failed to fetch courses from DB:", error);
      return [];
    }
  }

  /**
   * Get topics for a specific course from the database
   */
  async getTopicsFromDB(courseId?: string): Promise<{ id: string; name: string; nameHe: string; courseId: string }[]> {
    try {
      const { databases } = await createAdminClient();

      const queries = [Query.equal("isActive", true)];
      if (courseId) {
        queries.push(Query.equal("$id", courseId));
      }

      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.courses,
        queries
      );

      const topics: { id: string; name: string; nameHe: string; courseId: string }[] = [];

      for (const doc of response.documents) {
        try {
          const parsedTopics = JSON.parse(doc.topics || "[]") as DBTopic[];
          for (const topic of parsedTopics) {
            topics.push({
              id: topic.id,
              name: topic.name,
              nameHe: topic.nameHe,
              courseId: doc.$id,
            });
          }
        } catch {
          console.warn(`Failed to parse topics for course ${doc.$id}`);
        }
      }

      return topics;
    } catch (error) {
      console.error("Failed to fetch topics from DB:", error);
      return [];
    }
  }

  /**
   * Get all courses with user progress
   */
  async getCoursesWithProgress(userId: string): Promise<CourseWithProgress[]> {
    const courses = getActiveCourses();
    const progressMap = await this.getUserProgressMap(userId);
    const enrolledCourseIds = await this.getEnrolledCourseIds(userId);

    return courses.map((course) => {
      const topics = this.getTopicsForCourse(course);
      const masteredTopics = topics.filter(
        (t) => (progressMap.get(t.id)?.mastery ?? 0) >= 80
      ).length;

      return {
        ...course,
        totalTopics: topics.length,
        masteredTopics,
        overallProgress: topics.length > 0
          ? Math.round((masteredTopics / topics.length) * 100)
          : 0,
        isEnrolled: enrolledCourseIds.includes(course.id),
      };
    });
  }

  /**
   * Get course detail with skill tree data
   */
  async getCourseDetail(userId: string, courseId: string): Promise<CourseDetailData | null> {
    const course = getCourseById(courseId);
    if (!course) return null;

    const branches = BRANCHES.filter((b) => course.branchIds.includes(b.id));
    const topics = this.getTopicsForCourse(course);
    const progressMap = await this.getUserProgressMap(userId);

    // Calculate progress stats
    const masteredTopics = topics.filter(
      (t) => (progressMap.get(t.id)?.mastery ?? 0) >= 80
    ).length;
    const inProgressTopics = topics.filter(
      (t) => {
        const mastery = progressMap.get(t.id)?.mastery ?? 0;
        return mastery > 0 && mastery < 80;
      }
    ).length;

    return {
      course,
      branches,
      topics,
      userProgress: {
        totalTopics: topics.length,
        masteredTopics,
        inProgressTopics,
        overallProgress: topics.length > 0
          ? Math.round((masteredTopics / topics.length) * 100)
          : 0,
      },
    };
  }

  /**
   * Get exercises for a topic from the pre-seeded bank
   */
  async getExercisesForTopic(
    topicId: string,
    options: {
      difficulty?: "easy" | "medium" | "hard";
      limit?: number;
      excludeIds?: string[];
    } = {}
  ): Promise<Exercise[]> {
    const { difficulty, limit = 10, excludeIds = [] } = options;

    try {
      const { databases } = await createAdminClient();

      const queries: string[] = [
        Query.equal("topicId", topicId),
        Query.orderAsc("timesUsed"), // Prefer less-used questions
        Query.limit(limit * 2), // Fetch more to filter
      ];

      if (difficulty) {
        queries.push(Query.equal("difficulty", difficulty));
      }

      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.exercises,
        queries
      );

      // Filter out excluded IDs and limit
      const filtered = response.documents
        .filter((doc) => !excludeIds.includes(doc.$id))
        .slice(0, limit);

      return filtered as unknown as Exercise[];
    } catch (error) {
      console.error("Failed to fetch exercises:", error);
      return [];
    }
  }

  /**
   * Get exercises for a practice session
   * Returns 5 exercises: 2 easy, 2 medium, 1 hard
   */
  async getExercisesForSession(
    topicId: string,
    excludeIds: string[] = []
  ): Promise<Exercise[]> {
    const easy = await this.getExercisesForTopic(topicId, {
      difficulty: "easy",
      limit: 2,
      excludeIds,
    });

    const medium = await this.getExercisesForTopic(topicId, {
      difficulty: "medium",
      limit: 2,
      excludeIds: [...excludeIds, ...easy.map((e) => e.$id)],
    });

    const hard = await this.getExercisesForTopic(topicId, {
      difficulty: "hard",
      limit: 1,
      excludeIds: [...excludeIds, ...easy.map((e) => e.$id), ...medium.map((e) => e.$id)],
    });

    // Shuffle and return
    const exercises = [...easy, ...medium, ...hard];
    return this.shuffleArray(exercises);
  }

  /**
   * Increment times used counter for an exercise
   */
  async markExerciseUsed(exerciseId: string): Promise<void> {
    try {
      const { databases } = await createAdminClient();

      // Get current value
      const doc = await databases.getDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.exercises,
        exerciseId
      );

      // Increment
      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.exercises,
        exerciseId,
        { timesUsed: (doc.timesUsed || 0) + 1 }
      );
    } catch (error) {
      console.error("Failed to mark exercise used:", error);
    }
  }

  /**
   * Enroll user in a course
   */
  async enrollInCourse(userId: string, courseId: string): Promise<boolean> {
    try {
      const { databases } = await createAdminClient();

      // Get user profile
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.usersProfile,
        [Query.equal("userId", userId)]
      );

      if (response.documents.length === 0) {
        console.error("User profile not found");
        return false;
      }

      const profile = response.documents[0];
      const enrolledCourses: string[] = JSON.parse(profile.enrolledCourses || "[]");

      // Check if already enrolled
      if (enrolledCourses.includes(courseId)) {
        return true; // Already enrolled
      }

      // Add course
      enrolledCourses.push(courseId);

      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.usersProfile,
        profile.$id,
        { enrolledCourses: JSON.stringify(enrolledCourses) }
      );

      return true;
    } catch (error) {
      console.error("Failed to enroll in course:", error);
      return false;
    }
  }

  /**
   * Unenroll user from a course
   */
  async unenrollFromCourse(userId: string, courseId: string): Promise<boolean> {
    try {
      const { databases } = await createAdminClient();

      // Get user profile
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.usersProfile,
        [Query.equal("userId", userId)]
      );

      if (response.documents.length === 0) {
        console.error("User profile not found");
        return false;
      }

      const profile = response.documents[0];
      const enrolledCourses: string[] = JSON.parse(profile.enrolledCourses || "[]");

      // Remove course
      const updatedCourses = enrolledCourses.filter((id) => id !== courseId);

      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.usersProfile,
        profile.$id,
        { enrolledCourses: JSON.stringify(updatedCourses) }
      );

      return true;
    } catch (error) {
      console.error("Failed to unenroll from course:", error);
      return false;
    }
  }

  /**
   * Get user's enrolled course IDs
   */
  async getEnrolledCourseIds(userId: string): Promise<string[]> {
    try {
      const { databases } = await createAdminClient();

      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.usersProfile,
        [Query.equal("userId", userId)]
      );

      if (response.documents.length === 0) {
        return [];
      }

      return JSON.parse(response.documents[0].enrolledCourses || "[]");
    } catch (error) {
      console.error("Failed to get enrolled courses:", error);
      return [];
    }
  }

  // === Private helper methods ===

  private getTopicsForCourse(course: Course) {
    return TOPICS.filter((t) => course.branchIds.includes(t.branchId));
  }

  private async getUserProgressMap(userId: string): Promise<Map<string, TopicProgress>> {
    const map = new Map<string, TopicProgress>();

    try {
      const { databases } = await createAdminClient();

      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.userProgress,
        [Query.equal("userId", userId)]
      );

      for (const doc of response.documents) {
        map.set(doc.topicId, doc as unknown as TopicProgress);
      }
    } catch (error) {
      // Collection might not exist yet, return empty map
      console.warn("Could not fetch user progress:", error);
    }

    return map;
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

// Singleton instance
export const coursesService = new CoursesService();
