import { adminProcedure } from "../../../create-context";
import { z } from "zod";
import { createLoggingService } from "../../../../services/logging-service";

const inputSchema = z.object({
  userId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.number().optional(),
});

export const getUserActivityProcedure = adminProcedure
  .input(inputSchema)
  .query(async ({ ctx, input }) => {
    console.log('[getUserActivity] Fetching user activity');

    const loggingService = createLoggingService(ctx.supabase);

    const activity = await loggingService.getUserActivity({
      userId: input.userId,
      startDate: input.startDate ? new Date(input.startDate) : undefined,
      endDate: input.endDate ? new Date(input.endDate) : undefined,
      limit: input.limit || 100,
    });

    console.log(`[getUserActivity] Fetched ${activity.length} activity records`);

    return activity;
  });
