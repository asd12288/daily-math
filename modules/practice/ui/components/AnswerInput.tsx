// modules/practice/ui/components/AnswerInput.tsx
// Input component for submitting answers

"use client";

import React, { useState, useRef, useCallback } from "react";
import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import { Button, Input } from "@/shared/ui";
import { useUploadAnswerImage } from "../../hooks";

interface AnswerInputProps {
  onSubmit: (answerText: string | null, imageUrl: string | null) => void;
  onSkip: () => void;
  onNeedHelp: () => void;
  isSubmitting?: boolean;
  disabled?: boolean;
}

export function AnswerInput({
  onSubmit,
  onSkip,
  onNeedHelp,
  isSubmitting = false,
  disabled = false,
}: AnswerInputProps) {
  const t = useTranslations();
  const [answerText, setAnswerText] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadImageAsync, isUploading } = useUploadAnswerImage();

  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setUploadError(t("practice.answerInput.imageTooLarge"));
        return;
      }

      setSelectedImage(file);
      setUploadError(null);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [t]);

  const handleRemoveImage = useCallback(() => {
    setSelectedImage(null);
    setImagePreview(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (disabled || isSubmitting || isUploading) return;

    try {
      setUploadError(null);

      // If there's an image, upload it first
      if (imagePreview) {
        const uploadResult = await uploadImageAsync({
          base64Data: imagePreview,
          fileName: selectedImage?.name,
          mimeType: selectedImage?.type,
        });

        if (uploadResult.success && uploadResult.fileUrl) {
          // Submit with the uploaded image URL
          onSubmit(answerText || null, uploadResult.fileUrl);
        } else {
          setUploadError(t("practice.answerInput.uploadFailed"));
        }
      } else {
        // Submit text answer only
        onSubmit(answerText || null, null);
      }
    } catch {
      setUploadError(t("practice.answerInput.errorOccurred"));
    }
  }, [disabled, isSubmitting, isUploading, imagePreview, answerText, selectedImage, uploadImageAsync, onSubmit, t]);

  const canSubmit = answerText.trim() !== "" || selectedImage !== null;
  const isProcessing = isSubmitting || isUploading;

  return (
    <div className="space-y-4">
      {/* Text Answer Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t("practice.answerInput.yourAnswerLabel")}
        </label>
        <Input
          value={answerText}
          onChange={(e) => setAnswerText(e.target.value)}
          placeholder={t("practice.enterAnswer")}
          disabled={disabled || isProcessing}
          className="font-mono text-lg"
        />
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
        <span className="text-sm text-gray-500 dark:text-gray-400">{t("practice.answerInput.orDivider")}</span>
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
      </div>

      {/* Image Upload */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleImageSelect}
          className="hidden"
          disabled={disabled || isProcessing}
        />

        {!imagePreview ? (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isProcessing}
            className="w-full p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-primary-400 dark:hover:border-primary-500 transition-colors text-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon
              icon="tabler:camera"
              height={32}
              className="mx-auto text-gray-400 dark:text-gray-500 mb-2"
            />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("practice.uploadHandwork")}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t("practice.answerInput.takePhotoOrGallery")}
            </p>
          </button>
        ) : (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element -- Dynamic user-uploaded image with data URL */}
            <img
              src={imagePreview}
              alt="Answer preview"
              className="w-full h-48 object-contain bg-gray-100 dark:bg-gray-800 rounded-xl"
            />
            <button
              onClick={handleRemoveImage}
              disabled={disabled || isProcessing}
              className="absolute top-2 end-2 w-8 h-8 bg-error-500 text-white rounded-full flex items-center justify-center hover:bg-error-600 transition-colors disabled:opacity-50"
            >
              <Icon icon="tabler:x" height={16} />
            </button>
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                <div className="flex items-center gap-2 text-white">
                  <Icon icon="tabler:loader-2" className="animate-spin" height={24} />
                  <span>{t("practice.answerInput.uploading")}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Upload Error Display */}
        {uploadError && (
          <p className="mt-2 text-sm text-error-600 dark:text-error-400 flex items-center gap-1">
            <Icon icon="tabler:alert-circle" height={16} />
            {uploadError}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        {/* Help Button */}
        <Button
          variant="outline"
          onClick={onNeedHelp}
          disabled={disabled || isProcessing}
          className="flex-1"
          icon="tabler:bulb"
        >
          {t("practice.answerInput.imStuckHelp")}
        </Button>

        {/* Skip Button */}
        <Button
          variant="ghost"
          onClick={onSkip}
          disabled={disabled || isProcessing}
          className="flex-1"
          icon="tabler:player-skip-forward"
        >
          {t("practice.skip")}
        </Button>
      </div>

      {/* Submit Button */}
      <Button
        variant="primary"
        size="lg"
        onClick={handleSubmit}
        disabled={!canSubmit || disabled}
        isLoading={isProcessing}
        className="w-full"
        icon="tabler:send"
      >
        {isUploading ? t("practice.answerInput.uploading") : t("common.submit")}
      </Button>
    </div>
  );
}
