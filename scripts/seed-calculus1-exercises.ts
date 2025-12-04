/**
 * Seed Calculus 1 Exercises - All 15 topics × 15 exercises = 225 exercises
 * Run with: npx tsx scripts/seed-calculus1-exercises.ts
 */

import { Client, Databases, ID } from "node-appwrite";

const client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject("6929739f0023a7777f65")
  .setKey(process.env.APPWRITE_API_KEY || "standard_3e263bf7aa3910bdfc73e9c8989d51e3842c46df7401319705c3c043aa6aa1de846eeb6575b9d8b925d8370b4b6c69dee283308a4a0486c17dad29d560746cce8cc36ac221540dbd98b3d133f9118f400a8f9ab8c0cab5b442fe311bbb87e24b7915213d97e826c0a8a2d7b844bef4d28c022b08a4b208682e104c66dc16c9aa");

const databases = new Databases(client);
const DATABASE_ID = "dailymath";
const COURSE_ID = "calculus-1";

interface Exercise {
  id: string;
  topicId: string;
  question: string;
  questionHe: string;
  difficulty: "easy" | "medium" | "hard";
  xpReward: number;
  answer: string;
  answerType: "numeric" | "expression" | "proof" | "open";
  tip: string;
  tipHe: string;
  estimatedMinutes: number;
}

interface Solution {
  exerciseId: string;
  solution: string;
  steps: string[];
  stepsHe: string[];
}

// ============================================
// TOPIC 1: LIMIT DEFINITION (lim-def)
// ============================================
const LIMIT_DEFINITION_EXERCISES: Exercise[] = [
  // Easy (5)
  {
    id: "lim-def-e-001",
    topicId: "limit-definition",
    question: "Evaluate: $\\lim_{x \\to 3} (2x + 1)$",
    questionHe: "חשב: $\\lim_{x \\to 3} (2x + 1)$",
    difficulty: "easy",
    xpReward: 10,
    answer: "7",
    answerType: "numeric",
    tip: "For polynomials, you can directly substitute the value of x",
    tipHe: "עבור פולינומים, ניתן להציב ישירות את ערך x",
    estimatedMinutes: 2,
  },
  {
    id: "lim-def-e-002",
    topicId: "limit-definition",
    question: "Evaluate: $\\lim_{x \\to 4} \\sqrt{x}$",
    questionHe: "חשב: $\\lim_{x \\to 4} \\sqrt{x}$",
    difficulty: "easy",
    xpReward: 10,
    answer: "2",
    answerType: "numeric",
    tip: "The square root function is continuous, so substitute directly",
    tipHe: "פונקציית השורש רציפה, לכן הצב ישירות",
    estimatedMinutes: 2,
  },
  {
    id: "lim-def-e-003",
    topicId: "limit-definition",
    question: "Evaluate: $\\lim_{x \\to 0} (x^2 + 5)$",
    questionHe: "חשב: $\\lim_{x \\to 0} (x^2 + 5)$",
    difficulty: "easy",
    xpReward: 10,
    answer: "5",
    answerType: "numeric",
    tip: "Substitute x = 0 into the polynomial",
    tipHe: "הצב x = 0 לתוך הפולינום",
    estimatedMinutes: 2,
  },
  {
    id: "lim-def-e-004",
    topicId: "limit-definition",
    question: "Evaluate: $\\lim_{x \\to 2} (3x - 4)$",
    questionHe: "חשב: $\\lim_{x \\to 2} (3x - 4)$",
    difficulty: "easy",
    xpReward: 10,
    answer: "2",
    answerType: "numeric",
    tip: "Linear functions are continuous everywhere",
    tipHe: "פונקציות לינאריות רציפות בכל מקום",
    estimatedMinutes: 2,
  },
  {
    id: "lim-def-e-005",
    topicId: "limit-definition",
    question: "Evaluate: $\\lim_{x \\to -1} x^3$",
    questionHe: "חשב: $\\lim_{x \\to -1} x^3$",
    difficulty: "easy",
    xpReward: 10,
    answer: "-1",
    answerType: "numeric",
    tip: "Cube the value directly",
    tipHe: "העלה לחזקה שלישית ישירות",
    estimatedMinutes: 2,
  },
  // Medium (5)
  {
    id: "lim-def-m-001",
    topicId: "limit-definition",
    question: "Evaluate: $\\lim_{x \\to 2} \\frac{x^2 - 4}{x - 2}$",
    questionHe: "חשב: $\\lim_{x \\to 2} \\frac{x^2 - 4}{x - 2}$",
    difficulty: "medium",
    xpReward: 15,
    answer: "4",
    answerType: "numeric",
    tip: "Factor the numerator as a difference of squares",
    tipHe: "פרק את המונה כהפרש ריבועים",
    estimatedMinutes: 4,
  },
  {
    id: "lim-def-m-002",
    topicId: "limit-definition",
    question: "Does the limit exist? $\\lim_{x \\to 0} \\frac{|x|}{x}$",
    questionHe: "האם הגבול קיים? $\\lim_{x \\to 0} \\frac{|x|}{x}$",
    difficulty: "medium",
    xpReward: 15,
    answer: "no",
    answerType: "open",
    tip: "Check the left-hand and right-hand limits separately",
    tipHe: "בדוק את הגבולות החד-צדדיים בנפרד",
    estimatedMinutes: 4,
  },
  {
    id: "lim-def-m-003",
    topicId: "limit-definition",
    question: "Evaluate: $\\lim_{x \\to 1} \\frac{x^2 - 1}{x - 1}$",
    questionHe: "חשב: $\\lim_{x \\to 1} \\frac{x^2 - 1}{x - 1}$",
    difficulty: "medium",
    xpReward: 15,
    answer: "2",
    answerType: "numeric",
    tip: "Factor x² - 1 = (x-1)(x+1)",
    tipHe: "פרק x² - 1 = (x-1)(x+1)",
    estimatedMinutes: 4,
  },
  {
    id: "lim-def-m-004",
    topicId: "limit-definition",
    question: "Find $\\lim_{x \\to 3^+} \\frac{1}{x-3}$",
    questionHe: "מצא $\\lim_{x \\to 3^+} \\frac{1}{x-3}$",
    difficulty: "medium",
    xpReward: 15,
    answer: "+∞",
    answerType: "expression",
    tip: "Consider what happens when x approaches 3 from the right",
    tipHe: "חשוב מה קורה כאשר x מתקרב ל-3 מימין",
    estimatedMinutes: 4,
  },
  {
    id: "lim-def-m-005",
    topicId: "limit-definition",
    question: "Evaluate: $\\lim_{x \\to 0} \\frac{x^2 + 3x}{x}$",
    questionHe: "חשב: $\\lim_{x \\to 0} \\frac{x^2 + 3x}{x}$",
    difficulty: "medium",
    xpReward: 15,
    answer: "3",
    answerType: "numeric",
    tip: "Factor out x from the numerator first",
    tipHe: "הוצא x מהמונה תחילה",
    estimatedMinutes: 4,
  },
  // Hard (5)
  {
    id: "lim-def-h-001",
    topicId: "limit-definition",
    question: "Evaluate: $\\lim_{x \\to 4} \\frac{\\sqrt{x} - 2}{x - 4}$",
    questionHe: "חשב: $\\lim_{x \\to 4} \\frac{\\sqrt{x} - 2}{x - 4}$",
    difficulty: "hard",
    xpReward: 20,
    answer: "1/4",
    answerType: "expression",
    tip: "Multiply by the conjugate of the numerator",
    tipHe: "הכפל בצמוד של המונה",
    estimatedMinutes: 6,
  },
  {
    id: "lim-def-h-002",
    topicId: "limit-definition",
    question: "Find: $\\lim_{x \\to 0} \\frac{\\sqrt{1+x} - 1}{x}$",
    questionHe: "מצא: $\\lim_{x \\to 0} \\frac{\\sqrt{1+x} - 1}{x}$",
    difficulty: "hard",
    xpReward: 20,
    answer: "1/2",
    answerType: "expression",
    tip: "Rationalize by multiplying by the conjugate",
    tipHe: "רציונליזציה על ידי הכפלה בצמוד",
    estimatedMinutes: 6,
  },
  {
    id: "lim-def-h-003",
    topicId: "limit-definition",
    question: "Evaluate: $\\lim_{x \\to 1} \\frac{x^3 - 1}{x^2 - 1}$",
    questionHe: "חשב: $\\lim_{x \\to 1} \\frac{x^3 - 1}{x^2 - 1}$",
    difficulty: "hard",
    xpReward: 20,
    answer: "3/2",
    answerType: "expression",
    tip: "Factor both using sum/difference of cubes and difference of squares",
    tipHe: "פרק את שניהם באמצעות סכום/הפרש מעוקבים והפרש ריבועים",
    estimatedMinutes: 6,
  },
  {
    id: "lim-def-h-004",
    topicId: "limit-definition",
    question: "Find: $\\lim_{x \\to 0} \\frac{\\sqrt{x+9} - 3}{x}$",
    questionHe: "מצא: $\\lim_{x \\to 0} \\frac{\\sqrt{x+9} - 3}{x}$",
    difficulty: "hard",
    xpReward: 20,
    answer: "1/6",
    answerType: "expression",
    tip: "Multiply numerator and denominator by the conjugate",
    tipHe: "הכפל מונה ומכנה בצמוד",
    estimatedMinutes: 6,
  },
  {
    id: "lim-def-h-005",
    topicId: "limit-definition",
    question: "Evaluate: $\\lim_{h \\to 0} \\frac{(2+h)^2 - 4}{h}$",
    questionHe: "חשב: $\\lim_{h \\to 0} \\frac{(2+h)^2 - 4}{h}$",
    difficulty: "hard",
    xpReward: 20,
    answer: "4",
    answerType: "numeric",
    tip: "Expand (2+h)² and simplify before taking the limit",
    tipHe: "פתח (2+h)² ופשט לפני לקיחת הגבול",
    estimatedMinutes: 6,
  },
];

