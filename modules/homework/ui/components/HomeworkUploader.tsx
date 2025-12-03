// modules/homework/ui/components/HomeworkUploader.tsx
// PDF upload component with drag-and-drop, validation, and progress tracking

"use client";

import React, { useState, useRef, useCallback } from "react";
import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import { Button, Input, Card, CardContent } from "@/shared/ui";
import { useUploadHomework, type UploadErrorType } from "../../hooks";
import {
  MAX_FILE_SIZE,
  MAX_FILE_SIZE_MB,
  MAX_PAGES,
  ALLOWED_FILE_TYPES,
  STATUS_STYLES,
} from "../../config/constants";

/**
 * Error display configuration for each error type
 */
const ERROR_CONFIG: Record<
  UploadErrorType,
  { icon: string; color: string; actionIcon?: string }
> = {
  file_type: { icon: "tabler:file-alert", color: "warning" },
  file_size: { icon: "tabler:file-alert", color: "warning" },
  upload_failed: { icon: "tabler:cloud-off", color: "error" },
  network: { icon: "tabler:wifi-off", color: "error", actionIcon: "tabler:refresh" },
  ai_credits: { icon: "tabler:credit-card-off", color: "warning", actionIcon: "tabler:mail" },
  ai_rate_limit: { icon: "tabler:clock-pause", color: "warning", actionIcon: "tabler:clock" },
  ai_unavailable: { icon: "tabler:robot-off", color: "warning", actionIcon: "tabler:refresh" },
  processing: { icon: "tabler:alert-triangle", color: "error", actionIcon: "tabler:refresh" },
  timeout: { icon: "tabler:clock-x", color: "warning", actionIcon: "tabler:refresh" },
  server: { icon: "tabler:server-off", color: "error", actionIcon: "tabler:refresh" },
  auth: { icon: "tabler:lock-x", color: "error" },
  unknown: { icon: "tabler:alert-circle", color: "error", actionIcon: "tabler:refresh" },
};

interface HomeworkUploaderProps {
  onUploadComplete?: (homeworkId: string) => void;
  onCancel?: () => void;
}

