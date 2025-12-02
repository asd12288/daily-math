// modules/topics/hooks/use-video.ts
// React hooks for topic video data fetching

"use client";

import { trpc } from "@/trpc/client";

/**
 * Hook to fetch all videos for a topic
 */
export function useTopicVideos(topicId: string) {
  return trpc.topics.getVideos.useQuery(
    { topicId },
    {
      enabled: !!topicId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

/**
 * Hook to fetch videos grouped by language
 */
export function useTopicVideosGrouped(topicId: string) {
  return trpc.topics.getVideosGrouped.useQuery(
    { topicId },
    {
      enabled: !!topicId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

/**
 * Hook to fetch video count for a topic (for badge display)
 */
export function useTopicVideoCount(topicId: string) {
  return trpc.topics.getVideoCount.useQuery(
    { topicId },
    {
      enabled: !!topicId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

/**
 * Hook to fetch all videos for a course
 */
export function useCourseVideos(courseId: string) {
  return trpc.topics.getCourseVideos.useQuery(
    { courseId },
    {
      enabled: !!courseId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

/**
 * Hook to create a video (admin only)
 */
export function useCreateVideo() {
  const utils = trpc.useUtils();

  return trpc.topics.createVideo.useMutation({
    onSuccess: (data) => {
      if (data) {
        // Invalidate video queries
        utils.topics.getVideos.invalidate({ topicId: data.topicId });
        utils.topics.getVideosGrouped.invalidate({ topicId: data.topicId });
        utils.topics.getVideoCount.invalidate({ topicId: data.topicId });
        utils.topics.getCourseVideos.invalidate({ courseId: data.courseId });
      }
    },
  });
}

/**
 * Hook to update a video (admin only)
 */
export function useUpdateVideo() {
  const utils = trpc.useUtils();

  return trpc.topics.updateVideo.useMutation({
    onSuccess: (data) => {
      if (data) {
        // Invalidate video queries
        utils.topics.getVideos.invalidate({ topicId: data.topicId });
        utils.topics.getVideosGrouped.invalidate({ topicId: data.topicId });
        utils.topics.getCourseVideos.invalidate({ courseId: data.courseId });
      }
    },
  });
}

/**
 * Hook to delete a video (admin only)
 */
export function useDeleteVideo() {
  const utils = trpc.useUtils();

  return trpc.topics.deleteVideo.useMutation({
    onSuccess: () => {
      // Invalidate all video queries since we don't know which topic/course
      utils.topics.getVideos.invalidate();
      utils.topics.getVideosGrouped.invalidate();
      utils.topics.getVideoCount.invalidate();
      utils.topics.getCourseVideos.invalidate();
    },
  });
}
