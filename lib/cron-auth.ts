// lib/cron-auth.ts
// Helper for authenticating Vercel cron job requests

/**
 * Verify that the request is from Vercel cron
 * Vercel sends a secret in the Authorization header for cron jobs
 */
export function verifyCronSecret(request: Request): boolean {
  const authHeader = request.headers.get("authorization");

  // In development, skip verification if no secret is set
  if (process.env.NODE_ENV === "development" && !process.env.CRON_SECRET) {
    console.warn("[Cron] Running in development without CRON_SECRET");
    return true;
  }

  // Verify the cron secret
  if (!process.env.CRON_SECRET) {
    console.error("[Cron] CRON_SECRET environment variable is not set");
    return false;
  }

  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;
  return authHeader === expectedAuth;
}

/**
 * Create an unauthorized response for failed cron auth
 */
export function unauthorizedResponse(): Response {
  return new Response(
    JSON.stringify({ error: "Unauthorized", message: "Invalid cron secret" }),
    {
      status: 401,
      headers: { "Content-Type": "application/json" },
    }
  );
}

/**
 * Create a JSON response with proper headers
 */
export function cronResponse(
  data: Record<string, unknown>,
  status: number = 200
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Get Israel timezone date string (YYYY-MM-DD)
 * This accounts for the fact that cron runs at UTC times
 */
export function getIsraelDate(): string {
  const now = new Date();
  // Israel is UTC+2 (or UTC+3 during DST)
  // We use the Intl API to get the correct date in Israel timezone
  const israelDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jerusalem",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

  return israelDate; // Returns YYYY-MM-DD format
}

/**
 * Get the next day's date in Israel timezone
 * Used when generating sets at 22:00 UTC (midnight Israel time)
 */
export function getNextIsraelDate(): string {
  const israelDate = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Jerusalem" })
  );
  israelDate.setDate(israelDate.getDate() + 1);

  return israelDate.toISOString().split("T")[0];
}
