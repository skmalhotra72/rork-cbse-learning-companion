import { z } from "zod";
import { parentProcedure } from "../../../create-context";

export const createRewardProcedure = parentProcedure
  .input(
    z.object({
      studentId: z.string().uuid(),
      rewardName: z.string().min(1).max(100),
      description: z.string().optional(),
      pointsRequired: z.number().int().positive(),
      rewardType: z.enum(["privilege", "gift", "activity"]),
    })
  )
  .mutation(async ({ input, ctx }) => {
    console.log("[Rewards] Creating reward:", input);

    const { data: parentProfile, error: parentError } = await ctx.supabase
      .from("parent_profiles")
      .select("id")
      .eq("user_id", ctx.userId)
      .single();

    if (parentError || !parentProfile) {
      throw new Error("Parent profile not found");
    }

    const { data: link } = await ctx.supabase
      .from("student_parent_links")
      .select("id")
      .eq("student_id", input.studentId)
      .eq("parent_id", parentProfile.id)
      .single();

    if (!link) {
      throw new Error("Student not linked to this parent");
    }

    const { data: reward, error: insertError } = await ctx.supabase
      .from("parent_rewards")
      .insert({
        parent_id: parentProfile.id,
        student_id: input.studentId,
        reward_name: input.rewardName,
        description: input.description || null,
        points_required: input.pointsRequired,
        reward_type: input.rewardType,
        is_active: true,
        is_redeemed: false,
      })
      .select()
      .single();

    if (insertError) {
      console.error("[Rewards] Error creating reward:", insertError);
      throw new Error("Failed to create reward");
    }

    console.log("[Rewards] Reward created:", reward.id);

    return {
      reward,
    };
  });
