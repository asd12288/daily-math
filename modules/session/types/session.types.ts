// modules/session/types/session.types.ts
// Unified session type definitions

/**
 * Source of the session (where questions come from)
 */
export type SessionSource = "topic" | "homework" | "daily";

/**
 * Session mode determines user interaction
 * - learn: View solution only (50% XP)
 * - review: View solution only (50% XP, for homework)
 * - practice: Answer first, then reveal (100% XP)
 */
export type SessionMode = "learn" | "review" | "practice";

/**
 * Question difficulty levels
 */
export type SessionDifficulty = "easy" | "medium" | "hard";

/**
 * Solution status for lazy-loaded solutions
 */
export type SolutionStatus = "pending" | "loading" | "loaded" | "error";

/**
 * Unified question interface - works for all sources
 */
export interface SessionQuestion {
  /** Unique identifier */
  id: string;
  /** Original source ID (exerciseId, homeworkQuestionId) */
  sourceId: string;
  /** Question text (supports LaTeX) */
  content: string;
  /** Hebrew translation */
  contentHe?: string;
  /** Difficulty level */
  difficulty: SessionDifficulty;
  /** XP reward (before mode multiplier) */
  xpReward: number;
  /** Estimated time in minutes */
  estimatedMinutes?: number;

  // Grouping (for homework sub-questions)
  /** Is this a sub-question */
  isSubQuestion: boolean;
  /** Sub-question label (a, b, c, 1, 2, etc.) */
  subLabel?: string;
  /** Parent question ID (for sub-questions) */
  parentId?: string;
  /** Parent question context text */
  parentContext?: string;

  // Solution (lazy loaded or pre-loaded)
  /** Solution data (may be null until loaded) */
  solution?: SessionSolution | null;
  /** Solution loading status */
  solutionStatus: SolutionStatus;

  // State
  /** Has this question been viewed/revealed */
  isViewed: boolean;
  /** Timestamp when viewed */
  viewedAt?: string;
}

/**
 * Solution data for a question
 */
export interface SessionSolution {
  /** The final answer */
  answer: string;
  /** Solution steps (already localized) */
  steps: string[];
  /** Optional tip/insight */
  tip?: string;
  /** AI confidence (0-1), for homework */
  aiConfidence?: number;
}

/**
 * Question group for homework (parent + sub-questions)
 */
export interface SessionQuestionGroup {
  /** Parent question */
  parent: {
    id: string;
    content: string;
    contentHe?: string;
  };
  /** Sub-questions belonging to this parent */
  subQuestions: SessionQuestion[];
}

/**
 * Session filters applied when creating a session
 */
export interface SessionFilters {
  /** Filter by difficulty */
  difficulty?: SessionDifficulty | "all";
  /** Filter by question type (topic-specific) */
  questionType?: string;
  /** Number of questions to include */
  count: number;
}

/**
 * Session presets for quick start
 */
export interface SessionPreset {
  id: string;
  name: string;
  nameHe: string;
  description: string;
  descriptionHe: string;
  icon: string;
  filters: SessionFilters;
}

/**
 * Main session interface
 */
export interface Session {
  /** Unique session ID */
  id: string;
  /** User ID */
  userId: string;

  // Source info
  /** Where questions come from */
  source: SessionSource;
  /** Source ID (topicId, homeworkId) */
  sourceId: string;
  /** Source name for display */
  sourceName: string;
  /** Source name in Hebrew */
  sourceNameHe?: string;

  // Mode
  /** Session mode (learn/review/practice) */
  mode: SessionMode;

  // Questions
  /** All questions in session */
  questions: SessionQuestion[];
  /** Question groups (for homework with sub-questions) */
  questionGroups?: SessionQuestionGroup[];
  /** Whether questions have sub-question grouping */
  hasGroups: boolean;

  // Progress
  /** Current question index (0-based) */
  currentIndex: number;
  /** Number of questions viewed/completed */
  viewedCount: number;
  /** Total questions */
  totalQuestions: number;

  // Results
  /** Total XP earned so far */
  xpEarned: number;
  /** Is session completed */
  isCompleted: boolean;

  // Filters applied
  /** Filters used to create this session */
  filters: SessionFilters;

  // Timestamps
  /** When session was started */
  startedAt: string;
  /** When session was completed (if completed) */
  completedAt?: string;
  /** Last activity timestamp (for auto-save) */
  lastActivityAt: string;
}

/**
 * Session creation request
 */
export interface CreateSessionRequest {
  /** Source type */
  source: SessionSource;
  /** Source ID */
  sourceId: string;
  /** Session mode */
  mode: SessionMode;
  /** Filters to apply */
  filters: SessionFilters;
}

/**
 * Session completion summary
 */
export interface SessionResults {
  /** Session ID */
  sessionId: string;
  /** Total questions */
  totalQuestions: number;
  /** Questions viewed/answered */
  viewedCount: number;
  /** Correct answers (for practice mode) */
  correctCount?: number;
  /** Total XP earned */
  xpEarned: number;
  /** XP breakdown */
  xpBreakdown: {
    /** XP from viewing/answering */
    questionsXp: number;
    /** Completion bonus */
    completionBonus: number;
  };
  /** Time spent (seconds) */
  timeSpentSeconds: number;
  /** Source info for display */
  source: {
    type: SessionSource;
    name: string;
    nameHe?: string;
  };
}

/**
 * Active sessions for a user
 */
export interface ActiveSession {
  /** Session ID */
  id: string;
  /** Source info */
  source: SessionSource;
  sourceName: string;
  sourceNameHe?: string;
  /** Progress */
  viewedCount: number;
  totalQuestions: number;
  /** XP earned so far */
  xpEarned: number;
  /** When last active */
  lastActivityAt: string;
  /** Whether session is complete */
  isCompleted: boolean;
}

/**
 * Topic question (before adaptation to SessionQuestion)
 */
export interface TopicExercise {
  $id: string;
  topicId: string;
  question: string;
  questionHe?: string;
  difficulty: SessionDifficulty;
  xpReward: number;
  estimatedMinutes?: number;
  answer?: string;
  answerType: "numeric" | "expression" | "proof" | "open";
  tip?: string;
  tipHe?: string;
  // Solution from separate table
  solutionSteps?: string[];
  solutionStepsHe?: string[];
}

/**
 * Homework question (before adaptation to SessionQuestion)
 */
export interface HomeworkQuestionRaw {
  $id: string;
  homeworkId: string;
  questionText: string;
  questionTextHe?: string;
  difficulty: SessionDifficulty;
  isSubQuestion: boolean;
  parentQuestionId?: string;
  subQuestionLabel?: string;
  parentContext?: string;
  answer: string;
  solutionStatus?: "pending" | "generating" | "completed" | "failed";
  aiConfidence?: number;
  // Solution from related table
  solution?: {
    solutionSteps: string; // JSON string
    tip?: string;
    tipHe?: string;
  };
}
