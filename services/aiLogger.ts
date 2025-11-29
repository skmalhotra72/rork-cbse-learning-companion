import { SupabaseClient } from "@supabase/supabase-js";
import { AILogEntry, createLoggingService } from "../backend/services/logging-service";

export interface AICallWrapper {
  operationType: string;
  userId?: string;
  studentId?: string;
}

export async function withAILogging<T>(
  supabase: SupabaseClient,
  wrapper: AICallWrapper,
  aiCall: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();
  const loggingService = createLoggingService(supabase);

  try {
    console.log(`[AI Wrapper] Starting ${wrapper.operationType}...`);
    const result = await aiCall();
    const durationMs = Date.now() - startTime;

    const logEntry: AILogEntry = {
      userId: wrapper.userId,
      studentId: wrapper.studentId,
      aiService: 'rork-ai-toolkit',
      operationType: wrapper.operationType,
      requestData: { timestamp: new Date().toISOString() },
      responseData: typeof result === 'object' ? { success: true } : { result },
      durationMs,
      status: 'success',
    };

    await loggingService.logAICall(logEntry);
    console.log(`[AI Wrapper] Completed ${wrapper.operationType} in ${durationMs}ms`);

    return result;
  } catch (error) {
    const durationMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    const logEntry: AILogEntry = {
      userId: wrapper.userId,
      studentId: wrapper.studentId,
      aiService: 'rork-ai-toolkit',
      operationType: wrapper.operationType,
      requestData: { timestamp: new Date().toISOString() },
      durationMs,
      status: 'error',
      errorMessage,
    };

    await loggingService.logAICall(logEntry);
    console.error(`[AI Wrapper] Failed ${wrapper.operationType} in ${durationMs}ms:`, errorMessage);

    throw error;
  }
}
