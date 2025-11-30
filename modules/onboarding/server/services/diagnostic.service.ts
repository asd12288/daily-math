// modules/onboarding/server/services/diagnostic.service.ts
// Diagnostic test logic for placement

import { createAdminClient } from "@/lib/appwrite/server";
import { ID } from "node-appwrite";
import { SkillTreeService } from "@/modules/skill-tree/server/services/skill-tree.service";
import {
  DIAGNOSTIC_QUESTIONS,
  selectDiagnosticQuestions,
} from "../../config/diagnostic-questions";
import type {
  DiagnosticQuestion,
  DiagnosticAnswer,
  DiagnosticResult,
  TopicDiagnosticResult,
  OnboardingState,
  ExperienceLevel,
  DiagnosticConfig,
} from "../../types";
import { DEFAULT_DIAGNOSTIC_CONFIG } from "../../types";

export class DiagnosticService {
  /**
   * Get or create onboarding state for a user
   */
  static async getOnboardingState(userId: string): Promise<OnboardingState | null> {
    const { databases } = await createAdminClient();

    try {
      const response = await databases.listDocuments(
        process.env.APPWRITE_DATABASE_ID!,
        process.env.APPWRITE_ONBOARDING_COLLECTION!
      );

      const doc = response.documents.find((d) => d.userId === userId);
      if (!doc) return null;

      return {
        userId: doc.userId,
        isCompleted: doc.isCompleted,
        completedAt: doc.completedAt,
        currentStep: doc.currentStep,
        experienceLevel: doc.experienceLevel,
        diagnosticAnswers: JSON.parse(doc.diagnosticAnswers || "[]"),
        diagnosticResult: doc.diagnosticResult
          ? JSON.parse(doc.diagnosticResult)
          : null,
        startedAt: doc.startedAt,
      };
    } catch {
      return null;
    }
  }

  /**
   * Initialize onboarding for a new user
   */
  static async initializeOnboarding(userId: string): Promise<OnboardingState> {
    const { databases } = await createAdminClient();

    const state: OnboardingState = {
      userId,
      isCompleted: false,
      completedAt: null,
      currentStep: "welcome",
      experienceLevel: null,
      diagnosticAnswers: [],
      diagnosticResult: null,
      startedAt: new Date().toISOString(),
    };

    await databases.createDocument(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_ONBOARDING_COLLECTION!,
      ID.unique(),
      {
        userId: state.userId,
        isCompleted: state.isCompleted,
        completedAt: state.completedAt,
        currentStep: state.currentStep,
        experienceLevel: state.experienceLevel,
        diagnosticAnswers: JSON.stringify(state.diagnosticAnswers),
        diagnosticResult: null,
        startedAt: state.startedAt,
      }
    );

    return state;
  }

  /**
   * Get diagnostic questions for the placement test
   */
  static getDiagnosticQuestions(
    config: DiagnosticConfig = DEFAULT_DIAGNOSTIC_CONFIG
  ): DiagnosticQuestion[] {
    return selectDiagnosticQuestions(
      config.questionsPerBranch,
      config.maxQuestions
    );
  }

  /**
   * Submit an answer to a diagnostic question
   */
  static async submitDiagnosticAnswer(
    userId: string,
    questionId: string,
    userAnswer: string | null,
    timeSpentSeconds: number
  ): Promise<{ isCorrect: boolean | null; correctAnswer: string }> {
    const { databases } = await createAdminClient();

    // Find the question
    const question = DIAGNOSTIC_QUESTIONS.find((q) => q.id === questionId);
    if (!question) {
      throw new Error("Question not found");
    }

    // Check if answer is correct
    const isCorrect = userAnswer
      ? this.checkAnswer(userAnswer, question.correctAnswer)
      : null;
    const skipped = userAnswer === null;

    // Get current onboarding state
    const state = await this.getOnboardingState(userId);
    if (!state) {
      throw new Error("Onboarding not initialized");
    }

    // Add the answer
    const answer: DiagnosticAnswer = {
      questionId,
      topicId: question.topicId,
      userAnswer,
      isCorrect,
      skipped,
      timeSpentSeconds,
    };

    const updatedAnswers = [...state.diagnosticAnswers, answer];

    // Update the state
    const response = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_ONBOARDING_COLLECTION!
    );
    const doc = response.documents.find((d) => d.userId === userId);

    if (doc) {
      await databases.updateDocument(
        process.env.APPWRITE_DATABASE_ID!,
        process.env.APPWRITE_ONBOARDING_COLLECTION!,
        doc.$id,
        {
          diagnosticAnswers: JSON.stringify(updatedAnswers),
        }
      );
    }

