import { z } from "zod";
import { protectedProcedure } from "../../../create-context";

export const redeemRewardProcedure = protectedProcedure
  .input(
    z.object({
      rewardId: z.string().uuid(),
      studentId: z.string().uuid(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    console.log("[Rewards] Redeeming reward:", input.rewardId);

    const { data: reward, error: rewardError } = await ctx.supabase
      .from("parent_rewards")
      .select("*")
      .eq("id", input.rewardId)
      .eq("student_id", input.studentId)
      .single();

    if (rewardError || !reward) {
      throw new Error("Reward not found");
    }

    if (reward.is_redeemed) {
      throw new Error("Reward already redeemed");
    }

    const { data: studentProfile, error: profileError } = await ctx.supabase
      .from("student_profiles")
      .select("total_points")
      .eq("id", input.studentId)
      .single();

    if (profileError || !studentProfile) {
      throw new Error("Student not found");
    }

    if (studentProfile.total_points < reward.points_required) {
      throw new Error("Not enough points to redeem this reward");
    }

    const { error: updateError } = await ctx.supabase
      .from("parent_rewards")
      .update({
        is_redeemed: true,
        redeemed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", input.rewardId);

    if (updateError) {
      console.error("[Rewards] Error redeeming reward:", updateError);
      throw new Error("Failed to redeem reward");
    }

    const newTotalPoints = studentProfile.total_points - reward.points_required;

    const { error: pointsError } = await ctx.supabase
      .from("student_profiles")
      .update({
        total_points: newTotalPoints,
        updated_at: new Date().toISOString(),
      })
      .eq("id", input.studentId);

    if (pointsError) {
      console.error("[Rewards] Error deducting points:", pointsError);
      throw new Error("Failed to deduct points");
    }

    console.log("[Rewards] Reward redeemed successfully");

    return {
      success: true,
      pointsSpent: reward.points_required,
      remainingPoints: newTotalPoints,
    };
  });
