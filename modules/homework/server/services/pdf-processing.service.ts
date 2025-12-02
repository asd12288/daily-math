// modules/homework/server/services/pdf-processing.service.ts
// AI-powered PDF analysis for homework using Vercel AI Gateway
// OPTIMIZED: Extract only during upload (single AI call), solve on-demand

import { generateObject, createGateway } from "ai";
import { z } from "zod/v4";
import { createAdminClient } from "@/lib/appwrite/server";
import { APPWRITE_CONFIG } from "@/lib/appwrite/config";
import { HomeworkService } from "./homework.service";
// NOTE: Classification removed from upload for speed - classify on-demand during solving if needed
import type {
  ExtractedQuestion,
  OriginalLanguage,
  AISuggestions,
  HomeworkDifficulty,
  SolvedQuestion,
  HomeworkQuestionType,
} from "../../types";
import { getMimeTypeFromExtension } from "../../config/constants";

/**
 * Vercel AI Gateway configuration
 * Uses AI_GATEWAY_API_KEY environment variable
 * See: https://ai-sdk.dev/providers/ai-sdk-providers/ai-gateway
 */
const gateway = createGateway({
  apiKey: process.env.AI_GATEWAY_API_KEY ?? "",
});

// Use Gemini 2.0 Flash via AI Gateway
const PDF_ANALYSIS_MODEL = gateway("google/gemini-2.0-flash");
const PDF_ANALYSIS_TEMPERATURE = 0.3;

/**
 * System prompt for extracting questions from homework pages (with hierarchy support)
 */
const QUESTION_EXTRACTION_PROMPT = `You are an expert at analyzing homework documents in Hebrew and English.
Your task is to extract ALL math/physics questions from the document with proper HIERARCHICAL structure.

HIERARCHICAL QUESTION STRUCTURE:
Many physics/math homeworks have this structure:
- Main question (contains scenario, given data, context)
- Sub-questions (a, b, c or 1, 2, 3) that reference the main question

EXTRACTION RULES:
1. Extract main questions with isSubQuestion: false
2. Extract sub-questions with isSubQuestion: true
3. For sub-questions, set parentIndex to the array index of their parent question
4. For sub-questions, set subQuestionLabel ("a", "b", "c", "א", "ב", "ג", etc.)
5. The main question should contain ALL context, given data, scenario, and diagrams descriptions
6. Sub-questions should contain ONLY their specific ask

EXAMPLE:
Original: "1. A ball is thrown with initial velocity 10 m/s at 45°. (a) Find the maximum height (b) Find the range"

Output:
[
  { questionText: "A ball is thrown with initial velocity 10 m/s at 45°.", isSubQuestion: false, pageNumber: 1 },
  { questionText: "Find the maximum height", isSubQuestion: true, parentIndex: 0, subQuestionLabel: "a", pageNumber: 1 },
  { questionText: "Find the range", isSubQuestion: true, parentIndex: 0, subQuestionLabel: "b", pageNumber: 1 }
]

HEBREW EXAMPLE:
Original: "2. כדור נזרק במהירות התחלתית 15 מ/ש. א. חשב את הגובה המקסימלי. ב. חשב את הזמן באוויר."

Output:
[
  { questionText: "כדור נזרק במהירות התחלתית 15 מ/ש.", isSubQuestion: false, pageNumber: 1 },
  { questionText: "חשב את הגובה המקסימלי", isSubQuestion: true, parentIndex: 2, subQuestionLabel: "א", pageNumber: 1 },
  { questionText: "חשב את הזמן באוויר", isSubQuestion: true, parentIndex: 2, subQuestionLabel: "ב", pageNumber: 1 }
]

IMPORTANT:
- Extract questions EXACTLY as written (preserve original language)
- Use LaTeX notation for math: $...$ for inline, $$...$$ for display
- Detect if the content is in Hebrew (עברית) or English
- Handle BOTH typed AND handwritten content
- If a standalone question has NO sub-questions, set isSubQuestion: false with no parentIndex`;

/**
 * System prompt for solving homework questions (bilingual)
 */
