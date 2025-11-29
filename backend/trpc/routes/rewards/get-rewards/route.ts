import { z } from "zod";
import { protectedProcedure } from "../../../create-context";

export const getRewardsProcedure = protectedProcedure
  .input(
    z.object({
      studentId: z.string().uuid(),
    })
  )
  .query(async ({ input, ctx }) => {
    console.log("[Rewards] Getting rewards for student:", input.studentId);

    const { data: rewards, error } = await ctx.supabase
      .from("parent_rewards")
      .select("*")
      .eq("student_id", input.studentId)
      .eq("is_active", true)
      .order("points_required", { ascending: true });

    if (error) {
      console.error("[Rewards] Error fetching rewards:", error);
      throw new Error("Failed to fetch rewards");
    }

    const { data: studentProfile } = await ctx.supabase
      .from("student_profiles")
      .select("total_points")
      .eq("id", input.studentId)
      .single();

    const currentPoints = studentProfile?.total_points || 0;

    return {
      rewards: (rewards || []).map((reward) => ({
        ...reward,
        canRedeem: currentPoints >= reward.points_required && !reward.is_redeemed,
      })),
      currentPoints,
    };
  });
