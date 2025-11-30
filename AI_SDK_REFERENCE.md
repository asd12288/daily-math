# Vercel AI SDK Complete Reference - 2025

This document provides comprehensive reference for the Vercel AI SDK (package: `ai`) with focus on `generateText`, `generateObject`, Google Gemini integration, image analysis, and best practices for the DailyMath project.

**Last Updated:** November 2025
**AI SDK Version:** 5.x
**Target Models:** Gemini 2.0 Flash, Gemini 2.5 Flash

---

## Table of Contents

1. [Installation & Setup](#installation--setup)
2. [Google Gemini Provider](#google-gemini-provider)
3. [generateText API](#generatetext-api)
4. [generateObject API](#generateobject-api)
5. [Streaming APIs](#streaming-apis)
6. [Image & Vision Capabilities](#image--vision-capabilities)
7. [Error Handling](#error-handling)
8. [Best Practices](#best-practices)
9. [DailyMath Use Cases](#dailymath-use-cases)

---

## Installation & Setup

### Install Dependencies

```bash
npm install ai @ai-sdk/google zod
```

### Environment Variables

```bash
# .env.local
GOOGLE_GENERATIVE_AI_API_KEY=your-api-key-here
```

Get a free API key at [Google AI Studio](https://makersuite.google.com/app/apikey).

### Basic Import Pattern

```typescript
import { generateText, generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
```

---

## Google Gemini Provider

### Provider Setup

```typescript
import { google } from '@ai-sdk/google';

// Use default instance
const model = google('gemini-2.5-flash');

// Or create custom instance
import { createGoogleGenerativeAI } from '@ai-sdk/google';
const customGoogle = createGoogleGenerativeAI({
  baseURL: 'https://generativelanguage.googleapis.com/v1beta',
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  headers: { 'X-Custom-Header': 'value' },
});
```

### Available Models

| Model | ID | Best For | Features |
|-------|-----|----------|----------|
| **Gemini 2.5 Flash** | `gemini-2.5-flash` | Fast, efficient tasks | Multimodal, reasoning, image generation |
| **Gemini 2.5 Pro** | `gemini-2.5-pro` | Complex reasoning | Advanced analysis |
| **Gemini 2.0 Flash** | `gemini-2.0-flash` | Balanced performance | Multimodal support |

**Recommendation for DailyMath:** Use `gemini-2.5-flash` for question generation and answer verification.

### Model Configuration Options

```typescript
const result = await generateText({
  model: google('gemini-2.5-flash'),
  prompt: 'Your prompt',

  // Provider-specific options
  providerOptions: {
    google: {
      // Thinking/reasoning configuration
      thinkingConfig: {
        thinkingBudget: 8192,      // Max thinking tokens
        includeThoughts: true,      // Include reasoning in response
      },

      // Search grounding (requires google_search tool)
      searchGrounding: true,

      // Embedding options (for embedding models)
      outputDimensionality: 512,
      taskType: 'SEMANTIC_SIMILARITY',
    },
  },
});
```

---

## generateText API

### Function Signature

```typescript
function generateText(options: GenerateTextOptions): Promise<GenerateTextResult>
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `model` | `LanguageModelV1` | Yes | Model instance (e.g., `google('gemini-2.5-flash')`) |
| `prompt` | `string` | Yes* | Simple text prompt |
| `messages` | `Message[]` | Yes* | Conversation messages (use instead of prompt) |
| `system` | `string` | No | System prompt to define behavior |
| `maxOutputTokens` | `number` | No | Maximum tokens to generate |
| `temperature` | `number` | No | Sampling temperature (0-2, default 1) |
| `topP` | `number` | No | Nucleus sampling (0-1) |
| `topK` | `number` | No | Top-K sampling |
| `presencePenalty` | `number` | No | Penalize repeated topics |
| `frequencyPenalty` | `number` | No | Penalize repeated tokens |
| `stopSequences` | `string[]` | No | Stop generation at these sequences |
| `seed` | `number` | No | Deterministic generation seed |
| `tools` | `Record<string, Tool>` | No | Available tools/functions |
| `toolChoice` | `ToolChoice` | No | Tool selection strategy |
| `maxRetries` | `number` | No | Retry attempts (default: 2) |
| `abortSignal` | `AbortSignal` | No | Cancel operation |
| `headers` | `Record<string, string>` | No | Custom HTTP headers |

*Either `prompt` or `messages` is required, not both.

### Return Type

```typescript
interface GenerateTextResult {
  text: string;                          // Generated text
  reasoning?: string[];                  // Reasoning steps (if available)
  reasoningText?: string;                // Combined reasoning
  toolCalls: ToolCall[];                 // Tool invocations
  toolResults: ToolResult[];             // Tool execution results
  finishReason: FinishReason;            // Why generation stopped
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    reasoningTokens?: number;            // Gemini 2.5 thinking tokens
    cachedInputTokens?: number;
  };
  sources?: Source[];                    // RAG sources (if grounding used)
  files?: GeneratedFile[];               // Generated files (Gemini 2.5 images)
  messages: Message[];                   // Full conversation history
  steps: Step[];                         // Multi-step details
  response: {
    headers: Record<string, string>;
    body: unknown;
  };
}
```

### Basic Example

```typescript
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

const { text } = await generateText({
  model: google('gemini-2.5-flash'),
  prompt: 'Explain the derivative of x^2 step by step.',
});

console.log(text);
```

### Advanced Example with System Prompt

```typescript
const { text, usage } = await generateText({
  model: google('gemini-2.5-flash'),
  system: 'You are a calculus tutor. Explain concepts clearly with examples.',
  prompt: 'What is the chain rule?',
  temperature: 0.7,
  maxOutputTokens: 500,
});

console.log('Response:', text);
console.log('Tokens used:', usage.totalTokens);
```

### Multi-Step Generation (Agent Pattern)

```typescript
const { text, steps } = await generateText({
  model: google('gemini-2.5-flash'),
  tools: {
    calculator: {
      description: 'Perform mathematical calculations',
      inputSchema: z.object({
        expression: z.string(),
      }),
      execute: async ({ expression }) => {
        return { result: eval(expression) }; // Use safe eval in production
      },
    },
  },
  prompt: 'Calculate (5 + 3) * 2 and explain the result',
  maxSteps: 5, // Allow multi-step reasoning
});

console.log('Final answer:', text);
console.log('Steps taken:', steps.length);
```

---

## generateObject API

### Function Signature

```typescript
function generateObject<T>(options: GenerateObjectOptions): Promise<GenerateObjectResult<T>>
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `model` | `LanguageModelV1` | Yes | Model instance |
| `schema` | `ZodSchema<T>` | Yes | Zod schema defining output structure |
| `prompt` | `string` | Yes | Generation instructions |
| `schemaName` | `string` | No | Schema identifier for the LLM |
| `schemaDescription` | `string` | No | Schema documentation |
| `system` | `string` | No | System prompt |
| `maxOutputTokens` | `number` | No | Token limit |
| `temperature` | `number` | No | Sampling temperature |
| `output` | `OutputStrategy` | No | 'object' (default), 'array', 'enum', 'no-schema' |
| `providerOptions` | `object` | No | Provider-specific settings |

### Return Type

```typescript
interface GenerateObjectResult<T> {
  object: T;                             // Generated & validated object
  reasoning?: string;                    // Model's reasoning (if available)
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  response: {
    headers: Record<string, string>;
    body: unknown;
  };
}
```

### Basic Example

```typescript
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

const exerciseSchema = z.object({
  question: z.string().describe('The calculus question in LaTeX format'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  topic: z.string(),
  solution: z.string().describe('Step-by-step solution'),
  answer: z.string().describe('Final answer'),
  hints: z.array(z.string()).describe('Helpful hints for solving'),
});

const { object } = await generateObject({
  model: google('gemini-2.5-flash'),
  schema: exerciseSchema,
  prompt: `Generate a medium difficulty calculus exercise about derivatives.
           Use LaTeX notation for mathematical expressions.`,
});

console.log('Question:', object.question);
console.log('Answer:', object.answer);
console.log('Hints:', object.hints);
```

### Complex Nested Schema

```typescript
const recipeSchema = z.object({
  recipe: z.object({
    name: z.string().describe('Recipe name'),
    servings: z.number().describe('Number of servings'),
    prepTime: z.number().describe('Preparation time in minutes'),
    ingredients: z.array(
      z.object({
        name: z.string(),
        amount: z.string(),
        unit: z.string(),
      })
    ).describe('List of ingredients'),
    steps: z.array(z.string()).describe('Cooking instructions'),
    nutrition: z.object({
      calories: z.number(),
      protein: z.number(),
      carbs: z.number(),
      fat: z.number(),
    }).optional(),
  }),
});

const { object } = await generateObject({
  model: google('gemini-2.5-flash'),
  schema: recipeSchema,
  schemaName: 'Recipe',
  schemaDescription: 'A complete recipe with ingredients and nutrition',
  prompt: 'Generate a healthy vegetarian lasagna recipe for 4 people.',
});
```

### Array Output Strategy

```typescript
const heroSchema = z.object({
  name: z.string(),
  class: z.string(),
  level: z.number(),
  description: z.string(),
});

const { object } = await generateObject({
  model: google('gemini-2.5-flash'),
  schema: heroSchema,
  output: 'array', // Generate array of objects
  prompt: 'Generate 5 RPG character heroes with different classes.',
});

// object is now an array: Hero[]
object.forEach(hero => console.log(`${hero.name} - Level ${hero.level} ${hero.class}`));
```

### Enum Output Strategy

```typescript
const { object } = await generateObject({
  model: google('gemini-2.5-flash'),
  output: 'enum',
  enum: ['positive', 'negative', 'neutral'],
  prompt: 'Analyze the sentiment: "This product exceeded my expectations!"',
});

console.log('Sentiment:', object); // 'positive'
```

### Error Handling

```typescript
import { generateObject, NoObjectGeneratedError } from 'ai';

try {
  const { object } = await generateObject({
    model: google('gemini-2.5-flash'),
    schema: exerciseSchema,
    prompt: 'Generate an exercise',
  });

  console.log('Success:', object);
} catch (error) {
  if (NoObjectGeneratedError.isInstance(error)) {
    console.error('Generation failed');
    console.error('Cause:', error.cause);
    console.error('Raw text:', error.text);
    console.error('Usage:', error.usage);
    console.error('Response:', error.response);
  } else {
    throw error; // Re-throw unexpected errors
  }
}
```

---

## Streaming APIs

### streamText

For real-time text generation with immediate user feedback.

```typescript
import { streamText } from 'ai';
import { google } from '@ai-sdk/google';

const result = streamText({
  model: google('gemini-2.5-flash'),
  prompt: 'Write a story about a mathematician',
});

// Stream text chunks
for await (const chunk of result.textStream) {
  process.stdout.write(chunk);
}

// Or get full text after streaming
const finalText = await result.text;
```

### Convert to HTTP Response

```typescript
// In Next.js API route or tRPC procedure
export async function POST(req: Request) {
  const { prompt } = await req.json();

  const result = streamText({
    model: google('gemini-2.5-flash'),
    prompt,
  });

  // Return streaming response
  return result.toTextStreamResponse();
}
```

### streamObject

Stream partial objects as they're being generated.

```typescript
import { streamObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

const schema = z.object({
  recipe: z.object({
    name: z.string(),
    ingredients: z.array(z.string()),
    steps: z.array(z.string()),
  }),
});

const { partialObjectStream } = streamObject({
  model: google('gemini-2.5-flash'),
  schema,
  prompt: 'Generate a lasagna recipe',
});

// Stream partial objects (not validated until complete)
for await (const partialObject of partialObjectStream) {
  console.clear();
  console.log('Partial:', JSON.stringify(partialObject, null, 2));
}

// Get final validated object
const { object } = await result.object;
```

### Stream Array Elements

```typescript
const { elementStream } = streamObject({
  model: google('gemini-2.5-flash'),
  schema: z.object({
    name: z.string(),
    description: z.string(),
  }),
  output: 'array',
  prompt: 'Generate 10 calculus exercise topics',
});

// Stream complete elements as they arrive
for await (const element of elementStream) {
  console.log('Complete element:', element);
}
```

### Full Stream with Events

```typescript
const result = streamText({
  model: google('gemini-2.5-flash'),
  prompt: 'Explain calculus',
});

// Access all event types
for await (const part of result.fullStream) {
  switch (part.type) {
    case 'text-delta':
      process.stdout.write(part.textDelta);
      break;
    case 'tool-call':
      console.log('Tool called:', part.toolName);
      break;
    case 'error':
      console.error('Stream error:', part.error);
      break;
    case 'finish':
      console.log('Finish reason:', part.finishReason);
      break;
  }
}
```

---

## Image & Vision Capabilities

### Analyzing Images with generateText

```typescript
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import fs from 'fs';

const imageBuffer = fs.readFileSync('./solution.jpg');

const { text } = await generateText({
  model: google('gemini-2.5-flash'),
  messages: [
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: 'Analyze this handwritten calculus solution. Is it correct?'
        },
        {
          type: 'image',
          image: imageBuffer,
        },
      ],
    },
  ],
});

console.log('Analysis:', text);
```

### Analyzing Images with generateObject

```typescript
const analysisSchema = z.object({
  isCorrect: z.boolean().describe('Whether the solution is mathematically correct'),
  mistakes: z.array(z.object({
    location: z.string(),
    issue: z.string(),
    correction: z.string(),
  })).describe('List of mistakes found'),
  score: z.number().min(0).max(100).describe('Score out of 100'),
  feedback: z.string().describe('Constructive feedback for the student'),
});

const { object } = await generateObject({
  model: google('gemini-2.5-flash'),
  schema: analysisSchema,
  messages: [
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: 'Analyze this student\'s handwritten solution to the derivative problem: d/dx(x^3 + 2x)'
        },
        {
          type: 'image',
          image: imageBuffer,
        },
      ],
    },
  ],
});

console.log('Correct?', object.isCorrect);
console.log('Score:', object.score);
console.log('Mistakes:', object.mistakes);
console.log('Feedback:', object.feedback);
```

### Multiple Images

```typescript
const { text } = await generateText({
  model: google('gemini-2.5-flash'),
  messages: [
    {
      role: 'user',
      content: [
        { type: 'text', text: 'Compare these two solutions:' },
        { type: 'image', image: solution1Buffer },
        { type: 'image', image: solution2Buffer },
      ],
    },
  ],
});
```

### Image from URL (Gemini supports URLs)

```typescript
const { text } = await generateText({
  model: google('gemini-2.5-flash'),
  messages: [
    {
      role: 'user',
      content: [
        { type: 'text', text: 'Describe this diagram' },
        {
          type: 'image',
          image: new URL('https://example.com/diagram.png'),
        },
      ],
    },
  ],
});
```

### Convert FileList to Data URLs (for client-side)

```typescript
async function convertFilesToDataURLs(files: FileList) {
  return Promise.all(
    Array.from(files).map(
      file =>
        new Promise<{
          type: 'file';
          mediaType: string;
          url: string;
        }>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve({
              type: 'file',
              mediaType: file.type,
              url: reader.result as string,
            });
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        }),
    ),
  );
}

// Usage in form submission
const files = await convertFilesToDataURLs(fileInput.files);
const { text } = await generateText({
  model: google('gemini-2.5-flash'),
  messages: [
    {
      role: 'user',
      content: [
        { type: 'text', text: 'Analyze these images' },
        ...files,
      ],
    },
  ],
});
```

---

## Error Handling

### Error Types

The AI SDK provides specific error types for precise error handling:

| Error Type | Description | When It Occurs |
|------------|-------------|----------------|
| `APICallError` | API request failed | Network issues, rate limits, auth errors |
| `NoObjectGeneratedError` | Object generation failed | Schema validation failed, unparseable output |
| `NoSuchToolError` | Tool doesn't exist | Model tried to call undefined tool |
| `InvalidToolArgumentsError` | Tool arguments invalid | Schema validation failed for tool input |
| `ToolExecutionError` | Tool execution failed | Runtime error in tool execute function |
| `ToolCallRepairError` | Repair failed | Automatic repair couldn't fix tool call |

### Checking Error Types

```typescript
import {
  APICallError,
  NoObjectGeneratedError,
  NoSuchToolError,
  InvalidToolArgumentsError,
  ToolExecutionError,
} from 'ai';

try {
  const { object } = await generateObject({
    model: google('gemini-2.5-flash'),
    schema: mySchema,
    prompt: 'Generate data',
  });
} catch (error) {
  if (APICallError.isInstance(error)) {
    console.error('API call failed:', error.message);
    console.error('Status code:', error.statusCode);
    console.error('Is retryable?', error.isRetryable);
    console.error('Response data:', error.data);
  } else if (NoObjectGeneratedError.isInstance(error)) {
    console.error('Object generation failed');
    console.error('Cause:', error.cause);
    console.error('Raw text:', error.text);
    console.error('Usage:', error.usage);
  } else if (NoSuchToolError.isInstance(error)) {
    console.error('Tool not found:', error.toolName);
  } else if (InvalidToolArgumentsError.isInstance(error)) {
    console.error('Invalid tool args:', error.toolArgs);
    console.error('Validation error:', error.cause);
  } else if (ToolExecutionError.isInstance(error)) {
    console.error('Tool execution failed:', error.toolName);
    console.error('Error:', error.cause);
  } else {
    throw error; // Unknown error
  }
}
```

### Retry Pattern

```typescript
async function generateWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000,
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Check if retryable
      if (APICallError.isInstance(error) && !error.isRetryable) {
        throw error; // Don't retry non-retryable errors
      }

      if (i < maxRetries - 1) {
        // Exponential backoff
        const delay = delayMs * Math.pow(2, i);
        console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}

// Usage
const result = await generateWithRetry(() =>
  generateObject({
    model: google('gemini-2.5-flash'),
    schema: exerciseSchema,
    prompt: 'Generate exercise',
  })
);
```

### Handling Streaming Errors

```typescript
const result = streamText({
  model: google('gemini-2.5-flash'),
  prompt: 'Explain derivatives',
});

try {
  for await (const part of result.fullStream) {
    switch (part.type) {
      case 'error':
        console.error('Stream error:', part.error);
        // Handle gracefully
        break;

      case 'abort':
        console.log('Stream aborted by user');
        break;

      case 'text-delta':
        process.stdout.write(part.textDelta);
        break;
    }
  }
} catch (error) {
  // Errors before stream starts
  console.error('Failed to start stream:', error);
}
```

### Abort Signal Pattern

```typescript
const controller = new AbortController();

// Set timeout
setTimeout(() => controller.abort(), 30000); // 30 second timeout

try {
  const { text } = await generateText({
    model: google('gemini-2.5-flash'),
    prompt: 'Long generation task...',
    abortSignal: controller.signal,
  });
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('Generation timed out');
  } else {
    throw error;
  }
}
```

---

## Best Practices

### 1. Schema Design

**Use descriptive field names and descriptions:**

```typescript
// ❌ Bad
const schema = z.object({
  q: z.string(),
  a: z.string(),
  d: z.enum(['e', 'm', 'h']),
});

// ✅ Good
const schema = z.object({
  question: z.string().describe('The calculus question in LaTeX format with clear notation'),
  answer: z.string().describe('The final numerical or algebraic answer'),
  difficulty: z.enum(['easy', 'medium', 'hard']).describe('Difficulty level based on complexity'),
  explanation: z.string().describe('Step-by-step explanation of the solution process'),
});
```

### 2. Temperature Settings

| Task Type | Recommended Temperature | Reasoning |
|-----------|------------------------|-----------|
| Math/Logic | 0.2 - 0.4 | Need deterministic, correct answers |
| Creative Writing | 0.7 - 1.0 | Want variety and creativity |
| Code Generation | 0.3 - 0.5 | Balance correctness and variety |
| Classification | 0.1 - 0.3 | Consistent categorization |
| Structured Data | 0.2 - 0.5 | Predictable format adherence |

### 3. Token Management

```typescript
// Estimate tokens (rough: 1 token ≈ 4 characters)
const estimateTokens = (text: string) => Math.ceil(text.length / 4);

// Set appropriate limits
const { object } = await generateObject({
  model: google('gemini-2.5-flash'),
  schema: exerciseSchema,
  prompt: longPrompt,
  maxOutputTokens: 1024, // Prevent excessive generation
});
```

### 4. Prompt Engineering

**Be specific and structured:**

```typescript
const prompt = `
Generate a calculus exercise with the following requirements:

Topic: Derivatives of polynomial functions
Difficulty: Medium
Target Audience: First-year university students
Format Requirements:
- Use LaTeX notation for all mathematical expressions
- Include exactly 3 hints that progressively reveal the solution
- Provide a complete step-by-step solution
- The final answer should be in simplified form

Example format for hints:
1. Consider what rule applies to this type of function
2. Remember that d/dx(x^n) = nx^(n-1)
3. Apply the power rule to each term separately

Generate the exercise now:
`;

const { object } = await generateObject({
  model: google('gemini-2.5-flash'),
  schema: exerciseSchema,
  prompt,
  temperature: 0.5,
});
```

### 5. Validation Layers

```typescript
// Schema validation (AI SDK handles this)
const exerciseSchema = z.object({
  question: z.string().min(10),
  answer: z.string().min(1),
  difficulty: z.enum(['easy', 'medium', 'hard']),
});

// Business logic validation
function validateExercise(exercise: Exercise): boolean {
  // Check LaTeX validity
  if (!exercise.question.includes('\\') && !exercise.question.includes('$')) {
    throw new Error('Question must use LaTeX notation');
  }

  // Check reasonable length
  if (exercise.question.length > 1000) {
    throw new Error('Question too long');
  }

  return true;
}

const { object } = await generateObject({
  model: google('gemini-2.5-flash'),
  schema: exerciseSchema,
  prompt: 'Generate exercise',
});

validateExercise(object); // Additional validation
```

### 6. Caching Strategies

```typescript
// Simple in-memory cache for development
const cache = new Map<string, any>();

async function generateWithCache<T>(
  key: string,
  generator: () => Promise<T>,
  ttlMs = 3600000, // 1 hour
): Promise<T> {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < ttlMs) {
    return cached.value;
  }

  const value = await generator();
  cache.set(key, { value, timestamp: Date.now() });
  return value;
}

// Usage
const exercise = await generateWithCache(
  `exercise-${topic}-${difficulty}`,
  () => generateObject({
    model: google('gemini-2.5-flash'),
    schema: exerciseSchema,
    prompt: `Generate ${difficulty} ${topic} exercise`,
  })
);
```

### 7. Environment-Based Configuration

```typescript
// lib/ai-config.ts
import { google } from '@ai-sdk/google';

export const getAIModel = (task: 'generation' | 'analysis' | 'chat') => {
  const isDev = process.env.NODE_ENV === 'development';

  // Use faster/cheaper models in dev
  if (isDev) {
    return google('gemini-2.0-flash');
  }

  // Production: use optimal models per task
  switch (task) {
    case 'generation':
      return google('gemini-2.5-flash');
    case 'analysis':
      return google('gemini-2.5-pro');
    case 'chat':
      return google('gemini-2.5-flash');
  }
};

export const getDefaultConfig = (task: string) => ({
  temperature: task === 'generation' ? 0.7 : 0.3,
  maxOutputTokens: task === 'chat' ? 500 : 2048,
  maxRetries: 3,
});
```

---

## DailyMath Use Cases

### 1. Exercise Generation

```typescript
// modules/ai-generation/server/services/generate-exercise.ts
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

const exerciseSchema = z.object({
  question: z.string().describe('Question in LaTeX format'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  topic: z.string(),
  subtopic: z.string().optional(),
  solution: z.string().describe('Complete step-by-step solution with LaTeX'),
  answer: z.string().describe('Final answer'),
  hints: z.array(z.string()).min(2).max(5).describe('Progressive hints'),
  estimatedMinutes: z.number().min(1).max(60),
  requiredKnowledge: z.array(z.string()).describe('Prerequisites'),
  tags: z.array(z.string()).optional(),
});

export type Exercise = z.infer<typeof exerciseSchema>;

export async function generateExercise(
  topic: string,
  difficulty: 'easy' | 'medium' | 'hard',
  courseName: string,
) {
  const prompt = `
Generate a ${difficulty} difficulty calculus exercise for university students.

Course: ${courseName}
Topic: ${topic}
Difficulty: ${difficulty}

Requirements:
1. Use proper LaTeX notation for all mathematical expressions
2. The question should test understanding, not just memorization
3. Provide a complete solution showing all steps
4. Include 3-4 progressive hints that guide without giving away the answer
5. Estimate solving time realistically for a student at this level
6. List required prerequisite knowledge

Examples of ${difficulty} questions:
${getExamplesByDifficulty(difficulty)}

Generate the exercise now:
`;

  try {
    const { object, usage } = await generateObject({
      model: google('gemini-2.5-flash'),
      schema: exerciseSchema,
      prompt,
      temperature: 0.6, // Some creativity, but consistent
      maxOutputTokens: 2048,
    });

    console.log(`Exercise generated (${usage.totalTokens} tokens)`);
    return object;
  } catch (error) {
    console.error('Exercise generation failed:', error);
    throw error;
  }
}

function getExamplesByDifficulty(difficulty: string): string {
  const examples = {
    easy: `
- Find f'(x) for f(x) = 3x^2 + 2x - 1
- Evaluate the limit: lim(x→2) (x^2 - 4)/(x - 2)
`,
    medium: `
- Find the derivative using the chain rule: f(x) = (2x^2 + 1)^5
- Determine critical points of f(x) = x^3 - 3x^2 + 2
`,
    hard: `
- Prove the derivative of sin(x) using first principles
- Find the area between curves y = x^2 and y = √x
`,
  };
  return examples[difficulty] || examples.medium;
}
```

### 2. Handwritten Solution Analysis

```typescript
// modules/ai-generation/server/services/analyze-solution.ts
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

const analysisSchema = z.object({
  isCorrect: z.boolean().describe('Overall correctness'),
  score: z.number().min(0).max(100).describe('Score out of 100'),
  correctSteps: z.array(z.string()).describe('Steps done correctly'),
  mistakes: z.array(z.object({
    step: z.string().describe('Which step has the mistake'),
    issue: z.string().describe('What is wrong'),
    correction: z.string().describe('How to fix it'),
    severity: z.enum(['minor', 'major', 'critical']),
  })),
  feedback: z.string().describe('Constructive feedback'),
  suggestions: z.array(z.string()).describe('Study suggestions'),
  estimatedUnderstanding: z.enum(['beginner', 'intermediate', 'advanced']),
});

export type SolutionAnalysis = z.infer<typeof analysisSchema>;

export async function analyzeSolution(
  imageBuffer: Buffer,
  question: string,
  correctAnswer: string,
  solution: string,
) {
  const prompt = `
You are an expert calculus tutor analyzing a student's handwritten solution.

Original Question: ${question}
Correct Answer: ${correctAnswer}
Model Solution: ${solution}

Analyze the student's handwritten work in the image:
1. Check mathematical correctness of each step
2. Identify calculation errors, conceptual mistakes, or notation issues
3. Provide constructive, encouraging feedback
4. Suggest topics to review if mistakes indicate knowledge gaps
5. Assign a fair score (0-100) based on correctness and approach

Be patient and supportive - remember this is for learning, not judgement.
`;

  try {
    const { object, usage } = await generateObject({
      model: google('gemini-2.5-flash'), // Vision capable
      schema: analysisSchema,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image', image: imageBuffer },
          ],
        },
      ],
      temperature: 0.3, // Consistent grading
      maxOutputTokens: 1500,
    });

    console.log(`Analysis completed (${usage.totalTokens} tokens)`);
    return object;
  } catch (error) {
    console.error('Solution analysis failed:', error);
    throw error;
  }
}
```

### 3. AI Hint Generation (Progressive Disclosure)

```typescript
// modules/ai-generation/server/services/generate-hint.ts
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

export async function generateHint(
  question: string,
  hintLevel: 1 | 2 | 3,
  previousHints: string[] = [],
) {
  const hintDescriptions = {
    1: 'subtle nudge - identify which concept or rule to use',
    2: 'moderate help - show the first step or formula',
    3: 'strong hint - reveal most of the approach without full solution',
  };

  const prompt = `
Question: ${question}

Previous hints given:
${previousHints.map((h, i) => `${i + 1}. ${h}`).join('\n')}

Generate hint level ${hintLevel} (${hintDescriptions[hintLevel]}).

Requirements:
- Don't repeat previous hints
- Don't give away the complete solution
- Guide the student's thinking process
- Use encouraging language
- Maximum 2 sentences

Hint:
`;

  const { text } = await generateText({
    model: google('gemini-2.5-flash'),
    prompt,
    temperature: 0.5,
    maxOutputTokens: 150,
  });

  return text.trim();
}
```

### 4. Daily Set Generation (Batch)

```typescript
// modules/ai-generation/server/services/generate-daily-set.ts
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

const dailySetSchema = z.object({
  exercises: z.array(z.object({
    question: z.string(),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    topic: z.string(),
    solution: z.string(),
    answer: z.string(),
    hints: z.array(z.string()),
    estimatedMinutes: z.number(),
  })),
  totalEstimatedMinutes: z.number(),
  difficultyDistribution: z.object({
    easy: z.number(),
    medium: z.number(),
    hard: z.number(),
  }),
});

export async function generateDailySet(
  count: number,
  topics: string[],
  userLevel: number, // 1-10
) {
  // Determine difficulty distribution based on user level
  const distribution = getDifficultyDistribution(userLevel, count);

  const prompt = `
Generate ${count} calculus exercises for a daily practice set.

Topics to cover: ${topics.join(', ')}
User Level: ${userLevel}/10

Difficulty Distribution:
- Easy: ${distribution.easy} exercises
- Medium: ${distribution.medium} exercises
- Hard: ${distribution.hard} exercises

Requirements:
1. Diverse topics - don't repeat the same type of problem
2. Progressive difficulty throughout the set
3. Total estimated time should be reasonable (15-30 minutes for most users)
4. Each exercise must be complete with solution and hints
5. Use LaTeX for mathematical notation

Generate the complete set:
`;

  const { object } = await generateObject({
    model: google('gemini-2.5-flash'),
    schema: dailySetSchema,
    prompt,
    temperature: 0.7, // More variety
    maxOutputTokens: 4096, // Large for multiple exercises
  });

  return object;
}

function getDifficultyDistribution(
  level: number,
  count: number,
): { easy: number; medium: number; hard: number } {
  if (level <= 3) {
    // Beginner: mostly easy
    return {
      easy: Math.ceil(count * 0.6),
      medium: Math.floor(count * 0.3),
      hard: Math.floor(count * 0.1),
    };
  } else if (level <= 7) {
    // Intermediate: balanced
    return {
      easy: Math.floor(count * 0.2),
      medium: Math.ceil(count * 0.6),
      hard: Math.floor(count * 0.2),
    };
  } else {
    // Advanced: harder problems
    return {
      easy: Math.floor(count * 0.1),
      medium: Math.floor(count * 0.4),
      hard: Math.ceil(count * 0.5),
    };
  }
}
```

### 5. tRPC Integration Pattern

```typescript
// modules/ai-generation/server/procedures.ts
import { createTRPCRouter, protectedProcedure } from '@/trpc/init';
import { z } from 'zod';
import { generateExercise } from './services/generate-exercise';
import { analyzeSolution } from './services/analyze-solution';
import { TRPCError } from '@trpc/server';

export const aiRouter = createTRPCRouter({
  generateExercise: protectedProcedure
    .input(z.object({
      topic: z.string(),
      difficulty: z.enum(['easy', 'medium', 'hard']),
      courseName: z.string(),
    }))
    .mutation(async ({ input }) => {
      try {
        const exercise = await generateExercise(
          input.topic,
          input.difficulty,
          input.courseName,
        );
        return exercise;
      } catch (error) {
        console.error('Exercise generation error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate exercise',
          cause: error,
        });
      }
    }),

  analyzeSolution: protectedProcedure
    .input(z.object({
      imageBase64: z.string(),
      questionId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Fetch question details from database
        const question = await ctx.db.getQuestion(input.questionId);
        if (!question) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Question not found',
          });
        }

        // Convert base64 to buffer
        const imageBuffer = Buffer.from(input.imageBase64, 'base64');

        const analysis = await analyzeSolution(
          imageBuffer,
          question.question,
          question.answer,
          question.solution,
        );

        return analysis;
      } catch (error) {
        console.error('Solution analysis error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to analyze solution',
          cause: error,
        });
      }
    }),
});
```

### 6. Client-Side Usage (React)

```typescript
// modules/practice/ui/components/ExerciseView.tsx
'use client';

import { trpc } from '@/trpc/client';
import { useState } from 'react';
import { Button } from '@/shared/ui';

export function ExerciseView({ exerciseId }: { exerciseId: string }) {
  const [imageFile, setImageFile] = useState<File | null>(null);

  const analyzeMutation = trpc.ai.analyzeSolution.useMutation({
    onSuccess: (analysis) => {
      alert(`Score: ${analysis.score}/100\n\n${analysis.feedback}`);
    },
  });

  const handleSubmit = async () => {
    if (!imageFile) return;

    // Convert to base64
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result?.toString().split(',')[1];
      if (!base64) return;

      await analyzeMutation.mutateAsync({
        imageBase64: base64,
        questionId: exerciseId,
      });
    };
    reader.readAsDataURL(imageFile);
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
      />
      <Button
        onClick={handleSubmit}
        isLoading={analyzeMutation.isPending}
        disabled={!imageFile}
      >
        Submit Solution
      </Button>
    </div>
  );
}
```

---

## Additional Resources

### Official Documentation
- [AI SDK Documentation](https://ai-sdk.dev/docs/introduction)
- [generateText Reference](https://ai-sdk.dev/docs/reference/ai-sdk-core/generate-text)
- [generateObject Reference](https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data)
- [Google Provider](https://ai-sdk.dev/providers/ai-sdk-providers/google-generative-ai)
- [Error Handling](https://ai-sdk.dev/docs/ai-sdk-core/error-handling)
- [Multi-Modal Guide](https://ai-sdk.dev/docs/guides/multi-modal-chatbot)

### GitHub & Community
- [GitHub Repository](https://github.com/vercel/ai)
- [NPM Package](https://www.npmjs.com/package/ai)
- [Vercel AI Blog](https://vercel.com/blog/ai-sdk-5)

### Examples & Templates
- [useObject Template](https://vercel.com/templates/next.js/use-object)
- [Google Gemini Cheatsheet](https://patloeber.com/gemini-ai-sdk-cheatsheet/)
- [Market Research Agent Example](https://ai.google.dev/gemini-api/docs/vercel-ai-sdk-example)

---

## Version History

- **November 2025**: Initial documentation for DailyMath project
- **AI SDK 5.x**: Latest stable version with SSE streaming
- **AI SDK 4.2**: Added Gemini 2.0 Flash image generation support
- **AI SDK 4.1**: Improved error handling with NoObjectGeneratedError

---

*This document is maintained as part of the DailyMath project. For updates and contributions, refer to the project repository.*