const QUESTION_SOLVING_PROMPT = `You are an expert math and physics tutor.
Solve the given homework question step-by-step in BOTH English AND Hebrew.

CRITICAL LANGUAGE RULES:
- Generate solution steps in BOTH English (solutionSteps) AND Hebrew (solutionStepsHe)
- PRESERVE ALL LaTeX formulas EXACTLY in both versions: $x^2$, $$\\int f(x)dx$$
- PRESERVE mathematical symbols: =, ≤, ≥, ∫, ∑, ±, →, ∞, etc.
- PRESERVE variable names and functions: x, y, f(x), θ, v₀, etc.
- ONLY translate explanatory text and descriptions
- Both versions MUST have the SAME number of steps
- Use proper Hebrew mathematical terminology

EXAMPLES OF CORRECT TRANSLATION:
English: "Step 1: Apply the derivative rule to $f(x) = x^3$"
Hebrew: "שלב 1: נחיל את כלל הגזירה על $f(x) = x^3$"

English: "Step 2: Using the power rule, $\\frac{d}{dx}x^n = nx^{n-1}$"
Hebrew: "שלב 2: לפי כלל החזקה, $\\frac{d}{dx}x^n = nx^{n-1}$"

REQUIREMENTS:
1. Provide COMPLETE and CORRECT solution
2. Break down into 3-7 clear steps
3. Use LaTeX for all math: $...$ for inline, $$...$$ for display
4. Detect the subject and specific topic
5. Estimate difficulty (easy/medium/hard)
6. Provide a helpful tip in BOTH English and Hebrew

SUBJECT DETECTION:
- Calculus 1: Limits, derivatives, integrals, series
- Calculus 2: Multivariable calculus, advanced integrals
- Linear Algebra: Matrices, vectors, eigenvalues, linear systems
- Physics 1: Mechanics, kinematics, dynamics, energy
- Physics 2: Electricity, magnetism, waves
- Other: Anything else

DIFFICULTY ESTIMATION:
- easy: Single concept, straightforward application
- medium: Multiple steps, combining 2-3 concepts
- hard: Complex problem, advanced techniques needed`;

/**
 * Schema for solved question (bilingual - both EN and HE)
 */
const solvedQuestionSchema = z.object({
  detectedSubject: z.string().describe("Main subject (e.g., Calculus 1, Physics 1)"),
  detectedTopic: z.string().optional().describe("Specific topic within the subject"),
  questionType: z
    .enum(["multiple_choice", "open_ended", "proof", "calculation", "word_problem"])
    .describe("Type of question"),
  difficulty: z.enum(["easy", "medium", "hard"]).describe("Difficulty level"),
  answer: z.string().describe("Final answer (with LaTeX if needed)"),
  // English solution
  solutionSteps: z.array(z.string()).min(2).max(20).describe("Step-by-step solution in English"),
  tip: z.string().describe("Helpful tip for similar problems in English"),
  // Hebrew solution (always generated)
  solutionStepsHe: z.array(z.string()).min(2).max(20).describe("Step-by-step solution in Hebrew (שלבי הפתרון בעברית)"),
  tipHe: z.string().describe("Helpful tip in Hebrew (טיפ בעברית)"),
  // Confidence
  aiConfidence: z.number().min(0).max(10).describe("Confidence in the solution (0-10)"),
});

// NOTE: mapComplexityToDifficulty removed - classification happens on-demand

/**
 * PDF Processing Service
 * Handles AI analysis of homework PDFs
 * REFACTORED: Extract & classify only - solutions generated on-demand
 */
