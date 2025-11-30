// modules/practice/config/static-questions.ts
// Static pre-algebra questions for MVP

import type { Problem } from "../types";

/**
 * 5 Pre-Algebra questions with proper LaTeX formatting
 * Used for MVP - same questions for all users
 */
export const PRE_ALGEBRA_QUESTIONS: Problem[] = [
  {
    id: "pre-alg-1",
    topicId: "linear-equations",
    topicName: "Linear Equations",
    topicNameHe: "משוואות ליניאריות",
    slot: "foundation",
    difficulty: "easy",
    questionText: "Solve for x:",
    questionTextHe: "פתור את המשוואה:",
    questionLatex: "$2x + 5 = 13$",
    correctAnswer: "4",
    answerType: "numeric",
    solutionSteps: [
      "Subtract 5 from both sides: $2x + 5 - 5 = 13 - 5$",
      "Simplify: $2x = 8$",
      "Divide both sides by 2: $\\frac{2x}{2} = \\frac{8}{2}$",
      "Solution: $x = 4$",
    ],
    solutionStepsHe: [
      "נחסיר 5 משני הצדדים: $2x + 5 - 5 = 13 - 5$",
      "נפשט: $2x = 8$",
      "נחלק את שני הצדדים ב-2: $\\frac{2x}{2} = \\frac{8}{2}$",
      "פתרון: $x = 4$",
    ],
    hint: "First, isolate the term with x by subtracting 5 from both sides",
    hintHe: "תחילה, בודד את האיבר עם x על ידי חיסור 5 משני הצדדים",
    estimatedMinutes: 2,
    xpReward: 10,
  },
  {
    id: "pre-alg-2",
    topicId: "fractions",
    topicName: "Adding Fractions",
    topicNameHe: "חיבור שברים",
    slot: "foundation",
    difficulty: "easy",
    questionText: "Simplify:",
    questionTextHe: "פשט:",
    questionLatex: "$\\frac{3}{4} + \\frac{1}{2}$",
    correctAnswer: "5/4",
    answerType: "expression",
    solutionSteps: [
      "Find a common denominator (LCD = 4)",
      "Convert $\\frac{1}{2}$ to fourths: $\\frac{1}{2} = \\frac{2}{4}$",
      "Add the fractions: $\\frac{3}{4} + \\frac{2}{4} = \\frac{5}{4}$",
      "Answer: $\\frac{5}{4}$ or $1\\frac{1}{4}$",
    ],
    solutionStepsHe: [
      "מצא מכנה משותף (מ.מ.מ = 4)",
      "המר את $\\frac{1}{2}$ לרביעיות: $\\frac{1}{2} = \\frac{2}{4}$",
      "חבר את השברים: $\\frac{3}{4} + \\frac{2}{4} = \\frac{5}{4}$",
      "תשובה: $\\frac{5}{4}$ או $1\\frac{1}{4}$",
    ],
    hint: "Find the least common denominator first",
    hintHe: "מצא תחילה את המכנה המשותף הקטן ביותר",
    estimatedMinutes: 2,
    xpReward: 10,
  },
  {
    id: "pre-alg-3",
    topicId: "order-of-operations",
    topicName: "Order of Operations",
    topicNameHe: "סדר פעולות חשבון",
    slot: "core",
    difficulty: "medium",
    questionText: "Calculate:",
    questionTextHe: "חשב:",
    questionLatex: "$3 + 4 \\times 2 - 1$",
    correctAnswer: "10",
    answerType: "numeric",
    solutionSteps: [
      "Remember PEMDAS: Parentheses, Exponents, Multiplication/Division, Addition/Subtraction",
      "First, do multiplication: $4 \\times 2 = 8$",
      "Then left to right: $3 + 8 - 1$",
      "Calculate: $3 + 8 = 11$, then $11 - 1 = 10$",
    ],
    solutionStepsHe: [
      "זכור את סדר הפעולות: סוגריים, חזקות, כפל/חילוק, חיבור/חיסור",
      "תחילה, בצע כפל: $4 \\times 2 = 8$",
      "אז משמאל לימין: $3 + 8 - 1$",
      "חשב: $3 + 8 = 11$, אז $11 - 1 = 10$",
    ],
    hint: "Remember: Multiplication comes before addition and subtraction",
    hintHe: "זכור: כפל קודם לחיבור וחיסור",
    estimatedMinutes: 2,
    xpReward: 15,
  },
  {
    id: "pre-alg-4",
    topicId: "negative-numbers",
    topicName: "Equations with Negatives",
    topicNameHe: "משוואות עם מספרים שליליים",
    slot: "core",
    difficulty: "medium",
    questionText: "Solve for x:",
    questionTextHe: "פתור את המשוואה:",
    questionLatex: "$-3x + 7 = 1$",
    correctAnswer: "2",
    answerType: "numeric",
    solutionSteps: [
      "Subtract 7 from both sides: $-3x + 7 - 7 = 1 - 7$",
      "Simplify: $-3x = -6$",
      "Divide both sides by -3: $\\frac{-3x}{-3} = \\frac{-6}{-3}$",
      "Solution: $x = 2$",
    ],
    solutionStepsHe: [
      "חסר 7 משני הצדדים: $-3x + 7 - 7 = 1 - 7$",
      "פשט: $-3x = -6$",
      "חלק את שני הצדדים ב-3-: $\\frac{-3x}{-3} = \\frac{-6}{-3}$",
      "פתרון: $x = 2$",
    ],
    hint: "When dividing by a negative number, the sign flips",
    hintHe: "כאשר מחלקים במספר שלילי, הסימן מתהפך",
    estimatedMinutes: 3,
    xpReward: 15,
  },
  {
    id: "pre-alg-5",
    topicId: "word-problems",
    topicName: "Word Problems",
    topicNameHe: "בעיות מילוליות",
    slot: "challenge",
    difficulty: "medium",
    questionText: "A number doubled plus 3 equals 11. What is the number?",
    questionTextHe: "מספר כפול עצמו פלוס 3 שווה 11. מהו המספר?",
    questionLatex: "$2n + 3 = 11$",
    correctAnswer: "4",
    answerType: "numeric",
    solutionSteps: [
      "Let $n$ be the unknown number",
      "\"A number doubled\" means $2n$",
      "\"plus 3\" gives us $2n + 3$",
      "\"equals 11\" gives us the equation: $2n + 3 = 11$",
      "Subtract 3: $2n = 8$",
      "Divide by 2: $n = 4$",
    ],
    solutionStepsHe: [
      "נסמן את המספר הלא ידוע ב-$n$",
      "\"מספר כפול עצמו\" משמעותו $2n$",
      "\"פלוס 3\" נותן לנו $2n + 3$",
      "\"שווה 11\" נותן לנו את המשוואה: $2n + 3 = 11$",
      "נחסיר 3: $2n = 8$",
      "נחלק ב-2: $n = 4$",
    ],
    hint: "First translate the words into an equation, then solve",
    hintHe: "תחילה תרגם את המילים למשוואה, אז פתור",
    estimatedMinutes: 4,
    xpReward: 15,
  },
];

/**
 * Get a daily set using static questions
 * For MVP - returns the same 5 questions for all users
 */
export function getStaticDailySet(userId: string): {
  id: string;
  userId: string;
  date: string;
  problems: Problem[];
  currentIndex: number;
  completedCount: number;
  totalProblems: number;
  isCompleted: boolean;
  completedAt: string | null;
  xpEarned: number;
  focusTopicId: string;
  focusTopicName: string;
} {
  const today = new Date().toISOString().split("T")[0];

  return {
    id: `daily-${userId}-${today}`,
    userId,
    date: today,
    problems: PRE_ALGEBRA_QUESTIONS,
    currentIndex: 0,
    completedCount: 0,
    totalProblems: 5,
    isCompleted: false,
    completedAt: null,
    xpEarned: 0,
    focusTopicId: "pre-algebra",
    focusTopicName: "Pre-Algebra",
  };
}

/**
 * Calculate total possible XP from questions
 */
export const TOTAL_POSSIBLE_XP = PRE_ALGEBRA_QUESTIONS.reduce(
  (sum, q) => sum + q.xpReward,
  0
);
