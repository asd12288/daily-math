// Mock data for design showcase components

export const mockUser = {
  id: "user_123",
  displayName: "David Cohen",
  email: "david@example.com",
  avatarUrl: "/images/profile/user-1.jpg",
  totalXp: 450,
  currentLevel: 3,
  levelTitle: "Learner",
  currentStreak: 7,
  longestStreak: 14,
  dailyExerciseCount: 5,
  exercisesCompletedToday: 3,
  enrolledCourses: ["pre-calculus-algebra"],
  joinedAt: "2024-01-15",
};

export const mockLevels = [
  { level: 1, title: "Beginner", xpRequired: 0, icon: "tabler:seedling" },
  { level: 2, title: "Student", xpRequired: 100, icon: "tabler:book" },
  { level: 3, title: "Learner", xpRequired: 250, icon: "tabler:brain" },
  { level: 4, title: "Practitioner", xpRequired: 500, icon: "tabler:target" },
  { level: 5, title: "Scholar", xpRequired: 1000, icon: "tabler:school" },
  { level: 6, title: "Expert", xpRequired: 2000, icon: "tabler:award" },
  { level: 7, title: "Master", xpRequired: 4000, icon: "tabler:crown" },
  { level: 8, title: "Grandmaster", xpRequired: 6500, icon: "tabler:diamond" },
  { level: 9, title: "Legend", xpRequired: 8500, icon: "tabler:star" },
  { level: 10, title: "Sage", xpRequired: 10000, icon: "tabler:sun" },
];

export const mockCourses = [
  {
    id: "pre-calculus-algebra",
    name: "Pre-Calculus Algebra",
    nameHe: "אלגברה קדם-חשבון",
    description: "Build a strong foundation with order of operations, fractions, equations, and word problems",
    icon: "tabler:math-function",
    color: "primary",
    topics: ["Order of Operations", "Fractions & Decimals", "Basic Equations", "Linear Equations", "Word Problems"],
    exerciseCount: 470,
    enrolled: true,
  },
];

export type Difficulty = "easy" | "medium" | "hard";

export interface MockExercise {
  id: string;
  courseId: string;
  courseName: string;
  topic: string;
  difficulty: Difficulty;
  xp: number;
  question: string;
  solution: string;
  answer: string;
  tip: string;
  estimatedTime: number; // minutes
  status: "pending" | "in_progress" | "completed" | "skipped";
}

