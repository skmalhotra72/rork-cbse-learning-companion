import { z } from "zod";
import { parentProcedure } from "../../../create-context";
import { supabase } from "@/lib/supabase";

export const deleteRewardProcedure = parentProcedure
  .input(
    z.object({
      rewardId: z.string().uuid(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { userId } = ctx;

    console.log('[Delete Reward] Deleting reward:', input.rewardId);

    const { data: parentProfile, error: profileError } = await supabase
      .from('parent_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (profileError || !parentProfile) {
      throw new Error('Parent profile not found');
    }

    const { error: deleteError } = await supabase
      .from('parent_rewards')
      .delete()
      .eq('id', input.rewardId)
      .eq('parent_id', parentProfile.id);

    if (deleteError) {
      throw new Error('Failed to delete reward: ' + deleteError.message);
    }

    console.log('[Delete Reward] Reward deleted successfully');

    return { success: true };
  });
