// shared/ui/youtube-embed.tsx
// Lightweight YouTube embed component using react-lite-youtube-embed

"use client";

import LiteYouTubeEmbed from "react-lite-youtube-embed";
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";

interface YouTubeEmbedProps {
  /** YouTube video ID (e.g., "dQw4w9WgXcQ") */
  videoId: string;
  /** Video title for accessibility */
  title: string;
  /** Thumbnail quality - maxresdefault is highest */
  poster?: "default" | "mqdefault" | "hqdefault" | "sddefault" | "maxresdefault";
  /** Additional CSS classes */
  className?: string;
  /** Aspect ratio - default 16:9 */
  aspectRatio?: "16:9" | "4:3" | "1:1";
}

/**
 * Lightweight YouTube video embed component.
 *
 * Uses react-lite-youtube-embed for performance - only loads iframe on click.
 * This reduces initial page load by ~500KB compared to standard YouTube embed.
 *
 * @example
 * ```tsx
 * <YouTubeEmbed
 *   videoId="dQw4w9WgXcQ"
 *   title="Never Gonna Give You Up"
 * />
 * ```
 */
export function YouTubeEmbed({
  videoId,
  title,
  poster = "maxresdefault",
  className = "",
  aspectRatio = "16:9",
}: YouTubeEmbedProps) {
  // Calculate aspect ratio padding
  const aspectPadding = {
    "16:9": "56.25%",
    "4:3": "75%",
    "1:1": "100%",
  }[aspectRatio];

  return (
    <div
      className={`relative rounded-lg overflow-hidden bg-gray-900 ${className}`}
      style={{ paddingBottom: aspectPadding }}
    >
      <div className="absolute inset-0">
        <LiteYouTubeEmbed
          id={videoId}
          title={title}
          poster={poster}
          noCookie={true} // Privacy-friendly - uses youtube-nocookie.com
          params="rel=0" // Don't show related videos from other channels
        />
      </div>
    </div>
  );
}

/**
 * YouTube thumbnail URL generator
 */
export function getYouTubeThumbnailUrl(
  videoId: string,
  quality: "default" | "mqdefault" | "hqdefault" | "sddefault" | "maxresdefault" = "hqdefault"
): string {
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}

/**
 * YouTube video URL generator
 */
export function getYouTubeVideoUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

/**
 * Parse duration string to seconds (e.g., "12:34" -> 754)
 */
export function parseDurationToSeconds(duration: string): number {
  const parts = duration.split(":").map(Number);
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 0;
}

/**
 * Format seconds to duration string (e.g., 754 -> "12:34")
 */
export function formatSecondsToDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}
