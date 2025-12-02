// modules/topics/ui/components/VideosTab.tsx
// Videos tab with YouTube video grid and player

"use client";

import { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Icon } from "@iconify/react";
import { useTopicVideos } from "../../hooks/use-video";
import { VideoGrid, VideoGridSkeleton } from "./VideoGrid";
import { VideoLanguageFilter } from "./VideoLanguageFilter";
import { YouTubeEmbed, getYouTubeVideoUrl } from "@/shared/ui/youtube-embed";
import { Modal } from "@/shared/ui/modal";
import type { VideoDocument } from "../../server/services/video.service";
import type { VideoLanguage } from "@/lib/appwrite/types";

interface VideosTabProps {
  topicId: string;
  courseId?: string;
}

/**
 * Videos tab showing YouTube tutorials for a topic
 */
export function VideosTab({ topicId }: VideosTabProps) {
  const t = useTranslations("topics.videos");
  const locale = useLocale();
  const isHe = locale === "he";

  // Fetch videos
  const { data: videos, isLoading, error } = useTopicVideos(topicId);

  // State for language filter and selected video
  const [selectedLanguage, setSelectedLanguage] = useState<"all" | VideoLanguage>("all");
  const [selectedVideo, setSelectedVideo] = useState<VideoDocument | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  // Calculate counts for each language
  const languageCounts = useMemo(() => {
    if (!videos) return { all: 0, en: 0, he: 0, other: 0 };

    return {
      all: videos.length,
      en: videos.filter((v) => v.language === "en").length,
      he: videos.filter((v) => v.language === "he").length,
      other: videos.filter((v) => v.language === "other").length,
    };
  }, [videos]);

  // Filter videos by selected language
  const filteredVideos = useMemo(() => {
    if (!videos) return [];
    if (selectedLanguage === "all") return videos;
    return videos.filter((v) => v.language === selectedLanguage);
  }, [videos, selectedLanguage]);

  // Handle video selection
  const handleVideoSelect = (video: VideoDocument) => {
    setSelectedVideo(video);
    setIsPlayerOpen(true);
  };

  // Handle close player
  const handleClosePlayer = () => {
    setIsPlayerOpen(false);
    setSelectedVideo(null);
  };

  // Get localized title for selected video
  const selectedVideoTitle = selectedVideo
    ? isHe && selectedVideo.titleHe
      ? selectedVideo.titleHe
      : selectedVideo.title
    : "";

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
        <VideoGridSkeleton count={6} />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
        <div className="text-center">
          <Icon icon="tabler:alert-circle" className="w-12 h-12 text-error-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t("errorTitle")}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">{t("errorDesc")}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!videos || videos.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
        <div className="text-center py-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 flex items-center justify-center">
            <Icon icon="tabler:video" className="w-10 h-10 text-primary-600" />
          </div>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            {t("noVideos")}
          </h3>

          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            {t("noVideosDesc")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        {/* Header with filter */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Icon icon="tabler:video" className="w-5 h-5 text-primary-600" />
            {t("title")}
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
              ({languageCounts.all})
            </span>
          </h3>

          <VideoLanguageFilter
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
            counts={languageCounts}
          />
        </div>

        {/* Video grid */}
        {filteredVideos.length > 0 ? (
          <VideoGrid
            videos={filteredVideos}
            selectedVideoId={selectedVideo?.videoId}
            onVideoSelect={handleVideoSelect}
          />
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {t("noVideosInLanguage")}
          </div>
        )}
      </div>

      {/* Video player modal */}
      <Modal
        isOpen={isPlayerOpen}
        onClose={handleClosePlayer}
        title={selectedVideoTitle}
        size="xl"
      >
        {selectedVideo && (
          <div className="space-y-4">
            {/* Video player */}
            <YouTubeEmbed
              videoId={selectedVideo.videoId}
              title={selectedVideoTitle}
            />

            {/* Video info */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Icon icon="tabler:brand-youtube" className="w-5 h-5 text-red-500" />
                <span>{selectedVideo.channelName}</span>
                {selectedVideo.duration && (
                  <>
                    <span className="text-gray-300 dark:text-gray-600">|</span>
                    <Icon icon="tabler:clock" className="w-4 h-4" />
                    <span>{selectedVideo.duration}</span>
                  </>
                )}
              </div>

              <a
                href={getYouTubeVideoUrl(selectedVideo.videoId)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Icon icon="tabler:external-link" className="w-4 h-4" />
                {t("watchOnYouTube")}
              </a>
            </div>

            {/* Description */}
            {selectedVideo.description && (
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
                  {selectedVideo.description}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
