// modules/skill-tree/config/topics.ts
// All topic data comes from database - no static definitions

import type { Branch, Topic, BranchId } from "../types";

/**
 * Branch definitions - loaded from database
 */
export const BRANCHES: Branch[] = [];

/**
 * Topic definitions - loaded from database
 */
export const TOPICS: Topic[] = [];

/**
 * Get topics by branch
 */
export function getTopicsByBranch(branchId: BranchId): Topic[] {
  return TOPICS.filter((t) => t.branchId === branchId).sort(
    (a, b) => a.order - b.order
  );
}

/**
 * Get topic by ID
 */
export function getTopicById(topicId: string): Topic | undefined {
  return TOPICS.find((t) => t.id === topicId);
}

/**
 * Get branch by ID
 */
export function getBranchById(branchId: BranchId): Branch | undefined {
  return BRANCHES.find((b) => b.id === branchId);
}

/**
 * Get all prerequisite topics (recursively)
 */
export function getAllPrerequisites(topicId: string): string[] {
  const topic = getTopicById(topicId);
  if (!topic) return [];

  const prerequisites = new Set<string>();

  function addPrereqs(prereqs: string[]) {
    for (const prereq of prereqs) {
      if (!prerequisites.has(prereq)) {
        prerequisites.add(prereq);
        const prereqTopic = getTopicById(prereq);
        if (prereqTopic) {
          addPrereqs(prereqTopic.prerequisites);
        }
      }
    }
  }

  addPrereqs(topic.prerequisites);
  return Array.from(prerequisites);
}

/**
 * Get topics that depend on a given topic
 */
export function getDependentTopics(topicId: string): Topic[] {
  return TOPICS.filter((t) => t.prerequisites.includes(topicId));
}
