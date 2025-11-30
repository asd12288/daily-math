// Appwrite Configuration
export const APPWRITE_CONFIG = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!,
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!,
  databaseId: process.env.APPWRITE_DATABASE_ID!,

  // Collection IDs
  collections: {
    usersProfile: process.env.APPWRITE_USERS_PROFILE_COLLECTION!,
    courses: process.env.APPWRITE_COURSES_COLLECTION!,
    exercises: process.env.APPWRITE_EXERCISES_COLLECTION!,
    dailySets: process.env.APPWRITE_DAILY_SETS_COLLECTION!,
    userAnswers: process.env.APPWRITE_USER_ANSWERS_COLLECTION!,
    userProgress: process.env.APPWRITE_USER_PROGRESS_COLLECTION!,
    practiceSessions: process.env.APPWRITE_PRACTICE_SESSIONS_COLLECTION!,
    problemAttempts: process.env.APPWRITE_PROBLEM_ATTEMPTS_COLLECTION!,
  },

  // Storage bucket IDs
  buckets: {
    userImages: process.env.APPWRITE_USER_IMAGES_BUCKET!,
  },
} as const;

// Collection names for reference
export const COLLECTION_NAMES = {
  USERS_PROFILE: "users_profile",
  COURSES: "courses",
  EXERCISES: "exercises",
  DAILY_SETS: "daily_sets",
  USER_ANSWERS: "user_answers",
  USER_PROGRESS: "user_progress",
  PRACTICE_SESSIONS: "practice_sessions",
  PROBLEM_ATTEMPTS: "problem_attempts",
} as const;
