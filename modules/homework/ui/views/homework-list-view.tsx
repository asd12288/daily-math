// modules/homework/ui/views/homework-list-view.tsx
// Main view for listing all homework uploads with list layout and filters

"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button, Card, CardContent } from "@/shared/ui";
import { Modal } from "@/shared/ui/modal";
import { useHomeworkList, useDeleteHomework } from "../../hooks";
import { HomeworkListRow } from "../components/HomeworkListRow";
import { HomeworkFilters } from "../components/HomeworkFilters";
import { HomeworkUploader } from "../components/HomeworkUploader";
import type { HomeworkListItem, HomeworkStatus, HomeworkDateRange } from "../../types";

export function HomeworkListView() {
  const t = useTranslations();
  const router = useRouter();

  const [showUploader, setShowUploader] = useState(false);
  const [homeworkToDelete, setHomeworkToDelete] = useState<HomeworkListItem | null>(null);

  // Filter state
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<"all" | HomeworkStatus>("all");
  const [selectedDateRange, setSelectedDateRange] = useState<HomeworkDateRange>("all");

  const {
    homeworks,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    filterCounts,
    error,
  } = useHomeworkList({
    status: selectedStatus,
    subject: selectedSubject,
    dateRange: selectedDateRange,
  });

  const { deleteHomeworkAsync, isLoading: isDeleting } = useDeleteHomework();

  // Handle homework click
  const handleHomeworkClick = (homework: HomeworkListItem) => {
    if (homework.status === "completed") {
      router.push(`/homework/${homework.$id}`);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!homeworkToDelete) return;

    try {
      await deleteHomeworkAsync({ homeworkId: homeworkToDelete.$id });
      setHomeworkToDelete(null);
    } catch (error) {
      console.error("Failed to delete homework:", error);
    }
  };

  // Handle upload complete
  const handleUploadComplete = (homeworkId: string) => {
    setShowUploader(false);
    router.push(`/homework/${homeworkId}`);
  };

  // Check if any filters are active
  const hasActiveFilters = selectedSubject !== "all" || selectedStatus !== "all" || selectedDateRange !== "all";

  // Reset filters
  const resetFilters = () => {
    setSelectedSubject("all");
    setSelectedStatus("all");
    setSelectedDateRange("all");
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-9 w-36 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        {/* List skeleton */}
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <Card>
        <CardContent>
          <div className="text-center py-8">
            <Icon
              icon="tabler:alert-circle"
              height={40}
              className="mx-auto mb-4 text-error-500"
            />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t("common.error")}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {error.message}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with title, filters, and upload button */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t("homework.title")}
          </h1>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowUploader(true)}
            icon="tabler:plus"
          >
            {t("homework.uploadNew")}
          </Button>
        </div>

        {/* Filters row - only show if we have homeworks */}
        {filterCounts.total > 0 && (
          <div className="flex items-center justify-between gap-3">
            <HomeworkFilters
              selectedSubject={selectedSubject}
              selectedStatus={selectedStatus}
              selectedDateRange={selectedDateRange}
              onSubjectChange={setSelectedSubject}
              onStatusChange={setSelectedStatus}
              onDateRangeChange={setSelectedDateRange}
              filterCounts={filterCounts}
            />
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 flex items-center gap-1 flex-shrink-0"
              >
                <Icon icon="tabler:x" height={14} />
                <span className="hidden sm:inline">{t("homework.filters.clearAll")}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Upload modal */}
      {showUploader && (
        <Modal
          isOpen={showUploader}
          onClose={() => setShowUploader(false)}
          title={t("homework.uploadHomework")}
          size="lg"
        >
          <HomeworkUploader
            onUploadComplete={handleUploadComplete}
            onCancel={() => setShowUploader(false)}
          />
        </Modal>
      )}

      {/* Empty state - no homeworks at all */}
      {filterCounts.total === 0 && !isLoading && (
        <Card>
          <CardContent>
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Icon
                  icon="tabler:file-upload"
                  height={40}
                  className="text-gray-400 dark:text-gray-500"
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t("homework.noHomeworks")}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                {t("homework.noHomeworksDescription")}
              </p>
              <Button
                variant="primary"
                onClick={() => setShowUploader(true)}
                icon="tabler:upload"
              >
                {t("homework.uploadFirstHomework")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state - no results for current filters */}
      {filterCounts.total > 0 && homeworks.length === 0 && !isLoading && (
        <Card>
          <CardContent>
            <div className="text-center py-10">
              <Icon
                icon="tabler:filter-off"
                height={32}
                className="mx-auto mb-3 text-gray-400"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                {t("homework.noResultsTitle")}
              </p>
              <button
                onClick={resetFilters}
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                {t("homework.filters.clearAll")}
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Homework list */}
      {homeworks.length > 0 && (
        <div className="space-y-2">
          {homeworks.map((homework) => (
            <HomeworkListRow
              key={homework.$id}
              homework={homework}
              onClick={() => handleHomeworkClick(homework)}
              onDelete={() => setHomeworkToDelete(homework)}
            />
          ))}
        </div>
      )}

      {/* Load more button */}
      {hasNextPage && (
        <div className="flex justify-center pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchNextPage()}
            isLoading={isFetchingNextPage}
          >
            {t("common.loadMore")}
          </Button>
        </div>
      )}

      {/* Delete confirmation modal */}
      {homeworkToDelete && (
        <Modal
          isOpen={!!homeworkToDelete}
          onClose={() => setHomeworkToDelete(null)}
          title={t("homework.deleteConfirmTitle")}
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              {t("homework.deleteConfirmMessage", {
                title: homeworkToDelete.title || homeworkToDelete.originalFileName,
              })}
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setHomeworkToDelete(null)}
                disabled={isDeleting}
              >
                {t("common.cancel")}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                isLoading={isDeleting}
                icon="tabler:trash"
              >
                {t("common.delete")}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
