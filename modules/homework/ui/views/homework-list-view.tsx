// modules/homework/ui/views/homework-list-view.tsx
// Main view for listing all homework uploads

"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button, Card, CardContent } from "@/shared/ui";
import { Modal } from "@/shared/ui/modal";
import { useHomeworkList, useDeleteHomework } from "../../hooks";
import { HomeworkCard } from "../components/HomeworkCard";
import { HomeworkUploader } from "../components/HomeworkUploader";
import type { HomeworkListItem } from "../../types";

export function HomeworkListView() {
  const t = useTranslations();
  const router = useRouter();

  const [showUploader, setShowUploader] = useState(false);
  const [homeworkToDelete, setHomeworkToDelete] = useState<HomeworkListItem | null>(null);

  const {
    homeworks,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
  } = useHomeworkList();

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

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <Icon
            icon="tabler:loader-2"
            height={40}
            className="mx-auto mb-4 text-primary-500 animate-spin"
          />
          <p className="text-gray-500 dark:text-gray-400">
            {t("common.loading")}
          </p>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("homework.title")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t("homework.subtitle")}
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowUploader(true)}
          icon="tabler:upload"
        >
          {t("homework.uploadNew")}
        </Button>
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

      {/* Empty state */}
      {homeworks.length === 0 && (
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

      {/* Homework grid */}
      {homeworks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {homeworks.map((homework) => (
            <HomeworkCard
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
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            isLoading={isFetchingNextPage}
            icon="tabler:chevron-down"
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
