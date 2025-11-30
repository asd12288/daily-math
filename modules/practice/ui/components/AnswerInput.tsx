// modules/practice/ui/components/AnswerInput.tsx
// Input component for submitting answers

"use client";

import React, { useState, useRef } from "react";
import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import { Button, Input } from "@/shared/ui";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = () => {
    if (disabled || isSubmitting) return;

    // TODO: Upload image to storage and get URL
    // For now, just submit text answer
    onSubmit(answerText || null, imagePreview);
  };

  const canSubmit = answerText.trim() !== "" || selectedImage !== null;

  return (
    <div className="space-y-4">
      {/* Text Answer Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Your Answer
        </label>
        <Input
          value={answerText}
          onChange={(e) => setAnswerText(e.target.value)}
          placeholder="Enter your answer..."
          disabled={disabled || isSubmitting}
          className="font-mono text-lg"
        />
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
        <span className="text-sm text-gray-500 dark:text-gray-400">OR</span>
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
          disabled={disabled || isSubmitting}
        />

        {!imagePreview ? (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isSubmitting}
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
              Take a photo or select from gallery
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
              disabled={disabled || isSubmitting}
              className="absolute top-2 end-2 w-8 h-8 bg-error-500 text-white rounded-full flex items-center justify-center hover:bg-error-600 transition-colors"
            >
              <Icon icon="tabler:x" height={16} />
            </button>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        {/* Help Button */}
        <Button
          variant="outline"
          onClick={onNeedHelp}
          disabled={disabled || isSubmitting}
          className="flex-1"
          icon="tabler:bulb"
        >
          I&apos;m Stuck - Help Me
        </Button>

        {/* Skip Button */}
        <Button
          variant="ghost"
          onClick={onSkip}
          disabled={disabled || isSubmitting}
          className="flex-1"
          icon="tabler:player-skip-forward"
        >
          Skip
        </Button>
      </div>

      {/* Submit Button */}
      <Button
        variant="primary"
        size="lg"
        onClick={handleSubmit}
        disabled={!canSubmit || disabled}
        isLoading={isSubmitting}
        className="w-full"
        icon="tabler:send"
      >
        {t("common.submit")}
      </Button>
    </div>
  );
}
