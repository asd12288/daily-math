// modules/homework/server/services/classification.service.ts
// Lightweight AI classification for adaptive question processing

import { generateObject } from "ai";
import { z } from "zod/v4";
import { gateway } from "ai";
import type {
  ExtractedQuestion,
  ClassifiedQuestion,
  QuestionClassification,
  QuestionComplexity,
  VisualizationNeed,
  QuestionCategory,
} from "../../types";

/**
 * Use a fast model for classification (lightweight task)
 */
const CLASSIFICATION_MODEL = gateway("google/gemini-2.5-flash");
const CLASSIFICATION_TEMPERATURE = 0.2; // Low temperature for consistent classification

/**
 * System prompt for question classification
 * Designed to be efficient (~100-200 tokens for prompt)
 */
const CLASSIFICATION_SYSTEM_PROMPT = `You are an expert at analyzing homework questions for optimal processing.
Classify each question to determine the best solving strategy.

COMPLEXITY RULES:
- "simple": Direct formula application, single-step calculation, basic definition recall
  Examples: "Find derivative of x²", "Calculate 5+3", "What is the integral of sin(x)?"
- "medium": Multi-step problem, combining 2-3 concepts, word problems with setup
  Examples: "Projectile motion with given values", "Related rates problem", "System of equations"
- "complex": Proofs, derivations, multi-part analysis, abstract concepts
  Examples: "Prove by induction", "Derive formula from first principles", "Analyze and explain"

VISUALIZATION RULES:
- "required": Physical scenarios (projectile, forces, circuits), geometry with shapes, coordinate systems
- "helpful": Function graphs, motion diagrams, vectors (but solvable without)
- "not_needed": Pure algebra, derivatives, integrals, equations, proofs

CATEGORY RULES:
- "calculation": Numeric computation, formula application
- "word_problem": Real-world scenario requiring interpretation
- "proof": Mathematical proof or derivation
- "graph": Graph interpretation or sketching
- "physics_setup": Physics problem with physical scenario
- "geometry": Shapes, angles, spatial relationships
- "definition": Concept explanation or definition recall

BATCH RULES:
- canBatchProcess = true ONLY if:
  - complexity is "simple"
  - isSubQuestion is false
  - No reference to "previous question" or "given above"`;

/**
 * Schema for classification output
 */
const classificationSchema = z.object({
  classifications: z.array(
    z.object({
      questionIndex: z.number().describe("Index of question in input array"),
      complexity: z.enum(["simple", "medium", "complex"]),
      estimatedSteps: z.number().min(0).max(10).describe("Expected solution steps (0 for definitions)"),
      visualizationNeed: z.enum(["required", "helpful", "not_needed"]),
      visualizationReason: z.string().optional().describe("Brief reason if visualization needed"),
      questionCategory: z.enum([
        "calculation",
        "word_problem",
        "proof",
        "graph",
        "physics_setup",
        "geometry",
        "definition",
      ]),
      canBatchProcess: z.boolean().describe("Can this question be batch processed with others?"),
    })
  ),
});

/**
 * Classification Service
 * Provides lightweight pre-analysis of questions for adaptive processing
 */
