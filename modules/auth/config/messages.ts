// Auth-specific messages (for server-side use or fallbacks)
export const AUTH_MESSAGES = {
  SUCCESS: {
    LOGIN: "Welcome back!",
    REGISTER: "Account created successfully!",
    LOGOUT: "You have been logged out",
    PASSWORD_RESET_SENT: "Password reset email sent",
    PASSWORD_UPDATED: "Password updated successfully",
  },
  ERROR: {
    INVALID_CREDENTIALS: "Invalid email or password",
    EMAIL_EXISTS: "An account with this email already exists",
    WEAK_PASSWORD: "Password is too weak",
    USER_NOT_FOUND: "User not found",
    SESSION_EXPIRED: "Your session has expired. Please log in again.",
    UNKNOWN: "An unknown error occurred",
  },
} as const;
