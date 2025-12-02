// modules/homework/server/services/illustration.service.ts
// AI-powered illustration generation for homework questions using Vercel AI Gateway
// With smart decision logic to only generate images where they add value

import { gateway } from "ai";
import { generateText } from "ai";
import { createAdminClient } from "@/lib/appwrite/server";
import { APPWRITE_CONFIG } from "@/lib/appwrite/config";
import { ID } from "node-appwrite";
import type { QuestionClassification, QuestionCategory } from "../../types";

/**
 * Model configuration for illustration generation
 * Using Gemini 3 Pro Image (Nano Banana Pro) for high-quality native image generation
 * This model can generate images directly from text prompts
 */
const IMAGE_GENERATION_MODEL = gateway("google/gemini-3-pro-image");
const PROMPT_MODEL = gateway("google/gemini-2.5-flash");

/**
 * System prompt for generating illustration prompts
 * Converts physics/math questions into image generation prompts
 */
const PROMPT_GENERATION_SYSTEM = `You are an expert at creating image generation prompts for educational physics and math illustrations.

Your task: Convert homework questions into clear, specific prompts for generating helpful diagrams.

STYLE REQUIREMENTS:
- Clean, educational diagram style
- 2D vector-like appearance with clear lines
- Simple color palette: blue, red, green accents on white/light background
- No text labels in the image (we'll add labels separately)
- Focus on the physical setup and key elements
- Similar to textbook diagrams

CONTENT RULES:
1. For physics questions: Show the physical setup (objects, forces, motion, circuits, etc.)
2. For math questions: Show geometric shapes, graphs, or visual representations
3. Include arrows for forces, velocities, or directions when relevant
4. Show coordinate systems when helpful
5. Keep it simple - focus on understanding the problem setup

OUTPUT FORMAT:
Return ONLY the image generation prompt, no explanation.

EXAMPLES:
Question: "A ball is thrown at angle 45° with initial velocity 10 m/s. Find the maximum height."
Prompt: "Clean educational diagram showing projectile motion. A small ball with a curved dotted path arc against light blue sky, starting from ground level going up and back down. Include a velocity arrow at launch point at 45 degree angle, and a dashed vertical line showing maximum height. Simple 2D vector style, textbook illustration."

Question: "A block of mass m slides down a frictionless inclined plane at angle θ."
Prompt: "Simple physics diagram of inclined plane with a rectangular block sliding down. Show gravity force arrow pointing down, normal force arrow perpendicular to surface, and motion arrow along the slope. Clean 2D educational style with blue plane surface on white background."`;

/**
 * Illustration generation result
 */
export interface IllustrationResult {
  success: boolean;
  imageUrl?: string; // URL to stored image
  fileId?: string; // Appwrite storage file ID
  error?: string;
}

/**
 * Category-specific prompt templates
 * More targeted than generic "educational diagram"
 */
const CATEGORY_PROMPT_TEMPLATES: Record<QuestionCategory, string> = {
  physics_setup: `Clean physics diagram showing the physical scenario. Include relevant force arrows, motion paths, and coordinate system. Simple 2D vector style, textbook illustration with light background.`,
  geometry: `Precise geometric diagram with clearly labeled shapes, angles, and measurements. Use clean lines and minimal colors. Educational textbook style.`,
  graph: `Clear coordinate plane with properly drawn function curve or data points. Include axis labels and gridlines. Mathematical graph style.`,
  word_problem: `Simple illustration showing the real-world scenario described. Focus on key elements mentioned. Clean educational style.`,
  calculation: ``, // Usually no image needed
  proof: ``, // Usually no image needed
  definition: ``, // Usually no image needed
};

/**
 * Keywords that suggest visualization would help
 */
const VISUALIZATION_KEYWORDS = {
  physics: ["thrown", "slides", "falls", "rotates", "circuit", "force", "velocity", "acceleration", "projectile", "incline", "pendulum", "spring", "wave"],
  geometry: ["triangle", "circle", "rectangle", "angle", "perpendicular", "parallel", "tangent", "polygon", "area", "perimeter"],
  graph: ["graph", "plot", "curve", "function", "intersection", "maximum", "minimum", "asymptote"],
  diagram: ["shown in", "figure", "diagram", "illustrated", "as depicted"],
};

/**
 * Illustration Service
 * Generates physics/math illustrations for homework questions
 * Now with smart decision logic
 */
export class IllustrationService {
  /**
   * Determine if an image should be generated based on AI classification
   * @returns true if image would add value to the question
   */
  static shouldGenerateImage(
    classification: QuestionClassification,
    questionText: string
  ): boolean {
    // Quick check: if AI classified as not needed, respect that
    if (classification.visualizationNeed === "not_needed") {
      return false;
    }

    // Categories that typically don't need images
    const noImageCategories: QuestionCategory[] = ["calculation", "proof", "definition"];
    if (noImageCategories.includes(classification.questionCategory)) {
      // Double-check with keyword scan before rejecting
      return this.hasVisualizationKeywords(questionText);
    }

    // Categories that benefit from images
    const imageCategories: QuestionCategory[] = ["physics_setup", "geometry", "graph"];
    if (imageCategories.includes(classification.questionCategory)) {
      return true;
    }

    // For word problems, check if they involve physical/spatial concepts
    if (classification.questionCategory === "word_problem") {
      return this.hasVisualizationKeywords(questionText);
    }

    // Default: generate if AI said required or helpful
    // At this point, visualizationNeed is either "required" or "helpful"
    return true;
  }

