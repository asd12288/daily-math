"use client";

import { CardBox } from "@/shared/ui";
import { Icon } from "@iconify/react";
import { useState } from "react";
import { mockUser } from "../mock-data";

interface ExerciseCountSliderProps {
  value?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
}

export function ExerciseCountSlider({
  value: initialValue = mockUser.dailyExerciseCount,
  onChange,
  min = 1,
  max = 10,
}: ExerciseCountSliderProps) {
  const [value, setValue] = useState(initialValue);

  const handleChange = (newValue: number) => {
    setValue(newValue);
    onChange?.(newValue);
  };

  const getEstimatedTime = (count: number) => count * 4; // ~4 minutes per exercise

  return (
    <CardBox>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-semibold">Daily Exercise Count</h4>
          <p className="text-sm text-gray-500">How many exercises per day?</p>
        </div>
        <div className="text-end">
          <p className="text-3xl font-bold text-primary-600">{value}</p>
          <p className="text-xs text-gray-500">exercises/day</p>
        </div>
      </div>

      {/* Slider */}
      <div className="mb-6">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => handleChange(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
        />
        <div className="flex justify-between mt-2 text-xs text-gray-400">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>

      {/* Quick select buttons */}
      <div className="flex gap-2 mb-6">
        {[3, 5, 7, 10].map((count) => (
          <button
            key={count}
            onClick={() => handleChange(count)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              value === count
                ? "bg-primary-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {count}
          </button>
        ))}
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Icon icon="tabler:clock" className="text-gray-400" />
            <span className="text-sm text-gray-500">Estimated time</span>
          </div>
          <p className="font-semibold">~{getEstimatedTime(value)} min</p>
        </div>
        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Icon icon="tabler:star" className="text-gray-400" />
            <span className="text-sm text-gray-500">Potential XP</span>
          </div>
          <p className="font-semibold">{value * 15}-{value * 25} XP</p>
        </div>
      </div>

      {/* Recommendation */}
      {value >= 7 && (
        <div className="mt-4 p-3 bg-warning-50 dark:bg-warning-900/20 rounded-lg flex items-start gap-2">
          <Icon icon="tabler:info-circle" className="text-warning-600 mt-0.5" />
          <p className="text-sm text-warning-700 dark:text-warning-300">
            That&apos;s ambitious! Make sure you have enough time to complete all exercises.
          </p>
        </div>
      )}
    </CardBox>
  );
}

// Showcase
export function ExerciseCountSliderShowcase() {
  return (
    <div className="max-w-md">
      <ExerciseCountSlider />
    </div>
  );
}
