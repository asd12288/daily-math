// modules/skill-tree/server/services/topic-data.service.ts
// Fetches topics and branches from the database with caching

import { createAdminClient } from "@/lib/appwrite/server";
import { APPWRITE_CONFIG } from "@/lib/appwrite/config";
import { Query } from "node-appwrite";
import type { Branch, Topic, BranchId, Difficulty } from "../../types";

// In-memory cache with TTL
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
let topicsCache: CacheEntry<Topic[]> | null = null;
let branchesCache: CacheEntry<Branch[]> | null = null;
let coursesCache: CacheEntry<CourseData[]> | null = null;

interface CourseData {
  id: string;
  name: string;
  nameHe: string;
  description: string;
  descriptionHe: string;
  icon: string;
  color: string;
  topics: string; // JSON string of topic references
  isActive: boolean;
  sortOrder: number;
}

interface DBTopic {
  $id: string;
  courseId: string;
  name: string;
  nameHe: string;
  description: string;
  descriptionHe: string;
  branchId: string;
  order: number;
  prerequisites: string;
  difficultyLevels: string;
  questionTypes: string;
  keywords: string;
  isActive: boolean;
}

/**
 * Service to fetch topics and branches from the database
 * Uses in-memory caching to avoid repeated DB calls
 */
export class TopicDataService {
  /**
   * Get all topics from the database
   */
  static async getTopics(): Promise<Topic[]> {
    const now = Date.now();

    // Return cached data if valid
    if (topicsCache && topicsCache.expiresAt > now) {
      return topicsCache.data;
    }

    try {
      const { databases } = await createAdminClient();

      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.topics,
        [
          Query.equal("isActive", true),
          Query.orderAsc("order"),
          Query.limit(100),
        ]
      );

      const topics: Topic[] = response.documents.map((doc) => {
        const dbTopic = doc as unknown as DBTopic;
        return {
          id: dbTopic.$id,
          courseId: dbTopic.courseId,
          name: dbTopic.name,
          nameHe: dbTopic.nameHe,
          description: dbTopic.description,
          descriptionHe: dbTopic.descriptionHe || dbTopic.description,
          branchId: dbTopic.branchId as BranchId,
          prerequisites: this.parseJsonArray(dbTopic.prerequisites),
          order: dbTopic.order,
          difficultyLevels: this.parseJsonArray(dbTopic.difficultyLevels) as Difficulty[],
          questionTypes: this.parseJsonArray(dbTopic.questionTypes),
          keywords: this.parseJsonArray(dbTopic.keywords),
        };
      });

      // Update cache
      topicsCache = {
        data: topics,
        expiresAt: now + CACHE_TTL,
      };

      console.log(`[TopicData] Loaded ${topics.length} topics from database`);
      return topics;
    } catch (error) {
      console.error("[TopicData] Failed to fetch topics:", error);
      return topicsCache?.data || [];
    }
  }

  /**
   * Get all branches (derived from topics)
   * Branches are inferred from unique branchIds in topics
   */
  static async getBranches(): Promise<Branch[]> {
    const now = Date.now();

    // Return cached data if valid
    if (branchesCache && branchesCache.expiresAt > now) {
      return branchesCache.data;
    }

    const topics = await this.getTopics();

    // Build branches from unique branchIds
    const branchMap = new Map<string, Branch>();

    // Branch metadata - can be extended or moved to DB later
    const branchMeta: Record<string, Omit<Branch, "id">> = {
      limits: {
        name: "Limits",
        nameHe: "גבולות",
        icon: "tabler:arrows-move-horizontal",
        color: "blue",
        order: 1,
      },
      "derivatives-basic": {
        name: "Basic Derivatives",
        nameHe: "נגזרות בסיסיות",
        icon: "tabler:chart-line",
        color: "green",
        order: 2,
      },
      "derivatives-advanced": {
        name: "Advanced Derivatives",
        nameHe: "נגזרות מתקדמות",
        icon: "tabler:chart-dots-3",
        color: "purple",
        order: 3,
      },
      applications: {
        name: "Applications",
        nameHe: "יישומים",
        icon: "tabler:tools",
        color: "orange",
        order: 4,
      },
      integration: {
        name: "Integration",
        nameHe: "אינטגרציה",
        icon: "tabler:math-integral",
        color: "red",
        order: 5,
      },
      // Legacy branches (if any old data exists)
      foundations: {
        name: "Foundations",
        nameHe: "יסודות",
        icon: "tabler:building-arch",
        color: "gray",
        order: 0,
      },
      linear: {
        name: "Linear",
        nameHe: "לינארי",
        icon: "tabler:chart-line",
        color: "blue",
        order: 1,
      },
      polynomials: {
        name: "Polynomials",
        nameHe: "פולינומים",
        icon: "tabler:math-function",
        color: "green",
        order: 2,
      },
      quadratics: {
        name: "Quadratics",
        nameHe: "משוואות ריבועיות",
        icon: "tabler:chart-area",
        color: "purple",
        order: 3,
      },
      functions: {
        name: "Functions",
        nameHe: "פונקציות",
        icon: "tabler:graph",
        color: "orange",
        order: 4,
      },
    };

    for (const topic of topics) {
      if (!branchMap.has(topic.branchId)) {
        const meta = branchMeta[topic.branchId] || {
          name: topic.branchId,
          nameHe: topic.branchId,
          icon: "tabler:book",
          color: "gray",
          order: 99,
        };
        branchMap.set(topic.branchId, {
          id: topic.branchId,
          ...meta,
        });
      }
    }

    const branches = Array.from(branchMap.values()).sort(
      (a, b) => a.order - b.order
    );

    // Update cache
    branchesCache = {
      data: branches,
      expiresAt: now + CACHE_TTL,
    };

    console.log(`[TopicData] Derived ${branches.length} branches from topics`);
    return branches;
  }

  /**
   * Get all courses from the database
   */
  static async getCourses(): Promise<CourseData[]> {
    const now = Date.now();

    // Return cached data if valid
    if (coursesCache && coursesCache.expiresAt > now) {
      return coursesCache.data;
    }

    try {
      const { databases } = await createAdminClient();

      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.courses,
        [Query.orderAsc("sortOrder")]
      );

      const courses: CourseData[] = response.documents.map((doc) => ({
        id: doc.$id,
        name: doc.name,
        nameHe: doc.nameHe,
        description: doc.description,
        descriptionHe: doc.descriptionHe,
        icon: doc.icon,
        color: doc.color,
        topics: doc.topics || "[]",
        isActive: doc.isActive ?? true,
        sortOrder: doc.sortOrder ?? 0,
      }));

      // Update cache
      coursesCache = {
        data: courses,
        expiresAt: now + CACHE_TTL,
      };

      console.log(`[TopicData] Loaded ${courses.length} courses from database`);
      return courses;
    } catch (error) {
      console.error("[TopicData] Failed to fetch courses:", error);
      return coursesCache?.data || [];
    }
  }

  /**
   * Get a course by ID from the database
   */
  static async getCourseById(courseId: string): Promise<CourseData | null> {
    const courses = await this.getCourses();
    return courses.find((c) => c.id === courseId) || null;
  }

  /**
   * Get topic by ID
   */
  static async getTopicById(topicId: string): Promise<Topic | null> {
    const topics = await this.getTopics();
    return topics.find((t) => t.id === topicId) || null;
  }

  /**
   * Get topics by branch
   */
  static async getTopicsByBranch(branchId: BranchId): Promise<Topic[]> {
    const topics = await this.getTopics();
    return topics
      .filter((t) => t.branchId === branchId)
      .sort((a, b) => a.order - b.order);
  }

  /**
   * Get branch IDs for a course (from the topics)
   */
  static async getBranchIdsForCourse(courseId: string): Promise<BranchId[]> {
    const topics = await this.getTopics();
    const courseTopics = topics.filter((t) => t.courseId === courseId);

    const branchIds = new Set<BranchId>();
    for (const topic of courseTopics) {
      branchIds.add(topic.branchId);
    }

    return Array.from(branchIds);
  }

  /**
   * Get the first topic (for fallback purposes)
   */
  static async getFirstTopic(): Promise<Topic | null> {
    const topics = await this.getTopics();
    return topics.length > 0 ? topics[0] : null;
  }

  /**
   * Clear caches (for testing or after data updates)
   */
  static clearCache(): void {
    topicsCache = null;
    branchesCache = null;
    coursesCache = null;
    console.log("[TopicData] Cache cleared");
  }

  // === Private helpers ===

  private static parseJsonArray(jsonString: string | null | undefined): string[] {
    if (!jsonString) return [];
    try {
      const parsed = JSON.parse(jsonString);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
}