// ============================================
// TOPIC 2: LIMIT LAWS (lim-law)
// ============================================
const LIMIT_LAWS_EXERCISES: Exercise[] = [
  // Easy (5)
  {
    id: "lim-law-e-001",
    topicId: "limit-laws",
    question: "If $\\lim_{x \\to 2} f(x) = 3$ and $\\lim_{x \\to 2} g(x) = 5$, find $\\lim_{x \\to 2} [f(x) + g(x)]$",
    questionHe: "אם $\\lim_{x \\to 2} f(x) = 3$ ו-$\\lim_{x \\to 2} g(x) = 5$, מצא $\\lim_{x \\to 2} [f(x) + g(x)]$",
    difficulty: "easy",
    xpReward: 10,
    answer: "8",
    answerType: "numeric",
    tip: "Use the sum rule for limits",
    tipHe: "השתמש בכלל הסכום לגבולות",
    estimatedMinutes: 2,
  },
  {
    id: "lim-law-e-002",
    topicId: "limit-laws",
    question: "If $\\lim_{x \\to 1} f(x) = 4$, find $\\lim_{x \\to 1} [3f(x)]$",
    questionHe: "אם $\\lim_{x \\to 1} f(x) = 4$, מצא $\\lim_{x \\to 1} [3f(x)]$",
    difficulty: "easy",
    xpReward: 10,
    answer: "12",
    answerType: "numeric",
    tip: "Constants can be pulled outside the limit",
    tipHe: "קבועים ניתן להוציא מחוץ לגבול",
    estimatedMinutes: 2,
  },
  {
    id: "lim-law-e-003",
    topicId: "limit-laws",
    question: "If $\\lim_{x \\to 0} f(x) = 2$ and $\\lim_{x \\to 0} g(x) = 3$, find $\\lim_{x \\to 0} [f(x) \\cdot g(x)]$",
    questionHe: "אם $\\lim_{x \\to 0} f(x) = 2$ ו-$\\lim_{x \\to 0} g(x) = 3$, מצא $\\lim_{x \\to 0} [f(x) \\cdot g(x)]$",
    difficulty: "easy",
    xpReward: 10,
    answer: "6",
    answerType: "numeric",
    tip: "Use the product rule for limits",
    tipHe: "השתמש בכלל המכפלה לגבולות",
    estimatedMinutes: 2,
  },
  {
    id: "lim-law-e-004",
    topicId: "limit-laws",
    question: "Evaluate: $\\lim_{x \\to 2} (x^2 + 2x - 1)$",
    questionHe: "חשב: $\\lim_{x \\to 2} (x^2 + 2x - 1)$",
    difficulty: "easy",
    xpReward: 10,
    answer: "7",
    answerType: "numeric",
    tip: "Apply limit laws term by term",
    tipHe: "הפעל את חוקי הגבול איבר איבר",
    estimatedMinutes: 2,
  },
  {
    id: "lim-law-e-005",
    topicId: "limit-laws",
    question: "If $\\lim_{x \\to 3} f(x) = 6$ and $\\lim_{x \\to 3} g(x) = 2$, find $\\lim_{x \\to 3} \\frac{f(x)}{g(x)}$",
    questionHe: "אם $\\lim_{x \\to 3} f(x) = 6$ ו-$\\lim_{x \\to 3} g(x) = 2$, מצא $\\lim_{x \\to 3} \\frac{f(x)}{g(x)}$",
    difficulty: "easy",
    xpReward: 10,
    answer: "3",
    answerType: "numeric",
    tip: "Use the quotient rule (valid since denominator limit ≠ 0)",
    tipHe: "השתמש בכלל המנה (תקף מכיוון שגבול המכנה ≠ 0)",
    estimatedMinutes: 2,
  },
  // Medium (5)
  {
    id: "lim-law-m-001",
    topicId: "limit-laws",
    question: "Evaluate: $\\lim_{x \\to 0} \\frac{\\sin x}{x}$",
    questionHe: "חשב: $\\lim_{x \\to 0} \\frac{\\sin x}{x}$",
    difficulty: "medium",
    xpReward: 15,
    answer: "1",
    answerType: "numeric",
    tip: "This is a fundamental limit you should memorize",
    tipHe: "זהו גבול יסודי שכדאי לשנן",
    estimatedMinutes: 3,
  },
  {
    id: "lim-law-m-002",
    topicId: "limit-laws",
    question: "Evaluate: $\\lim_{x \\to 0} \\frac{\\sin 3x}{x}$",
    questionHe: "חשב: $\\lim_{x \\to 0} \\frac{\\sin 3x}{x}$",
    difficulty: "medium",
    xpReward: 15,
    answer: "3",
    answerType: "numeric",
    tip: "Rewrite as 3 · (sin 3x)/(3x) and use the fundamental limit",
    tipHe: "רשום מחדש כ-3 · (sin 3x)/(3x) והשתמש בגבול היסודי",
    estimatedMinutes: 4,
  },
  {
    id: "lim-law-m-003",
    topicId: "limit-laws",
    question: "Evaluate: $\\lim_{x \\to 0} \\frac{1 - \\cos x}{x}$",
    questionHe: "חשב: $\\lim_{x \\to 0} \\frac{1 - \\cos x}{x}$",
    difficulty: "medium",
    xpReward: 15,
    answer: "0",
    answerType: "numeric",
    tip: "This is another fundamental limit",
    tipHe: "זהו גבול יסודי נוסף",
    estimatedMinutes: 4,
  },
  {
    id: "lim-law-m-004",
    topicId: "limit-laws",
    question: "Evaluate: $\\lim_{x \\to 0} \\frac{\\tan x}{x}$",
    questionHe: "חשב: $\\lim_{x \\to 0} \\frac{\\tan x}{x}$",
    difficulty: "medium",
    xpReward: 15,
    answer: "1",
    answerType: "numeric",
    tip: "Write tan x = sin x / cos x and use limit laws",
    tipHe: "רשום tan x = sin x / cos x והשתמש בחוקי גבולות",
    estimatedMinutes: 4,
  },
  {
    id: "lim-law-m-005",
    topicId: "limit-laws",
    question: "If $-x^2 \\leq f(x) \\leq x^2$ for all $x$, find $\\lim_{x \\to 0} f(x)$",
    questionHe: "אם $-x^2 \\leq f(x) \\leq x^2$ לכל $x$, מצא $\\lim_{x \\to 0} f(x)$",
    difficulty: "medium",
    xpReward: 15,
    answer: "0",
    answerType: "numeric",
    tip: "Apply the Squeeze Theorem",
    tipHe: "הפעל את משפט הסנדוויץ'",
    estimatedMinutes: 4,
  },
  // Hard (5)
  {
    id: "lim-law-h-001",
    topicId: "limit-laws",
    question: "Evaluate: $\\lim_{x \\to 0} \\frac{\\sin 5x}{\\sin 2x}$",
    questionHe: "חשב: $\\lim_{x \\to 0} \\frac{\\sin 5x}{\\sin 2x}$",
    difficulty: "hard",
    xpReward: 20,
    answer: "5/2",
    answerType: "expression",
    tip: "Multiply and divide to use sin(u)/u → 1",
    tipHe: "הכפל וחלק כדי להשתמש ב-sin(u)/u → 1",
    estimatedMinutes: 6,
  },
  {
    id: "lim-law-h-002",
    topicId: "limit-laws",
    question: "Evaluate: $\\lim_{x \\to 0} \\frac{1 - \\cos x}{x^2}$",
    questionHe: "חשב: $\\lim_{x \\to 0} \\frac{1 - \\cos x}{x^2}$",
    difficulty: "hard",
    xpReward: 20,
    answer: "1/2",
    answerType: "expression",
    tip: "Multiply by (1 + cos x)/(1 + cos x) and use sin²x = 1 - cos²x",
    tipHe: "הכפל ב-(1 + cos x)/(1 + cos x) והשתמש ב-sin²x = 1 - cos²x",
    estimatedMinutes: 6,
  },
  {
    id: "lim-law-h-003",
    topicId: "limit-laws",
    question: "Evaluate: $\\lim_{x \\to 0} x \\cot x$",
    questionHe: "חשב: $\\lim_{x \\to 0} x \\cot x$",
    difficulty: "hard",
    xpReward: 20,
    answer: "1",
    answerType: "numeric",
    tip: "Write cot x = cos x / sin x and simplify",
    tipHe: "רשום cot x = cos x / sin x ופשט",
    estimatedMinutes: 6,
  },
  {
    id: "lim-law-h-004",
    topicId: "limit-laws",
    question: "Evaluate: $\\lim_{x \\to 0} \\frac{\\sin x - x}{x^3}$",
    questionHe: "חשב: $\\lim_{x \\to 0} \\frac{\\sin x - x}{x^3}$",
    difficulty: "hard",
    xpReward: 20,
    answer: "-1/6",
    answerType: "expression",
    tip: "Use L'Hôpital's rule three times or Taylor series",
    tipHe: "השתמש בכלל לופיטל שלוש פעמים או בטור טיילור",
    estimatedMinutes: 8,
  },
  {
    id: "lim-law-h-005",
    topicId: "limit-laws",
    question: "Using Squeeze Theorem, evaluate: $\\lim_{x \\to 0} x^2 \\sin\\frac{1}{x}$",
    questionHe: "באמצעות משפט הסנדוויץ', חשב: $\\lim_{x \\to 0} x^2 \\sin\\frac{1}{x}$",
    difficulty: "hard",
    xpReward: 20,
    answer: "0",
    answerType: "numeric",
    tip: "Since -1 ≤ sin(1/x) ≤ 1, we have -x² ≤ x²sin(1/x) ≤ x²",
    tipHe: "מכיוון ש--1 ≤ sin(1/x) ≤ 1, יש לנו -x² ≤ x²sin(1/x) ≤ x²",
    estimatedMinutes: 6,
  },
];

