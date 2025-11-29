import { adminProcedure } from "../../../create-context";
import { z } from "zod";
import { createLoggingService } from "../../../../services/logging-service";

const inputSchema = z.object({
  userId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.number().optional(),
});

export const getAILogsProcedure = adminProcedure
  .input(inputSchema)
  .query(async ({ ctx, input }) => {
    console.log('[getAILogs] Fetching AI logs');

    const loggingService = createLoggingService(ctx.supabase);

    const logs = await loggingService.getAILogs({
      userId: input.userId,
      startDate: input.startDate ? new Date(input.startDate) : undefined,
      endDate: input.endDate ? new Date(input.endDate) : undefined,
      limit: input.limit || 100,
    });

    console.log(`[getAILogs] Fetched ${logs.length} logs`);

    return logs;
  });
