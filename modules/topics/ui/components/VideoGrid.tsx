// modules/topics/ui/components/VideoGrid.tsx
// Responsive grid layout for video cards

"use client";

import { VideoCard } from "./VideoCard";
import type { VideoDocument } from "../../server/services/video.service";

interface VideoGridProps {
  videos: VideoDocument[];
  selectedVideoId?: string;
  onVideoSelect?: (video: VideoDocument) => void;
}

/**
 * Responsive grid of video cards
 */
export function VideoGrid({ videos, selectedVideoId, onVideoSelect }: VideoGridProps) {
  if (videos.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {videos.map((video) => (
        <VideoCard
          key={video.$id}
          video={video}
          isSelected={video.videoId === selectedVideoId}
          onClick={() => onVideoSelect?.(video)}
        />
      ))}
    </div>
  );
}

/**
 * Loading skeleton for video grid
 */
export function VideoGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
        >
          {/* Thumbnail skeleton */}
          <div className="aspect-video bg-gray-200 dark:bg-gray-700 animate-pulse" />

          {/* Content skeleton */}
          <div className="p-3 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