    return { isCorrect, correctAnswer: question.correctAnswer };
  }

  /**
   * Complete the diagnostic test and calculate results
   */
  static async completeDiagnostic(userId: string): Promise<DiagnosticResult> {
    const { databases } = await createAdminClient();

    const state = await this.getOnboardingState(userId);
    if (!state) {
      throw new Error("Onboarding not initialized");
    }

    const result = this.calculateResults(state.diagnosticAnswers);

    // Update the state with results
    const response = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_ONBOARDING_COLLECTION!
    );
    const doc = response.documents.find((d) => d.userId === userId);

    if (doc) {
      await databases.updateDocument(
        process.env.APPWRITE_DATABASE_ID!,
        process.env.APPWRITE_ONBOARDING_COLLECTION!,
        doc.$id,
        {
          currentStep: "results",
          diagnosticResult: JSON.stringify(result),
        }
      );
    }

    // Apply results to skill tree
    await this.applyResultsToSkillTree(userId, result);

    return result;
  }

  /**
   * Complete the entire onboarding flow
   */
  static async completeOnboarding(
    userId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    preferences: { dailyGoal: number; reminderTime: string | null }
  ): Promise<void> {
    const { databases } = await createAdminClient();

    const response = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_ONBOARDING_COLLECTION!
    );
    const doc = response.documents.find((d) => d.userId === userId);

    if (doc) {
      await databases.updateDocument(
        process.env.APPWRITE_DATABASE_ID!,
        process.env.APPWRITE_ONBOARDING_COLLECTION!,
        doc.$id,
        {
          currentStep: "complete",
          isCompleted: true,
          completedAt: new Date().toISOString(),
        }
      );
    }

    // Update user profile with preferences
    // TODO: Update user profile collection with dailyGoal and reminderTime
  }

  /**
   * Update current onboarding step
   */
  static async updateStep(
    userId: string,
    step: OnboardingState["currentStep"],
    experienceLevel?: ExperienceLevel
  ): Promise<void> {
    const { databases } = await createAdminClient();

    const response = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_ONBOARDING_COLLECTION!
    );
    const doc = response.documents.find((d) => d.userId === userId);

    if (doc) {
      const updates: Record<string, string | null> = { currentStep: step };
      if (experienceLevel) {
        updates.experienceLevel = experienceLevel;
      }

      await databases.updateDocument(
        process.env.APPWRITE_DATABASE_ID!,
        process.env.APPWRITE_ONBOARDING_COLLECTION!,
        doc.$id,
        updates
      );
    }
  }

  // === Private helpers ===

  private static checkAnswer(userAnswer: string, correctAnswer: string): boolean {
    const normalize = (s: string) =>
      s
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/x=/g, "")
        .replace(/,/g, ", ")
        .trim();

    const normalizedUser = normalize(userAnswer);
    const normalizedCorrect = normalize(correctAnswer);

    // Direct match
    if (normalizedUser === normalizedCorrect) return true;

    // Check for equivalent answers (like x=2, x=3 vs x=3, x=2)
    const userParts = normalizedUser.split(",").map((s) => s.trim()).sort();
    const correctParts = normalizedCorrect.split(",").map((s) => s.trim()).sort();

    if (userParts.length === correctParts.length) {
      return userParts.every((p, i) => p === correctParts[i]);
    }

    return false;
  }

  private static calculateResults(answers: DiagnosticAnswer[]): DiagnosticResult {
    const totalQuestions = answers.length;
    const answeredCount = answers.filter((a) => !a.skipped).length;
    const correctCount = answers.filter((a) => a.isCorrect === true).length;
    const skippedCount = answers.filter((a) => a.skipped).length;
    const percentCorrect =
      answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

    // Calculate per-topic results
    const topicMap = new Map<string, TopicDiagnosticResult>();

    for (const answer of answers) {
      const question = DIAGNOSTIC_QUESTIONS.find(
        (q) => q.id === answer.questionId
      );
      if (!question) continue;

      const existing = topicMap.get(answer.topicId);
      if (existing) {
        existing.questionsAsked++;
        if (answer.isCorrect) existing.correctAnswers++;
      } else {
        topicMap.set(answer.topicId, {
          topicId: answer.topicId,
          topicName: question.topicName,
          branchId: question.branchId,
          questionsAsked: 1,
          correctAnswers: answer.isCorrect ? 1 : 0,
          status: "not_tested",
        });
      }
    }

    // Determine status for each topic
    const topicResults: TopicDiagnosticResult[] = [];
    for (const result of topicMap.values()) {
      const accuracy =
        result.questionsAsked > 0
          ? result.correctAnswers / result.questionsAsked
          : 0;

      if (accuracy >= 0.8) {
        result.status = "mastered";
      } else if (result.questionsAsked > 0) {
        result.status = "needs_practice";
      }

      topicResults.push(result);
    }

    // Determine recommended start topic
    const recommendedStartTopic = this.determineStartTopic(topicResults);

    // Estimate experience level
    const estimatedLevel = this.estimateLevel(percentCorrect, topicResults);

    return {
      totalQuestions,
      answeredCount,
      correctCount,
      skippedCount,
      percentCorrect,
      topicResults,
      recommendedStartTopic,
      estimatedLevel,
    };
  }

  private static determineStartTopic(
    topicResults: TopicDiagnosticResult[]
  ): string {
    // Find the first topic that needs practice, in order of branches
    const branchOrder = ["foundations", "linear", "polynomials", "quadratics", "functions"];

    for (const branch of branchOrder) {
      const branchTopics = topicResults.filter((t) => t.branchId === branch);
      const needsPractice = branchTopics.find(
        (t) => t.status === "needs_practice"
      );
      if (needsPractice) {
        return needsPractice.topicId;
      }
    }

    // If all mastered or not tested, start with first foundations topic
    return "order-of-operations";
  }

  private static estimateLevel(
    percentCorrect: number,
    topicResults: TopicDiagnosticResult[]
  ): ExperienceLevel {
    const masteredCount = topicResults.filter(
      (t) => t.status === "mastered"
    ).length;

    if (percentCorrect >= 80 && masteredCount >= 4) {
      return "advanced";
    } else if (percentCorrect >= 60 && masteredCount >= 2) {
      return "comfortable";
    } else if (percentCorrect >= 30) {
      return "some";
    } else {
      return "beginner";
    }
  }

  private static async applyResultsToSkillTree(
    userId: string,
    result: DiagnosticResult
  ): Promise<void> {
    // Mark mastered topics in the skill tree
    for (const topicResult of result.topicResults) {
      if (topicResult.status === "mastered") {
        // Use setTopicMastered to properly mark as mastered
        // This bypasses normal mastery requirements since user demonstrated knowledge
        await SkillTreeService.setTopicMastered(userId, topicResult.topicId);
      }
    }
  }
}
