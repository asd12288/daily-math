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
    // Homework feature collections
    homeworks: process.env.APPWRITE_HOMEWORKS_COLLECTION || "homeworks",
    homeworkQuestions:
      process.env.APPWRITE_HOMEWORK_QUESTIONS_COLLECTION || "homework_questions",
    homeworkSolutions:
      process.env.APPWRITE_HOMEWORK_SOLUTIONS_COLLECTION || "homework_solutions",
    // Topic-centric learning collections
    topics: process.env.APPWRITE_TOPICS_COLLECTION || "topics",
    topicFormulas: process.env.APPWRITE_TOPIC_FORMULAS_COLLECTION || "topic_formulas",
    topicVideos: process.env.APPWRITE_TOPIC_VIDEOS_COLLECTION || "topic_videos",
  },

  // Storage bucket IDs
  buckets: {
    userImages: process.env.APPWRITE_USER_IMAGES_BUCKET!,
    // Note: user_images bucket now also accepts PDFs for homework uploads
    userFiles: process.env.APPWRITE_USER_FILES_BUCKET || "user_images",
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
  // Homework feature
  HOMEWORKS: "homeworks",
  HOMEWORK_QUESTIONS: "homework_questions",
  HOMEWORK_SOLUTIONS: "homework_solutions",
  // Topic-centric learning
  TOPICS: "topics",
  TOPIC_FORMULAS: "topic_formulas",
  TOPIC_VIDEOS: "topic_videos",
} as const;

// Bucket names for reference
export const BUCKET_NAMES = {
  USER_IMAGES: "user_images",
  USER_FILES: "user_images", // Same bucket, now accepts PDFs too
} as const;
