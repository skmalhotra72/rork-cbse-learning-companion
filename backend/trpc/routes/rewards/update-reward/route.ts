import { z } from "zod";
import { parentProcedure } from "../../../create-context";

export const updateRewardProcedure = parentProcedure
  .input(
    z.object({
      rewardId: z.string().uuid(),
      rewardName: z.string().min(1).max(100).optional(),
      description: z.string().optional(),
      pointsRequired: z.number().int().positive().optional(),
      rewardType: z.enum(["privilege", "gift", "activity"]).optional(),
      isActive: z.boolean().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    console.log("[Rewards] Updating reward:", input.rewardId);

    const { data: parentProfile, error: parentError } = await ctx.supabase
      .from("parent_profiles")
      .select("id")
      .eq("user_id", ctx.userId)
      .single();

    if (parentError || !parentProfile) {
      throw new Error("Parent profile not found");
    }

    const { data: reward, error: rewardError } = await ctx.supabase
      .from("parent_rewards")
      .select("*")
      .eq("id", input.rewardId)
      .eq("parent_id", parentProfile.id)
      .single();

    if (rewardError || !reward) {
      throw new Error("Reward not found or you don't have permission");
    }

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (input.rewardName !== undefined) updates.reward_name = input.rewardName;
    if (input.description !== undefined) updates.description = input.description;
    if (input.pointsRequired !== undefined) updates.points_required = input.pointsRequired;
    if (input.rewardType !== undefined) updates.reward_type = input.rewardType;
    if (input.isActive !== undefined) updates.is_active = input.isActive;

    const { error: updateError } = await ctx.supabase
      .from("parent_rewards")
      .update(updates)
      .eq("id", input.rewardId);

    if (updateError) {
      console.error("[Rewards] Error updating reward:", updateError);
      throw new Error("Failed to update reward");
    }

    console.log("[Rewards] Reward updated successfully");

    return {
      success: true,
    };
  });
