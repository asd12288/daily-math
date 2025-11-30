"use client";

import { CardBox } from "@/shared/ui";
import { Icon } from "@iconify/react";
import { mockUser, mockDailySet } from "../mock-data";

export function WelcomeCard() {
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12 ? "Good morning" : currentHour < 18 ? "Good afternoon" : "Good evening";

  return (
    <CardBox className="bg-primary-50 dark:bg-primary-900/20 overflow-hidden">
      <div className="grid grid-cols-12 gap-4">
        <div className="lg:col-span-8 col-span-12">
          <div className="flex gap-3 items-center mb-6">
            <div className="h-12 w-12 rounded-full bg-primary-500 flex items-center justify-center text-white text-xl font-bold">
              {mockUser.displayName.charAt(0)}
            </div>
            <div>
              <h5 className="text-lg font-medium">
                {greeting}, {mockUser.displayName}!
              </h5>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ready to tackle today&apos;s exercises?
              </p>
            </div>
          </div>

          <div className="flex gap-6 items-center flex-wrap">
            {/* Today's Set */}
            <div className="pe-6 border-e border-gray-300 dark:border-gray-600">
              <div className="flex items-center gap-2">
                <Icon icon="tabler:list-check" className="text-primary-500 text-xl" />
                <h3 className="text-2xl font-bold">{mockDailySet.exercises.length}</h3>
              </div>
              <p className="text-sm text-gray-500 mt-1">Today&apos;s Exercises</p>
            </div>

            {/* Progress */}
            <div className="pe-6 border-e border-gray-300 dark:border-gray-600">
              <div className="flex items-center gap-2">
                <Icon icon="tabler:circle-check" className="text-success-500 text-xl" />
                <h3 className="text-2xl font-bold">
                  {mockDailySet.completedCount}/{mockDailySet.exercises.length}
                </h3>
              </div>
              <p className="text-sm text-gray-500 mt-1">Completed</p>
            </div>

            {/* Estimated Time */}
            <div>
              <div className="flex items-center gap-2">
                <Icon icon="tabler:clock" className="text-warning-500 text-xl" />
                <h3 className="text-2xl font-bold">~{mockDailySet.estimatedTime}</h3>
              </div>
              <p className="text-sm text-gray-500 mt-1">Minutes Left</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 col-span-12 flex items-center justify-center lg:justify-end">
          <button className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors">
            <Icon icon="tabler:player-play" className="text-xl" />
            Start Practice
          </button>
        </div>
      </div>
    </CardBox>
  );
}
