// modules/homework/server/services/batch-solving.service.ts
// Batch processing for multiple simple questions in a single API call

import { generateObject } from "ai";
import { z } from "zod/v4";
import { gateway } from "ai";
import type {
  ClassifiedQuestion,
  SolvedQuestion,
  HomeworkQuestionType,
  HomeworkDifficulty,
  BatchSolvingResult,
} from "../../types";

/**
 * Model configuration for batch processing
 */
const BATCH_MODEL = gateway("google/gemini-2.5-flash");
const BATCH_TEMPERATURE = 0.3; // Low temperature for consistent results

/**
 * Maximum questions per batch
 * Balance between token efficiency and response quality
 */
const MAX_BATCH_SIZE = 5;
const MIN_BATCH_SIZE = 2; // Don't batch single questions

/**
 * System prompt for batch solving
 * Optimized for multiple simple questions
 */
const BATCH_SYSTEM_PROMPT = `You are an expert math/physics tutor solving multiple simple homework questions.

RULES:
1. Solve each question with 1-2 clear steps
2. Provide solutions in BOTH English AND Hebrew
3. PRESERVE all LaTeX: $x^2$, $$\\int f(x)dx$$
4. PRESERVE symbols: =, ≤, ≥, ∫, ∑, ±, →, ∞
5. Keep tips brief (1 sentence)
6. EN and HE steps must match in count

SUBJECT DETECTION:
- Calculus: derivatives, integrals, limits
- Linear Algebra: matrices, vectors
- Physics: mechanics, kinematics`;

/**
 * Schema for a single question in batch
 */
const batchQuestionSchema = z.object({
  questionIndex: z.number().describe("Index from input"),
  detectedSubject: z.string(),
  detectedTopic: z.string().optional(),
  questionType: z.enum(["multiple_choice", "open_ended", "proof", "calculation", "word_problem"]),
  difficulty: z.enum(["easy", "medium", "hard"]),
  answer: z.string(),
  solutionSteps: z.array(z.string()).min(1).max(3),
  solutionStepsHe: z.array(z.string()).min(1).max(3),
  tip: z.string().max(150),
  tipHe: z.string().max(150),
  aiConfidence: z.number().min(0).max(10),
});

/**
 * Schema for batch response
 */
const batchResponseSchema = z.object({
  solutions: z.array(batchQuestionSchema),
});

/**
 * Batch Solving Service
 * Processes multiple simple questions in a single API call
 * Reduces token overhead from repeated system prompts
 */
export class BatchSolvingService {
  /**
   * Solve a batch of simple questions
   * @param questions Array of 2-5 simple questions
   * @returns Solved questions with solutions
   */
  static async solveBatch(questions: ClassifiedQuestion[]): Promise<BatchSolvingResult> {
    if (questions.length === 0) {
      return { questions: [] };
    }

    // If only 1 question, don't batch (use adaptive solving instead)
    if (questions.length < MIN_BATCH_SIZE) {
      console.warn(`[BatchSolve] Only ${questions.length} question(s), consider using adaptive solving`);
    }

    console.log(`[BatchSolve] Processing batch of ${questions.length} questions`);

    try {
      // Format questions for batch processing
      const questionsText = questions
        .map((q, i) => `[Q${i}]: ${q.questionText}`)
        .join("\n\n");

      const { object: result } = await generateObject({
        model: BATCH_MODEL,
        system: BATCH_SYSTEM_PROMPT,
        prompt: `Solve these ${questions.length} simple homework questions:\n\n${questionsText}`,
        schema: batchResponseSchema,
        temperature: BATCH_TEMPERATURE,
      });

      // Map solutions back to questions
      const solvedQuestions: SolvedQuestion[] = questions.map((question, index) => {
        const solution = result.solutions.find((s) => s.questionIndex === index);

        if (!solution) {
          console.warn(`[BatchSolve] Missing solution for question ${index}`);
          // Return a placeholder - this should be re-processed individually
          return {
            ...question,
            questionType: "calculation" as HomeworkQuestionType,
            detectedSubject: "Unknown",
            difficulty: "easy" as HomeworkDifficulty,
            answer: "Error: Solution not generated",
            solutionSteps: ["Error processing question"],
            solutionStepsHe: ["שגיאה בעיבוד השאלה"],
            tip: "Please try again",
            tipHe: "נסה שוב",
            aiConfidence: 0,
          };
        }

        return {
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
      });

      console.log(`[BatchSolve] Successfully solved ${solvedQuestions.length} questions`);

      return { questions: solvedQuestions };
    } catch (error) {
      console.error("[BatchSolve] Batch processing failed:", error);
      throw new Error(`Batch solving failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Process multiple batches of questions
   * Splits questions into batches and processes each
   */
  static async solveBatches(questions: ClassifiedQuestion[]): Promise<SolvedQuestion[]> {
    if (questions.length === 0) {
      return [];
    }

    // Create batches of MAX_BATCH_SIZE
    const batches: ClassifiedQuestion[][] = [];
    for (let i = 0; i < questions.length; i += MAX_BATCH_SIZE) {
      batches.push(questions.slice(i, i + MAX_BATCH_SIZE));
    }

    console.log(`[BatchSolve] Processing ${batches.length} batches for ${questions.length} questions`);

    const allResults: SolvedQuestion[] = [];

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];

      try {
        // For very small batches (1 question), still process but log warning
        const result = await this.solveBatch(batch);
        allResults.push(...result.questions);

        console.log(`[BatchSolve] Completed batch ${i + 1}/${batches.length}`);
      } catch (error) {
        console.error(`[BatchSolve] Batch ${i + 1} failed:`, error);

        // Mark failed questions
        for (const question of batch) {
          allResults.push({
            ...question,
            questionType: "calculation" as HomeworkQuestionType,
            detectedSubject: "Unknown",
            difficulty: "easy" as HomeworkDifficulty,
            answer: "Error: Batch processing failed",
            solutionSteps: ["This question could not be processed in batch mode"],
            solutionStepsHe: ["לא ניתן היה לעבד שאלה זו במצב אצווה"],
            tip: "Please retry this homework",
            tipHe: "נסה שוב את השיעורי בית",
            aiConfidence: 0,
          });
        }
      }
    }

    return allResults;
  }

  /**
   * Estimate token savings from batch processing
   * For monitoring and optimization
   */
  static estimateTokenSavings(batchCount: number, questionsPerBatch: number): {
    withoutBatch: number;
    withBatch: number;
    savings: number;
    savingsPercent: number;
  } {
    // Approximate token counts
    const SYSTEM_PROMPT_TOKENS = 200; // Per request
    const SCHEMA_OVERHEAD_TOKENS = 100; // Per request
    const AVG_QUESTION_TOKENS = 50;
    const AVG_RESPONSE_TOKENS = 150;

    const totalQuestions = batchCount * questionsPerBatch;

    // Without batching: each question = separate request
    const withoutBatch =
      totalQuestions * (SYSTEM_PROMPT_TOKENS + SCHEMA_OVERHEAD_TOKENS + AVG_QUESTION_TOKENS + AVG_RESPONSE_TOKENS);

    // With batching: shared system prompt per batch
    const withBatch =
      batchCount * (SYSTEM_PROMPT_TOKENS + SCHEMA_OVERHEAD_TOKENS) +
      totalQuestions * (AVG_QUESTION_TOKENS + AVG_RESPONSE_TOKENS);

    const savings = withoutBatch - withBatch;
    const savingsPercent = Math.round((savings / withoutBatch) * 100);

    return { withoutBatch, withBatch, savings, savingsPercent };
  }
}
