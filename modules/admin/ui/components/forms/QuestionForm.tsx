"use client";

// modules/admin/ui/components/forms/QuestionForm.tsx
// Form for creating and editing questions

import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { Button } from "@/shared/ui";
import { questionFormSchema } from "../../../lib/validation";
import type { AdminExercise } from "@/lib/appwrite/types";

// Infer the form input type from the schema
type QuestionFormData = z.infer<typeof questionFormSchema>;

interface QuestionFormProps {
  initialData?: AdminExercise;
  courses: { id: string; name: string }[];
  topics: { id: string; name: string; courseId: string }[];
  onSubmit: (data: QuestionFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function QuestionForm({
  initialData,
  courses,
  topics,
  onSubmit,
  onCancel,
  isSubmitting,
}: QuestionFormProps) {
  const t = useTranslations();
  const isEdit = !!initialData;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<QuestionFormData>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      courseId: initialData?.courseId || "",
      topicId: initialData?.topicId || "",
      question: initialData?.question || "",
      questionHe: initialData?.questionHe || "",
      difficulty: initialData?.difficulty || "medium",
      answerType: initialData?.answerType || "numeric",
      correctAnswer: initialData?.correctAnswer || "",
      solution: initialData?.solution || "",
      solutionHe: initialData?.solutionHe || "",
      hints: initialData?.hints || [],
      hintsHe: initialData?.hintsHe || [],
      tags: initialData?.tags || [],
      estimatedTime: initialData?.estimatedTime || 5,
      isActive: initialData?.isActive ?? true,
    },
  });

  const {
    fields: _hintFields,
    append: _appendHint,
    remove: _removeHint,
  } = useFieldArray({
    control,
    name: "hints" as never,
  });
  // Note: hint fields UI to be implemented in future iteration
  void _hintFields;
  void _appendHint;
  void _removeHint;

  const selectedCourseId = watch("courseId");
  const filteredTopics = selectedCourseId
    ? topics.filter((t) => t.courseId === selectedCourseId)
    : [];

  // Reset topic when course changes
  useEffect(() => {
    if (selectedCourseId && initialData?.courseId !== selectedCourseId) {
      setValue("topicId", "");
    }
  }, [selectedCourseId, initialData?.courseId, setValue]);

  // Tags input state
  const [tagInput, setTagInput] = useState("");
  const tags = watch("tags") || [];

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setValue("tags", [...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setValue("tags", tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Course and Topic */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t("admin.form.course")} *
          </label>
          <select
            {...register("courseId")}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">{t("admin.form.selectCourse")}</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
          {errors.courseId && (
            <p className="mt-1 text-sm text-error-600">{errors.courseId.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t("admin.form.topic")} *
          </label>
          <select
            {...register("topicId")}
            disabled={!selectedCourseId}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
          >
            <option value="">{t("admin.form.selectTopic")}</option>
            {filteredTopics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.name}
              </option>
            ))}
          </select>
          {errors.topicId && (
            <p className="mt-1 text-sm text-error-600">{errors.topicId.message}</p>
          )}
        </div>
      </div>

      {/* Question (English) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t("admin.form.question")} * <span className="text-gray-400">(English)</span>
        </label>
        <textarea
          {...register("question")}
          rows={4}
          placeholder={t("admin.form.questionPlaceholder")}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
        />
        <p className="mt-1 text-xs text-gray-500">{t("admin.form.latexHint")}</p>
        {errors.question && (
          <p className="mt-1 text-sm text-error-600">{errors.question.message}</p>
        )}
      </div>

      {/* Question (Hebrew) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t("admin.form.questionHe")} <span className="text-gray-400">(Hebrew)</span>
        </label>
        <textarea
          {...register("questionHe")}
          rows={4}
          dir="rtl"
          placeholder={t("admin.form.questionHePlaceholder")}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
        />
      </div>

      {/* Difficulty and Answer Type */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t("admin.form.difficulty")} *
          </label>
          <select
            {...register("difficulty")}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="easy">{t("difficulty.easy")}</option>
            <option value="medium">{t("difficulty.medium")}</option>
            <option value="hard">{t("difficulty.hard")}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t("admin.form.answerType")} *
          </label>
          <select
            {...register("answerType")}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="numeric">{t("answerType.numeric")}</option>
            <option value="expression">{t("answerType.expression")}</option>
            <option value="proof">{t("answerType.proof")}</option>
            <option value="open">{t("answerType.open")}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t("admin.form.estimatedTime")} ({t("common.minutes")})
          </label>
          <input
            type="number"
            {...register("estimatedTime", { valueAsNumber: true })}
            min={1}
            max={120}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Correct Answer */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t("admin.form.answer")} *
        </label>
        <input
          {...register("correctAnswer")}
          placeholder={t("admin.form.answerPlaceholder")}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono"
        />
        {errors.correctAnswer && (
          <p className="mt-1 text-sm text-error-600">{errors.correctAnswer.message}</p>
        )}
      </div>

      {/* Solution (English) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t("admin.form.solution")} * <span className="text-gray-400">(English)</span>
        </label>
        <textarea
          {...register("solution")}
          rows={6}
          placeholder={t("admin.form.solutionPlaceholder")}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
        />
        {errors.solution && (
          <p className="mt-1 text-sm text-error-600">{errors.solution.message}</p>
        )}
      </div>

      {/* Solution (Hebrew) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t("admin.form.solutionHe")} <span className="text-gray-400">(Hebrew)</span>
        </label>
        <textarea
          {...register("solutionHe")}
          rows={6}
          dir="rtl"
          placeholder={t("admin.form.solutionHePlaceholder")}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t("admin.form.tags")}
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddTag();
              }
            }}
            placeholder={t("admin.form.tagPlaceholder")}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <Button type="button" variant="outline" onClick={handleAddTag}>
            <Icon icon="tabler:plus" height={18} />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="text-gray-400 hover:text-error-600"
              >
                <Icon icon="tabler:x" height={14} />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Active Status */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          {...register("isActive")}
          id="isActive"
          className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        <label
          htmlFor="isActive"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {t("admin.form.active")}
        </label>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t("admin.cancel")}
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {isEdit ? t("admin.save") : t("admin.questions.add")}
        </Button>
      </div>
    </form>
  );
}

export default QuestionForm;
