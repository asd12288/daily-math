// modules/notifications/server/services/email.service.ts
// Email notification service using Resend

import { Resend } from "resend";

// Initialize Resend client
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Email sender configuration
const FROM_EMAIL = "DailyMath <noreply@dailymath.app>";
const FALLBACK_FROM = "onboarding@resend.dev"; // Use Resend's test domain during development

/**
 * User data for email templates
 */
interface UserEmailData {
  email: string;
  displayName: string;
  preferredLocale?: "en" | "he";
}

/**
 * Daily set data for reminders
 */
interface DailySetEmailData {
  totalProblems: number;
  focusTopicName: string;
  estimatedMinutes: number;
}

/**
 * Send daily reminder email
 */
export async function sendDailyReminder(
  user: UserEmailData,
  dailySet: DailySetEmailData
): Promise<boolean> {
  if (!resend) {
    console.warn("[Email] Resend not configured, skipping email");
    return false;
  }

  const isHebrew = user.preferredLocale === "he";
  const subject = isHebrew
    ? `${dailySet.totalProblems} תרגילים מחכים לך היום!`
    : `Your ${dailySet.totalProblems} exercises are ready!`;

  const html = buildReminderEmail(user, dailySet, isHebrew);

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.NODE_ENV === "production" ? FROM_EMAIL : FALLBACK_FROM,
      to: user.email,
      subject,
      html,
    });

    if (error) {
      console.error("[Email] Failed to send reminder:", error);
      return false;
    }

    console.log(`[Email] Reminder sent to ${user.email}, id: ${data?.id}`);
    return true;
  } catch (error) {
    console.error("[Email] Error sending reminder:", error);
    return false;
  }
}

/**
 * Send streak warning email (evening reminder before streak breaks)
 */
export async function sendStreakWarning(
  user: UserEmailData,
  streakDays: number
): Promise<boolean> {
  if (!resend) {
    console.warn("[Email] Resend not configured, skipping email");
    return false;
  }

  const isHebrew = user.preferredLocale === "he";
  const subject = isHebrew
    ? `אל תאבד את הרצף של ${streakDays} ימים!`
    : `Don't lose your ${streakDays}-day streak!`;

  const html = buildStreakWarningEmail(user, streakDays, isHebrew);

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.NODE_ENV === "production" ? FROM_EMAIL : FALLBACK_FROM,
      to: user.email,
      subject,
      html,
    });

    if (error) {
      console.error("[Email] Failed to send streak warning:", error);
      return false;
    }

    console.log(`[Email] Streak warning sent to ${user.email}, id: ${data?.id}`);
    return true;
  } catch (error) {
    console.error("[Email] Error sending streak warning:", error);
    return false;
  }
}

/**
 * Build reminder email HTML
 */
function buildReminderEmail(
  user: UserEmailData,
  dailySet: DailySetEmailData,
  isHebrew: boolean
): string {
  const dir = isHebrew ? "rtl" : "ltr";
  const greeting = isHebrew ? `בוקר טוב, ${user.displayName}!` : `Good morning, ${user.displayName}!`;
  const readyText = isHebrew
    ? `${dailySet.totalProblems} תרגילים מחכים לך היום ב${dailySet.focusTopicName}.`
    : `${dailySet.totalProblems} exercises are ready for you today in ${dailySet.focusTopicName}.`;
  const timeText = isHebrew
    ? `זמן משוער: ${dailySet.estimatedMinutes} דקות`
    : `Estimated time: ${dailySet.estimatedMinutes} minutes`;
  const buttonText = isHebrew ? "התחל לתרגל" : "Start Practice";
  const footerText = isHebrew
    ? "כדי להפסיק לקבל תזכורות, עדכן את ההגדרות שלך."
    : "To stop receiving reminders, update your settings.";

  return `
<!DOCTYPE html>
<html dir="${dir}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DailyMath</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background-color: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <!-- Logo -->
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 28px; font-weight: bold; color: #3b82f6;">DailyMath</span>
      </div>

      <!-- Greeting -->
      <h1 style="color: #18181b; font-size: 24px; margin-bottom: 16px; text-align: center;">
        ${greeting}
      </h1>

      <!-- Main message -->
      <p style="color: #52525b; font-size: 16px; line-height: 1.6; text-align: center; margin-bottom: 8px;">
        ${readyText}
      </p>
      <p style="color: #71717a; font-size: 14px; text-align: center; margin-bottom: 32px;">
        ${timeText}
      </p>

      <!-- CTA Button -->
      <div style="text-align: center; margin-bottom: 32px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://dailymath.app'}/practice"
           style="display: inline-block; background-color: #3b82f6; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
          ${buttonText}
        </a>
      </div>

      <!-- Footer -->
      <p style="color: #a1a1aa; font-size: 12px; text-align: center; border-top: 1px solid #e4e4e7; padding-top: 24px; margin-bottom: 0;">
        ${footerText}
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Build streak warning email HTML
 */
function buildStreakWarningEmail(
  user: UserEmailData,
  streakDays: number,
  isHebrew: boolean
): string {
  const dir = isHebrew ? "rtl" : "ltr";
  const greeting = isHebrew ? `היי ${user.displayName}!` : `Hey ${user.displayName}!`;
  const warningText = isHebrew
    ? `הרצף של ${streakDays} ימים שלך עומד להישבר! השלם את התרגילים של היום כדי לשמור עליו.`
    : `Your ${streakDays}-day streak is about to break! Complete today's exercises to keep it going.`;
  const motivationText = isHebrew
    ? "אל תיתן לכל העבודה הקשה ללכת לאיבוד."
    : "Don't let all that hard work go to waste.";
  const buttonText = isHebrew ? "השלם עכשיו" : "Complete Now";
  const footerText = isHebrew
    ? "כדי להפסיק לקבל אזהרות רצף, עדכן את ההגדרות שלך."
    : "To stop receiving streak warnings, update your settings.";

  return `
<!DOCTYPE html>
<html dir="${dir}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DailyMath</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background-color: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <!-- Logo -->
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 28px; font-weight: bold; color: #3b82f6;">DailyMath</span>
      </div>

      <!-- Streak Badge -->
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; background: linear-gradient(135deg, #f97316, #ea580c); padding: 16px 32px; border-radius: 12px;">
          <span style="font-size: 36px;">🔥</span>
          <span style="color: white; font-size: 28px; font-weight: bold; margin-left: 8px;">${streakDays}</span>
        </div>
      </div>

      <!-- Greeting -->
      <h1 style="color: #18181b; font-size: 24px; margin-bottom: 16px; text-align: center;">
        ${greeting}
      </h1>

      <!-- Warning message -->
      <p style="color: #dc2626; font-size: 16px; line-height: 1.6; text-align: center; margin-bottom: 8px; font-weight: 500;">
        ${warningText}
      </p>
      <p style="color: #71717a; font-size: 14px; text-align: center; margin-bottom: 32px;">
        ${motivationText}
      </p>

      <!-- CTA Button -->
      <div style="text-align: center; margin-bottom: 32px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://dailymath.app'}/practice"
           style="display: inline-block; background: linear-gradient(135deg, #f97316, #ea580c); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
          ${buttonText}
        </a>
      </div>

      <!-- Footer -->
      <p style="color: #a1a1aa; font-size: 12px; text-align: center; border-top: 1px solid #e4e4e7; padding-top: 24px; margin-bottom: 0;">
        ${footerText}
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
