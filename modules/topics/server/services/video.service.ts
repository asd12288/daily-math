// modules/topics/server/services/video.service.ts
// Service for topic videos CRUD operations

import { Query } from "node-appwrite";
import { createAdminClient } from "@/lib/appwrite/server";
import { APPWRITE_CONFIG } from "@/lib/appwrite/config";
import type { TopicVideo, VideoLanguage, VideoSource, VideosByLanguage } from "@/lib/appwrite/types";

const { databaseId, collections } = APPWRITE_CONFIG;

/**
 * Video document from Appwrite (parsed)
 */
export interface VideoDocument {
  $id: string;
  $collectionId: string;
  $databaseId: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  $sequence: number;
  videoId: string;
  topicId: string;
  courseId: string;
  title: string;
  titleHe?: string;
  channelName: string;
  thumbnailUrl: string;
  duration?: string;
  durationSeconds?: number;
  language: VideoLanguage;
  sortOrder: number;
  source: VideoSource;
  description?: string;
  isActive: boolean;
}

/**
 * Input for creating a video
 */
export interface CreateVideoInput {
  videoId: string;
  topicId: string;
  courseId: string;
  title: string;
  titleHe?: string;
  channelName: string;
  thumbnailUrl: string;
  duration?: string;
  durationSeconds?: number;
  language: VideoLanguage;
  sortOrder?: number;
  source?: VideoSource;
  description?: string;
}

/**
 * Language labels for UI display
 */
const LANGUAGE_LABELS: Record<VideoLanguage, string> = {
  en: "English",
  he: "עברית",
  other: "Other",
};

/**
 * Parse raw Appwrite document to VideoDocument
 */
function parseVideoDocument(doc: Record<string, unknown>): VideoDocument {
  return {
    $id: doc.$id as string,
    $collectionId: doc.$collectionId as string,
    $databaseId: doc.$databaseId as string,
    $createdAt: doc.$createdAt as string,
    $updatedAt: doc.$updatedAt as string,
    $permissions: doc.$permissions as string[],
    $sequence: (doc.$sequence as number) || 0,
    videoId: doc.videoId as string,
    topicId: doc.topicId as string,
    courseId: doc.courseId as string,
    title: doc.title as string,
    titleHe: (doc.titleHe as string) || undefined,
    channelName: doc.channelName as string,
    thumbnailUrl: doc.thumbnailUrl as string,
    duration: (doc.duration as string) || undefined,
    durationSeconds: (doc.durationSeconds as number) || undefined,
    language: (doc.language as VideoLanguage) || "en",
    sortOrder: (doc.sortOrder as number) || 0,
    source: (doc.source as VideoSource) || "curated",
    description: (doc.description as string) || undefined,
    isActive: doc.isActive !== false, // Default to true
  };
}

/**
 * Get all videos for a topic
 */
export async function getVideosByTopic(topicId: string): Promise<VideoDocument[]> {
  const { databases } = await createAdminClient();

  try {
    const response = await databases.listDocuments(
      databaseId,
      collections.topicVideos,
      [
        Query.equal("topicId", topicId),
        Query.equal("isActive", true),
        Query.orderAsc("sortOrder"),
        Query.limit(50),
      ]
    );

    return response.documents.map(parseVideoDocument);
  } catch {
    return [];
  }
}

/**
 * Get videos for a topic filtered by language
 */
export async function getVideosByTopicAndLanguage(
  topicId: string,
  language: VideoLanguage
): Promise<VideoDocument[]> {
  const { databases } = await createAdminClient();

  try {
    const response = await databases.listDocuments(
      databaseId,
      collections.topicVideos,
      [
        Query.equal("topicId", topicId),
        Query.equal("language", language),
        Query.equal("isActive", true),
        Query.orderAsc("sortOrder"),
        Query.limit(50),
      ]
    );

    return response.documents.map(parseVideoDocument);
  } catch {
    return [];
  }
}

/**
 * Get videos grouped by language
 */
export async function getVideosGroupedByLanguage(
  topicId: string
): Promise<VideosByLanguage[]> {
  const videos = await getVideosByTopic(topicId);

  const groupedMap = new Map<VideoLanguage, VideoDocument[]>();

  for (const video of videos) {
    const lang = video.language;
    if (!groupedMap.has(lang)) {
      groupedMap.set(lang, []);
    }
    groupedMap.get(lang)!.push(video);
  }

  // Return in order: en, he, other
  const order: VideoLanguage[] = ["en", "he", "other"];
  const result: VideosByLanguage[] = [];

  for (const lang of order) {
    const langVideos = groupedMap.get(lang);
    if (langVideos && langVideos.length > 0) {
      result.push({
        language: lang,
        languageLabel: LANGUAGE_LABELS[lang],
        videos: langVideos,
      });
    }
  }

  return result;
}

