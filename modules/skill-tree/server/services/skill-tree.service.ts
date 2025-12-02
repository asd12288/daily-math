// modules/skill-tree/server/services/skill-tree.service.ts
// Business logic for skill tree operations

import { createAdminClient } from "@/lib/appwrite/server";
import { ID, Query } from "node-appwrite";
import {
  BRANCHES,
  TOPICS,
  getTopicsByBranch,
  getTopicById,
} from "../../config/topics";
import {
  type TopicProgress,
  type TopicWithProgress,
  type BranchWithTopics,
  type SkillTreeState,
  type TopicStatus,
  calculateMastery,
  determineTopicStatus,
  checkPrerequisitesMet,
  MASTERY_CONSTANTS,
} from "../../types";
import { getCourseById } from "@/modules/courses/config/courses-data";

export class SkillTreeService {
  /**
   * Get the full skill tree state for a user
   */
  static async getSkillTreeState(userId: string): Promise<SkillTreeState> {
    // Fetch all user progress for this user
    const progressMap = await this.getUserProgressMap(userId);

    // Build branches with topics and progress
    // Note: All topics are unlocked - we just track progress and show recommendations
    const branches: BranchWithTopics[] = BRANCHES.map((branch) => {
      const branchTopics = getTopicsByBranch(branch.id);

      const topicsWithProgress: TopicWithProgress[] = branchTopics.map(
        (topic) => {
          const progress = progressMap.get(topic.id) || null;
          // Check prerequisites for UI recommendations only (not for locking)
          const prereqCheck = checkPrerequisitesMet(topic.prerequisites, progressMap);
          const status = determineTopicStatus(progress);
          const mastery = progress ? calculateMastery(progress) : 0;

          return {
            ...topic,
            progress,
            status,
            mastery,
            canPractice: true as const, // All topics always available
            hasUnmetPrerequisites: !prereqCheck.met,
            recommendedFirst: prereqCheck.unmetTopics,
          };
        }
      );

      const completedCount = topicsWithProgress.filter(
        (t) => t.status === "mastered"
      ).length;

      const overallMastery =
        topicsWithProgress.length > 0
          ? Math.round(
              topicsWithProgress.reduce((sum, t) => sum + t.mastery, 0) /
                topicsWithProgress.length
            )
          : 0;

      return {
        ...branch,
        topics: topicsWithProgress,
        overallMastery,
        completedCount,
        totalCount: topicsWithProgress.length,
      };
    });

    // Calculate overall stats
    const totalTopics = TOPICS.length;
    const totalMastered = branches.reduce(
      (sum, b) => sum + b.completedCount,
      0
    );
    const overallProgress = Math.round((totalMastered / totalTopics) * 100);

    // Find current focus topic (first in_progress or first not_started)
    let currentFocusTopic: string | null = null;
    for (const branch of branches) {
      for (const topic of branch.topics) {
        if (topic.status === "in_progress") {
          currentFocusTopic = topic.id;
          break;
        }
      }
      if (currentFocusTopic) break;
    }

    // If no in_progress topic, find first not_started topic
    if (!currentFocusTopic) {
      for (const branch of branches) {
        for (const topic of branch.topics) {
          if (topic.status === "not_started") {
            currentFocusTopic = topic.id;
            break;
          }
        }
        if (currentFocusTopic) break;
      }
    }

    return {
      branches,
      currentFocusTopic,
      overallProgress,
      totalMastered,
      totalTopics,
    };
  }