export class PdfProcessingService {
  /**
   * Process a homework file - FAST extraction only (single AI call)
   * Solutions are generated on-demand when user clicks "Get Solution"
   *
   * OPTIMIZED FLOW (Fast ~3-5 seconds):
   * 1. Extract questions from PDF/image (single AI call)
   * 2. Store questions with default metadata (NO solutions, NO classification)
   * 3. Complete!
   *
   * Classification and solving happen on-demand when user requests a solution.
   *
   * @param homeworkId Homework document ID
   * @param userId User ID
   * @param _generateIllustrations Ignored - illustrations now generated on-demand
   */
  static async processHomework(
    homeworkId: string,
    userId: string,
    _generateIllustrations: boolean = false
  ): Promise<{ success: boolean; questionCount: number; error?: string }> {
    console.log(`[PDF] Starting FAST extraction for homework ${homeworkId}`);

    try {
      // Update status to processing
      await HomeworkService.updateHomeworkStatus(homeworkId, "processing", {
        processingStartedAt: new Date().toISOString(),
      });

      // Get homework details
      const homework = await HomeworkService.getHomeworkById(homeworkId);
      if (!homework) {
        throw new Error("Homework not found");
      }

      // Get file from storage
      const { storage } = await createAdminClient();
      const fileBuffer = await storage.getFileDownload(
        APPWRITE_CONFIG.buckets.userFiles,
        homework.fileId
      );

      // Determine MIME type from file name
      const mimeType = getMimeTypeFromExtension(homework.originalFileName);
      const fileType = homework.fileType || (mimeType === "application/pdf" ? "pdf" : "image");

      // Convert to base64 for Gemini
      const base64Content = Buffer.from(fileBuffer).toString("base64");
      const dataUrl = `data:${mimeType};base64,${base64Content}`;

      // ===== STEP 1: Extract questions from file =====
      const fileTypeLabel = fileType === "pdf" ? "PDF" : "image";
      console.log(`[PDF] Step 1: Extracting questions from ${fileTypeLabel} (${homework.pageCount} pages)`);
      const extractedQuestions = await this.extractQuestionsFromFile(
        dataUrl,
        homework.pageCount,
        fileType
      );

      if (extractedQuestions.length === 0) {
        await HomeworkService.updateHomeworkStatus(homeworkId, "failed", {
          errorMessage: "No questions could be detected in the file",
          processingCompletedAt: new Date().toISOString(),
        });
        return { success: false, questionCount: 0, error: "No questions detected" };
      }

      console.log(`[PDF] Found ${extractedQuestions.length} questions`);

      // NOTE: Classification step REMOVED for faster uploads
      // Classification now happens on-demand when user requests a solution

      // ===== STEP 2: Store questions WITHOUT solutions (FAST) =====
      console.log(`[PDF] Step 2: Storing ${extractedQuestions.length} questions (solutions on-demand)`);

      let detectedLanguage: "en" | "he" | "mixed" = "en";
      const languages = new Set<string>();
      const indexToDbId: Map<number, string> = new Map();

      // Sort by orderIndex to maintain hierarchy (parent before children)
      const sortedQuestions = [...extractedQuestions].sort(
        (a, b) => a.orderIndex - b.orderIndex
      );

      for (const question of sortedQuestions) {
        languages.add(question.originalLanguage);

        try {
          // Default AI suggestions (classification happens on-demand)
          const aiSuggestions: AISuggestions = {
            visualizationNeeded: false, // Will be determined when solution is generated
            estimatedSteps: 3,
            questionCategory: "calculation",
          };

          // Determine parent question ID for sub-questions
          let parentQuestionId: string | undefined;
          if (question.isSubQuestion && question.parentIndex !== undefined) {
            parentQuestionId = indexToDbId.get(question.parentIndex);
          }

          // Create question in database WITHOUT solution (FAST)
          const dbQuestion = await HomeworkService.createQuestion({
            homeworkId,
            userId,
            orderIndex: question.orderIndex,
            pageNumber: question.pageNumber,
            questionText: question.questionText,
            originalLanguage: question.originalLanguage,
            // Default values - will be set properly when solution is generated
            questionType: "calculation",
            detectedSubject: "Math",
            difficulty: "medium" as HomeworkDifficulty, // Will be updated when solved
            answer: "", // Empty - filled on-demand
            // Hierarchy fields
            isSubQuestion: question.isSubQuestion,
            parentQuestionId,
            subQuestionLabel: question.subQuestionLabel,
            parentContext: question.parentContext,
            // On-demand fields
            solutionStatus: "pending",
            aiSuggestions: JSON.stringify(aiSuggestions),
          });

          // Track the mapping
          indexToDbId.set(question.orderIndex, dbQuestion.$id);

          // NOTE: NO solution created here - will be generated on-demand

          console.log(`[PDF] Stored question ${question.orderIndex + 1}/${sortedQuestions.length}`);
        } catch (error) {
          console.error(`[PDF] Failed to store question ${question.orderIndex}:`, error);
        }
      }

      // Determine overall language
      if (languages.has("en") && languages.has("he")) {
        detectedLanguage = "mixed";
      } else if (languages.has("he")) {
        detectedLanguage = "he";
      }

      // Update homework status to completed
      await HomeworkService.updateHomeworkStatus(homeworkId, "completed", {
        questionCount: indexToDbId.size,
        detectedLanguage,
        processingCompletedAt: new Date().toISOString(),
      });

      console.log(`[PDF] FAST upload complete: ${indexToDbId.size} questions stored (solutions on-demand)`);

      return { success: true, questionCount: indexToDbId.size };
    } catch (error) {
      console.error(`[PDF] Processing failed for homework ${homeworkId}:`, error);

      await HomeworkService.updateHomeworkStatus(homeworkId, "failed", {
        errorMessage: error instanceof Error ? error.message : "Processing failed",
        processingCompletedAt: new Date().toISOString(),
      });

      return {
        success: false,
        questionCount: 0,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Extract questions from a file (PDF or image) with hierarchical structure
   */
  static async extractQuestionsFromFile(
    dataUrl: string,
    pageCount: number,
    fileType: "pdf" | "image"
  ): Promise<ExtractedQuestion[]> {
    const allQuestions: ExtractedQuestion[] = [];
    let globalIndex = 0;

    // Get MIME type from data URL
    const mimeType = dataUrl.split(";")[0].split(":")[1] || "application/pdf";

    // Context text based on file type
    const contextText = fileType === "pdf"
      ? `This is a homework PDF with ${pageCount} page(s). Extract ALL questions from ALL pages with hierarchical structure.`
      : `This is an image of homework (possibly handwritten or printed). Extract ALL questions visible in the image with hierarchical structure.`;

    try {
      // Send file to Gemini (it can handle both PDFs and images)
      const { object: result } = await generateObject({
        model: PDF_ANALYSIS_MODEL,
        system: QUESTION_EXTRACTION_PROMPT,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `${contextText} For main questions with sub-questions (a, b, c...), extract separately and link them.`,
              },
              {
                type: "file",
                data: dataUrl,
                mediaType: mimeType,
              } as { type: "file"; data: string; mediaType: string },
            ],
          },
        ],
        schema: z.object({
          questions: z.array(
            z.object({
              questionText: z.string(),
              originalLanguage: z.enum(["en", "he"]),
              pageNumber: z.number().min(1),
              isSubQuestion: z.boolean().describe("true if this is a sub-question (a, b, c, etc.)"),
              subQuestionLabel: z.string().optional().describe("Label like 'a', 'b', 'c', 'א', 'ב'"),
              parentIndex: z.number().optional().describe("Index of parent question in this array"),
            })
          ),
        }),
        temperature: PDF_ANALYSIS_TEMPERATURE,
      });

      // First pass: map all questions to ExtractedQuestion format
      for (const q of result.questions) {
        allQuestions.push({
          questionText: q.questionText,
          originalLanguage: q.originalLanguage as OriginalLanguage,
          pageNumber: Math.min(q.pageNumber, pageCount),
          orderIndex: globalIndex++,
          isSubQuestion: q.isSubQuestion,
          subQuestionLabel: q.subQuestionLabel,
          parentIndex: q.parentIndex,
        });
      }

      // Second pass: fill in parent context for sub-questions
      for (const question of allQuestions) {
        if (question.isSubQuestion && question.parentIndex !== undefined) {
          const parent = allQuestions[question.parentIndex];
          if (parent && !parent.isSubQuestion) {
            question.parentContext = parent.questionText;
          }
        }
      }

      const fileLabel = fileType === "pdf" ? "PDF" : "image";
      console.log(`[PDF] Extracted ${allQuestions.length} questions from ${fileLabel} (${allQuestions.filter(q => q.isSubQuestion).length} sub-questions)`);
    } catch (error) {
      console.error("[PDF] Question extraction failed:", error);
      throw new Error(`Failed to extract questions from ${fileType === "pdf" ? "PDF" : "image"}`);
    }

