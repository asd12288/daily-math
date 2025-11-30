"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { XPToast, DailySetCompleteToast } from "../components/XPToast";
import { LevelUpCelebration } from "../components/LevelBadge";
import type { XpToastType } from "../../types/gamification.types";

interface XpToastData {
  id: string;
  xp: number;
  message?: string;
  type: XpToastType;
  isExiting?: boolean;
}

interface DailyCompleteData {
  id: string;
  totalXp: number;
  bonusXp?: number;
  isExiting?: boolean;
}

interface LevelUpData {
  newLevel: number;
  newTitle: string;
}

interface GamificationContextType {
  showXpToast: (xp: number, type?: XpToastType, message?: string) => void;
  showDailyComplete: (totalXp: number, bonusXp?: number) => void;
  showLevelUp: (newLevel: number, newTitle: string) => void;
}

const GamificationContext = createContext<GamificationContextType | null>(null);

export function useGamification() {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error("useGamification must be used within a GamificationProvider");
  }
  return context;
}

interface GamificationProviderProps {
  children: ReactNode;
}

export function GamificationProvider({ children }: GamificationProviderProps) {
  const [xpToasts, setXpToasts] = useState<XpToastData[]>([]);
  const [dailyComplete, setDailyComplete] = useState<DailyCompleteData | null>(null);
  const [levelUp, setLevelUp] = useState<LevelUpData | null>(null);

  // Auto-dismiss XP toasts after 2.5 seconds (with exit animation)
  useEffect(() => {
    if (xpToasts.length > 0 && !xpToasts[0].isExiting) {
      const timer = setTimeout(() => {
        // Mark first toast as exiting
        setXpToasts((prev) =>
          prev.map((t, i) => (i === 0 ? { ...t, isExiting: true } : t))
        );
        // Remove after exit animation
        setTimeout(() => {
          setXpToasts((prev) => prev.slice(1));
        }, 300);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [xpToasts]);

  // Auto-dismiss daily complete after 4 seconds
  useEffect(() => {
    if (dailyComplete && !dailyComplete.isExiting) {
      const timer = setTimeout(() => {
        setDailyComplete((prev) => (prev ? { ...prev, isExiting: true } : null));
        setTimeout(() => {
          setDailyComplete(null);
        }, 300);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [dailyComplete]);

  const showXpToast = useCallback((xp: number, type: XpToastType = "earned", message?: string) => {
    const id = `xp-${Date.now()}-${Math.random()}`;
    setXpToasts((prev) => [...prev, { id, xp, type, message }]);
  }, []);

  const showDailyComplete = useCallback((totalXp: number, bonusXp?: number) => {
    const id = `daily-${Date.now()}`;
    setDailyComplete({ id, totalXp, bonusXp });
  }, []);

  const showLevelUp = useCallback((newLevel: number, newTitle: string) => {
    setLevelUp({ newLevel, newTitle });
  }, []);

  const closeLevelUp = useCallback(() => {
    setLevelUp(null);
  }, []);

  return (
    <GamificationContext.Provider value={{ showXpToast, showDailyComplete, showLevelUp }}>
      {children}

      {/* Toast container - fixed at bottom end (right for LTR, left for RTL) */}
      <div className="fixed bottom-6 end-6 z-50 flex flex-col items-end gap-3">
        {/* XP Toasts */}
        {xpToasts.map((toast) => (
          <div
            key={toast.id}
            className={toast.isExiting ? "animate-slide-down-fade" : "animate-slide-up-fade"}
          >
            <XPToast xp={toast.xp} type={toast.type} message={toast.message} />
          </div>
        ))}

        {/* Daily Complete Toast */}
        {dailyComplete && (
          <div className={dailyComplete.isExiting ? "animate-slide-down-fade" : "animate-slide-up-fade"}>
            <DailySetCompleteToast totalXp={dailyComplete.totalXp} bonusXp={dailyComplete.bonusXp} />
          </div>
        )}
      </div>

      {/* Level Up Celebration - full screen modal */}
      {levelUp && (
        <LevelUpCelebration
          newLevel={levelUp.newLevel}
          newTitle={levelUp.newTitle}
          onClose={closeLevelUp}
        />
      )}
    </GamificationContext.Provider>
  );
}
