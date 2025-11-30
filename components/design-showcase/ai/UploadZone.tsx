"use client";

import { Icon } from "@iconify/react";
import { useState } from "react";

interface UploadZoneProps {
  onUpload?: (file: File) => void;
  isUploading?: boolean;
}

export function UploadZone({ onUpload, isUploading = false }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleFile(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    onUpload?.(file);
  };

  const clearPreview = () => {
    setPreview(null);
  };

  if (preview) {
    return (
      <div className="relative rounded-xl overflow-hidden border-2 border-success-300 dark:border-success-700">
        {/* eslint-disable-next-line @next/next/no-img-element -- Dynamic user-uploaded image with data URL */}
        <img src={preview} alt="Uploaded solution" className="w-full h-auto max-h-96 object-contain bg-gray-100 dark:bg-gray-800" />
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <Icon icon="tabler:circle-check" className="text-success-400" />
              <span className="text-sm">Image uploaded successfully</span>
            </div>
            <button
              onClick={clearPreview}
              className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-all ${
        isDragging
          ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
          : "border-gray-300 dark:border-gray-600 hover:border-primary-400"
      } ${isUploading ? "opacity-50 pointer-events-none" : "cursor-pointer"}`}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={isUploading}
      />

      <div className="space-y-4">
        <div
          className={`h-16 w-16 mx-auto rounded-full flex items-center justify-center ${
            isDragging
              ? "bg-primary-100 dark:bg-primary-900/40"
              : "bg-gray-100 dark:bg-gray-800"
          }`}
        >
          {isUploading ? (
            <Icon icon="tabler:loader-2" className="text-3xl text-primary-500 animate-spin" />
          ) : (
            <Icon
              icon={isDragging ? "tabler:download" : "tabler:camera"}
              className={`text-3xl ${isDragging ? "text-primary-600" : "text-gray-400"}`}
            />
          )}
        </div>

        <div>
          <p className="font-medium text-gray-700 dark:text-gray-300">
            {isDragging ? "Drop your image here" : "Upload your handwritten solution"}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Drag and drop or click to browse
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Icon icon="tabler:photo" />
            JPG, PNG, HEIC
          </span>
          <span className="flex items-center gap-1">
            <Icon icon="tabler:file" />
            Max 10MB
          </span>
        </div>
      </div>
    </div>
  );
}

// Camera capture button
export function CameraCapture({ onCapture }: { onCapture?: () => void }) {
  return (
    <button
      onClick={onCapture}
      className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors"
    >
      <Icon icon="tabler:camera" className="text-xl" />
      Take Photo
    </button>
  );
}

// Showcase
export function UploadZoneShowcase() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-500 mb-2">Upload Zone</p>
        <UploadZone />
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-2">Loading State</p>
        <UploadZone isUploading />
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-2">Camera Button</p>
        <CameraCapture />
      </div>
    </div>
  );
}