  /**
   * Get skill tree state filtered by enrolled courses (Hybrid approach)
   * Returns only branches/topics that belong to the user's enrolled courses
   */
  static async getSkillTreeStateForCourses(
    userId: string,
    enrolledCourseIds: string[]
  ): Promise<SkillTreeState> {
    // Build set of enrolled branch IDs from courses
    const enrolledBranchIds = new Set<string>();
    for (const courseId of enrolledCourseIds) {
      const course = getCourseById(courseId);
      if (course) {
        course.branchIds.forEach((branchId) => enrolledBranchIds.add(branchId));
      }
    }

    // If no valid courses found, fall back to all branches
    if (enrolledBranchIds.size === 0) {
      console.log("[SkillTree] No enrolled courses found, using full skill tree");
      return this.getSkillTreeState(userId);
    }

    // Filter BRANCHES to only enrolled ones
    const filteredBranches = BRANCHES.filter((b) => enrolledBranchIds.has(b.id));

    // Fetch all user progress for this user
    const progressMap = await this.getUserProgressMap(userId);

    // Build branches with topics and progress (only for enrolled branches)
    const branches: BranchWithTopics[] = filteredBranches.map((branch) => {
      const branchTopics = getTopicsByBranch(branch.id);

      const topicsWithProgress: TopicWithProgress[] = branchTopics.map(
        (topic) => {
          const progress = progressMap.get(topic.id) || null;
          const prereqCheck = checkPrerequisitesMet(topic.prerequisites, progressMap);
          const status = determineTopicStatus(progress);
          const mastery = progress ? calculateMastery(progress) : 0;

          return {
            ...topic,
            progress,
            status,
            mastery,
            canPractice: true as const,
            hasUnmetPrerequisites: !prereqCheck.met,
            recommendedFirst: prereqCheck.unmetTopics,
          };
        }
      );

      const completedCount = topicsWithProgress.filter(
        (t) => t.status === "mastered"
      ).length;

      const overallMastery =
        topicsWithProgress.length > 0
          ? Math.round(
              topicsWithProgress.reduce((sum, t) => sum + t.mastery, 0) /
                topicsWithProgress.length
            )
          : 0;

      return {
        ...branch,
        topics: topicsWithProgress,
        overallMastery,
        completedCount,
        totalCount: topicsWithProgress.length,
      };
    });

    // Calculate overall stats (only from enrolled topics)
    const totalTopics = branches.reduce((sum, b) => sum + b.totalCount, 0);
    const totalMastered = branches.reduce((sum, b) => sum + b.completedCount, 0);
    const overallProgress = totalTopics > 0
      ? Math.round((totalMastered / totalTopics) * 100)
      : 0;

    // Find current focus topic (first in_progress or first not_started within enrolled courses)
    let currentFocusTopic: string | null = null;
    for (const branch of branches) {
      for (const topic of branch.topics) {
        if (topic.status === "in_progress") {
          currentFocusTopic = topic.id;
          break;
        }
      }
      if (currentFocusTopic) break;
    }

    if (!currentFocusTopic) {
      for (const branch of branches) {
        for (const topic of branch.topics) {
          if (topic.status === "not_started") {
            currentFocusTopic = topic.id;
            break;
          }
        }
        if (currentFocusTopic) break;
      }
    }

    console.log(`[SkillTree] Filtered to ${branches.length} branches, ${totalTopics} topics for enrolled courses`);

    return {
      branches,
      currentFocusTopic,
      overallProgress,
      totalMastered,
      totalTopics,
    };
  }

  /**
   * Get progress for a single topic
   */
  static async getTopicProgress(
    userId: string,
    topicId: string
  ): Promise<TopicWithProgress | null> {
    const topic = getTopicById(topicId);
    if (!topic) return null;

    const progressMap = await this.getUserProgressMap(userId);
    const progress = progressMap.get(topicId) || null;
    const prereqCheck = checkPrerequisitesMet(topic.prerequisites, progressMap);
    const status = determineTopicStatus(progress);
    const mastery = progress ? calculateMastery(progress) : 0;

    return {
      ...topic,
      progress,
      status,
      mastery,
      canPractice: true as const,
      hasUnmetPrerequisites: !prereqCheck.met,
      recommendedFirst: prereqCheck.unmetTopics,
    };
  }

