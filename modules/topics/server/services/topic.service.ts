// modules/topics/server/services/topic.service.ts
// Service for topic CRUD operations

import { Query } from "node-appwrite";
import { createAdminClient } from "@/lib/appwrite/server";
import { APPWRITE_CONFIG } from "@/lib/appwrite/config";
import { BRANCHES } from "@/modules/skill-tree/config/topics";
import type {
  TopicDocument,
  TopicDetail,
  TopicsByBranch,
  Branch,
  BranchId,
} from "../../types";
import type { Exercise, ExerciseDifficulty } from "@/lib/appwrite/types";

const { databaseId, collections } = APPWRITE_CONFIG;

/**
 * Parse JSON fields from the raw Appwrite document
 */
function parseTopicDocument(doc: Record<string, unknown>): TopicDocument {
  return {
    $id: doc.$id as string,
    $createdAt: doc.$createdAt as string,
    $updatedAt: doc.$updatedAt as string,
    courseId: doc.courseId as string,
    name: doc.name as string,
    nameHe: doc.nameHe as string,
    description: doc.description as string,
    descriptionHe: (doc.descriptionHe as string) || undefined,
    branchId: doc.branchId as BranchId,
    prerequisites: JSON.parse((doc.prerequisites as string) || "[]"),
    order: doc.order as number,
    difficultyLevels: JSON.parse((doc.difficultyLevels as string) || '["easy","medium","hard"]'),
    questionTypes: doc.questionTypes ? JSON.parse(doc.questionTypes as string) : undefined,
    keywords: doc.keywords ? JSON.parse(doc.keywords as string) : undefined,
    theoryContent: (doc.theoryContent as string) || undefined,
    theoryContentHe: (doc.theoryContentHe as string) || undefined,
    videoIds: doc.videoIds ? JSON.parse(doc.videoIds as string) : undefined,
    isActive: doc.isActive as boolean,
    estimatedMinutes: (doc.estimatedMinutes as number) || undefined,
  };
}

/**
 * Get a single topic by ID
 */
export async function getTopicById(topicId: string): Promise<TopicDocument | null> {
  const { databases } = await createAdminClient();

  try {
    const doc = await databases.getDocument(
      databaseId,
      collections.topics,
      topicId
    );
    return parseTopicDocument(doc);
  } catch {
    return null;
  }
}

/**
 * Get topic detail with branch and related topics
 */
export async function getTopicDetail(topicId: string): Promise<TopicDetail | null> {
  const topic = await getTopicById(topicId);
  if (!topic) return null;

  const branch = BRANCHES.find((b) => b.id === topic.branchId);
  if (!branch) return null;

  // Fetch prerequisite topics
  const prerequisiteTopics: TopicDocument[] = [];
  for (const prereqId of topic.prerequisites) {
    const prereqTopic = await getTopicById(prereqId);
    if (prereqTopic) {
      prerequisiteTopics.push(prereqTopic);
    }
  }

  // Fetch dependent topics (topics that have this topic as prerequisite)
  const { databases } = await createAdminClient();
  const allTopics = await databases.listDocuments(
    databaseId,
    collections.topics,
    [Query.equal("courseId", topic.courseId), Query.limit(100)]
  );

  const dependentTopics = allTopics.documents
    .map(parseTopicDocument)
    .filter((t) => t.prerequisites.includes(topicId));

  return {
    ...topic,
    branch,
    prerequisiteTopics,
    dependentTopics,
  };
}

/**
 * Get all topics for a course
 */
export async function getTopicsByCourse(
  courseId: string,
  includeInactive = false
): Promise<TopicDocument[]> {
  const { databases } = await createAdminClient();

  const queries = [
    Query.equal("courseId", courseId),
    Query.orderAsc("order"),
    Query.limit(100),
  ];

  if (!includeInactive) {
    queries.push(Query.equal("isActive", true));
  }

  const response = await databases.listDocuments(
    databaseId,
    collections.topics,
    queries
  );

  return response.documents.map(parseTopicDocument);
}

/**
 * Get topics grouped by branch
 */
