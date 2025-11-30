import { z } from "zod";

export const updateSettingsSchema = z.object({
  displayName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .optional(),
  dailyExerciseCount: z
    .number()
    .int()
    .min(1, "Minimum 1 exercise per day")
    .max(10, "Maximum 10 exercises per day")
    .optional(),
  preferredTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)")
    .optional()
    .nullable(),
  emailReminders: z.boolean().optional(),
  streakWarnings: z.boolean().optional(),
  weeklyReport: z.boolean().optional(),
});

export type UpdateSettingsSchema = z.infer<typeof updateSettingsSchema>;