  /**
   * Update progress after answering a question
   * Uses Query lookup instead of compound document IDs to avoid 36-char limit
   */
  static async updateProgress(
    userId: string,
    topicId: string,
    isCorrect: boolean
  ): Promise<TopicProgress> {
    const { databases } = await createAdminClient();
    const now = new Date();
    const today = now.toISOString().split("T")[0]; // For daysPracticed array
    const todayDatetime = now.toISOString(); // Full ISO datetime for lastPracticed

    let progress: TopicProgress;

    try {
      // Query for existing progress document by userId AND topicId
      const existingDocs = await databases.listDocuments(
        process.env.APPWRITE_DATABASE_ID!,
        process.env.APPWRITE_USER_PROGRESS_COLLECTION!,
        [
          Query.equal("userId", userId),
          Query.equal("topicId", topicId),
          Query.limit(1),
        ]
      );

      if (existingDocs.documents.length > 0) {
        // Update existing progress
        const existing = existingDocs.documents[0];
        const daysPracticedRaw = existing.daysPracticed || "[]";
        const daysPracticed = typeof daysPracticedRaw === "string"
          ? JSON.parse(daysPracticedRaw)
          : daysPracticedRaw;
        if (!daysPracticed.includes(today)) {
          daysPracticed.push(today);
        }

        progress = {
          topicId,
          userId,
          status: existing.status,
          mastery: existing.mastery,
          correctAttempts: (existing.correctAttempts || 0) + (isCorrect ? 1 : 0),
          totalAttempts: existing.totalAttempts + 1,
          lastPracticed: todayDatetime,
          daysPracticed,
        };

        // Recalculate mastery and status
        progress.mastery = calculateMastery(progress);
        progress.status = this.calculateStatus(progress);

        await databases.updateDocument(
          process.env.APPWRITE_DATABASE_ID!,
          process.env.APPWRITE_USER_PROGRESS_COLLECTION!,
          existing.$id,
          {
            correctAttempts: progress.correctAttempts,
            totalAttempts: progress.totalAttempts,
            lastPracticed: progress.lastPracticed,
            daysPracticed: JSON.stringify(progress.daysPracticed),
            mastery: progress.mastery,
            status: progress.status,
          }
        );

        console.log(`[SkillTree] Updated progress for user ${userId}, topic ${topicId}: ${isCorrect ? 'correct' : 'incorrect'}`);
      } else {
        // Create new progress document with unique ID
        progress = {
          topicId,
          userId,
          status: "in_progress",
          mastery: 0,
          correctAttempts: isCorrect ? 1 : 0,
          totalAttempts: 1,
          lastPracticed: todayDatetime,
          daysPracticed: [today],
        };

        progress.mastery = calculateMastery(progress);

        await databases.createDocument(
          process.env.APPWRITE_DATABASE_ID!,
          process.env.APPWRITE_USER_PROGRESS_COLLECTION!,
          ID.unique(),
          {
            ...progress,
            daysPracticed: JSON.stringify(progress.daysPracticed),
          }
        );

        console.log(`[SkillTree] Created new progress for user ${userId}, topic ${topicId}`);
      }
    } catch (error) {
      console.error(`[SkillTree] Failed to update progress for user ${userId}, topic ${topicId}:`, error);
      // Return a default progress object to avoid breaking the flow
      progress = {
        topicId,
        userId,
        status: "in_progress",
        mastery: 0,
        correctAttempts: isCorrect ? 1 : 0,
        totalAttempts: 1,
        lastPracticed: todayDatetime,
        daysPracticed: [today],
      };
    }

    return progress;
  }

  /**
   * Set a topic directly to mastered status (used for diagnostic results)
   * Bypasses normal mastery requirements since user has demonstrated knowledge
   */
  static async setTopicMastered(
    userId: string,
    topicId: string
  ): Promise<void> {
    const { databases } = await createAdminClient();
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const todayDatetime = now.toISOString();

    // Create fake history to meet mastery requirements
    // We use 3 "virtual" practice days to satisfy the REQUIRED_DAYS check
    const virtualDays = [
      today,
      new Date(Date.now() - 86400000).toISOString().split("T")[0], // yesterday
      new Date(Date.now() - 172800000).toISOString().split("T")[0], // 2 days ago
    ];

    const masteredProgress: TopicProgress = {
      topicId,
      userId,
      status: "mastered",
      mastery: 100,
      correctAttempts: MASTERY_CONSTANTS.REQUIRED_CORRECT, // Meet requirement
      totalAttempts: MASTERY_CONSTANTS.REQUIRED_CORRECT, // 100% accuracy
      lastPracticed: todayDatetime,
      daysPracticed: virtualDays,
    };

    try {
      // Check if progress already exists
      const existing = await databases.listDocuments(
        process.env.APPWRITE_DATABASE_ID!,
        process.env.APPWRITE_USER_PROGRESS_COLLECTION!,
        [
          Query.equal("userId", userId),
          Query.equal("topicId", topicId),
          Query.limit(1),
        ]
      );

      if (existing.documents.length > 0) {
        // Update existing document to mastered
        await databases.updateDocument(
          process.env.APPWRITE_DATABASE_ID!,
          process.env.APPWRITE_USER_PROGRESS_COLLECTION!,
          existing.documents[0].$id,
          {
            status: "mastered",
            mastery: 100,
            correctAttempts: masteredProgress.correctAttempts,
            totalAttempts: masteredProgress.totalAttempts,
            lastPracticed: todayDatetime,
            daysPracticed: JSON.stringify(virtualDays),
          }
        );
        console.log(`[SkillTree] Updated topic ${topicId} to mastered for user ${userId}`);
      } else {
        // Create new mastered progress document
        await databases.createDocument(
          process.env.APPWRITE_DATABASE_ID!,
          process.env.APPWRITE_USER_PROGRESS_COLLECTION!,
          ID.unique(),
          {
            ...masteredProgress,
            daysPracticed: JSON.stringify(masteredProgress.daysPracticed),
          }
        );
        console.log(`[SkillTree] Created mastered progress for user ${userId}, topic ${topicId}`);
      }
    } catch (error) {
      console.error(`[SkillTree] Failed to set topic ${topicId} as mastered:`, error);
    }
  }