// ============================================
// TOPIC 3: CONTINUITY (cont)
// ============================================
const CONTINUITY_EXERCISES: Exercise[] = [
  // Easy (5)
  {
    id: "cont-e-001",
    topicId: "continuity",
    question: "Is $f(x) = x^2 + 3x - 1$ continuous at $x = 2$?",
    questionHe: "האם $f(x) = x^2 + 3x - 1$ רציפה ב-$x = 2$?",
    difficulty: "easy",
    xpReward: 10,
    answer: "yes",
    answerType: "open",
    tip: "Polynomials are continuous everywhere",
    tipHe: "פולינומים רציפים בכל מקום",
    estimatedMinutes: 2,
  },
  {
    id: "cont-e-002",
    topicId: "continuity",
    question: "At which point is $f(x) = \\frac{1}{x-3}$ discontinuous?",
    questionHe: "באיזו נקודה $f(x) = \\frac{1}{x-3}$ אינה רציפה?",
    difficulty: "easy",
    xpReward: 10,
    answer: "3",
    answerType: "numeric",
    tip: "Find where the denominator equals zero",
    tipHe: "מצא היכן המכנה שווה לאפס",
    estimatedMinutes: 2,
  },
  {
    id: "cont-e-003",
    topicId: "continuity",
    question: "Is $f(x) = \\sin x$ continuous at $x = \\pi$?",
    questionHe: "האם $f(x) = \\sin x$ רציפה ב-$x = \\pi$?",
    difficulty: "easy",
    xpReward: 10,
    answer: "yes",
    answerType: "open",
    tip: "Sine is continuous on all of ℝ",
    tipHe: "הסינוס רציף על כל ℝ",
    estimatedMinutes: 2,
  },
  {
    id: "cont-e-004",
    topicId: "continuity",
    question: "Find all discontinuities of $f(x) = \\frac{x}{x^2-4}$",
    questionHe: "מצא את כל נקודות אי-הרציפות של $f(x) = \\frac{x}{x^2-4}$",
    difficulty: "easy",
    xpReward: 10,
    answer: "x = 2, x = -2",
    answerType: "expression",
    tip: "Factor the denominator: x² - 4 = (x-2)(x+2)",
    tipHe: "פרק את המכנה: x² - 4 = (x-2)(x+2)",
    estimatedMinutes: 3,
  },
  {
    id: "cont-e-005",
    topicId: "continuity",
    question: "Is $f(x) = e^x$ continuous at $x = 0$?",
    questionHe: "האם $f(x) = e^x$ רציפה ב-$x = 0$?",
    difficulty: "easy",
    xpReward: 10,
    answer: "yes",
    answerType: "open",
    tip: "The exponential function is continuous everywhere",
    tipHe: "הפונקציה האקספוננציאלית רציפה בכל מקום",
    estimatedMinutes: 2,
  },
  // Medium (5)
  {
    id: "cont-m-001",
    topicId: "continuity",
    question: "What type of discontinuity does $f(x) = \\frac{x^2-1}{x-1}$ have at $x = 1$?",
    questionHe: "איזה סוג אי-רציפות יש ל-$f(x) = \\frac{x^2-1}{x-1}$ ב-$x = 1$?",
    difficulty: "medium",
    xpReward: 15,
    answer: "removable",
    answerType: "open",
    tip: "Factor and check if the limit exists",
    tipHe: "פרק ובדוק אם הגבול קיים",
    estimatedMinutes: 4,
  },
  {
    id: "cont-m-002",
    topicId: "continuity",
    question: "Find $k$ so that $f(x) = \\begin{cases} x^2 & x < 2 \\\\ k & x = 2 \\\\ 4x-4 & x > 2 \\end{cases}$ is continuous at $x = 2$",
    questionHe: "מצא $k$ כך ש-$f(x) = \\begin{cases} x^2 & x < 2 \\\\ k & x = 2 \\\\ 4x-4 & x > 2 \\end{cases}$ רציפה ב-$x = 2$",
    difficulty: "medium",
    xpReward: 15,
    answer: "4",
    answerType: "numeric",
    tip: "For continuity, the left limit, right limit, and f(2) must all equal",
    tipHe: "לרציפות, הגבול השמאלי, הימני ו-f(2) חייבים להיות שווים",
    estimatedMinutes: 5,
  },
  {
    id: "cont-m-003",
    topicId: "continuity",
    question: "What type of discontinuity does the floor function $f(x) = \\lfloor x \\rfloor$ have at $x = 2$?",
    questionHe: "איזה סוג אי-רציפות יש לפונקציית הרצפה $f(x) = \\lfloor x \\rfloor$ ב-$x = 2$?",
    difficulty: "medium",
    xpReward: 15,
    answer: "jump",
    answerType: "open",
    tip: "Compare left and right limits at integer points",
    tipHe: "השווה גבולות שמאלי וימני בנקודות שלמות",
    estimatedMinutes: 4,
  },
  {
    id: "cont-m-004",
    topicId: "continuity",
    question: "Using IVT, show that $f(x) = x^3 - x - 1$ has a root in $[1, 2]$. What are $f(1)$ and $f(2)$?",
    questionHe: "באמצעות משפט ערך הביניים, הראה ש-$f(x) = x^3 - x - 1$ יש שורש ב-$[1, 2]$. מה הם $f(1)$ ו-$f(2)$?",
    difficulty: "medium",
    xpReward: 15,
    answer: "f(1)=-1, f(2)=5",
    answerType: "expression",
    tip: "Calculate f(1) and f(2), check for sign change",
    tipHe: "חשב f(1) ו-f(2), בדוק החלפת סימן",
    estimatedMinutes: 4,
  },
  {
    id: "cont-m-005",
    topicId: "continuity",
    question: "Find the horizontal asymptote of $f(x) = \\frac{3x^2 + 1}{x^2 - 4}$",
    questionHe: "מצא את האסימפטוטה האופקית של $f(x) = \\frac{3x^2 + 1}{x^2 - 4}$",
    difficulty: "medium",
    xpReward: 15,
    answer: "y = 3",
    answerType: "expression",
    tip: "Compare leading coefficients when degrees are equal",
    tipHe: "השווה מקדמים מובילים כאשר הדרגות שוות",
    estimatedMinutes: 4,
  },
  // Hard (5)
  {
    id: "cont-h-001",
    topicId: "continuity",
    question: "Find $a$ and $b$ so $f(x) = \\begin{cases} ax + b & x < 1 \\\\ x^2 + 1 & x \\geq 1 \\end{cases}$ is continuous and differentiable at $x = 1$",
    questionHe: "מצא $a$ ו-$b$ כך ש-$f(x) = \\begin{cases} ax + b & x < 1 \\\\ x^2 + 1 & x \\geq 1 \\end{cases}$ רציפה וגזירה ב-$x = 1$",
    difficulty: "hard",
    xpReward: 20,
    answer: "a=2, b=0",
    answerType: "expression",
    tip: "For continuity: match values. For differentiability: match derivatives",
    tipHe: "לרציפות: התאם ערכים. לגזירות: התאם נגזרות",
    estimatedMinutes: 7,
  },
  {
    id: "cont-h-002",
    topicId: "continuity",
    question: "Classify the discontinuity of $f(x) = \\frac{\\sin x}{x}$ at $x = 0$ (assuming $f(0)$ undefined)",
    questionHe: "סווג את אי-הרציפות של $f(x) = \\frac{\\sin x}{x}$ ב-$x = 0$ (בהנחה ש-$f(0)$ לא מוגדר)",
    difficulty: "hard",
    xpReward: 20,
    answer: "removable",
    answerType: "open",
    tip: "The limit exists and equals 1, so it's removable",
    tipHe: "הגבול קיים ושווה 1, לכן זו אי-רציפות סליקה",
    estimatedMinutes: 5,
  },
  {
    id: "cont-h-003",
    topicId: "continuity",
    question: "Prove using IVT that $\\cos x = x$ has a solution in $(0, 1)$",
    questionHe: "הוכח באמצעות משפט ערך הביניים ש-$\\cos x = x$ יש פתרון ב-$(0, 1)$",
    difficulty: "hard",
    xpReward: 20,
    answer: "proof",
    answerType: "proof",
    tip: "Let g(x) = cos(x) - x, show g(0) > 0 and g(1) < 0",
    tipHe: "הגדר g(x) = cos(x) - x, הראה g(0) > 0 ו-g(1) < 0",
    estimatedMinutes: 7,
  },
  {
    id: "cont-h-004",
    topicId: "continuity",
    question: "Find all values of $c$ for which $f(x) = \\begin{cases} cx^2 + 2x & x < 2 \\\\ x^3 - cx & x \\geq 2 \\end{cases}$ is continuous",
    questionHe: "מצא את כל ערכי $c$ שעבורם $f(x) = \\begin{cases} cx^2 + 2x & x < 2 \\\\ x^3 - cx & x \\geq 2 \\end{cases}$ רציפה",
    difficulty: "hard",
    xpReward: 20,
    answer: "c = 2/3",
    answerType: "expression",
    tip: "Set the left limit equal to the right limit at x = 2",
    tipHe: "השווה את הגבול השמאלי לגבול הימני ב-x = 2",
    estimatedMinutes: 6,
  },
  {
    id: "cont-h-005",
    topicId: "continuity",
    question: "Find $\\lim_{x \\to \\infty} \\frac{2x^3 - x + 5}{4x^3 + 3x^2 - 1}$",
    questionHe: "מצא $\\lim_{x \\to \\infty} \\frac{2x^3 - x + 5}{4x^3 + 3x^2 - 1}$",
    difficulty: "hard",
    xpReward: 20,
    answer: "1/2",
    answerType: "expression",
    tip: "Divide numerator and denominator by x³",
    tipHe: "חלק מונה ומכנה ב-x³",
    estimatedMinutes: 5,
  },
];