export async function getTopicsGroupedByBranch(
  courseId: string
): Promise<TopicsByBranch[]> {
  const topics = await getTopicsByCourse(courseId);

  const groupedMap = new Map<BranchId, TopicDocument[]>();

  // Initialize groups for all branches
  for (const branch of BRANCHES) {
    groupedMap.set(branch.id, []);
  }

  // Group topics by branch
  for (const topic of topics) {
    const group = groupedMap.get(topic.branchId);
    if (group) {
      group.push(topic);
    }
  }

  // Convert to array and filter out empty branches
  return BRANCHES
    .map((branch) => ({
      branch,
      topics: groupedMap.get(branch.id) || [],
    }))
    .filter((group) => group.topics.length > 0);
}

/**
 * Get all branches
 */
export function getAllBranches(): Branch[] {
  return BRANCHES;
}

/**
 * Get a single branch by ID
 */
export function getBranchById(branchId: BranchId): Branch | undefined {
  return BRANCHES.find((b) => b.id === branchId);
}

/**
 * Update topic theory content
 */
export async function updateTopicTheory(
  topicId: string,
  content: string,
  contentHe?: string
): Promise<TopicDocument | null> {
  const { databases } = await createAdminClient();

  try {
    const updated = await databases.updateDocument(
      databaseId,
      collections.topics,
      topicId,
      {
        theoryContent: content,
        ...(contentHe && { theoryContentHe: contentHe }),
      }
    );
    return parseTopicDocument(updated);
  } catch {
    return null;
  }
}

/**
 * Update topic video IDs
 */
export async function updateTopicVideos(
  topicId: string,
  videoIds: string[]
): Promise<TopicDocument | null> {
  const { databases } = await createAdminClient();

  try {
    const updated = await databases.updateDocument(
      databaseId,
      collections.topics,
      topicId,
      {
        videoIds: JSON.stringify(videoIds),
      }
    );
    return parseTopicDocument(updated);
  } catch {
    return null;
  }
}

/**
 * Exercise document type for internal use
 */
export interface ExerciseDocument {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  courseId: string;
  topicId: string;
  question: string;
  questionHe?: string;
  difficulty: ExerciseDifficulty;
  xpReward: number;
  answer?: string;
  answerType: string;
  tip?: string;
  tipHe?: string;
  diagramUrl?: string;
  isActive: boolean;
  estimatedMinutes?: number;
}

/**
 * Parse exercise document from Appwrite
 */
function parseExerciseDocument(doc: Record<string, unknown>): ExerciseDocument {
  return {
    $id: doc.$id as string,
    $createdAt: doc.$createdAt as string,
    $updatedAt: doc.$updatedAt as string,
    courseId: doc.courseId as string,
    topicId: doc.topicId as string,
    question: doc.question as string,
    questionHe: (doc.questionHe as string) || undefined,
    difficulty: doc.difficulty as ExerciseDifficulty,
    xpReward: doc.xpReward as number,
    answer: (doc.answer as string) || undefined,
    answerType: doc.answerType as string,
    tip: (doc.tip as string) || undefined,
    tipHe: (doc.tipHe as string) || undefined,
    diagramUrl: (doc.diagramUrl as string) || undefined,
    isActive: doc.isActive as boolean,
    estimatedMinutes: (doc.estimatedMinutes as number) || undefined,
  };
}

/**
 * Get exercises by topic ID
 */
export async function getExercisesByTopic(
  topicId: string,
  options?: {
    difficulty?: ExerciseDifficulty;
    limit?: number;
    onlyActive?: boolean;
  }
): Promise<ExerciseDocument[]> {
  const { databases } = await createAdminClient();

  const queries = [
    Query.equal("topicId", topicId),
    Query.limit(options?.limit || 100),
  ];

  if (options?.difficulty) {
    queries.push(Query.equal("difficulty", options.difficulty));
  }

  if (options?.onlyActive !== false) {
    queries.push(Query.equal("isActive", true));
  }

  const response = await databases.listDocuments(
    databaseId,
    collections.exercises,
    queries
  );

  return response.documents.map(parseExerciseDocument);
}

/**
 * Get exercise count by topic
 */
export async function getExerciseCountByTopic(topicId: string): Promise<{
  total: number;
  easy: number;
  medium: number;
  hard: number;
}> {
  const exercises = await getExercisesByTopic(topicId, { onlyActive: true });

  return {
    total: exercises.length,
    easy: exercises.filter((e) => e.difficulty === "easy").length,
    medium: exercises.filter((e) => e.difficulty === "medium").length,
    hard: exercises.filter((e) => e.difficulty === "hard").length,
  };
}
