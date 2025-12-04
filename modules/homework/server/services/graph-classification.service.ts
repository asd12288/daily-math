// modules/homework/server/services/graph-classification.service.ts
// AI-powered detection of graphable equations in homework questions

import { generateObject, createGateway } from "ai";
import { z } from "zod/v4";
import type { GraphType } from "../../types";

/**
 * Vercel AI Gateway configuration
 */
const gateway = createGateway({
  apiKey: process.env.AI_GATEWAY_API_KEY ?? "",
});

// Use Gemini 2.0 Flash for fast classification
const CLASSIFICATION_MODEL = gateway("google/gemini-2.0-flash");
const CLASSIFICATION_TEMPERATURE = 0.2; // Low for consistency

/**
 * System prompt for graph classification
 */
const GRAPH_CLASSIFICATION_PROMPT = `You are an expert at analyzing mathematical questions to determine if they contain graphable functions.

WHAT IS GRAPHABLE:
1. Explicit functions: y = f(x), f(x) = expression, g(x) = ...
2. Limit questions: Extract the function from lim_{x→a} f(x) → the f(x) is graphable
3. Derivative questions: Extract original function f(x) from f'(x) or df/dx
4. Integral questions: Extract the integrand function
5. Polynomial expressions: x², x³ + 2x, etc.
6. Trigonometric: sin(x), cos(x), tan(x)
7. Exponential/Logarithmic: e^x, 2^x, ln(x), log(x)
8. Rational functions: 1/(x+1), (x²-1)/(x+1)

NOT GRAPHABLE:
- Pure arithmetic: "Calculate 3 + 5"
- Matrix/vector operations
- Pure proofs without specific functions
- Word problems without explicit mathematical functions
- Questions asking for definitions only

EXTRACTION RULES:
- Extract the function in JavaScript-parseable format
- Use ** for exponents: x² → x**2
- Use Math functions: sin → Math.sin, cos → Math.cos, etc.
- Use Math.sqrt for square roots
- Use Math.log for natural log (ln), Math.log10 for log base 10
- Use Math.exp for e^x
- For fractions: a/b stays as a/b, use parentheses: (x+1)/(x-1)

EXAMPLES:
- "Find lim_{x→0} sin(x)/x" → graphableFunction: "Math.sin(x)/x", graphType: "limit"
- "Find f'(x) for f(x) = x³ - 2x" → graphableFunction: "x**3 - 2*x", graphType: "derivative"
- "Graph y = 2x + 1" → graphableFunction: "2*x + 1", graphType: "polynomial"
- "Evaluate ∫x²dx" → graphableFunction: "x**2", graphType: "integral"

DOMAIN SUGGESTIONS:
- Trigonometric: [-6.28, 6.28] (approximately -2π to 2π)
- Logarithmic: [0.1, 10] (must be positive)
- Polynomial: [-5, 5] (standard range)
- Rational with asymptotes: avoid the asymptote`;

/**
 * Zod schema for graph classification response
 */
const graphClassificationSchema = z.object({
  graphable: z.boolean().describe("Is there a function that can be graphed?"),
  graphableFunction: z
    .string()
    .optional()
    .describe("The function in JavaScript format, e.g., 'x**2 + 2*x' or 'Math.sin(x)'"),
  graphType: z
    .enum([
      "polynomial",
      "rational",
      "trigonometric",
      "exponential",
      "logarithmic",
      "limit",
      "derivative",
      "integral",
      "other",
    ])
    .optional()
    .describe("Type of mathematical function"),
  graphDomainMin: z.number().optional().describe("Suggested minimum x value"),
  graphDomainMax: z.number().optional().describe("Suggested maximum x value"),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe("Confidence in the detection (0-1)"),
});

type GraphClassificationResult = z.infer<typeof graphClassificationSchema>;

/**
 * Graph classification result with proper typing
 */
export interface GraphClassification {
  graphable: boolean;
  graphableFunction?: string;
  graphType?: GraphType;
  graphDomain?: [number, number];
  confidence: number;
}

/**
 * Service for AI-powered graph detection in homework questions
 */
export class GraphClassificationService {
  /**
   * Classify a single question for graphability
   */
  static async classifyQuestion(questionText: string): Promise<GraphClassification> {
    try {
      const { object: result } = await generateObject({
        model: CLASSIFICATION_MODEL,
        system: GRAPH_CLASSIFICATION_PROMPT,
        prompt: `Analyze this math question for graphable content:\n\n${questionText}`,
        schema: graphClassificationSchema,
        temperature: CLASSIFICATION_TEMPERATURE,
      });

      return this.transformResult(result);
    } catch (error) {
      console.error("[GraphClassification] Failed to classify question:", error);
      return { graphable: false, confidence: 0 };
    }
  }

  /**
   * Batch classify multiple questions for performance
   * Processes in parallel with concurrency limit
   */
  static async classifyBatch(
    questions: Array<{ orderIndex: number; questionText: string }>
  ): Promise<Map<number, GraphClassification>> {
    const results = new Map<number, GraphClassification>();

    if (questions.length === 0) {
      return results;
    }

    console.log(`[GraphClassification] Classifying ${questions.length} questions for graphability`);
    const startTime = Date.now();

    // Process in parallel batches to balance speed and API limits
    const BATCH_SIZE = 5;

    for (let i = 0; i < questions.length; i += BATCH_SIZE) {
      const batch = questions.slice(i, i + BATCH_SIZE);

      const batchResults = await Promise.all(
        batch.map(async (q) => {
          const classification = await this.classifyQuestion(q.questionText);
          return { orderIndex: q.orderIndex, classification };
        })
      );

      for (const { orderIndex, classification } of batchResults) {
        results.set(orderIndex, classification);
      }
    }

    const duration = Date.now() - startTime;
    const graphableCount = Array.from(results.values()).filter((r) => r.graphable).length;
    console.log(
      `[GraphClassification] Completed in ${duration}ms. Found ${graphableCount}/${questions.length} graphable questions`
    );

    return results;
  }

  /**
   * Transform AI result to our interface
   */
  private static transformResult(result: GraphClassificationResult): GraphClassification {
    return {
      graphable: result.graphable,
      graphableFunction: result.graphableFunction,
      graphType: result.graphType as GraphType | undefined,
      graphDomain:
        result.graphDomainMin !== undefined && result.graphDomainMax !== undefined
          ? [result.graphDomainMin, result.graphDomainMax]
          : undefined,
      confidence: result.confidence,
    };
  }

  /**
   * Validate that a function string can be parsed and executed
   * Used as a safety check before rendering graphs
   */
  static validateFunction(funcStr: string): boolean {
    try {
      // Create the function
      const fn = new Function("x", `return ${funcStr}`) as (x: number) => number;

      // Test with a few values
      const testValues = [0, 1, -1, 0.5, 2];
      for (const x of testValues) {
        const result = fn(x);
        // Check it returns a valid number (NaN is ok for some x values like sqrt(-1))
        if (typeof result !== "number") {
          return false;
        }
      }

      return true;
    } catch {
      return false;
    }
  }
}
