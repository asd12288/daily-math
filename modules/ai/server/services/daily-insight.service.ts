// modules/ai/server/services/daily-insight.service.ts
// AI-generated daily insights for dashboard - cached per user per day

import { generateObject } from "ai";
import { z } from "zod/v4";
import { Query } from "node-appwrite";
import { createAdminClient } from "@/lib/appwrite/server";
import { APPWRITE_CONFIG } from "@/lib/appwrite/config";
import {
  SOCRATIC_TUTOR_CONFIG,
  createGatewayOptions,
} from "../../config";

const { databaseId, collections } = APPWRITE_CONFIG;

/**
 * Types for daily insight
 */
export type InsightType = "fact" | "tip" | "mistake" | "connection";

export interface DailyInsight {
  type: InsightType;
  content: string;
  contentHe: string;
  relatedTopicId: string;
  relatedTopicName: string;
  relatedTopicNameHe: string;
  generatedAt: string;
}

/**
 * Zod schema for insight generation
 */
const insightSchema = z.object({
  type: z.enum(["fact", "tip", "mistake", "connection"]).describe("The type of insight"),
  content: z.string().describe("The educational insight content in English (2-3 sentences)"),
});

/**
 * Hebrew translation schema
 */
const hebrewTranslationSchema = z.object({
  contentHe: z.string().describe("The insight translated to Hebrew"),
});

/**
 * Static fallback insights when AI fails or no topics available
 */
const FALLBACK_INSIGHTS: DailyInsight[] = [
  {
    type: "tip",
    content: "When solving complex problems, try breaking them into smaller, manageable steps. This technique works wonders in calculus and algebra!",
    contentHe: "כאשר פותרים בעיות מורכבות, נסו לפרק אותן לשלבים קטנים וניתנים לניהול. טכניקה זו עובדת מצוין בחדו\"א ואלגברה!",
    relatedTopicId: "",
    relatedTopicName: "Problem Solving",
    relatedTopicNameHe: "פתרון בעיות",
    generatedAt: new Date().toISOString(),
  },
  {
    type: "fact",
    content: "The symbol for infinity (∞) was invented by John Wallis in 1655. It resembles a sideways figure 8 and is used extensively in calculus limits.",
    contentHe: "סימן האינסוף (∞) הומצא על ידי ג'ון וואליס ב-1655. הוא דומה לספרה 8 שוכבת ומשמש רבות בגבולות בחדו\"א.",
    relatedTopicId: "",
    relatedTopicName: "Limits",
    relatedTopicNameHe: "גבולות",
    generatedAt: new Date().toISOString(),
  },
  {
    type: "mistake",
    content: "A common mistake: forgetting to apply the chain rule when differentiating composite functions. Always check if your function has an 'inner function'!",
    contentHe: "טעות נפוצה: שוכחים להפעיל את כלל השרשרת בגזירת פונקציות מורכבות. תמיד בדקו אם לפונקציה שלכם יש 'פונקציה פנימית'!",
    relatedTopicId: "",
    relatedTopicName: "Chain Rule",
    relatedTopicNameHe: "כלל השרשרת",
    generatedAt: new Date().toISOString(),
  },
];

/**
 * Get today's date as YYYY-MM-DD in user's timezone (default: Israel)
 */
function getTodayDate(): string {
  const now = new Date();
  // Use Israel timezone
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jerusalem",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(now);
}

/**
 * Get random topics from user's enrolled courses
 */
async function getRandomTopicFromCourses(
  enrolledCourseIds: string[]
): Promise<{ id: string; name: string; nameHe: string; description: string } | null> {
  if (enrolledCourseIds.length === 0) return null;

  const { databases } = await createAdminClient();

  try {
    // Query topics from enrolled courses
    const topics = await databases.listDocuments(
      databaseId,
      collections.topics,
      [
        Query.equal("isActive", true),
        Query.limit(50),
      ]
    );

    // Filter to enrolled courses
    const enrolledTopics = topics.documents.filter((t) =>
      enrolledCourseIds.includes(t.courseId as string)
    );

    if (enrolledTopics.length === 0) return null;

    // Pick a random topic
    const randomTopic = enrolledTopics[Math.floor(Math.random() * enrolledTopics.length)];

    return {
      id: randomTopic.$id,
      name: randomTopic.name as string,
      nameHe: randomTopic.nameHe as string,
      description: randomTopic.description as string,
    };
  } catch (error) {
    console.error("Failed to get random topic:", error);
    return null;
  }
}

/**
 * Check if we have a cached insight for today
 */
