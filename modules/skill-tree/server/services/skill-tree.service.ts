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
  MASTERY_CONSTANTS,
} from "../../types";

export class SkillTreeService {
  /**
   * Get the full skill tree state for a user
   */
  static async getSkillTreeState(userId: string): Promise<SkillTreeState> {
    // Fetch all user progress for this user
    const progressMap = await this.getUserProgressMap(userId);

    // Build branches with topics and progress
    const branches: BranchWithTopics[] = BRANCHES.map((branch) => {
      const branchTopics = getTopicsByBranch(branch.id);

      const topicsWithProgress: TopicWithProgress[] = branchTopics.map(
        (topic) => {
          const progress = progressMap.get(topic.id) || null;
          const prerequisitesMet = this.checkPrerequisitesMet(
            topic.prerequisites,
            progressMap
          );
          const status = determineTopicStatus(progress, prerequisitesMet);
          const mastery = progress ? calculateMastery(progress) : 0;

          return {
            ...topic,
            progress,
            status,
            mastery,
            isUnlocked: prerequisitesMet,
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

    // Find current focus topic (first in_progress or first available)
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
          if (topic.status === "available") {
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
    const prerequisitesMet = this.checkPrerequisitesMet(
      topic.prerequisites,
      progressMap
    );
    const status = determineTopicStatus(progress, prerequisitesMet);
    const mastery = progress ? calculateMastery(progress) : 0;

    return {
      ...topic,
      progress,
      status,
      mastery,
      isUnlocked: prerequisitesMet,
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
   * Initialize skill tree for a new user (after diagnostic test)
   */
  static async initializeForUser(
    userId: string,
    diagnosticResults: { topicId: string; passed: boolean }[]
  ): Promise<void> {
    const { databases } = await createAdminClient();
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const todayDatetime = now.toISOString();

    for (const result of diagnosticResults) {
      const progress: TopicProgress = {
        topicId: result.topicId,
        userId,
        status: result.passed ? "available" : "available", // Both are available, but mastery differs
        mastery: result.passed ? 50 : 0, // Passed diagnostic = 50% head start
        correctAttempts: result.passed ? 5 : 0,
        totalAttempts: 1,
        lastPracticed: todayDatetime,
        daysPracticed: [today],
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
        progressMap.set(doc.topicId, {
          topicId: doc.topicId,
          userId: doc.userId,
          status: (doc.status as TopicStatus) || "available",
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
   * Check if all prerequisites for a topic are met
   */
  private static checkPrerequisitesMet(
    prerequisites: string[],
    progressMap: Map<string, TopicProgress>
  ): boolean {
    if (prerequisites.length === 0) return true;

    return prerequisites.every((prereqId) => {
      const progress = progressMap.get(prereqId);
      if (!progress) return false;

      // Prerequisite is met if mastery >= 50%
      return progress.mastery >= MASTERY_CONSTANTS.UNLOCK_THRESHOLD * 100;
    });
  }

  /**
   * Calculate status from progress
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

    return "available";
  }
}