export function HomeworkUploader({
  onUploadComplete,
  onCancel,
}: HomeworkUploaderProps) {
  const t = useTranslations();
  const [title, setTitle] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [generateIllustrations, setGenerateIllustrations] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    upload,
    reset,
    status,
    progress,
    error,
    errorType,
    homeworkId,
    isUploading,
    isComplete,
    isError,
  } = useUploadHomework();

  // Validate file before selection
  const validateFile = useCallback((file: File): string | null => {
    // Check file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return t("homework.errors.invalidFileType");
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return t("homework.errors.fileTooLarge", { maxSize: MAX_FILE_SIZE_MB });
    }

    return null;
  }, [t]);

  // Handle file selection
  const handleFileSelect = useCallback(
    (file: File) => {
      const error = validateFile(file);
      if (error) {
        setValidationError(error);
        setSelectedFile(null);
        return;
      }

      setValidationError(null);
      setSelectedFile(file);
    },
    [validateFile]
  );

  // Handle drag events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  // Handle file input change
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  // Remove selected file
  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    setValidationError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  // Start upload
  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;
    await upload(selectedFile, title || undefined, generateIllustrations);
  }, [selectedFile, title, upload, generateIllustrations]);

  // Reset and start over
  const handleReset = useCallback(() => {
    reset();
    setSelectedFile(null);
    setTitle("");
    setValidationError(null);
    setGenerateIllustrations(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [reset]);

  // Handle completion
  const handleViewHomework = useCallback(() => {
    if (homeworkId && onUploadComplete) {
      onUploadComplete(homeworkId);
    }
  }, [homeworkId, onUploadComplete]);

  // Get status display
  const getStatusDisplay = () => {
    if (status === "idle" || status === "validating") return null;

    const statusConfig = STATUS_STYLES[status as keyof typeof STATUS_STYLES];
    if (!statusConfig) return null;

    return (
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${statusConfig.bg} ${statusConfig.text} text-sm font-medium`}
      >
        <Icon
          icon={statusConfig.icon}
          height={16}
          className={status === "processing" ? "animate-spin" : ""}
        />
        <span>{statusConfig.label}</span>
      </div>
    );
  };

  // Render dropzone or processing state
  const renderContent = () => {
    // Show completion state
    if (isComplete) {
      return (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success-100 dark:bg-success-900/30 flex items-center justify-center">
            <Icon
              icon="tabler:check"
              height={32}
              className="text-success-600 dark:text-success-400"
            />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t("homework.uploadSuccess")}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            {t("homework.uploadSuccessDescription")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="primary"
              onClick={handleViewHomework}
              icon="tabler:eye"
            >
              {t("homework.viewSolutions")}
            </Button>
            <Button variant="outline" onClick={handleReset} icon="tabler:plus">
              {t("homework.uploadAnother")}
            </Button>
          </div>
        </div>
      );
    }

    // Show error state with specific error type feedback
    if (isError) {
      const currentErrorType = errorType || "unknown";
      const errorConfig = ERROR_CONFIG[currentErrorType];
      const colorClass = errorConfig.color === "warning" ? "warning" : "error";

      return (
        <div className="text-center py-8">
          {/* Error icon */}
          <div
            className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
              colorClass === "warning"
                ? "bg-warning-100 dark:bg-warning-900/30"
                : "bg-error-100 dark:bg-error-900/30"
            }`}
          >
            <Icon
              icon={errorConfig.icon}
              height={32}
              className={
                colorClass === "warning"
                  ? "text-warning-600 dark:text-warning-400"
                  : "text-error-600 dark:text-error-400"
              }
            />
          </div>

          {/* Error title - translated based on type */}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t(`homework.errors.titles.${currentErrorType}`, {
              defaultValue: t("homework.uploadFailed"),
            })}
          </h3>

          {/* Error description - translated based on type */}
          <p
            className={`text-sm mb-3 ${
              colorClass === "warning"
                ? "text-warning-700 dark:text-warning-300"
                : "text-error-600 dark:text-error-400"
            }`}
          >
            {t(`homework.errors.descriptions.${currentErrorType}`, {
              defaultValue: error || t("homework.errors.processingFailed"),
            })}
          </p>

          {/* Suggested action */}
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
            {t(`homework.errors.suggestions.${currentErrorType}`, {
              defaultValue: t("homework.errors.suggestions.unknown"),
            })}
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="outline"
              onClick={handleReset}
              icon={errorConfig.actionIcon || "tabler:refresh"}
            >
              {t("common.tryAgain")}
            </Button>

            {/* Show contact support for AI credits issue */}
            {currentErrorType === "ai_credits" && (
              <Button
                variant="primary"
                onClick={() => window.open("mailto:support@dailymath.com", "_blank")}
                icon="tabler:mail"
              >
                {t("homework.errors.contactSupport")}
              </Button>
            )}

            {/* Show "try later" info for rate limits */}
            {currentErrorType === "ai_rate_limit" && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-warning-50 dark:bg-warning-900/20 text-warning-700 dark:text-warning-300 text-sm">
                <Icon icon="tabler:clock" height={16} />
                {t("homework.errors.waitAndRetry")}
              </div>
            )}
          </div>

          {/* Technical details (collapsible) - useful for debugging */}
          {error && (
            <details className="mt-6 text-left max-w-md mx-auto">
              <summary className="text-xs text-gray-400 dark:text-gray-500 cursor-pointer hover:text-gray-600 dark:hover:text-gray-400">
                {t("homework.errors.technicalDetails")}
              </summary>
              <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs text-gray-600 dark:text-gray-400 overflow-x-auto whitespace-pre-wrap break-words">
                {error}
              </pre>
            </details>
          )}
        </div>
      );
    }

    // Show processing state
    if (isUploading) {
      return (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <Icon
              icon="tabler:loader-2"
              height={32}
              className="text-primary-600 dark:text-primary-400 animate-spin"
            />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {status === "uploading"
              ? t("homework.uploading")
              : t("homework.processing")}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {status === "processing"
              ? t("homework.processingDescription")
              : t("homework.uploadingDescription")}
          </p>

          {/* Progress bar */}
          <div className="w-full max-w-xs mx-auto">
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-600 dark:bg-primary-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {progress}%
            </p>
          </div>
        </div>
      );
    }

    // Show upload form
    return (
      <div className="space-y-4">
        {/* Title Input */}
        <div>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("homework.titlePlaceholder")}
            label={t("homework.titleLabel")}
            helperText={t("homework.titleHelper")}
            disabled={isUploading}
          />
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
          onChange={handleInputChange}
          className="hidden"
          disabled={isUploading}
        />

        {/* Dropzone or file preview */}
        {!selectedFile ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative cursor-pointer p-8 border-2 border-dashed rounded-xl text-center
              transition-all duration-200
              ${
                isDragging
                  ? "border-primary-500 bg-primary-50 dark:bg-primary-900/10"
                  : "border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500"
              }
            `}
          >
            <div className="flex flex-col items-center">
              <div
                className={`
                w-14 h-14 rounded-full flex items-center justify-center mb-4
                ${
                  isDragging
                    ? "bg-primary-100 dark:bg-primary-900/30"
                    : "bg-gray-100 dark:bg-gray-800"
                }
              `}
              >
                <Icon
                  icon="tabler:upload"
                  height={28}
                  className={
                    isDragging
                      ? "text-primary-600 dark:text-primary-400"
                      : "text-gray-500 dark:text-gray-400"
                  }
                />
              </div>
              <p className="text-base font-medium text-gray-900 dark:text-white mb-1">
                {isDragging
                  ? t("homework.dropHere")
                  : t("homework.dragAndDrop")}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                {t("homework.orClickToSelect")}
              </p>
              <div className="flex flex-wrap gap-2 justify-center text-xs text-gray-400 dark:text-gray-500">
                <span className="flex items-center gap-1">
                  <Icon icon="tabler:file" height={14} />
                  {t("homework.supportedFormats")}
                </span>
                <span className="flex items-center gap-1">
                  <Icon icon="tabler:file-zip" height={14} />
                  Max {MAX_FILE_SIZE_MB}MB
                </span>
                <span className="flex items-center gap-1">
                  <Icon icon="tabler:files" height={14} />
                  {t("homework.maxPagesInfo", { maxPages: MAX_PAGES })}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center gap-4">
              {/* Dynamic icon based on file type */}
              {(() => {
                const ext = selectedFile.name.split(".").pop()?.toLowerCase();
                const isPdf = ext === "pdf";
                const iconBg = isPdf
                  ? "bg-error-100 dark:bg-error-900/30"
                  : "bg-primary-100 dark:bg-primary-900/30";
                const iconColor = isPdf
                  ? "text-error-600 dark:text-error-400"
                  : "text-primary-600 dark:text-primary-400";
                const iconName = isPdf ? "tabler:file-type-pdf" : "tabler:photo";

                return (
                  <div
                    className={`w-12 h-12 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon icon={iconName} height={24} className={iconColor} />
                  </div>
                );
              })()}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile();
                }}
                className="p-2 text-gray-400 hover:text-error-500 transition-colors"
              >
                <Icon icon="tabler:x" height={20} />
              </button>
            </div>
          </div>
        )}

        {/* Validation error */}
        {validationError && (
          <p className="text-sm text-error-600 dark:text-error-400 flex items-center gap-1">
            <Icon icon="tabler:alert-circle" height={16} />
            {validationError}
          </p>
        )}

        {/* Illustration generation option */}
        {selectedFile && (
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={generateIllustrations}
                onChange={(e) => setGenerateIllustrations(e.target.checked)}
                disabled={isUploading}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Icon
                    icon="tabler:photo-ai"
                    height={18}
                    className="text-secondary-500"
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {t("homework.generateIllustrations")}
                  </span>
                  <span className="px-1.5 py-0.5 text-xs font-medium rounded bg-secondary-100 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-400">
                    {t("homework.optional")}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t("homework.generateIllustrationsDesc")}
                </p>
              </div>
            </label>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1"
              disabled={isUploading}
            >
              {t("common.cancel")}
            </Button>
          )}
          <Button
            variant="primary"
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            isLoading={isUploading}
            className="flex-1"
            icon="tabler:upload"
          >
            {t("homework.uploadAndAnalyze")}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardContent>
        {/* Header with status */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t("homework.uploadHomework")}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t("homework.uploadDescription")}
            </p>
          </div>
          {getStatusDisplay()}
        </div>

        {renderContent()}
      </CardContent>
    </Card>
  );
}
