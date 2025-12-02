/**
 * Appwrite Database Schema Definition
 *
 * This file documents the schema for all collections in the DailyMath database.
 * Use this as a reference when setting up collections in Appwrite Console.
 *
 * To create collections:
 * 1. Go to Appwrite Console > Databases > Create Database
 * 2. Create each collection listed below
 * 3. Add the attributes as specified
 * 4. Create indexes for frequently queried fields
 * 5. Update .env.local with the collection IDs
 */

export const SCHEMA = {
  database: {
    name: "dailymath",
    description: "DailyMath application database",
  },

  collections: {
    users_profile: {
      name: "users_profile",
      description: "User profiles and preferences",
      attributes: [
        { key: "userId", type: "string", size: 36, required: true },
        { key: "displayName", type: "string", size: 100, required: true },
        { key: "email", type: "string", size: 255, required: true },
        { key: "avatarUrl", type: "url", required: false },

        // Role-based access control
        {
          key: "role",
          type: "enum",
          elements: ["user", "admin"],
          default: "user",
          required: true,
        },

        // Gamification
        { key: "totalXp", type: "integer", min: 0, default: 0, required: true },
        { key: "currentLevel", type: "integer", min: 1, max: 10, default: 1, required: true },
        { key: "currentStreak", type: "integer", min: 0, default: 0, required: true },
        { key: "longestStreak", type: "integer", min: 0, default: 0, required: true },
        { key: "lastPracticeDate", type: "datetime", required: false },

        // Preferences
        { key: "dailyExerciseCount", type: "integer", min: 1, max: 10, default: 5, required: true },
        { key: "preferredTime", type: "string", size: 5, required: false }, // HH:mm
        { key: "emailReminders", type: "boolean", default: true, required: true },
        { key: "streakWarnings", type: "boolean", default: true, required: true },
        { key: "weeklyReport", type: "boolean", default: true, required: true },

        // Integrations
        { key: "notionAccessToken", type: "string", size: 500, required: false },
        { key: "notionDatabaseId", type: "string", size: 36, required: false },

        // Enrolled courses
        { key: "enrolledCourses", type: "string[]", size: 36, required: true },
      ],
      indexes: [
        { key: "userId_idx", type: "unique", attributes: ["userId"] },
        { key: "email_idx", type: "unique", attributes: ["email"] },
        { key: "role_idx", type: "key", attributes: ["role"] },
        { key: "streak_idx", type: "key", attributes: ["currentStreak"], orders: ["DESC"] },
        { key: "level_idx", type: "key", attributes: ["currentLevel"], orders: ["DESC"] },
      ],
    },

    courses: {
      name: "courses",
      description: "Available courses/subjects",
      attributes: [
        { key: "name", type: "string", size: 100, required: true },
        { key: "nameHe", type: "string", size: 100, required: true },
        { key: "description", type: "string", size: 500, required: true },
        { key: "descriptionHe", type: "string", size: 500, required: true },
        { key: "icon", type: "string", size: 10, required: true }, // Emoji
        { key: "color", type: "string", size: 7, required: true }, // #RRGGBB
        { key: "topics", type: "string", size: 10000, required: true }, // JSON string
        { key: "isActive", type: "boolean", default: true, required: true },
        { key: "sortOrder", type: "integer", min: 0, default: 0, required: true },
      ],
      indexes: [
        { key: "active_sort_idx", type: "key", attributes: ["isActive", "sortOrder"] },
        { key: "name_idx", type: "fulltext", attributes: ["name"] },
      ],
    },

    exercises: {
      name: "exercises",
      description: "Exercise bank with questions and solutions",
      attributes: [
        { key: "courseId", type: "string", size: 36, required: true },
        { key: "topicId", type: "string", size: 36, required: true },
        { key: "question", type: "string", size: 5000, required: true },
        { key: "questionHe", type: "string", size: 5000, required: false },
        {
          key: "difficulty",
          type: "enum",
          elements: ["easy", "medium", "hard"],
          required: true,
        },
        { key: "xpReward", type: "integer", min: 1, max: 100, default: 10, required: true },
        { key: "solution", type: "string", size: 10000, required: true },
        { key: "solutionHe", type: "string", size: 10000, required: false },
        { key: "answer", type: "string", size: 500, required: false },
        {
          key: "answerType",
          type: "enum",
          elements: ["numeric", "expression", "proof", "open"],
          required: true,
        },
        { key: "tip", type: "string", size: 1000, required: false },
        { key: "tipHe", type: "string", size: 1000, required: false },
        { key: "diagramUrl", type: "url", required: false },
        { key: "generatedBy", type: "string", size: 50, required: false },
        { key: "generatedAt", type: "datetime", required: false },
        { key: "timesUsed", type: "integer", min: 0, default: 0, required: true },
        { key: "averageRating", type: "float", min: 0, max: 5, required: false },
      ],
      indexes: [
        { key: "course_topic_idx", type: "key", attributes: ["courseId", "topicId"] },
        { key: "difficulty_idx", type: "key", attributes: ["difficulty"] },
        { key: "question_fulltext", type: "fulltext", attributes: ["question"] },
      ],
    },

    daily_sets: {
      name: "daily_sets",
      description: "Daily exercise sets assigned to users",
      attributes: [
        { key: "userId", type: "string", size: 36, required: true },
        { key: "date", type: "string", size: 10, required: true }, // YYYY-MM-DD
        { key: "exercises", type: "string", size: 5000, required: true }, // JSON
        { key: "completedCount", type: "integer", min: 0, default: 0, required: true },
        { key: "totalCount", type: "integer", min: 1, max: 10, required: true },
        { key: "isCompleted", type: "boolean", default: false, required: true },
        { key: "completedAt", type: "datetime", required: false },
        { key: "xpEarned", type: "integer", min: 0, default: 0, required: true },
        { key: "reminderSent", type: "boolean", default: false, required: true },
        { key: "warningSent", type: "boolean", default: false, required: true },
        { key: "notionPageId", type: "string", size: 36, required: false },
      ],
      indexes: [
        { key: "user_date_idx", type: "unique", attributes: ["userId", "date"] },
        { key: "date_idx", type: "key", attributes: ["date"], orders: ["DESC"] },
        { key: "incomplete_idx", type: "key", attributes: ["isCompleted", "date"] },
      ],
    },

    user_answers: {
      name: "user_answers",
      description: "User answers to exercises",
      attributes: [
        { key: "userId", type: "string", size: 36, required: true },
        { key: "exerciseId", type: "string", size: 36, required: true },
        { key: "dailySetId", type: "string", size: 36, required: true },
        {
          key: "answerType",
          type: "enum",
          elements: ["self_mark", "image_upload", "text_input"],
          required: true,
        },
        { key: "textAnswer", type: "string", size: 1000, required: false },
        { key: "imageFileId", type: "string", size: 36, required: false },
        { key: "imageAnalysis", type: "string", size: 2000, required: false }, // JSON
        { key: "isCorrect", type: "boolean", required: false },
        { key: "selfMarked", type: "boolean", default: false, required: true },
        { key: "xpAwarded", type: "integer", min: 0, default: 0, required: true },
        { key: "startedAt", type: "datetime", required: true },
        { key: "submittedAt", type: "datetime", required: true },
        { key: "timeSpentSeconds", type: "integer", min: 0, required: true },
      ],
      indexes: [
        { key: "user_exercise_idx", type: "key", attributes: ["userId", "exerciseId"] },
        { key: "daily_set_idx", type: "key", attributes: ["dailySetId"] },
        { key: "user_time_idx", type: "key", attributes: ["userId", "submittedAt"], orders: ["ASC", "DESC"] },
      ],
    },

    // ============================================
    // Topic-Centric Learning Collections
    // ============================================

    topics: {
      name: "topics",
      description: "Individual study topics within courses",
      attributes: [
        { key: "courseId", type: "string", size: 36, required: true },
        { key: "name", type: "string", size: 200, required: true },
        { key: "nameHe", type: "string", size: 200, required: true },
        { key: "description", type: "string", size: 2000, required: true },
        { key: "descriptionHe", type: "string", size: 2000, required: false },
        { key: "branchId", type: "string", size: 50, required: true },
        { key: "prerequisites", type: "string", size: 1000, required: false, default: "[]" }, // JSON array of topic IDs
        { key: "order", type: "integer", min: 0, required: true },
        { key: "difficultyLevels", type: "string", size: 100, required: false, default: '["easy","medium","hard"]' }, // JSON array
        { key: "questionTypes", type: "string", size: 500, required: false }, // JSON array for AI prompts
        { key: "keywords", type: "string", size: 500, required: false }, // JSON array for search
        { key: "theoryContent", type: "string", size: 20000, required: false }, // Markdown for Learn tab
        { key: "theoryContentHe", type: "string", size: 20000, required: false },
        { key: "videoIds", type: "string", size: 1000, required: false }, // JSON array of YouTube IDs
        { key: "isActive", type: "boolean", default: true, required: false },
        { key: "estimatedMinutes", type: "integer", min: 5, max: 120, required: false },
      ],
      indexes: [
        { key: "courseId_idx", type: "key", attributes: ["courseId"] },
        { key: "branchId_idx", type: "key", attributes: ["branchId"] },
        { key: "course_order_idx", type: "key", attributes: ["courseId", "order"] },
        { key: "name_fulltext", type: "fulltext", attributes: ["name"] },
      ],
    },

    topic_formulas: {
      name: "topic_formulas",
      description: "Formulas and equations for topics (cheat sheets)",
      attributes: [
        { key: "topicId", type: "string", size: 36, required: true },
        { key: "courseId", type: "string", size: 36, required: true },
        { key: "title", type: "string", size: 200, required: true },
        { key: "titleHe", type: "string", size: 200, required: false },
        { key: "latex", type: "string", size: 2000, required: true }, // LaTeX formula content
        { key: "explanation", type: "string", size: 1000, required: false },
        { key: "explanationHe", type: "string", size: 1000, required: false },
        { key: "category", type: "string", size: 100, required: false }, // e.g., "derivatives", "limits"
        { key: "sortOrder", type: "integer", min: 0, default: 0, required: false },
        { key: "tags", type: "string", size: 500, required: false }, // JSON array
        { key: "isCore", type: "boolean", default: false, required: false }, // Mark essential formulas
      ],
      indexes: [
        { key: "topicId_idx", type: "key", attributes: ["topicId"] },
        { key: "topic_order_idx", type: "key", attributes: ["topicId", "sortOrder"] },
        { key: "courseId_idx", type: "key", attributes: ["courseId"] },
      ],
    },

    topic_videos: {
      name: "topic_videos",
      description: "YouTube video tutorials linked to topics",
      attributes: [
        { key: "videoId", type: "string", size: 20, required: true }, // YouTube video ID
        { key: "topicId", type: "string", size: 36, required: true },
        { key: "courseId", type: "string", size: 36, required: true },
        { key: "title", type: "string", size: 300, required: true },
        { key: "titleHe", type: "string", size: 300, required: false },
        { key: "channelName", type: "string", size: 150, required: true },
        { key: "thumbnailUrl", type: "string", size: 500, required: true },
        { key: "duration", type: "string", size: 10, required: false }, // e.g., "12:34"
        { key: "durationSeconds", type: "integer", min: 0, required: false },
        {
          key: "language",
          type: "enum",
          elements: ["en", "he", "other"],
          required: true,
        },
        { key: "sortOrder", type: "integer", min: 0, default: 0, required: false },
        {
          key: "source",
          type: "enum",
          elements: ["curated", "api"],
          default: "curated",
          required: false,
        },
        { key: "description", type: "string", size: 2000, required: false },
        { key: "isActive", type: "boolean", default: true, required: false },
      ],
      indexes: [
        { key: "topicId_idx", type: "key", attributes: ["topicId"] },
        { key: "topic_order_idx", type: "key", attributes: ["topicId", "sortOrder"] },
        { key: "courseId_idx", type: "key", attributes: ["courseId"] },
        { key: "language_idx", type: "key", attributes: ["language"] },
      ],
    },
  },

  buckets: {
    user_images: {
      name: "user_images",
      description: "User-uploaded handwork images for AI analysis",
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedExtensions: ["jpg", "jpeg", "png", "heic", "webp"],
      permissions: {
        create: ["users"],
        read: ["users"],
        update: [],
        delete: ["users"],
      },
    },
  },
};