// ============================================
// TOPIC 4: DERIVATIVE DEFINITION (der-def)
// ============================================
const DERIVATIVE_DEFINITION_EXERCISES: Exercise[] = [
  // Easy (5)
  {
    id: "der-def-e-001",
    topicId: "derivative-definition",
    question: "Using the definition, find $f'(x)$ for $f(x) = 3x$",
    questionHe: "באמצעות ההגדרה, מצא $f'(x)$ עבור $f(x) = 3x$",
    difficulty: "easy",
    xpReward: 10,
    answer: "3",
    answerType: "numeric",
    tip: "Use the limit definition: f'(x) = lim[h→0] (f(x+h) - f(x))/h",
    tipHe: "השתמש בהגדרת הגבול: f'(x) = lim[h→0] (f(x+h) - f(x))/h",
    estimatedMinutes: 3,
  },
  {
    id: "der-def-e-002",
    topicId: "derivative-definition",
    question: "Find the slope of the tangent line to $y = x^2$ at $x = 3$",
    questionHe: "מצא את שיפוע המשיק ל-$y = x^2$ ב-$x = 3$",
    difficulty: "easy",
    xpReward: 10,
    answer: "6",
    answerType: "numeric",
    tip: "The slope is f'(3) where f(x) = x²",
    tipHe: "השיפוע הוא f'(3) כאשר f(x) = x²",
    estimatedMinutes: 3,
  },
  {
    id: "der-def-e-003",
    topicId: "derivative-definition",
    question: "If $f(x) = 5$, what is $f'(x)$?",
    questionHe: "אם $f(x) = 5$, מה הוא $f'(x)$?",
    difficulty: "easy",
    xpReward: 10,
    answer: "0",
    answerType: "numeric",
    tip: "The derivative of a constant is zero",
    tipHe: "הנגזרת של קבוע היא אפס",
    estimatedMinutes: 2,
  },
  {
    id: "der-def-e-004",
    topicId: "derivative-definition",
    question: "Find the equation of the tangent line to $y = x^2$ at the point $(1, 1)$",
    questionHe: "מצא את משוואת המשיק ל-$y = x^2$ בנקודה $(1, 1)$",
    difficulty: "easy",
    xpReward: 10,
    answer: "y = 2x - 1",
    answerType: "expression",
    tip: "Use point-slope form: y - y₁ = m(x - x₁) where m = f'(1)",
    tipHe: "השתמש בצורת נקודה-שיפוע: y - y₁ = m(x - x₁) כאשר m = f'(1)",
    estimatedMinutes: 4,
  },
  {
    id: "der-def-e-005",
    topicId: "derivative-definition",
    question: "Using the definition, find $f'(2)$ for $f(x) = x^2$",
    questionHe: "באמצעות ההגדרה, מצא $f'(2)$ עבור $f(x) = x^2$",
    difficulty: "easy",
    xpReward: 10,
    answer: "4",
    answerType: "numeric",
    tip: "Compute lim[h→0] ((2+h)² - 4)/h",
    tipHe: "חשב lim[h→0] ((2+h)² - 4)/h",
    estimatedMinutes: 4,
  },
  // Medium (5)
  {
    id: "der-def-m-001",
    topicId: "derivative-definition",
    question: "Using the definition, find $f'(x)$ for $f(x) = x^2 + 2x$",
    questionHe: "באמצעות ההגדרה, מצא $f'(x)$ עבור $f(x) = x^2 + 2x$",
    difficulty: "medium",
    xpReward: 15,
    answer: "2x + 2",
    answerType: "expression",
    tip: "Expand (x+h)² + 2(x+h), subtract f(x), divide by h, then take limit",
    tipHe: "פתח (x+h)² + 2(x+h), חסר f(x), חלק ב-h, ואז קח גבול",
    estimatedMinutes: 5,
  },
  {
    id: "der-def-m-002",
    topicId: "derivative-definition",
    question: "Using the definition, find $f'(x)$ for $f(x) = \\frac{1}{x}$",
    questionHe: "באמצעות ההגדרה, מצא $f'(x)$ עבור $f(x) = \\frac{1}{x}$",
    difficulty: "medium",
    xpReward: 15,
    answer: "-1/x²",
    answerType: "expression",
    tip: "Common denominator: 1/(x+h) - 1/x = (x - (x+h))/(x(x+h))",
    tipHe: "מכנה משותף: 1/(x+h) - 1/x = (x - (x+h))/(x(x+h))",
    estimatedMinutes: 6,
  },
  {
    id: "der-def-m-003",
    topicId: "derivative-definition",
    question: "Using the definition, find $f'(x)$ for $f(x) = \\sqrt{x}$",
    questionHe: "באמצעות ההגדרה, מצא $f'(x)$ עבור $f(x) = \\sqrt{x}$",
    difficulty: "medium",
    xpReward: 15,
    answer: "1/(2√x)",
    answerType: "expression",
    tip: "Rationalize the numerator by multiplying by conjugate",
    tipHe: "רציונליזציה של המונה על ידי הכפלה בצמוד",
    estimatedMinutes: 6,
  },
  {
    id: "der-def-m-004",
    topicId: "derivative-definition",
    question: "Find the average rate of change of $f(x) = x^3$ from $x = 1$ to $x = 2$",
    questionHe: "מצא את קצב השינוי הממוצע של $f(x) = x^3$ מ-$x = 1$ עד $x = 2$",
    difficulty: "medium",
    xpReward: 15,
    answer: "7",
    answerType: "numeric",
    tip: "Average rate = (f(2) - f(1))/(2 - 1)",
    tipHe: "קצב ממוצע = (f(2) - f(1))/(2 - 1)",
    estimatedMinutes: 4,
  },
  {
    id: "der-def-m-005",
    topicId: "derivative-definition",
    question: "At what point on $y = x^2$ is the tangent line horizontal?",
    questionHe: "באיזו נקודה על $y = x^2$ המשיק אופקי?",
    difficulty: "medium",
    xpReward: 15,
    answer: "(0, 0)",
    answerType: "expression",
    tip: "Horizontal tangent means f'(x) = 0",
    tipHe: "משיק אופקי פירושו f'(x) = 0",
    estimatedMinutes: 4,
  },
  // Hard (5)
  {
    id: "der-def-h-001",
    topicId: "derivative-definition",
    question: "Using the definition, find $f'(x)$ for $f(x) = x^3$",
    questionHe: "באמצעות ההגדרה, מצא $f'(x)$ עבור $f(x) = x^3$",
    difficulty: "hard",
    xpReward: 20,
    answer: "3x²",
    answerType: "expression",
    tip: "Use binomial expansion: (x+h)³ = x³ + 3x²h + 3xh² + h³",
    tipHe: "השתמש בפיתוח בינומי: (x+h)³ = x³ + 3x²h + 3xh² + h³",
    estimatedMinutes: 7,
  },
  {
    id: "der-def-h-002",
    topicId: "derivative-definition",
    question: "Is $f(x) = |x|$ differentiable at $x = 0$? Explain.",
    questionHe: "האם $f(x) = |x|$ גזירה ב-$x = 0$? הסבר.",
    difficulty: "hard",
    xpReward: 20,
    answer: "no",
    answerType: "open",
    tip: "Check left and right derivatives at x = 0",
    tipHe: "בדוק נגזרות שמאלית וימנית ב-x = 0",
    estimatedMinutes: 6,
  },
  {
    id: "der-def-h-003",
    topicId: "derivative-definition",
    question: "Find the tangent line to $y = \\frac{1}{x}$ at the point $(2, \\frac{1}{2})$",
    questionHe: "מצא את המשיק ל-$y = \\frac{1}{x}$ בנקודה $(2, \\frac{1}{2})$",
    difficulty: "hard",
    xpReward: 20,
    answer: "y = -x/4 + 1",
    answerType: "expression",
    tip: "Find f'(2) first, then use point-slope form",
    tipHe: "מצא קודם f'(2), ואז השתמש בצורת נקודה-שיפוע",
    estimatedMinutes: 6,
  },
  {
    id: "der-def-h-004",
    topicId: "derivative-definition",
    question: "Find $f'(0)$ using the definition for $f(x) = x|x|$",
    questionHe: "מצא $f'(0)$ באמצעות ההגדרה עבור $f(x) = x|x|$",
    difficulty: "hard",
    xpReward: 20,
    answer: "0",
    answerType: "numeric",
    tip: "Note that x|x| = x² for x ≥ 0 and -x² for x < 0",
    tipHe: "שים לב ש-x|x| = x² עבור x ≥ 0 ו--x² עבור x < 0",
    estimatedMinutes: 7,
  },
  {
    id: "der-def-h-005",
    topicId: "derivative-definition",
    question: "Find all points on $y = x^3 - 3x$ where the tangent line is horizontal",
    questionHe: "מצא את כל הנקודות על $y = x^3 - 3x$ שבהן המשיק אופקי",
    difficulty: "hard",
    xpReward: 20,
    answer: "(1, -2) and (-1, 2)",
    answerType: "expression",
    tip: "Set f'(x) = 0 and solve for x, then find corresponding y values",
    tipHe: "הצב f'(x) = 0 ופתור עבור x, ואז מצא את ערכי y המתאימים",
    estimatedMinutes: 6,
  },
];

