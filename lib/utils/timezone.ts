// lib/utils/timezone.ts
// Timezone utilities for consistent date handling

/**
 * Default timezone for Israeli users
 */
export const DEFAULT_TIMEZONE = "Asia/Jerusalem";

/**
 * Get the current date string in user's timezone (YYYY-MM-DD format)
 */
export function getUserLocalDate(timezone: string = DEFAULT_TIMEZONE): string {
  try {
    return new Date().toLocaleDateString("en-CA", { timeZone: timezone });
  } catch {
    // Fallback to UTC if timezone is invalid
    console.warn(`Invalid timezone: ${timezone}, falling back to default`);
    return new Date().toLocaleDateString("en-CA", { timeZone: DEFAULT_TIMEZONE });
  }
}

/**
 * Get a specific date string in user's timezone (YYYY-MM-DD format)
 */
export function getDateInTimezone(date: Date, timezone: string = DEFAULT_TIMEZONE): string {
  try {
    return date.toLocaleDateString("en-CA", { timeZone: timezone });
  } catch {
    return date.toLocaleDateString("en-CA", { timeZone: DEFAULT_TIMEZONE });
  }
}

/**
 * Check if two dates are consecutive days
 * Uses noon time to avoid DST edge cases
 */
export function isConsecutiveDay(lastDate: string, currentDate: string): boolean {
  if (!lastDate || !currentDate) return false;

  // Parse dates at noon to avoid DST issues
  const last = new Date(`${lastDate}T12:00:00Z`);
  const current = new Date(`${currentDate}T12:00:00Z`);

  // Calculate difference in days
  const diffMs = current.getTime() - last.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  return diffDays === 1;
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: string, date2: string): boolean {
  return date1 === date2;
}

/**
 * Calculate days between two dates
 */
export function daysBetween(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 0;

  const start = new Date(`${startDate}T12:00:00Z`);
  const end = new Date(`${endDate}T12:00:00Z`);

  const diffMs = end.getTime() - start.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}
