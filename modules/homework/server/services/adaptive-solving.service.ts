// modules/homework/server/services/adaptive-solving.service.ts
// Complexity-aware question solving with dynamic prompts and schemas

import { generateObject, createGateway } from "ai";
import { z } from "zod/v4";
import type {
  ClassifiedQuestion,
  SolvedQuestion,
  HomeworkQuestionType,
  HomeworkDifficulty,
  QuestionComplexity,
} from "../../types";

/**
 * Vercel AI Gateway configuration
 * Uses AI_GATEWAY_API_KEY environment variable
 */
const gateway = createGateway({
  apiKey: process.env.AI_GATEWAY_API_KEY ?? "",
});

/**
 * Model configuration - using Gemini 2.0 Flash via AI Gateway
 */
const SOLVING_MODEL = gateway("google/gemini-2.0-flash");

/**
 * Temperature settings by complexity
 * Lower temperature for simple (more deterministic), higher for complex (more creative)
 */
const TEMPERATURE_BY_COMPLEXITY: Record<QuestionComplexity, number> = {
  simple: 0.3,
  medium: 0.4,
  complex: 0.5,
};

/**
 * Base system prompt (shared across all complexities)
 */
const BASE_SYSTEM_PROMPT = `You are an expert math and physics tutor.
Solve the given homework question in BOTH English AND Hebrew.

CRITICAL: ANSWER FIELD
- The "answer" field MUST contain the final numerical or symbolic answer
- Example: "t = 3.675 s" or "$v = 14.375 m/s$" or "$f'(x) = 3x^2 - 4x + 5$"
- DO NOT leave the answer field empty - always provide the final result

CRITICAL LANGUAGE RULES:
- PRESERVE ALL LaTeX formulas EXACTLY in both versions: $x^2$, $$\\int f(x)dx$$
- PRESERVE mathematical symbols: =, ≤, ≥, ∫, ∑, ±, →, ∞
- PRESERVE variable names: x, y, f(x), θ, v₀
- ONLY translate explanatory text
- Both EN and HE MUST have SAME number of steps

SUBJECT DETECTION:
- Calculus 1: Limits, derivatives, integrals
- Linear Algebra: Matrices, vectors, eigenvalues
- Physics 1: Mechanics, kinematics, dynamics`;

/**
 * Complexity-specific prompt additions
 */
const COMPLEXITY_PROMPTS: Record<QuestionComplexity, string> = {
  simple: `
SIMPLE QUESTION - Be concise:
- Provide 1-2 clear steps
- Direct formula application
- Brief tip (1 sentence max)`,

  medium: `
MEDIUM QUESTION - Standard detail:
- Provide 3-4 clear steps
- Show key transformations
- Include helpful tip`,

  complex: `
COMPLEX QUESTION - Thorough explanation:
- Provide 5-7 detailed steps
- Explain reasoning at each step
- Include key insight about the concept
- Note common mistakes to avoid`,
};

/**
 * Zod schemas by complexity
 */
const SIMPLE_SCHEMA = z.object({
  detectedSubject: z.string(),
  detectedTopic: z.string().optional(),
  questionType: z.enum(["multiple_choice", "open_ended", "proof", "calculation", "word_problem"]),
  difficulty: z.enum(["easy", "medium", "hard"]),
  answer: z.string().min(1).describe("The final answer to the question - MUST NOT be empty"),
  solutionSteps: z.array(z.string()).min(1).max(3),
  solutionStepsHe: z.array(z.string()).min(1).max(3),
  tip: z.string().max(150),
  tipHe: z.string().max(150),
  aiConfidence: z.number().min(0).max(10),
});

const MEDIUM_SCHEMA = z.object({
  detectedSubject: z.string(),
  detectedTopic: z.string().optional(),
  questionType: z.enum(["multiple_choice", "open_ended", "proof", "calculation", "word_problem"]),
  difficulty: z.enum(["easy", "medium", "hard"]),
  answer: z.string().min(1).describe("The final answer to the question - MUST NOT be empty"),
  solutionSteps: z.array(z.string()).min(2).max(5),
  solutionStepsHe: z.array(z.string()).min(2).max(5),
  tip: z.string(),
  tipHe: z.string(),
  aiConfidence: z.number().min(0).max(10),
});

const COMPLEX_SCHEMA = z.object({
  detectedSubject: z.string(),
  detectedTopic: z.string().optional(),
  questionType: z.enum(["multiple_choice", "open_ended", "proof", "calculation", "word_problem"]),
  difficulty: z.enum(["easy", "medium", "hard"]),
  answer: z.string().min(1).describe("The final answer to the question - MUST NOT be empty"),
  solutionSteps: z.array(z.string()).min(4).max(10),
  solutionStepsHe: z.array(z.string()).min(4).max(10),
  tip: z.string(),
  tipHe: z.string(),
  aiConfidence: z.number().min(0).max(10),
  // Extra fields for complex questions
  keyInsight: z.string().describe("Key conceptual insight or main takeaway"),
  keyInsightHe: z.string().describe("Key insight in Hebrew"),
  commonMistakes: z.array(z.string()).max(3).describe("Common errors students make"),
  commonMistakesHe: z.array(z.string()).max(3).describe("Common errors in Hebrew"),
});