  /**
   * Initialize skill tree for a new user (after diagnostic test)
   */
  static async initializeForUser(
    userId: string,
    diagnosticResults: { topicId: string; passed: boolean }[]
  ): Promise<void> {
    const { databases } = await createAdminClient();
    void databases; // Used in setTopicMastered calls

    for (const result of diagnosticResults) {
      // If passed, use setTopicMastered for proper mastery
      if (result.passed) {
        await this.setTopicMastered(userId, result.topicId);
        continue;
      }

      // Not passed - create not_started record
      const progress: TopicProgress = {
        topicId: result.topicId,
        userId,
        status: "not_started",
        mastery: 0,
        correctAttempts: 0,
        totalAttempts: 0,
        lastPracticed: null,
        daysPracticed: [],
      };

      try {
        // Check if progress already exists
        const existing = await databases.listDocuments(
          process.env.APPWRITE_DATABASE_ID!,
          process.env.APPWRITE_USER_PROGRESS_COLLECTION!,
          [
            Query.equal("userId", userId),
            Query.equal("topicId", result.topicId),
            Query.limit(1),
          ]
        );

        if (existing.documents.length === 0) {
          await databases.createDocument(
            process.env.APPWRITE_DATABASE_ID!,
            process.env.APPWRITE_USER_PROGRESS_COLLECTION!,
            ID.unique(),
            {
              ...progress,
              daysPracticed: JSON.stringify(progress.daysPracticed),
            }
          );
          console.log(`[SkillTree] Initialized progress for user ${userId}, topic ${result.topicId}`);
        }
      } catch (error) {
        console.error(`[SkillTree] Failed to initialize progress for topic ${result.topicId}:`, error);
      }
    }
  }

  // === Private helper methods ===

  /**
   * Get all progress documents for a user as a Map
   */
  private static async getUserProgressMap(
    userId: string
  ): Promise<Map<string, TopicProgress>> {
    const { databases } = await createAdminClient();
    const progressMap = new Map<string, TopicProgress>();

    try {
      const response = await databases.listDocuments(
        process.env.APPWRITE_DATABASE_ID!,
        process.env.APPWRITE_USER_PROGRESS_COLLECTION!,
        [
          Query.equal("userId", userId),
          Query.limit(100), // Should cover all topics
        ]
      );

      for (const doc of response.documents) {
        const daysPracticedRaw = doc.daysPracticed || "[]";
        const daysPracticed = typeof daysPracticedRaw === "string"
          ? JSON.parse(daysPracticedRaw)
          : daysPracticedRaw;

        // Map old status values to new ones
        let status: TopicStatus = "not_started";
        if (doc.status === "mastered") {
          status = "mastered";
        } else if (doc.status === "in_progress" || doc.status === "available" || doc.status === "locked") {
          // If they have attempts, they're in_progress; otherwise not_started
          status = doc.totalAttempts > 0 ? "in_progress" : "not_started";
        }

        progressMap.set(doc.topicId, {
          topicId: doc.topicId,
          userId: doc.userId,
          status,
          mastery: doc.mastery || 0,
          correctAttempts: doc.correctAttempts || 0,
          totalAttempts: doc.totalAttempts || 0,
          lastPracticed: doc.lastPracticed,
          daysPracticed,
        });
      }
    } catch (error) {
      console.error(`[SkillTree] Failed to get progress map for user ${userId}:`, error);
    }

    return progressMap;
  }

  /**
   * Calculate status from progress
   * Note: No more "locked" or "available" - just not_started, in_progress, mastered
   */
  private static calculateStatus(progress: TopicProgress): TopicStatus {
    if (
      progress.correctAttempts >= MASTERY_CONSTANTS.REQUIRED_CORRECT &&
      progress.correctAttempts / progress.totalAttempts >=
        MASTERY_CONSTANTS.REQUIRED_ACCURACY &&
      progress.daysPracticed.length >= MASTERY_CONSTANTS.REQUIRED_DAYS
    ) {
      return "mastered";
    }

    if (progress.totalAttempts > 0) {
      return "in_progress";
    }

    return "not_started";
  }
}
