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
  enrolledCourses: ["calculus-1", "linear-algebra"],
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
    id: "calculus-1",
    name: "Calculus 1",
    nameHe: "חדו״א 1",
    description: "Limits, derivatives, and integrals",
    icon: "tabler:math-function",
    color: "primary",
    topics: ["Limits", "Derivatives", "Integrals", "Applications"],
    exerciseCount: 150,
    enrolled: true,
  },
  {
    id: "linear-algebra",
    name: "Linear Algebra",
    nameHe: "אלגברה ליניארית",
    description: "Vectors, matrices, and linear transformations",
    icon: "tabler:grid-3x3",
    color: "secondary",
    topics: ["Vectors", "Matrices", "Eigenvalues", "Linear Transformations"],
    exerciseCount: 120,
    enrolled: true,
  },
  {
    id: "physics-1",
    name: "Physics 1",
    nameHe: "פיסיקה 1",
    description: "Mechanics and thermodynamics",
    icon: "tabler:atom",
    color: "warning",
    topics: ["Kinematics", "Dynamics", "Energy", "Thermodynamics"],
    exerciseCount: 100,
    enrolled: false,
    comingSoon: true,
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
    courseId: "calculus-1",
    courseName: "Calculus 1",
    topic: "Derivatives",
    difficulty: "easy",
    xp: 10,
    question: "Find the derivative of $f(x) = x^3 - 2x^2 + 5x - 3$",
    solution: `**Step 1:** Apply the power rule to each term.

$\\frac{d}{dx}(x^3) = 3x^2$

$\\frac{d}{dx}(-2x^2) = -4x$

$\\frac{d}{dx}(5x) = 5$

$\\frac{d}{dx}(-3) = 0$

**Step 2:** Combine the results.

$f'(x) = 3x^2 - 4x + 5$`,
    answer: "$f'(x) = 3x^2 - 4x + 5$",
    tip: "Remember the power rule: $\\frac{d}{dx}(x^n) = nx^{n-1}$",
    estimatedTime: 3,
    status: "completed",
  },
  {
    id: "ex-2",
    courseId: "calculus-1",
    courseName: "Calculus 1",
    topic: "Integrals",
    difficulty: "medium",
    xp: 20,
    question: "Evaluate the definite integral: $\\int_0^2 (3x^2 + 2x) \\, dx$",
    solution: `**Step 1:** Find the antiderivative.

$\\int (3x^2 + 2x) \\, dx = x^3 + x^2 + C$

**Step 2:** Apply the Fundamental Theorem of Calculus.

$\\left[ x^3 + x^2 \\right]_0^2 = (2^3 + 2^2) - (0^3 + 0^2)$

$= (8 + 4) - 0 = 12$`,
    answer: "$12$",
    tip: "Use the Fundamental Theorem of Calculus: $\\int_a^b f(x)dx = F(b) - F(a)$",
    estimatedTime: 5,
    status: "completed",
  },
  {
    id: "ex-3",
    courseId: "calculus-1",
    courseName: "Calculus 1",
    topic: "Derivatives",
    difficulty: "medium",
    xp: 20,
    question: "Find $\\frac{dy}{dx}$ if $y = \\sin(x^2)$",
    solution: `**Step 1:** Identify this as a chain rule problem.

Let $u = x^2$, so $y = \\sin(u)$

**Step 2:** Apply the chain rule.

$\\frac{dy}{dx} = \\frac{dy}{du} \\cdot \\frac{du}{dx}$

$= \\cos(u) \\cdot 2x$

$= 2x\\cos(x^2)$`,
    answer: "$\\frac{dy}{dx} = 2x\\cos(x^2)$",
    tip: "Chain rule: $\\frac{d}{dx}[f(g(x))] = f'(g(x)) \\cdot g'(x)$",
    estimatedTime: 4,
    status: "in_progress",
  },
  {
    id: "ex-4",
    courseId: "linear-algebra",
    courseName: "Linear Algebra",
    topic: "Matrices",
    difficulty: "hard",
    xp: 30,
    question: "Find the eigenvalues of the matrix $A = \\begin{pmatrix} 3 & 1 \\\\ 0 & 2 \\end{pmatrix}$",
    solution: `**Step 1:** Set up the characteristic equation.

$\\det(A - \\lambda I) = 0$

$\\det \\begin{pmatrix} 3-\\lambda & 1 \\\\ 0 & 2-\\lambda \\end{pmatrix} = 0$

**Step 2:** Calculate the determinant.

$(3-\\lambda)(2-\\lambda) - (1)(0) = 0$

$(3-\\lambda)(2-\\lambda) = 0$

**Step 3:** Solve for $\\lambda$.

$\\lambda_1 = 3, \\quad \\lambda_2 = 2$`,
    answer: "$\\lambda_1 = 3, \\lambda_2 = 2$",
    tip: "For triangular matrices, the eigenvalues are the diagonal entries!",
    estimatedTime: 6,
    status: "pending",
  },
  {
    id: "ex-5",
    courseId: "linear-algebra",
    courseName: "Linear Algebra",
    topic: "Vectors",
    difficulty: "easy",
    xp: 10,
    question: "Calculate the dot product of $\\vec{u} = (2, 3, -1)$ and $\\vec{v} = (1, -2, 4)$",
    solution: `**Step 1:** Apply the dot product formula.

$\\vec{u} \\cdot \\vec{v} = u_1v_1 + u_2v_2 + u_3v_3$

**Step 2:** Substitute the values.

$= (2)(1) + (3)(-2) + (-1)(4)$

$= 2 - 6 - 4$

$= -8$`,
    answer: "$-8$",
    tip: "Dot product: $\\vec{u} \\cdot \\vec{v} = \\sum_{i=1}^n u_i v_i$",
    estimatedTime: 2,
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
  favoriteSubject: "Calculus 1",
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