  /**
   * Check if question text contains keywords suggesting visualization would help
   */
  private static hasVisualizationKeywords(questionText: string): boolean {
    const lowerText = questionText.toLowerCase();

    for (const keywords of Object.values(VISUALIZATION_KEYWORDS)) {
      for (const keyword of keywords) {
        if (lowerText.includes(keyword)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Generate a targeted prompt based on question category and visualization reason
   * More specific than the generic approach
   */
  static generateTargetedPromptPrefix(
    category: QuestionCategory,
    visualizationReason?: string
  ): string {
    // Start with category-specific template
    let prefix = CATEGORY_PROMPT_TEMPLATES[category] || "";

    // Add visualization reason if provided
    if (visualizationReason) {
      prefix = `${visualizationReason}. ${prefix}`;
    }

    return prefix;
  }

  /**
   * Generate an illustration for a homework question
   * @param questionText The question text (including context for sub-questions)
   * @param subject Detected subject (e.g., "Physics 1", "Calculus")
   * @param userId User ID for storage permissions
   * @param classification Optional classification for targeted prompt generation
   */
  static async generateIllustration(
    questionText: string,
    subject: string,
    userId: string,
    classification?: QuestionClassification
  ): Promise<IllustrationResult> {
    console.log(`[Illustration] Generating for subject: ${subject}, category: ${classification?.questionCategory || "unknown"}`);

    // If classification provided, use targeted prompt prefix
    const targetedPrefix = classification
      ? this.generateTargetedPromptPrefix(
          classification.questionCategory,
          classification.visualizationReason
        )
      : "";

    try {
      // Step 1: Generate an optimized prompt for the image model
      // Use targeted prefix if available from classification
      const promptInstruction = targetedPrefix
        ? `Generate an image prompt for this ${subject} question. Focus on: ${targetedPrefix}\n\nQuestion:\n${questionText}`
        : `Generate an image prompt for this ${subject} question:\n\n${questionText}`;

      const promptResult = await generateText({
        model: PROMPT_MODEL,
        system: PROMPT_GENERATION_SYSTEM,
        prompt: promptInstruction,
        temperature: 0.5,
        maxOutputTokens: 256,
      });

      const imagePrompt = promptResult.text.trim();
      console.log(`[Illustration] Generated prompt: ${imagePrompt.substring(0, 100)}...`);

      // Step 2: Generate the illustration using Gemini Flash Image
      // This model generates images inline with text responses
      const imageResult = await generateText({
        model: IMAGE_GENERATION_MODEL,
        prompt: `Generate an educational physics/math diagram: ${imagePrompt}`,
        temperature: 0.7,
      });

      // Extract image from the response (Gemini returns images in the response)
      const imageFile = imageResult.files?.[0];
      if (!imageFile || !imageFile.base64) {
        throw new Error("No image generated");
      }

      const generatedImage = {
        base64: imageFile.base64,
        mediaType: imageFile.mediaType || "image/png",
      };

      // Step 3: Upload to Appwrite storage
      const { storage } = await createAdminClient();
      const fileId = ID.unique();

      // Convert base64 to buffer
      const imageBuffer = Buffer.from(generatedImage.base64, "base64");

      // Use InputFile from node-appwrite/file for server-side upload
      const { InputFile } = await import("node-appwrite/file");
      const inputFile = InputFile.fromBuffer(imageBuffer, `illustration-${fileId}.png`);

      await storage.createFile(
        APPWRITE_CONFIG.buckets.userFiles,
        fileId,
        inputFile,
        // Illustrations are AI-generated educational diagrams - make them publicly readable
        // but only the owner can delete them
        [`read("any")`, `delete("user:${userId}")`]
      );

      // Generate a public URL for the image
      const imageUrl = `${APPWRITE_CONFIG.endpoint}/storage/buckets/${APPWRITE_CONFIG.buckets.userFiles}/files/${fileId}/view?project=${APPWRITE_CONFIG.projectId}`;

      console.log(`[Illustration] Generated and stored: ${fileId}`);

      return {
        success: true,
        imageUrl,
        fileId,
      };
    } catch (error) {
      console.error("[Illustration] Generation failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Illustration generation failed",
      };
    }
  }

  /**
   * Generate illustrations for questions that need them
   * Now uses smart decision logic based on classification
   * @param questions Array of questions with their context and classification
   * @param userId User ID for storage
   */
  static async generateBatchIllustrations(
    questions: Array<{
      questionId: string;
      questionText: string;
      subject: string;
      isSubQuestion: boolean;
      classification?: QuestionClassification;
    }>,
    userId: string
  ): Promise<Map<string, IllustrationResult>> {
    const results = new Map<string, IllustrationResult>();

    // Filter questions that actually need illustrations
    const questionsNeedingImages = questions.filter((q) => {
      // Skip sub-questions (they share parent's context)
      if (q.isSubQuestion) return false;

      // Use smart decision if classification available
      if (q.classification) {
        return this.shouldGenerateImage(q.classification, q.questionText);
      }

      // Fallback: generate for all main questions (legacy behavior)
      return true;
    });

    console.log(
      `[Illustration] Generating ${questionsNeedingImages.length}/${questions.length} illustrations (smart filtering)`
    );

    // Process sequentially to avoid rate limits
    for (const question of questionsNeedingImages) {
      try {
        const result = await this.generateIllustration(
          question.questionText,
          question.subject,
          userId,
          question.classification
        );
        results.set(question.questionId, result);

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`[Illustration] Failed for question ${question.questionId}:`, error);
        results.set(question.questionId, {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return results;
  }

  /**
   * Delete an illustration from storage
   */
  static async deleteIllustration(fileId: string): Promise<boolean> {
    try {
      const { storage } = await createAdminClient();
      await storage.deleteFile(APPWRITE_CONFIG.buckets.userFiles, fileId);
      console.log(`[Illustration] Deleted: ${fileId}`);
      return true;
    } catch (error) {
      console.error(`[Illustration] Failed to delete ${fileId}:`, error);
      return false;
    }
  }
}
