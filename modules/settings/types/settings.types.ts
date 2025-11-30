// Settings Types

export interface UserSettings {
  // Profile
  displayName: string;
  email: string;
  avatarUrl?: string;

  // Practice preferences
  dailyExerciseCount: number; // 1-10
  preferredTime?: string; // HH:mm format

  // Notification preferences
  emailReminders: boolean;
  streakWarnings: boolean;
  weeklyReport: boolean;
}

export interface UpdateSettingsInput {
  displayName?: string;
  dailyExerciseCount?: number;
  preferredTime?: string;
  emailReminders?: boolean;
  streakWarnings?: boolean;
  weeklyReport?: boolean;
}

export interface ComingSoonFeature {
  id: string;
  name: string;
  nameHe: string;
  icon: string;
}

export const COMING_SOON_FEATURES: ComingSoonFeature[] = [
  { id: "avatar", name: "Profile Picture", nameHe: "תמונת פרופיל", icon: "tabler:camera" },
  { id: "theme", name: "Theme Toggle", nameHe: "מצב תצוגה", icon: "tabler:palette" },
  { id: "notion", name: "Notion Sync", nameHe: "סנכרון Notion", icon: "tabler:brand-notion" },
  { id: "calendar", name: "Calendar Sync", nameHe: "סנכרון לוח שנה", icon: "tabler:calendar" },
  { id: "password", name: "Change Password", nameHe: "שינוי סיסמה", icon: "tabler:lock" },
  { id: "export", name: "Export Data", nameHe: "ייצוא נתונים", icon: "tabler:download" },
  { id: "delete", name: "Delete Account", nameHe: "מחיקת חשבון", icon: "tabler:trash" },
];