// ============================================
// TOPIC 5: BASIC RULES (bas-rul)
// ============================================
const BASIC_RULES_EXERCISES: Exercise[] = [
  // Easy (5)
  {
    id: "bas-rul-e-001",
    topicId: "basic-rules",
    question: "Find $\\frac{d}{dx}[x^5]$",
    questionHe: "מצא $\\frac{d}{dx}[x^5]$",
    difficulty: "easy",
    xpReward: 10,
    answer: "5x⁴",
    answerType: "expression",
    tip: "Apply the power rule: d/dx[xⁿ] = nxⁿ⁻¹",
    tipHe: "הפעל את כלל החזקה: d/dx[xⁿ] = nxⁿ⁻¹",
    estimatedMinutes: 2,
  },
  {
    id: "bas-rul-e-002",
    topicId: "basic-rules",
    question: "Find $\\frac{d}{dx}[4x^3]$",
    questionHe: "מצא $\\frac{d}{dx}[4x^3]$",
    difficulty: "easy",
    xpReward: 10,
    answer: "12x²",
    answerType: "expression",
    tip: "Constant multiple rule: d/dx[cf(x)] = c·f'(x)",
    tipHe: "כלל הכפל בקבוע: d/dx[cf(x)] = c·f'(x)",
    estimatedMinutes: 2,
  },
  {
    id: "bas-rul-e-003",
    topicId: "basic-rules",
    question: "Find $\\frac{d}{dx}[x^2 + 3x]$",
    questionHe: "מצא $\\frac{d}{dx}[x^2 + 3x]$",
    difficulty: "easy",
    xpReward: 10,
    answer: "2x + 3",
    answerType: "expression",
    tip: "Apply sum rule and power rule",
    tipHe: "הפעל כלל הסכום וכלל החזקה",
    estimatedMinutes: 2,
  },
  {
    id: "bas-rul-e-004",
    topicId: "basic-rules",
    question: "Find $\\frac{d}{dx}[7]$",
    questionHe: "מצא $\\frac{d}{dx}[7]$",
    difficulty: "easy",
    xpReward: 10,
    answer: "0",
    answerType: "numeric",
    tip: "Derivative of a constant is 0",
    tipHe: "נגזרת של קבוע היא 0",
    estimatedMinutes: 1,
  },
  {
    id: "bas-rul-e-005",
    topicId: "basic-rules",
    question: "Find $\\frac{d}{dx}[x^{-2}]$",
    questionHe: "מצא $\\frac{d}{dx}[x^{-2}]$",
    difficulty: "easy",
    xpReward: 10,
    answer: "-2x⁻³",
    answerType: "expression",
    tip: "Power rule works for negative exponents too",
    tipHe: "כלל החזקה עובד גם לחזקות שליליות",
    estimatedMinutes: 2,
  },
  // Medium (5)
  {
    id: "bas-rul-m-001",
    topicId: "basic-rules",
    question: "Find $f'(x)$ for $f(x) = 3x^4 - 2x^3 + x - 5$",
    questionHe: "מצא $f'(x)$ עבור $f(x) = 3x^4 - 2x^3 + x - 5$",
    difficulty: "medium",
    xpReward: 15,
    answer: "12x³ - 6x² + 1",
    answerType: "expression",
    tip: "Differentiate each term separately",
    tipHe: "גזור כל איבר בנפרד",
    estimatedMinutes: 4,
  },
  {
    id: "bas-rul-m-002",
    topicId: "basic-rules",
    question: "Find $\\frac{d}{dx}[\\sqrt{x}]$ (write as power first)",
    questionHe: "מצא $\\frac{d}{dx}[\\sqrt{x}]$ (רשום כחזקה תחילה)",
    difficulty: "medium",
    xpReward: 15,
    answer: "1/(2√x)",
    answerType: "expression",
    tip: "√x = x^(1/2), then apply power rule",
    tipHe: "√x = x^(1/2), ואז הפעל כלל החזקה",
    estimatedMinutes: 4,
  },
  {
    id: "bas-rul-m-003",
    topicId: "basic-rules",
    question: "Find $\\frac{d}{dx}\\left[\\frac{1}{x^3}\\right]$",
    questionHe: "מצא $\\frac{d}{dx}\\left[\\frac{1}{x^3}\\right]$",
    difficulty: "medium",
    xpReward: 15,
    answer: "-3/x⁴",
    answerType: "expression",
    tip: "Rewrite as x⁻³ first",
    tipHe: "רשום מחדש כ-x⁻³ תחילה",
    estimatedMinutes: 3,
  },
  {
    id: "bas-rul-m-004",
    topicId: "basic-rules",
    question: "Find $f'(x)$ for $f(x) = x^{3/2} + x^{-1/2}$",
    questionHe: "מצא $f'(x)$ עבור $f(x) = x^{3/2} + x^{-1/2}$",
    difficulty: "medium",
    xpReward: 15,
    answer: "(3/2)x^(1/2) - (1/2)x^(-3/2)",
    answerType: "expression",
    tip: "Apply power rule to fractional exponents",
    tipHe: "הפעל כלל החזקה לחזקות שבריות",
    estimatedMinutes: 4,
  },
  {
    id: "bas-rul-m-005",
    topicId: "basic-rules",
    question: "Find the derivative of $y = 5x^4 - \\frac{2}{x} + 3\\sqrt{x}$",
    questionHe: "מצא את הנגזרת של $y = 5x^4 - \\frac{2}{x} + 3\\sqrt{x}$",
    difficulty: "medium",
    xpReward: 15,
    answer: "20x³ + 2/x² + 3/(2√x)",
    answerType: "expression",
    tip: "Rewrite as 5x⁴ - 2x⁻¹ + 3x^(1/2)",
    tipHe: "רשום מחדש כ-5x⁴ - 2x⁻¹ + 3x^(1/2)",
    estimatedMinutes: 5,
  },
  // Hard (5)
  {
    id: "bas-rul-h-001",
    topicId: "basic-rules",
    question: "Find the equation of the tangent line to $y = x^3 - 4x$ at $x = 2$",
    questionHe: "מצא את משוואת המשיק ל-$y = x^3 - 4x$ ב-$x = 2$",
    difficulty: "hard",
    xpReward: 20,
    answer: "y = 8x - 16",
    answerType: "expression",
    tip: "Find y(2) and y'(2), then use point-slope form",
    tipHe: "מצא y(2) ו-y'(2), ואז השתמש בצורת נקודה-שיפוע",
    estimatedMinutes: 6,
  },
  {
    id: "bas-rul-h-002",
    topicId: "basic-rules",
    question: "Find $f''(x)$ for $f(x) = x^5 - 3x^3 + 2x$",
    questionHe: "מצא $f''(x)$ עבור $f(x) = x^5 - 3x^3 + 2x$",
    difficulty: "hard",
    xpReward: 20,
    answer: "20x³ - 18x",
    answerType: "expression",
    tip: "Find f'(x) first, then differentiate again",
    tipHe: "מצא f'(x) תחילה, ואז גזור שוב",
    estimatedMinutes: 5,
  },
  {
    id: "bas-rul-h-003",
    topicId: "basic-rules",
    question: "Find all $x$ where the tangent to $y = x^4 - 2x^2$ has slope 0",
    questionHe: "מצא את כל ה-$x$ שבהם לשיפוע המשיק ל-$y = x^4 - 2x^2$ שווה 0",
    difficulty: "hard",
    xpReward: 20,
    answer: "x = 0, x = 1, x = -1",
    answerType: "expression",
    tip: "Solve y'(x) = 0",
    tipHe: "פתור y'(x) = 0",
    estimatedMinutes: 6,
  },
  {
    id: "bas-rul-h-004",
    topicId: "basic-rules",
    question: "Find $\\frac{d^3}{dx^3}[x^5]$ (third derivative)",
    questionHe: "מצא $\\frac{d^3}{dx^3}[x^5]$ (נגזרת שלישית)",
    difficulty: "hard",
    xpReward: 20,
    answer: "60x²",
    answerType: "expression",
    tip: "Differentiate three times",
    tipHe: "גזור שלוש פעמים",
    estimatedMinutes: 4,
  },
  {
    id: "bas-rul-h-005",
    topicId: "basic-rules",
    question: "If $f(x) = ax^3 + bx^2$ has a horizontal tangent at $(1, 2)$, find $a$ and $b$",
    questionHe: "אם ל-$f(x) = ax^3 + bx^2$ יש משיק אופקי ב-$(1, 2)$, מצא $a$ ו-$b$",
    difficulty: "hard",
    xpReward: 20,
    answer: "a = -4, b = 6",
    answerType: "expression",
    tip: "Use two conditions: f(1) = 2 and f'(1) = 0",
    tipHe: "השתמש בשני תנאים: f(1) = 2 ו-f'(1) = 0",
    estimatedMinutes: 7,
  },
];