export class ClassificationService {
  /**
   * Classify multiple questions in a single API call
   * This is a lightweight operation (~200-500 tokens for 10 questions)
   */
  static async classifyQuestions(
    questions: ExtractedQuestion[]
  ): Promise<ClassifiedQuestion[]> {
    if (questions.length === 0) {
      return [];
    }

    console.log(`[Classification] Classifying ${questions.length} questions`);

    try {
      // Format questions for classification
      const questionsText = questions
        .map((q, i) => {
          const prefix = q.isSubQuestion
            ? `[${i}] (sub-question ${q.subQuestionLabel || ""}): `
            : `[${i}]: `;
          const context = q.parentContext ? `Context: ${q.parentContext.substring(0, 100)}... ` : "";
          return `${prefix}${context}${q.questionText}`;
        })
        .join("\n\n");

      const { object: result } = await generateObject({
        model: CLASSIFICATION_MODEL,
        system: CLASSIFICATION_SYSTEM_PROMPT,
        prompt: `Classify these ${questions.length} homework questions:\n\n${questionsText}`,
        schema: classificationSchema,
        temperature: CLASSIFICATION_TEMPERATURE,
      });

      // Map classifications back to questions
      const classifiedQuestions: ClassifiedQuestion[] = questions.map((question, index) => {
        // Find classification for this question
        const classification = result.classifications.find((c) => c.questionIndex === index);

        // Default classification if AI missed this question
        const defaultClassification: QuestionClassification = {
          complexity: "medium" as QuestionComplexity,
          estimatedSteps: 3,
          visualizationNeed: "not_needed" as VisualizationNeed,
          questionCategory: "calculation" as QuestionCategory,
          canBatchProcess: false,
        };

        if (!classification) {
          console.warn(`[Classification] Missing classification for question ${index}, using default`);
          return {
            ...question,
            classification: defaultClassification,
          };
        }

        // Sub-questions should inherit parent's visualization but can't be batched
        const finalClassification: QuestionClassification = {
          complexity: classification.complexity as QuestionComplexity,
          estimatedSteps: classification.estimatedSteps,
          visualizationNeed: classification.visualizationNeed as VisualizationNeed,
          visualizationReason: classification.visualizationReason,
          questionCategory: classification.questionCategory as QuestionCategory,
          // Sub-questions can never be batch processed (need parent context)
          canBatchProcess: question.isSubQuestion ? false : classification.canBatchProcess,
        };

        return {
          ...question,
          classification: finalClassification,
        };
      });

      // Log classification summary
      const summary = {
        simple: classifiedQuestions.filter((q) => q.classification.complexity === "simple").length,
        medium: classifiedQuestions.filter((q) => q.classification.complexity === "medium").length,
        complex: classifiedQuestions.filter((q) => q.classification.complexity === "complex").length,
        needsImage: classifiedQuestions.filter(
          (q) => q.classification.visualizationNeed !== "not_needed"
        ).length,
        batchable: classifiedQuestions.filter((q) => q.classification.canBatchProcess).length,
      };
      console.log(`[Classification] Summary:`, summary);

      return classifiedQuestions;
    } catch (error) {
      console.error("[Classification] Failed:", error);

      // Fallback: return questions with default medium classification
      return questions.map((question) => ({
        ...question,
        classification: {
          complexity: "medium" as QuestionComplexity,
          estimatedSteps: 3,
          visualizationNeed: "not_needed" as VisualizationNeed,
          questionCategory: "calculation" as QuestionCategory,
          canBatchProcess: false,
        },
      }));
    }
  }

  /**
   * Group classified questions by processing strategy
   */
  static groupByProcessingStrategy(questions: ClassifiedQuestion[]): {
    batchable: ClassifiedQuestion[];
    standard: ClassifiedQuestion[];
    complex: ClassifiedQuestion[];
  } {
    const batchable: ClassifiedQuestion[] = [];
    const standard: ClassifiedQuestion[] = [];
    const complex: ClassifiedQuestion[] = [];

    for (const question of questions) {
      if (question.classification.canBatchProcess) {
        batchable.push(question);
      } else if (question.classification.complexity === "complex") {
        complex.push(question);
      } else {
        standard.push(question);
      }
    }

    return { batchable, standard, complex };
  }

  /**
   * Create batches of questions for batch processing
   * Groups 3-5 simple questions per batch
   */
  static createBatches(questions: ClassifiedQuestion[], maxBatchSize: number = 5): ClassifiedQuestion[][] {
    const batches: ClassifiedQuestion[][] = [];
    let currentBatch: ClassifiedQuestion[] = [];

    for (const question of questions) {
      currentBatch.push(question);

      if (currentBatch.length >= maxBatchSize) {
        batches.push(currentBatch);
        currentBatch = [];
      }
    }

    // Add remaining questions as final batch
    if (currentBatch.length > 0) {
      batches.push(currentBatch);
    }

    return batches;
  }
}