    return allQuestions;
  }

  /**
   * Solve a single question (generates bilingual solution in one call)
   * For sub-questions, includes parent context in the prompt
   */
  static async solveQuestion(question: ExtractedQuestion): Promise<SolvedQuestion> {
    try {
      // Build prompt with parent context for sub-questions
      let questionPrompt: string;
      if (question.isSubQuestion && question.parentContext) {
        questionPrompt = `Solve this homework question:

CONTEXT (from main question):
${question.parentContext}

SUB-QUESTION ${question.subQuestionLabel || ""}:
${question.questionText}

Original language: ${question.originalLanguage}`;
      } else {
        questionPrompt = `Solve this homework question:\n\n${question.questionText}\n\nOriginal language: ${question.originalLanguage}`;
      }

      const { object: solution } = await generateObject({
        model: PDF_ANALYSIS_MODEL,
        system: QUESTION_SOLVING_PROMPT,
        prompt: questionPrompt,
        schema: solvedQuestionSchema,
        temperature: 0.4,
      });

      // Solution now includes both English and Hebrew directly
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
    } catch (error) {
      console.error("[PDF] Question solving failed:", error);
      throw new Error("Failed to solve question");
    }
  }

  /**
   * Retry processing for a failed homework
   */
  static async retryProcessing(
    homeworkId: string,
    userId: string
  ): Promise<{ success: boolean; questionCount: number; error?: string }> {
    // Verify the homework exists and belongs to user
    const homework = await HomeworkService.getHomeworkById(homeworkId);
    if (!homework) {
      return { success: false, questionCount: 0, error: "Homework not found" };
    }

    if (homework.userId !== userId) {
      return { success: false, questionCount: 0, error: "Unauthorized" };
    }

    if (homework.status !== "failed") {
      return { success: false, questionCount: 0, error: "Can only retry failed homeworks" };
    }

    // Start processing again
    return this.processHomework(homeworkId, userId);
  }
}
