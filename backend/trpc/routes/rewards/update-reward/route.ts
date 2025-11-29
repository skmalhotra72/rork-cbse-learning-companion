import { z } from "zod";
import { parentProcedure } from "../../../create-context";
import { supabase } from "@/lib/supabase";

export const updateRewardProcedure = parentProcedure
  .input(
    z.object({
      rewardId: z.string().uuid(),
      rewardName: z.string().min(1).max(100).optional(),
      description: z.string().optional(),
      pointsRequired: z.number().positive().optional(),
      rewardType: z.enum(['privilege', 'gift', 'activity']).optional(),
      isActive: z.boolean().optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { userId } = ctx;

    console.log('[Update Reward] Updating reward:', input.rewardId);

    const { data: parentProfile, error: profileError } = await supabase
      .from('parent_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (profileError || !parentProfile) {
      throw new Error('Parent profile not found');
    }

    const { data: existingReward, error: fetchError } = await supabase
      .from('parent_rewards')
      .select('*')
      .eq('id', input.rewardId)
      .eq('parent_id', parentProfile.id)
      .single();

    if (fetchError || !existingReward) {
      throw new Error('Reward not found or access denied');
    }

    const updates: any = {};
    if (input.rewardName !== undefined) updates.reward_name = input.rewardName;
    if (input.description !== undefined) updates.description = input.description;
    if (input.pointsRequired !== undefined) updates.points_required = input.pointsRequired;
    if (input.rewardType !== undefined) updates.reward_type = input.rewardType;
    if (input.isActive !== undefined) updates.is_active = input.isActive;

    const { error: updateError } = await supabase
      .from('parent_rewards')
      .update(updates)
      .eq('id', input.rewardId);

    if (updateError) {
      throw new Error('Failed to update reward: ' + updateError.message);
    }

    console.log('[Update Reward] Reward updated successfully');

    return { success: true };
  });
