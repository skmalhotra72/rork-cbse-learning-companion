import { adminProcedure } from "../../../create-context";
import { z } from "zod";
import { createLoggingService } from "../../../../services/logging-service";

const inputSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const getAIAnalyticsProcedure = adminProcedure
  .input(inputSchema)
  .query(async ({ ctx, input }) => {
    console.log('[getAIAnalytics] Fetching AI analytics');

    const loggingService = createLoggingService(ctx.supabase);

    const analytics = await loggingService.getAIAnalytics({
      startDate: input.startDate ? new Date(input.startDate) : undefined,
      endDate: input.endDate ? new Date(input.endDate) : undefined,
    });

    console.log('[getAIAnalytics] Analytics fetched successfully');

    return analytics;
  });