async function getCachedInsight(userId: string): Promise<DailyInsight | null> {
  const { databases } = await createAdminClient();
  const today = getTodayDate();

  try {
    // Check if daily_insights collection exists and has today's insight
    const cached = await databases.listDocuments(
      databaseId,
      "daily_insights",
      [
        Query.equal("userId", userId),
        Query.equal("date", today),
        Query.limit(1),
      ]
    );

    if (cached.documents.length > 0) {
      const doc = cached.documents[0];
      return {
        type: doc.type as InsightType,
        content: doc.content as string,
        contentHe: doc.contentHe as string,
        relatedTopicId: doc.relatedTopicId as string,
        relatedTopicName: doc.relatedTopicName as string,
        relatedTopicNameHe: doc.relatedTopicNameHe as string,
        generatedAt: doc.$createdAt as string,
      };
    }

    return null;
  } catch {
    // Collection might not exist yet, return null
    return null;
  }
}

/**
 * Save insight to cache
 */
async function cacheInsight(
  userId: string,
  insight: DailyInsight
): Promise<void> {
  const { databases } = await createAdminClient();
  const today = getTodayDate();

  try {
    await databases.createDocument(
      databaseId,
      "daily_insights",
      `${userId}_${today}`,
      {
        userId,
        date: today,
        type: insight.type,
        content: insight.content,
        contentHe: insight.contentHe,
        relatedTopicId: insight.relatedTopicId,
        relatedTopicName: insight.relatedTopicName,
        relatedTopicNameHe: insight.relatedTopicNameHe,
      }
    );
  } catch (error) {
    // Log but don't fail - caching is optional
    console.error("Failed to cache insight:", error);
  }
}

/**
 * Generate a daily insight for a user based on their enrolled courses
 * Cached per user per day
 */
export async function generateDailyInsight(
  userId: string,
  enrolledCourseIds: string[]
): Promise<DailyInsight> {
  // 1. Check cache first
  const cached = await getCachedInsight(userId);
  if (cached) {
    return cached;
  }

  // 2. Get a random topic from enrolled courses
  const topic = await getRandomTopicFromCourses(enrolledCourseIds);

  // If no topics, return a fallback
  if (!topic) {
    const fallback = FALLBACK_INSIGHTS[Math.floor(Math.random() * FALLBACK_INSIGHTS.length)];
    return { ...fallback, generatedAt: new Date().toISOString() };
  }

  // 3. Generate insight with AI
  const prompt = `Generate an interesting, educational insight about "${topic.name}" (${topic.description}).

Choose ONE type randomly:
- "fact": A surprising or non-obvious mathematical fact
- "tip": A study tip or problem-solving strategy
- "mistake": A common mistake students make and how to avoid it
- "connection": A real-world application or connection

Requirements:
- 2-3 sentences maximum
- University-level appropriate (for Israeli students)
- Specific to the topic, not generic
- Engaging and memorable
- Do NOT include formulas or LaTeX`;

  const gatewayOptions = createGatewayOptions({
    userId,
    tags: ["daily-insight"],
    enableFailover: true,
  });

  try {
    // Generate English insight
    const { object: insight } = await generateObject({
      model: SOCRATIC_TUTOR_CONFIG.model,
      prompt,
      schema: insightSchema,
      temperature: 0.85, // High creativity
      providerOptions: gatewayOptions,
    });

    // Translate to Hebrew
    const { object: hebrewContent } = await generateObject({
      model: SOCRATIC_TUTOR_CONFIG.model,
      prompt: `Translate this educational math insight to Hebrew. Keep it natural and engaging:
"${insight.content}"`,
      schema: hebrewTranslationSchema,
      temperature: 0.3,
      providerOptions: gatewayOptions,
    });

    const result: DailyInsight = {
      type: insight.type,
      content: insight.content,
      contentHe: hebrewContent.contentHe,
      relatedTopicId: topic.id,
      relatedTopicName: topic.name,
      relatedTopicNameHe: topic.nameHe,
      generatedAt: new Date().toISOString(),
    };

    // 4. Cache for today
    await cacheInsight(userId, result);

    return result;
  } catch (error) {
    console.error("Failed to generate insight:", error);
    // Return fallback on error
    const fallback = FALLBACK_INSIGHTS[Math.floor(Math.random() * FALLBACK_INSIGHTS.length)];
    return {
      ...fallback,
      relatedTopicId: topic.id,
      relatedTopicName: topic.name,
      relatedTopicNameHe: topic.nameHe,
      generatedAt: new Date().toISOString(),
    };
  }
}