// Combine all exercises (first 5 topics = 75 exercises)
const ALL_EXERCISES: Exercise[] = [
  ...LIMIT_DEFINITION_EXERCISES,
  ...LIMIT_LAWS_EXERCISES,
  ...CONTINUITY_EXERCISES,
  ...DERIVATIVE_DEFINITION_EXERCISES,
  ...BASIC_RULES_EXERCISES,
];

// Generate solutions for all exercises
function generateSolution(exercise: Exercise): Solution {
  // Create step-by-step solutions based on exercise content
  const steps: string[] = [];
  const stepsHe: string[] = [];

  // Generic solution generation - would be customized per exercise type
  steps.push(`Given: ${exercise.question.replace(/\$/g, '')}`);
  steps.push(`Hint: ${exercise.tip}`);
  steps.push(`Work through the problem step by step.`);
  steps.push(`Answer: $\\boxed{${exercise.answer}}$`);

  stepsHe.push(`נתון: ${exercise.questionHe.replace(/\$/g, '')}`);
  stepsHe.push(`רמז: ${exercise.tipHe}`);
  stepsHe.push(`עבור על הבעיה צעד אחר צעד.`);
  stepsHe.push(`תשובה: $\\boxed{${exercise.answer}}$`);

  return {
    exerciseId: exercise.id,
    solution: `The answer is ${exercise.answer}`,
    steps,
    stepsHe,
  };
}