/**
 * Get video count for a topic (for badge display)
 */
export async function getVideoCount(topicId: string): Promise<number> {
  const { databases } = await createAdminClient();

  try {
    const response = await databases.listDocuments(
      databaseId,
      collections.topicVideos,
      [
        Query.equal("topicId", topicId),
        Query.equal("isActive", true),
        Query.limit(1),
        Query.select(["$id"]),
      ]
    );

    return response.total;
  } catch {
    return 0;
  }
}

/**
 * Get all videos for a course
 */
export async function getVideosByCourse(courseId: string): Promise<VideoDocument[]> {
  const { databases } = await createAdminClient();

  try {
    const response = await databases.listDocuments(
      databaseId,
      collections.topicVideos,
      [
        Query.equal("courseId", courseId),
        Query.equal("isActive", true),
        Query.orderAsc("sortOrder"),
        Query.limit(200),
      ]
    );

    return response.documents.map(parseVideoDocument);
  } catch {
    return [];
  }
}

/**
 * Get a single video by ID
 */
export async function getVideoById(videoDocId: string): Promise<VideoDocument | null> {
  const { databases } = await createAdminClient();

  try {
    const doc = await databases.getDocument(
      databaseId,
      collections.topicVideos,
      videoDocId
    );

    return parseVideoDocument(doc);
  } catch {
    return null;
  }
}

/**
 * Create a new video
 */
export async function createVideo(
  data: CreateVideoInput
): Promise<VideoDocument | null> {
  const { databases } = await createAdminClient();

  try {
    const doc = await databases.createDocument(
      databaseId,
      collections.topicVideos,
      "unique()",
      {
        videoId: data.videoId,
        topicId: data.topicId,
        courseId: data.courseId,
        title: data.title,
        titleHe: data.titleHe || null,
        channelName: data.channelName,
        thumbnailUrl: data.thumbnailUrl,
        duration: data.duration || null,
        durationSeconds: data.durationSeconds || null,
        language: data.language,
        sortOrder: data.sortOrder || 0,
        source: data.source || "curated",
        description: data.description || null,
        isActive: true,
      }
    );
    return parseVideoDocument(doc);
  } catch (error) {
    console.error("Failed to create video:", error);
    return null;
  }
}

/**
 * Update an existing video
 */
export async function updateVideo(
  videoDocId: string,
  data: Partial<CreateVideoInput>
): Promise<VideoDocument | null> {
  const { databases } = await createAdminClient();

  try {
    const updateData: Record<string, unknown> = {};

    if (data.videoId !== undefined) updateData.videoId = data.videoId;
    if (data.topicId !== undefined) updateData.topicId = data.topicId;
    if (data.courseId !== undefined) updateData.courseId = data.courseId;
    if (data.title !== undefined) updateData.title = data.title;
    if (data.titleHe !== undefined) updateData.titleHe = data.titleHe || null;
    if (data.channelName !== undefined) updateData.channelName = data.channelName;
    if (data.thumbnailUrl !== undefined) updateData.thumbnailUrl = data.thumbnailUrl;
    if (data.duration !== undefined) updateData.duration = data.duration || null;
    if (data.durationSeconds !== undefined) updateData.durationSeconds = data.durationSeconds || null;
    if (data.language !== undefined) updateData.language = data.language;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;
    if (data.source !== undefined) updateData.source = data.source;
    if (data.description !== undefined) updateData.description = data.description || null;

    const doc = await databases.updateDocument(
      databaseId,
      collections.topicVideos,
      videoDocId,
      updateData
    );
    return parseVideoDocument(doc);
  } catch (error) {
    console.error("Failed to update video:", error);
    return null;
  }
}

/**
 * Delete a video (soft delete - set isActive to false)
 */
export async function deleteVideo(videoDocId: string): Promise<boolean> {
  const { databases } = await createAdminClient();

  try {
    await databases.updateDocument(
      databaseId,
      collections.topicVideos,
      videoDocId,
      { isActive: false }
    );
    return true;
  } catch (error) {
    console.error("Failed to delete video:", error);
    return false;
  }
}

/**
 * Hard delete a video (permanently remove)
 */
export async function hardDeleteVideo(videoDocId: string): Promise<boolean> {
  const { databases } = await createAdminClient();

  try {
    await databases.deleteDocument(
      databaseId,
      collections.topicVideos,
      videoDocId
    );
    return true;
  } catch (error) {
    console.error("Failed to hard delete video:", error);
    return false;
  }
}

/**
 * Bulk create videos (for seeding)
 */
export async function bulkCreateVideos(
  videos: CreateVideoInput[]
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (const video of videos) {
    const result = await createVideo(video);
    if (result) {
      success++;
    } else {
      failed++;
    }
  }

  return { success, failed };
}
