import { z } from "zod";
import { protectedProcedure } from "../../../create-context";

export const getBadgesProcedure = protectedProcedure
  .input(
    z.object({
      studentId: z.string().uuid(),
    })
  )
  .query(async ({ input, ctx }) => {
    console.log("[Gamification] Getting badges for student:", input.studentId);

    const { data: badges, error } = await ctx.supabase
      .from("gamification")
      .select("*")
      .eq("student_id", input.studentId)
      .eq("achievement_type", "badge")
      .order("earned_at", { ascending: false });

    if (error) {
      console.error("[Gamification] Error fetching badges:", error);
      throw new Error("Failed to fetch badges");
    }

    return {
      badges: badges || [],
    };
  });