/**
 * Initial course data to seed the database
 */
export const SEED_COURSES = [
  {
    name: "Calculus 1",
    nameHe: "חשבון אינפיניטסימלי 1",
    description: "Limits, derivatives, and basic integration",
    descriptionHe: "גבולות, נגזרות ואינטגרציה בסיסית",
    icon: "📐",
    color: "#3B82F6",
    topics: [
      { id: "limits", name: "Limits", nameHe: "גבולות" },
      { id: "continuity", name: "Continuity", nameHe: "רציפות" },
      { id: "derivatives", name: "Derivatives", nameHe: "נגזרות" },
      { id: "chain-rule", name: "Chain Rule", nameHe: "כלל השרשרת" },
      { id: "optimization", name: "Optimization", nameHe: "אופטימיזציה" },
      { id: "integrals", name: "Basic Integrals", nameHe: "אינטגרלים בסיסיים" },
    ],
    isActive: true,
    sortOrder: 1,
  },
  {
    name: "Linear Algebra",
    nameHe: "אלגברה ליניארית",
    description: "Vectors, matrices, and linear transformations",
    descriptionHe: "וקטורים, מטריצות והעתקות ליניאריות",
    icon: "📊",
    color: "#8B5CF6",
    topics: [
      { id: "vectors", name: "Vectors", nameHe: "וקטורים" },
      { id: "matrices", name: "Matrices", nameHe: "מטריצות" },
      { id: "systems", name: "Linear Systems", nameHe: "מערכות משוואות" },
      { id: "determinants", name: "Determinants", nameHe: "דטרמיננטות" },
      { id: "eigenvalues", name: "Eigenvalues", nameHe: "ערכים עצמיים" },
    ],
    isActive: true,
    sortOrder: 2,
  },
  {
    name: "Physics 1",
    nameHe: "פיסיקה 1",
    description: "Mechanics and thermodynamics",
    descriptionHe: "מכניקה ותרמודינמיקה",
    icon: "🔬",
    color: "#10B981",
    topics: [
      { id: "kinematics", name: "Kinematics", nameHe: "קינמטיקה" },
      { id: "forces", name: "Forces", nameHe: "כוחות" },
      { id: "energy", name: "Energy", nameHe: "אנרגיה" },
      { id: "momentum", name: "Momentum", nameHe: "תנע" },
      { id: "rotation", name: "Rotation", nameHe: "סיבוב" },
    ],
    isActive: false, // Coming soon
    sortOrder: 3,
  },
];

export default SCHEMA;