export const mockExercises: MockExercise[] = [
  {
    id: "ex-1",
    courseId: "pre-calculus-algebra",
    courseName: "Pre-Calculus Algebra",
    topic: "Order of Operations",
    difficulty: "easy",
    xp: 10,
    question: "Evaluate: $3 + 4 \\times 2$",
    solution: `**Step 1:** Apply order of operations (PEMDAS/BODMAS).

Multiplication comes before addition.

$4 \\times 2 = 8$

**Step 2:** Add the results.

$3 + 8 = 11$`,
    answer: "$11$",
    tip: "Remember: Multiplication and division before addition and subtraction!",
    estimatedTime: 2,
    status: "completed",
  },
  {
    id: "ex-2",
    courseId: "pre-calculus-algebra",
    courseName: "Pre-Calculus Algebra",
    topic: "Fractions & Decimals",
    difficulty: "medium",
    xp: 15,
    question: "Calculate: $\\frac{2}{3} + \\frac{1}{4}$",
    solution: `**Step 1:** Find a common denominator.

LCD of 3 and 4 is 12.

**Step 2:** Convert fractions.

$\\frac{2}{3} = \\frac{8}{12}$

$\\frac{1}{4} = \\frac{3}{12}$

**Step 3:** Add the fractions.

$\\frac{8}{12} + \\frac{3}{12} = \\frac{11}{12}$`,
    answer: "$\\frac{11}{12}$",
    tip: "Find the least common denominator (LCD) first!",
    estimatedTime: 3,
    status: "completed",
  },
  {
    id: "ex-3",
    courseId: "pre-calculus-algebra",
    courseName: "Pre-Calculus Algebra",
    topic: "Basic Equations",
    difficulty: "medium",
    xp: 15,
    question: "Solve for x: $2x + 3 = 11$",
    solution: `**Step 1:** Subtract 3 from both sides.

$2x + 3 - 3 = 11 - 3$

$2x = 8$

**Step 2:** Divide both sides by 2.

$\\frac{2x}{2} = \\frac{8}{2}$

$x = 4$`,
    answer: "$x = 4$",
    tip: "Isolate the variable by doing inverse operations!",
    estimatedTime: 3,
    status: "in_progress",
  },
  {
    id: "ex-4",
    courseId: "pre-calculus-algebra",
    courseName: "Pre-Calculus Algebra",
    topic: "Linear Equations",
    difficulty: "hard",
    xp: 20,
    question: "Solve: $3(x - 2) + 4 = 2x + 5$",
    solution: `**Step 1:** Distribute the 3.

$3x - 6 + 4 = 2x + 5$

$3x - 2 = 2x + 5$

**Step 2:** Subtract 2x from both sides.

$x - 2 = 5$

**Step 3:** Add 2 to both sides.

$x = 7$`,
    answer: "$x = 7$",
    tip: "Distribute first, then collect like terms!",
    estimatedTime: 5,
    status: "pending",
  },
  {
    id: "ex-5",
    courseId: "pre-calculus-algebra",
    courseName: "Pre-Calculus Algebra",
    topic: "Word Problems",
    difficulty: "medium",
    xp: 15,
    question: "Tom is 5 years older than Sara. Together their ages sum to 31. How old is Sara?",
    solution: `**Step 1:** Set up variables.

Let Sara's age = x

Tom's age = x + 5

**Step 2:** Write the equation.

$x + (x + 5) = 31$

**Step 3:** Solve.

$2x + 5 = 31$

$2x = 26$

$x = 13$`,
    answer: "Sara is 13 years old",
    tip: "Define variables clearly and translate words into equations!",
    estimatedTime: 4,
    status: "pending",
  },
];

export const mockDailySet = {
  id: "set-2024-01-20",
  date: "2024-01-20",
  exercises: mockExercises,
  totalXp: mockExercises.reduce((sum, ex) => sum + ex.xp, 0),
  completedCount: mockExercises.filter((ex) => ex.status === "completed").length,
  estimatedTime: mockExercises.reduce((sum, ex) => sum + ex.estimatedTime, 0),
};

export const mockAIAnalysis = {
  isCorrect: true,
  confidence: 0.92,
  feedback: "Great work! Your solution is correct and well-structured.",
  detailedFeedback: [
    { step: 1, status: "correct", comment: "Correctly identified the power rule application" },
    { step: 2, status: "correct", comment: "Proper differentiation of each term" },
    { step: 3, status: "correct", comment: "Final answer is accurate" },
  ],
  suggestions: [
    "Consider showing intermediate steps for clarity",
    "Your handwriting is clear and easy to read",
  ],
  xpEarned: 20,
};

export const mockStats = {
  todayXp: 50,
  weekXp: 280,
  monthXp: 1200,
  totalExercises: 47,
  correctRate: 0.85,
  averageTime: 4.2, // minutes per exercise
  favoriteSubject: "Pre-Calculus Algebra",
};

export const mockNotificationSettings = {
  dailyReminder: true,
  dailyReminderTime: "09:00",
  streakWarning: true,
  streakWarningTime: "20:00",
  weeklyReport: true,
  emailNotifications: true,
};

// Skill Tree Mock Data
export type SkillTopicStatus = "locked" | "available" | "in_progress" | "mastered";

export interface MockSkillTopic {
  id: string;
  name: string;
  status: SkillTopicStatus;
  mastery: number;
  prerequisites: string[];
  description?: string;
}

export interface MockSkillBranch {
  id: string;
  name: string;
  color: string;
  topics: MockSkillTopic[];
}

