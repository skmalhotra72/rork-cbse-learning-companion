import { z } from "zod";
import { protectedProcedure } from "../../../create-context";
import { supabase } from "@/lib/supabase";

export const redeemRewardProcedure = protectedProcedure
  .input(
    z.object({
      rewardId: z.string().uuid(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { userId } = ctx;

    console.log('[Redeem Reward] Redeeming reward:', input.rewardId);

    const { data: studentProfile, error: profileError } = await supabase
      .from('student_profiles')
      .select('id, total_points')
      .eq('user_id', userId)
      .single();

    if (profileError || !studentProfile) {
      throw new Error('Student profile not found');
    }

    const { data: reward, error: rewardError } = await supabase
      .from('parent_rewards')
      .select('*')
      .eq('id', input.rewardId)
      .eq('student_id', studentProfile.id)
      .eq('is_active', true)
      .eq('is_redeemed', false)
      .single();

    if (rewardError || !reward) {
      throw new Error('Reward not found or already redeemed');
    }

    if (studentProfile.total_points < reward.points_required) {
      throw new Error('Insufficient points');
    }

    const { error: updateError } = await supabase
      .from('parent_rewards')
      .update({
        is_redeemed: true,
        redeemed_at: new Date().toISOString(),
      })
      .eq('id', input.rewardId);

    if (updateError) {
      throw new Error('Failed to redeem reward: ' + updateError.message);
    }

    const newPoints = studentProfile.total_points - reward.points_required;
    await supabase
      .from('student_profiles')
      .update({ total_points: newPoints })
      .eq('id', studentProfile.id);

    console.log('[Redeem Reward] Reward redeemed successfully');

    return { success: true, newPoints };
  });
