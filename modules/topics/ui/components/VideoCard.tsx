// modules/topics/ui/components/VideoCard.tsx
// Individual video card component

"use client";

import Image from "next/image";
import { Icon } from "@iconify/react";
import { useLocale } from "next-intl";
import { getYouTubeThumbnailUrl } from "@/shared/ui/youtube-embed";
import type { VideoDocument } from "../../server/services/video.service";

interface VideoCardProps {
  video: VideoDocument;
  onClick?: () => void;
  isSelected?: boolean;
}

/**
 * Video card showing thumbnail, title, channel, and duration
 */
export function VideoCard({ video, onClick, isSelected }: VideoCardProps) {
  const locale = useLocale();
  const isHe = locale === "he";

  // Use localized title if available
  const title = isHe && video.titleHe ? video.titleHe : video.title;

  // Language badge config
  const languageBadge = {
    en: { label: "EN", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    he: { label: "HE", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
    other: { label: "Other", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400" },
  }[video.language];

  return (
    <button
      onClick={onClick}
      className={`
        group relative w-full text-start rounded-xl overflow-hidden
        bg-white dark:bg-gray-800
        border-2 transition-all duration-200
        hover:shadow-lg hover:scale-[1.02]
        ${isSelected
          ? "border-primary-500 ring-2 ring-primary-500/20"
          : "border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700"
        }
      `}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-900">
        <Image
          src={video.thumbnailUrl || getYouTubeThumbnailUrl(video.videoId)}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 320px"
        />

        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
            <Icon icon="tabler:player-play-filled" className="w-8 h-8 text-primary-600 ms-1" />
          </div>
        </div>

        {/* Duration badge */}
        {video.duration && (
          <div className="absolute bottom-2 end-2 px-2 py-0.5 bg-black/80 text-white text-xs font-medium rounded">
            {video.duration}
          </div>
        )}

        {/* Language badge */}
        <div className={`absolute top-2 start-2 px-2 py-0.5 text-xs font-medium rounded ${languageBadge.color}`}>
          {languageBadge.label}
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <h4 className="font-medium text-gray-900 dark:text-white line-clamp-2 text-sm leading-snug mb-1.5">
          {title}
        </h4>

        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <Icon icon="tabler:brand-youtube" className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span className="truncate">{video.channelName}</span>
        </div>
      </div>
    </button>
  );
}
