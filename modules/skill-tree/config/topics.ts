// modules/skill-tree/config/topics.ts
// Static topic definitions for Pre-Calculus Algebra

import type { Branch, Topic, BranchId } from "../types";

/**
 * Branch definitions - categories of topics
 */
export const BRANCHES: Branch[] = [
  {
    id: "foundations",
    name: "Foundations",
    nameHe: "יסודות",
    icon: "tabler:plant-2",
    color: "success",
    order: 1,
  },
  {
    id: "linear",
    name: "Linear Algebra",
    nameHe: "אלגברה לינארית",
    icon: "tabler:line",
    color: "primary",
    order: 2,
  },
  {
    id: "polynomials",
    name: "Polynomials",
    nameHe: "פולינומים",
    icon: "tabler:math-function",
    color: "secondary",
    order: 3,
  },
  {
    id: "quadratics",
    name: "Quadratics",
    nameHe: "משוואות ריבועיות",
    icon: "tabler:chart-arcs",
    color: "warning",
    order: 4,
  },
  {
    id: "functions",
    name: "Functions",
    nameHe: "פונקציות",
    icon: "tabler:chart-line",
    color: "error",
    order: 5,
  },
];

/**
 * Topic definitions - all 15 topics for MVP
 */
export const TOPICS: Topic[] = [
  // === FOUNDATIONS (3 topics) ===
  {
    id: "order-of-operations",
    name: "Order of Operations",
    nameHe: "סדר פעולות חשבון",
    description: "PEMDAS/BODMAS rules for evaluating expressions",
    descriptionHe: "כללי סדר פעולות לחישוב ביטויים",
    branchId: "foundations",
    prerequisites: [],
    order: 1,
    difficultyLevels: ["easy", "medium", "hard"],
    questionTypes: ["evaluate", "identify-error", "insert-parentheses"],
    keywords: ["parentheses", "exponents", "multiplication", "division", "addition", "subtraction"],
  },
  {
    id: "fractions-decimals",
    name: "Fractions & Decimals",
    nameHe: "שברים ועשרוניים",
    description: "Operations with fractions and decimal conversions",
    descriptionHe: "פעולות בשברים והמרות עשרוניות",
    branchId: "foundations",
    prerequisites: ["order-of-operations"],
    order: 2,
    difficultyLevels: ["easy", "medium", "hard"],
    questionTypes: ["simplify", "convert", "add-subtract", "multiply-divide"],
    keywords: ["fraction", "decimal", "numerator", "denominator", "simplify"],
  },
  {
    id: "basic-equations",
    name: "Basic Equations",
    nameHe: "משוואות בסיסיות",
    description: "Solving simple one-step and two-step equations",
    descriptionHe: "פתרון משוואות פשוטות בשלב אחד או שניים",
    branchId: "foundations",
    prerequisites: ["fractions-decimals"],
    order: 3,
    difficultyLevels: ["easy", "medium", "hard"],
    questionTypes: ["solve-for-x", "word-problem", "check-solution"],
    keywords: ["equation", "solve", "variable", "isolate"],
  },

  // === LINEAR (3 topics) ===
  {
    id: "linear-equations-one-var",
    name: "Linear Equations (One Variable)",
    nameHe: "משוואות ליניאריות (משתנה אחד)",
    description: "Solving linear equations with one unknown",
    descriptionHe: "פתרון משוואות ליניאריות עם נעלם אחד",
    branchId: "linear",
    prerequisites: ["basic-equations"],
    order: 1,
    difficultyLevels: ["easy", "medium", "hard"],
    questionTypes: ["solve", "multi-step", "with-fractions", "with-parentheses"],
    keywords: ["linear", "equation", "solve", "coefficient"],
  },
  {
    id: "linear-word-problems",
    name: "Linear Word Problems",
    nameHe: "בעיות מילוליות ליניאריות",
    description: "Translating word problems into linear equations",
    descriptionHe: "תרגום בעיות מילוליות למשוואות ליניאריות",
    branchId: "linear",
    prerequisites: ["linear-equations-one-var"],
    order: 2,
    difficultyLevels: ["easy", "medium", "hard"],
    questionTypes: ["translate", "age-problem", "distance-problem", "mixture-problem"],
    keywords: ["word problem", "translate", "setup", "unknown"],
  },
  {
    id: "systems-of-equations",
    name: "Systems of Equations",
    nameHe: "מערכת משוואות",
    description: "Solving systems of two linear equations",
    descriptionHe: "פתרון מערכת של שתי משוואות ליניאריות",
    branchId: "linear",
    prerequisites: ["linear-word-problems"],
    order: 3,
    difficultyLevels: ["easy", "medium", "hard"],
    questionTypes: ["substitution", "elimination", "graphical", "word-problem"],
    keywords: ["system", "substitution", "elimination", "intersection"],
  },

  // === POLYNOMIALS (3 topics) ===
  {
    id: "expanding-expressions",
    name: "Expanding Expressions",
    nameHe: "פתיחת סוגריים",
    description: "Distributing and expanding polynomial expressions",
    descriptionHe: "הפצה ופתיחת ביטויים פולינומיים",
    branchId: "polynomials",
    prerequisites: ["basic-equations"],
    order: 1,
    difficultyLevels: ["easy", "medium", "hard"],
    questionTypes: ["distribute", "foil", "expand-binomial", "simplify"],
    keywords: ["expand", "distribute", "FOIL", "binomial", "polynomial"],
  },
  {
    id: "factoring-basics",
    name: "Factoring Basics",
    nameHe: "פירוק לגורמים - בסיסי",
    description: "Finding common factors and basic factoring",
    descriptionHe: "מציאת גורם משותף ופירוק בסיסי",
    branchId: "polynomials",
    prerequisites: ["expanding-expressions"],
    order: 2,
    difficultyLevels: ["easy", "medium", "hard"],
    questionTypes: ["gcf", "factor-out", "difference-of-squares"],
    keywords: ["factor", "GCF", "common factor", "difference of squares"],
  },
  {
    id: "factoring-trinomials",
    name: "Factoring Trinomials",
    nameHe: "פירוק טרינומים",
    description: "Factoring quadratic trinomials (ax² + bx + c)",
    descriptionHe: "פירוק טרינומים ריבועיים",
    branchId: "polynomials",
    prerequisites: ["factoring-basics"],
    order: 3,
    difficultyLevels: ["easy", "medium", "hard"],
    questionTypes: ["factor-simple", "factor-leading-coef", "factor-by-grouping"],
    keywords: ["trinomial", "factor", "leading coefficient", "ac method"],
  },

  // === QUADRATICS (3 topics) ===
  {
    id: "quadratic-by-factoring",
    name: "Solving by Factoring",
    nameHe: "פתרון על ידי פירוק",
    description: "Solving quadratic equations using factoring",
    descriptionHe: "פתרון משוואות ריבועיות באמצעות פירוק",
    branchId: "quadratics",
    prerequisites: ["factoring-trinomials"],
    order: 1,
    difficultyLevels: ["easy", "medium", "hard"],
    questionTypes: ["solve-factored", "factor-then-solve", "find-roots"],
    keywords: ["quadratic", "roots", "zeros", "factor", "zero product"],
  },
  {
    id: "quadratic-formula",
    name: "Quadratic Formula",
    nameHe: "נוסחת השורשים",
    description: "Using the quadratic formula to find solutions",
    descriptionHe: "שימוש בנוסחת השורשים למציאת פתרונות",
    branchId: "quadratics",
    prerequisites: ["quadratic-by-factoring"],
    order: 2,
    difficultyLevels: ["easy", "medium", "hard"],
    questionTypes: ["apply-formula", "discriminant", "complex-roots"],
    keywords: ["quadratic formula", "discriminant", "roots", "a b c"],
  },
  {
    id: "quadratic-word-problems",
    name: "Quadratic Word Problems",
    nameHe: "בעיות מילוליות ריבועיות",
    description: "Real-world applications of quadratic equations",
    descriptionHe: "יישומים של משוואות ריבועיות בעולם האמיתי",
    branchId: "quadratics",
    prerequisites: ["quadratic-formula"],
    order: 3,
    difficultyLevels: ["easy", "medium", "hard"],
    questionTypes: ["projectile", "area", "optimization", "revenue"],
    keywords: ["word problem", "projectile", "area", "maximum", "minimum"],
  },

  // === FUNCTIONS (3 topics) ===
  {
    id: "function-notation",
    name: "Function Notation",
    nameHe: "סימון פונקציות",
    description: "Understanding and using f(x) notation",
    descriptionHe: "הבנה ושימוש בסימון f(x)",
    branchId: "functions",
    prerequisites: ["linear-equations-one-var"],
    order: 1,
    difficultyLevels: ["easy", "medium", "hard"],
    questionTypes: ["evaluate", "find-input", "compose", "interpret"],
    keywords: ["function", "f(x)", "input", "output", "evaluate"],
  },
  {
    id: "domain-range",
    name: "Domain & Range",
    nameHe: "תחום וטווח",
    description: "Finding domain and range of functions",
    descriptionHe: "מציאת תחום וטווח של פונקציות",
    branchId: "functions",
    prerequisites: ["function-notation"],
    order: 2,
    difficultyLevels: ["easy", "medium", "hard"],
    questionTypes: ["find-domain", "find-range", "from-graph", "restrictions"],
    keywords: ["domain", "range", "restriction", "undefined"],
  },
  {
    id: "basic-graphing",
    name: "Basic Graphing",
    nameHe: "שרטוט גרפים בסיסי",
    description: "Graphing linear and simple functions",
    descriptionHe: "שרטוט פונקציות ליניאריות ופשוטות",
    branchId: "functions",
    prerequisites: ["domain-range"],
    order: 3,
    difficultyLevels: ["easy", "medium", "hard"],
    questionTypes: ["plot-points", "slope-intercept", "identify-function", "transformations"],
    keywords: ["graph", "slope", "intercept", "coordinate", "plot"],
  },
];