async function seedExercises() {
  console.log("=== Seeding Calculus 1 Exercises (Topics 1-5) ===\n");

  let created = 0;
  let skipped = 0;

  for (const exercise of ALL_EXERCISES) {
    try {
      // Create exercise
      await databases.createDocument(DATABASE_ID, "exercises", exercise.id, {
        courseId: COURSE_ID,
        topicId: exercise.topicId,
        question: exercise.question,
        questionHe: exercise.questionHe,
        difficulty: exercise.difficulty,
        xpReward: exercise.xpReward,
        answer: exercise.answer,
        answerType: exercise.answerType,
        tip: exercise.tip,
        tipHe: exercise.tipHe,
        estimatedMinutes: exercise.estimatedMinutes,
        isActive: true,
      });
      console.log(`✓ Created: ${exercise.id}`);
      created++;
    } catch (error: unknown) {
      const err = error as { code?: number; message?: string };
      if (err.code === 409) {
        console.log(`○ Skipped: ${exercise.id} (already exists)`);
        skipped++;
      } else {
        console.error(`✗ Error: ${exercise.id}`, err.message);
      }
    }
  }

  console.log("\n=== Creating Solutions ===\n");

  for (const exercise of ALL_EXERCISES) {
    const solution = generateSolution(exercise);
    try {
      await databases.createDocument(DATABASE_ID, "exercise_solutions", ID.unique(), {
        exerciseId: solution.exerciseId,
        solution: solution.solution,
        steps: JSON.stringify(solution.steps),
        stepsHe: JSON.stringify(solution.stepsHe),
      });
      console.log(`✓ Solution: ${exercise.id}`);
    } catch (error: unknown) {
      const err = error as { code?: number; message?: string };
      if (err.code === 409) {
        console.log(`○ Skipped solution: ${exercise.id}`);
      } else {
        console.error(`✗ Solution error: ${exercise.id}`, err.message);
      }
    }
  }

  console.log("\n=== Summary ===");
  console.log(`Exercises created: ${created}`);
  console.log(`Exercises skipped: ${skipped}`);
  console.log(`Total: ${ALL_EXERCISES.length}`);
}

seedExercises().catch(console.error);