export const mockSkillBranches: MockSkillBranch[] = [
  {
    id: "foundations",
    name: "Foundations",
    color: "#6366f1", // primary/indigo
    topics: [
      {
        id: "numbers",
        name: "Numbers & Operations",
        status: "mastered",
        mastery: 100,
        prerequisites: [],
        description: "Basic number theory and arithmetic operations",
      },
      {
        id: "variables",
        name: "Variables & Expressions",
        status: "mastered",
        mastery: 100,
        prerequisites: ["numbers"],
        description: "Introduction to algebraic notation",
      },
      {
        id: "equations",
        name: "Basic Equations",
        status: "mastered",
        mastery: 85,
        prerequisites: ["variables"],
        description: "Solving simple equations",
      },
    ],
  },
  {
    id: "linear",
    name: "Linear Algebra",
    color: "#8b5cf6", // purple
    topics: [
      {
        id: "linear-equations",
        name: "Linear Equations",
        status: "in_progress",
        mastery: 65,
        prerequisites: ["equations"],
        description: "Systems of linear equations",
      },
      {
        id: "vectors",
        name: "Vectors",
        status: "available",
        mastery: 20,
        prerequisites: ["linear-equations"],
        description: "Vector operations and geometry",
      },
      {
        id: "matrices",
        name: "Matrices",
        status: "locked",
        mastery: 0,
        prerequisites: ["vectors"],
        description: "Matrix operations and properties",
      },
      {
        id: "eigenvalues",
        name: "Eigenvalues",
        status: "locked",
        mastery: 0,
        prerequisites: ["matrices"],
        description: "Eigenvalues and eigenvectors",
      },
    ],
  },
  {
    id: "calculus",
    name: "Calculus",
    color: "#22c55e", // success/green
    topics: [
      {
        id: "limits",
        name: "Limits",
        status: "in_progress",
        mastery: 45,
        prerequisites: ["equations"],
        description: "Understanding limits and continuity",
      },
      {
        id: "derivatives",
        name: "Derivatives",
        status: "available",
        mastery: 10,
        prerequisites: ["limits"],
        description: "Differentiation techniques",
      },
      {
        id: "integrals",
        name: "Integrals",
        status: "locked",
        mastery: 0,
        prerequisites: ["derivatives"],
        description: "Integration and antiderivatives",
      },
      {
        id: "applications",
        name: "Applications",
        status: "locked",
        mastery: 0,
        prerequisites: ["integrals", "derivatives"],
        description: "Real-world calculus applications",
      },
    ],
  },
  {
    id: "polynomials",
    name: "Polynomials",
    color: "#f59e0b", // warning/amber
    topics: [
      {
        id: "polynomial-basics",
        name: "Polynomial Basics",
        status: "mastered",
        mastery: 90,
        prerequisites: ["variables"],
        description: "Polynomial expressions and operations",
      },
      {
        id: "factoring",
        name: "Factoring",
        status: "in_progress",
        mastery: 55,
        prerequisites: ["polynomial-basics"],
        description: "Factoring polynomials",
      },
      {
        id: "roots",
        name: "Finding Roots",
        status: "available",
        mastery: 15,
        prerequisites: ["factoring"],
        description: "Finding polynomial roots",
      },
    ],
  },
  {
    id: "quadratics",
    name: "Quadratics",
    color: "#ef4444", // error/red
    topics: [
      {
        id: "quadratic-equations",
        name: "Quadratic Equations",
        status: "available",
        mastery: 30,
        prerequisites: ["equations", "polynomial-basics"],
        description: "Solving quadratic equations",
      },
      {
        id: "quadratic-formula",
        name: "Quadratic Formula",
        status: "locked",
        mastery: 0,
        prerequisites: ["quadratic-equations"],
        description: "The quadratic formula",
      },
      {
        id: "parabolas",
        name: "Parabolas",
        status: "locked",
        mastery: 0,
        prerequisites: ["quadratic-formula"],
        description: "Graphing and analyzing parabolas",
      },
    ],
  },
];