/**
 * Get topics by branch
 */
export function getTopicsByBranch(branchId: BranchId): Topic[] {
  return TOPICS.filter((t) => t.branchId === branchId).sort(
    (a, b) => a.order - b.order
  );
}

/**
 * Get topic by ID
 */
export function getTopicById(topicId: string): Topic | undefined {
  return TOPICS.find((t) => t.id === topicId);
}

/**
 * Get branch by ID
 */
export function getBranchById(branchId: BranchId): Branch | undefined {
  return BRANCHES.find((b) => b.id === branchId);
}

/**
 * Get all prerequisite topics (recursively)
 */
export function getAllPrerequisites(topicId: string): string[] {
  const topic = getTopicById(topicId);
  if (!topic) return [];

  const prerequisites = new Set<string>();

  function addPrereqs(prereqs: string[]) {
    for (const prereq of prereqs) {
      if (!prerequisites.has(prereq)) {
        prerequisites.add(prereq);
        const prereqTopic = getTopicById(prereq);
        if (prereqTopic) {
          addPrereqs(prereqTopic.prerequisites);
        }
      }
    }
  }

  addPrereqs(topic.prerequisites);
  return Array.from(prerequisites);
}

/**
 * Get topics that depend on a given topic
 */
export function getDependentTopics(topicId: string): Topic[] {
  return TOPICS.filter((t) => t.prerequisites.includes(topicId));
}
