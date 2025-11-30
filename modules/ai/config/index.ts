// modules/ai/config/index.ts
// AI model configuration - Using Vercel AI Gateway

import { gateway } from "ai";

/**
 * Gateway configuration for failover and analytics
 */
export const GATEWAY_CONFIG = {
  primaryModel: "google/gemini-2.5-flash",
  fallbackModel: "anthropic/claude-sonnet-4",
  providers: ["google", "anthropic"],
};

/**
 * Default model for question generation and analysis
 * Using Vercel AI Gateway
 */
export const QUESTION_GENERATION_CONFIG = {
  model: gateway(GATEWAY_CONFIG.primaryModel),
  temperature: 0.7,
  maxTokens: 1024,
};

/**
 * Model config for Socratic tutoring (more creative)
 */
export const SOCRATIC_TUTOR_CONFIG = {
  model: gateway(GATEWAY_CONFIG.primaryModel),
  temperature: 0.8,
  maxTokens: 256,
};

/**
 * Model config for image analysis
 */
export const IMAGE_ANALYSIS_CONFIG = {
  model: gateway(GATEWAY_CONFIG.primaryModel),
  temperature: 0.3, // Lower temperature for more precise analysis
  maxTokens: 1024,
};

/**
 * Create gateway provider options with analytics and failover
 */
export function createGatewayOptions(params: {
  userId?: string;
  tags?: string[];
  enableFailover?: boolean;
}) {
  return {
    gateway: {
      ...(params.userId && { user: params.userId }),
      ...(params.tags && { tags: params.tags }),
      ...(params.enableFailover && {
        order: [...GATEWAY_CONFIG.providers],
        models: [GATEWAY_CONFIG.primaryModel, GATEWAY_CONFIG.fallbackModel],
      }),
    },
  };
}

export * from "./prompts";
