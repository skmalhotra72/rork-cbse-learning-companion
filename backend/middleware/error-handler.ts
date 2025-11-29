import { Context } from "hono";
import { TRPCError } from "@trpc/server";

export interface ErrorLog {
  timestamp: string;
  error: string;
  stack?: string;
  context?: any;
  userId?: string;
  path?: string;
  method?: string;
}

export async function logError(
  error: Error | TRPCError,
  context?: {
    userId?: string;
    path?: string;
    method?: string;
    additionalInfo?: any;
  }
): Promise<void> {
  const errorLog: ErrorLog = {
    timestamp: new Date().toISOString(),
    error: error.message,
    stack: error.stack,
    context: context?.additionalInfo,
    userId: context?.userId,
    path: context?.path,
    method: context?.method,
  };

  console.error('=== ERROR LOG ===');
  console.error(JSON.stringify(errorLog, null, 2));
  console.error('=================');
}

export function handleTRPCError(error: unknown): TRPCError {
  if (error instanceof TRPCError) {
    return error;
  }

  if (error instanceof Error) {
    return new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: error.message,
      cause: error,
    });
  }

  return new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
    cause: error,
  });
}

export async function errorHandler(c: Context, next: () => Promise<void>) {
  try {
    await next();
  } catch (error) {
    await logError(
      error as Error,
      {
        path: c.req.path,
        method: c.req.method,
      }
    );

    if (error instanceof TRPCError) {
      return c.json(
        {
          error: {
            code: error.code,
            message: error.message,
          },
        },
        500
      );
    }

    return c.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred',
        },
      },
      500
    );
  }
}
