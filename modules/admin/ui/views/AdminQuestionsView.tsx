"use client";

// modules/admin/ui/views/AdminQuestionsView.tsx
// Main view for admin question management

import React, { useState, useCallback } from "react";
import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import { Button, Card, CardContent } from "@/shared/ui";
import {
  QuestionFiltersPanel,
  QuestionTable,
  QuestionPreview,
  QuestionForm,
  Pagination,
} from "../components";
import {
  useQuestions,
  useAdminStats,
  useCreateQuestion,
  useUpdateQuestion,
  useDeleteQuestion,
  useBulkOperation,
} from "../../hooks";
import { trpc } from "@/trpc/client";
import type { QuestionFilters as QuestionFiltersType } from "../../types";
import type { Exercise } from "@/lib/appwrite/types";
import type { QuestionFormInput } from "../../lib/validation";

type ViewMode = "list" | "create" | "edit";

export function AdminQuestionsView() {
  const t = useTranslations();

  // State
  const [filters, setFilters] = useState<QuestionFiltersType>({ page: 1, limit: 20 });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [editingQuestion, setEditingQuestion] = useState<Exercise | null>(null);
  const [previewQuestion, setPreviewQuestion] = useState<Exercise | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Fetch courses and topics from database
  const { data: coursesData } = trpc.courses.getCoursesFromDB.useQuery();
  const { data: topicsData } = trpc.courses.getTopicsFromDB.useQuery();

  // Transform data for components
  const courses = coursesData ?? [];
  const topics = topicsData ?? [];

  // Queries
  const { data: questionsData, isLoading } = useQuestions(filters);
  const { data: stats } = useAdminStats();

  // Mutations
  const createMutation = useCreateQuestion();
  const updateMutation = useUpdateQuestion();
  const deleteMutation = useDeleteQuestion();
  const bulkMutation = useBulkOperation();

  // Handlers
  const handleFiltersChange = useCallback((newFilters: QuestionFiltersType) => {
    setFilters(newFilters);
    setSelectedIds([]);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const handleLimitChange = useCallback((limit: number) => {
    setFilters((prev) => ({ ...prev, limit, page: 1 }));
  }, []);

  const handleCreate = useCallback(() => {
    setEditingQuestion(null);
    setViewMode("create");
  }, []);

  const handleEdit = useCallback((question: Exercise) => {
    setEditingQuestion(question);
    setViewMode("edit");
  }, []);

  const handleView = useCallback((question: Exercise) => {
    setPreviewQuestion(question);
    setIsPreviewOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (questionId: string) => {
      if (window.confirm(t("admin.confirmDelete"))) {
        await deleteMutation.mutateAsync({ questionId });
      }
    },
    [deleteMutation, t]
  );

  const handleBulkAction = useCallback(
    async (operation: "activate" | "deactivate" | "delete") => {
      if (selectedIds.length === 0) return;

      if (operation === "delete" && !window.confirm(t("admin.confirmBulkDelete"))) {
        return;
      }

      await bulkMutation.mutateAsync({ questionIds: selectedIds, operation });
      setSelectedIds([]);
    },
    [selectedIds, bulkMutation, t]
  );

  const handleFormSubmit = useCallback(
    async (data: QuestionFormInput) => {
      if (viewMode === "create") {
        await createMutation.mutateAsync(data);
      } else if (viewMode === "edit" && editingQuestion) {
        await updateMutation.mutateAsync({
          questionId: editingQuestion.$id,
          ...data,
        });
      }
      setViewMode("list");
      setEditingQuestion(null);
    },
    [viewMode, editingQuestion, createMutation, updateMutation]
  );

  const handleFormCancel = useCallback(() => {
    setViewMode("list");
    setEditingQuestion(null);
  }, []);

  // Render form mode
  if (viewMode === "create" || viewMode === "edit") {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleFormCancel}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Icon icon="tabler:arrow-left" height={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {viewMode === "create"
              ? t("admin.questions.addTitle")
              : t("admin.questions.editTitle")}
          </h1>
        </div>

        {/* Form Card */}
        <Card>
          <CardContent className="p-6">
            <QuestionForm
              initialData={editingQuestion || undefined}
              courses={MOCK_COURSES}
              topics={MOCK_TOPICS}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
              isSubmitting={createMutation.isPending || updateMutation.isPending}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render list mode
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("admin.questions.title")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {t("admin.questions.subtitle")}
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Icon icon="tabler:plus" className="me-2" height={18} />
          {t("admin.questions.add")}
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                <Icon icon="tabler:database" className="text-primary-600" height={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalQuestions}
                </p>
                <p className="text-sm text-gray-500">{t("admin.stats.total")}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success-100 dark:bg-success-900/30 rounded-lg">
                <Icon icon="tabler:circle-check" className="text-success-600" height={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.activeQuestions}
                </p>
                <p className="text-sm text-gray-500">{t("admin.stats.active")}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning-100 dark:bg-warning-900/30 rounded-lg">
                <Icon icon="tabler:star" className="text-warning-600" height={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.questionsByDifficulty.medium}
                </p>
                <p className="text-sm text-gray-500">{t("admin.stats.medium")}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-error-100 dark:bg-error-900/30 rounded-lg">
                <Icon icon="tabler:flame" className="text-error-600" height={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.questionsByDifficulty.hard}
                </p>
                <p className="text-sm text-gray-500">{t("admin.stats.hard")}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <QuestionFiltersPanel
        filters={filters}
        onFiltersChange={handleFiltersChange}
        courses={MOCK_COURSES}
        topics={MOCK_TOPICS}
      />

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
          <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
            {t("admin.bulk.selected", { count: selectedIds.length })}
          </span>
          <div className="flex gap-2 ms-auto">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkAction("activate")}
              disabled={bulkMutation.isPending}
            >
              <Icon icon="tabler:circle-check" className="me-1" height={16} />
              {t("admin.bulk.activate")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkAction("deactivate")}
              disabled={bulkMutation.isPending}
            >
              <Icon icon="tabler:circle-x" className="me-1" height={16} />
              {t("admin.bulk.deactivate")}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleBulkAction("delete")}
              disabled={bulkMutation.isPending}
            >
              <Icon icon="tabler:trash" className="me-1" height={16} />
              {t("admin.bulk.delete")}
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <QuestionTable
        questions={questionsData?.questions || []}
        isLoading={isLoading}
        selectedIds={selectedIds}
        onSelectIds={setSelectedIds}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
      />

      {/* Pagination */}
      {questionsData && questionsData.totalPages > 1 && (
        <Pagination
          page={questionsData.page}
          totalPages={questionsData.totalPages}
          total={questionsData.total}
          limit={questionsData.limit}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
        />
      )}

      {/* Preview Modal */}
      <QuestionPreview
        question={previewQuestion}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onEdit={handleEdit}
      />
    </div>
  );
}

export default AdminQuestionsView;