/**
 * Type for schema inference
 */
type SimpleSolution = z.infer<typeof SIMPLE_SCHEMA>;
type MediumSolution = z.infer<typeof MEDIUM_SCHEMA>;
type ComplexSolution = z.infer<typeof COMPLEX_SCHEMA>;

/**
 * Adaptive Solving Service
 * Solves questions with complexity-appropriate depth and detail
 */
export class AdaptiveSolvingService {
  /**
   * Solve a single question with adaptive complexity
   */
  static async solveAdaptive(question: ClassifiedQuestion): Promise<SolvedQuestion> {
    const { complexity } = question.classification;

    console.log(
      `[AdaptiveSolve] Solving question ${question.orderIndex} (${complexity})`
    );

    try {
      // Build prompt with parent context for sub-questions
      const questionPrompt = this.buildQuestionPrompt(question);

      // Select schema and settings based on complexity
      const { schema, systemPrompt, temperature } = this.getConfigForComplexity(complexity);

      const { object: solution } = await generateObject({
        model: SOLVING_MODEL,
        system: systemPrompt,
        prompt: questionPrompt,
        schema,
        temperature,
      });

      // Convert to SolvedQuestion (handle both simple and complex schemas)
      return this.toSolvedQuestion(question, solution, complexity);
    } catch (error) {
      console.error(`[AdaptiveSolve] Failed for question ${question.orderIndex}:`, error);
      throw new Error(`Failed to solve question: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Build the question prompt with context
   */
  private static buildQuestionPrompt(question: ClassifiedQuestion): string {
    if (question.isSubQuestion && question.parentContext) {
      return `Solve this homework question:

CONTEXT (from main question):
${question.parentContext}

SUB-QUESTION ${question.subQuestionLabel || ""}:
${question.questionText}

Original language: ${question.originalLanguage}`;
    }

    return `Solve this homework question:

${question.questionText}

Original language: ${question.originalLanguage}`;
  }

  /**
   * Get configuration based on complexity
   */
  private static getConfigForComplexity(complexity: QuestionComplexity) {
    const systemPrompt = BASE_SYSTEM_PROMPT + COMPLEXITY_PROMPTS[complexity];
    const temperature = TEMPERATURE_BY_COMPLEXITY[complexity];

    switch (complexity) {
      case "simple":
        return { schema: SIMPLE_SCHEMA, systemPrompt, temperature };
      case "complex":
        return { schema: COMPLEX_SCHEMA, systemPrompt, temperature };
      default:
        return { schema: MEDIUM_SCHEMA, systemPrompt, temperature };
    }
  }

  /**
   * Convert AI response to SolvedQuestion
   */
  private static toSolvedQuestion(
    question: ClassifiedQuestion,
    solution: SimpleSolution | MediumSolution | ComplexSolution,
    complexity: QuestionComplexity
  ): SolvedQuestion {
    const baseSolution: SolvedQuestion = {
      ...question,
      questionType: solution.questionType as HomeworkQuestionType,
      detectedSubject: solution.detectedSubject,
      detectedTopic: solution.detectedTopic,
      difficulty: solution.difficulty as HomeworkDifficulty,
      answer: solution.answer,
      solutionSteps: solution.solutionSteps,
      solutionStepsHe: solution.solutionStepsHe,
      tip: solution.tip,
      tipHe: solution.tipHe,
      aiConfidence: solution.aiConfidence,
    };

    // Add extra fields for complex questions
    if (complexity === "complex" && "keyInsight" in solution) {
      baseSolution.keyInsight = solution.keyInsight;
      baseSolution.keyInsightHe = solution.keyInsightHe;
      baseSolution.commonMistakes = solution.commonMistakes;
      baseSolution.commonMistakesHe = solution.commonMistakesHe;
    }

    return baseSolution;
  }

  /**
   * Solve multiple questions with appropriate complexity handling
   * Processes standard (medium) and complex questions individually
   */
  static async solveMultiple(questions: ClassifiedQuestion[]): Promise<SolvedQuestion[]> {
    const results: SolvedQuestion[] = [];

    for (const question of questions) {
      try {
        const solved = await this.solveAdaptive(question);
        results.push(solved);
      } catch (error) {
        console.error(`[AdaptiveSolve] Skipping question ${question.orderIndex}:`, error);
        // Continue with other questions
      }
    }

    return results;
  }
}
