import { storage } from "../storage";
import type { InsertPromptHistory } from "@shared/schema";

export interface PromptHistoryContext {
  userId?: number;
  sessionId?: string;
  feature: string;
  userPrompt?: string;
  systemPrompt?: string;
  fullPrompt?: string;
  requestData?: any;
  aiModel: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface PromptHistoryResponse {
  aiResponse: string;
  processedResponse?: string;
  parsedData?: any;
  tokensUsed?: number;
  promptTokens?: number;
  completionTokens?: number;
  generationTimeMs?: number;
  status?: 'success' | 'error' | 'partial';
  errorMessage?: string;
  responseLength?: number;
  parseSuccess?: boolean;
}

/**
 * Saves a prompt and its response to the prompt history database
 */
export async function savePromptHistory(
  context: PromptHistoryContext,
  response: PromptHistoryResponse
): Promise<void> {
  try {
    const promptHistoryEntry: InsertPromptHistory = {
      userId: context.userId,
      sessionId: context.sessionId,
      feature: context.feature,
      aiModel: context.aiModel,
      userPrompt: context.userPrompt,
      systemPrompt: context.systemPrompt,
      fullPrompt: context.fullPrompt,
      requestData: context.requestData,
      aiResponse: response.aiResponse,
      processedResponse: response.processedResponse,
      parsedData: response.parsedData,
      tokensUsed: response.tokensUsed,
      promptTokens: response.promptTokens,
      completionTokens: response.completionTokens,
      generationTimeMs: response.generationTimeMs,
      status: response.status || 'success',
      errorMessage: response.errorMessage,
      responseLength: response.responseLength || response.aiResponse.length,
      parseSuccess: response.parseSuccess !== false, // default to true unless explicitly false
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    };

    await storage.createPromptHistory(promptHistoryEntry);
    console.log(`Saved prompt history for feature: ${context.feature}, model: ${context.aiModel}`);
  } catch (error) {
    console.error('Error saving prompt history:', error);
    // Don't throw the error to avoid breaking the main AI functionality
  }
}

/**
 * Wrapper function for AI requests with automatic prompt history saving
 */
export async function executeAIRequestWithHistory<T>(
  context: PromptHistoryContext,
  aiFunction: () => Promise<T>,
  responseParser?: (response: T) => { processed: string; parsed?: any }
): Promise<T> {
  const startTime = Date.now();
  let result: T;
  let error: Error | undefined;

  try {
    result = await aiFunction();
    const endTime = Date.now();
    const generationTimeMs = endTime - startTime;

    // Parse the response if a parser is provided
    const parsedResponse = responseParser ? responseParser(result) : undefined;

    // Save to prompt history
    await savePromptHistory(context, {
      aiResponse: typeof result === 'string' ? result : JSON.stringify(result),
      processedResponse: parsedResponse?.processed,
      parsedData: parsedResponse?.parsed,
      generationTimeMs,
      status: 'success',
      responseLength: typeof result === 'string' ? result.length : JSON.stringify(result).length,
      parseSuccess: true,
    });

    return result;
  } catch (err) {
    error = err as Error;
    const endTime = Date.now();
    const generationTimeMs = endTime - startTime;

    // Save error to prompt history
    await savePromptHistory(context, {
      aiResponse: '',
      status: 'error',
      errorMessage: error.message,
      generationTimeMs,
      responseLength: 0,
      parseSuccess: false,
    });

    throw error;
  }
}

/**
 * Create a session ID for tracking related prompts
 */
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Extract token usage from OpenAI response
 */
export function extractTokenUsage(response: any): {
  tokensUsed?: number;
  promptTokens?: number;
  completionTokens?: number;
} {
  if (response?.usage) {
    return {
      tokensUsed: response.usage.total_tokens,
      promptTokens: response.usage.prompt_tokens,
      completionTokens: response.usage.completion_tokens,
    };
  }
  return {};
}