import { adminProcedure } from "../../../create-context";
import { createLoggingService } from "../../../../services/logging-service";

export const getSystemHealthProcedure = adminProcedure
  .query(async ({ ctx }) => {
    console.log('[getSystemHealth] Fetching system health');

    const loggingService = createLoggingService(ctx.supabase);

    const health = await loggingService.getSystemHealth();

    console.log('[getSystemHealth] System health fetched successfully');

    return health;
  });
