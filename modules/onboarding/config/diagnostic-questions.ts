// modules/onboarding/config/diagnostic-questions.ts
// Pre-defined diagnostic questions for placement test

import type { DiagnosticQuestion } from "../types";

/**
 * Diagnostic questions organized by branch
 * These are carefully selected to assess skill levels across topics
 */
export const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  // === FOUNDATIONS ===
  {
    id: "diag-found-1",
    topicId: "order-of-operations",
    topicName: "Order of Operations",
    topicNameHe: "סדר פעולות חשבון",
    branchId: "foundations",
    difficulty: "easy",
    questionText: "Evaluate: 8 + 4 × 2",
    questionTextHe: "חשב: 8 + 4 × 2",
    correctAnswer: "16",
    hint: "Remember: multiplication before addition",
    hintHe: "זכור: כפל לפני חיבור",
  },
  {
    id: "diag-found-2",
    topicId: "fractions-decimals",
    topicName: "Fractions & Decimals",
    topicNameHe: "שברים ועשרוניים",
    branchId: "foundations",
    difficulty: "medium",
    questionText: "Simplify: 3/4 + 1/2",
    questionTextHe: "פשט: 3/4 + 1/2",
    correctAnswer: "5/4",
    hint: "Find a common denominator first",
    hintHe: "מצא מכנה משותף תחילה",
  },
  {
    id: "diag-found-3",
    topicId: "basic-equations",
    topicName: "Basic Equations",
    topicNameHe: "משוואות בסיסיות",
    branchId: "foundations",
    difficulty: "easy",
    questionText: "Solve for x: x + 7 = 15",
    questionTextHe: "פתור עבור x: x + 7 = 15",
    correctAnswer: "8",
    hint: "Subtract 7 from both sides",
    hintHe: "חסר 7 משני הצדדים",
  },

  // === LINEAR ===
  {
    id: "diag-linear-1",
    topicId: "linear-equations-one-var",
    topicName: "Linear Equations",
    topicNameHe: "משוואות ליניאריות",
    branchId: "linear",
    difficulty: "medium",
    questionText: "Solve: 3x - 5 = 16",
    questionTextHe: "פתור: 3x - 5 = 16",
    correctAnswer: "7",
    hint: "First add 5, then divide by 3",
    hintHe: "קודם הוסף 5, אחר כך חלק ב-3",
  },
  {
    id: "diag-linear-2",
    topicId: "linear-equations-one-var",
    topicName: "Linear Equations",
    topicNameHe: "משוואות ליניאריות",
    branchId: "linear",
    difficulty: "hard",
    questionText: "Solve: 2(x + 3) = x + 10",
    questionTextHe: "פתור: 2(x + 3) = x + 10",
    correctAnswer: "4",
    hint: "First expand the left side",
    hintHe: "קודם פתח את הסוגריים בצד שמאל",
  },

  // === POLYNOMIALS ===
  {
    id: "diag-poly-1",
    topicId: "expanding-expressions",
    topicName: "Expanding Expressions",
    topicNameHe: "פתיחת סוגריים",
    branchId: "polynomials",
    difficulty: "medium",
    questionText: "Expand: (x + 3)(x + 2)",
    questionTextHe: "פתח: (x + 3)(x + 2)",
    correctAnswer: "x² + 5x + 6",
    hint: "Use FOIL: First, Outer, Inner, Last",
    hintHe: "השתמש בכלל הכפל: ראשון, חיצוני, פנימי, אחרון",
  },
  {
    id: "diag-poly-2",
    topicId: "factoring-basics",
    topicName: "Factoring Basics",
    topicNameHe: "פירוק לגורמים",
    branchId: "polynomials",
    difficulty: "medium",
    questionText: "Factor: x² - 16",
    questionTextHe: "פרק לגורמים: x² - 16",
    correctAnswer: "(x+4)(x-4)",
    hint: "This is a difference of squares: a² - b²",
    hintHe: "זהו הפרש ריבועים: a² - b²",
  },

  // === QUADRATICS ===
  {
    id: "diag-quad-1",
    topicId: "factoring-trinomials",
    topicName: "Factoring Trinomials",
    topicNameHe: "פירוק טרינומים",
    branchId: "quadratics",
    difficulty: "medium",
    questionText: "Factor: x² + 7x + 12",
    questionTextHe: "פרק לגורמים: x² + 7x + 12",
    correctAnswer: "(x+3)(x+4)",
    hint: "Find two numbers that multiply to 12 and add to 7",
    hintHe: "מצא שני מספרים שמכפלתם 12 וסכומם 7",
  },
  {
    id: "diag-quad-2",
    topicId: "quadratic-by-factoring",
    topicName: "Solving by Factoring",
    topicNameHe: "פתרון על ידי פירוק",
    branchId: "quadratics",
    difficulty: "hard",
    questionText: "Solve: x² - 5x + 6 = 0",
    questionTextHe: "פתור: x² - 5x + 6 = 0",
    correctAnswer: "x=2, x=3",
    hint: "Factor the left side, then set each factor to zero",
    hintHe: "פרק את הצד השמאלי, ואז השווה כל גורם לאפס",
  },

  // === FUNCTIONS ===
  {
    id: "diag-func-1",
    topicId: "function-notation",
    topicName: "Function Notation",
    topicNameHe: "סימון פונקציות",
    branchId: "functions",
    difficulty: "easy",
    questionText: "If f(x) = 2x + 3, find f(4)",
    questionTextHe: "אם f(x) = 2x + 3, מצא f(4)",
    correctAnswer: "11",
    hint: "Replace x with 4 in the formula",
    hintHe: "החלף את x ב-4 בנוסחה",
  },
  {
    id: "diag-func-2",
    topicId: "domain-range",
    topicName: "Domain & Range",
    topicNameHe: "תחום וטווח",
    branchId: "functions",
    difficulty: "hard",
    questionText: "What is the domain of f(x) = 1/(x-2)?",
    questionTextHe: "מהו התחום של f(x) = 1/(x-2)?",
    correctAnswer: "x≠2",
    hint: "The denominator cannot be zero",
    hintHe: "המכנה לא יכול להיות אפס",
  },
];

/**
 * Get diagnostic questions for a specific branch
 */
export function getQuestionsByBranch(branchId: string): DiagnosticQuestion[] {
  return DIAGNOSTIC_QUESTIONS.filter((q) => q.branchId === branchId);
}

/**
 * Get a subset of diagnostic questions for the placement test
 */
export function selectDiagnosticQuestions(
  questionsPerBranch: number = 2,
  maxTotal: number = 10
): DiagnosticQuestion[] {
  const branches = ["foundations", "linear", "polynomials", "quadratics", "functions"];
  const selected: DiagnosticQuestion[] = [];

  for (const branch of branches) {
    const branchQuestions = getQuestionsByBranch(branch);
    // Select up to questionsPerBranch from each branch
    const toSelect = branchQuestions.slice(0, questionsPerBranch);
    selected.push(...toSelect);

    if (selected.length >= maxTotal) break;
  }

  return selected.slice(0, maxTotal);
}
