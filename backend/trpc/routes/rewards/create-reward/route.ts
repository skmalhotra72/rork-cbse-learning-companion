import { z } from "zod";
import { parentProcedure } from "../../../create-context";
import { supabase } from "@/lib/supabase";

export const createRewardProcedure = parentProcedure
  .input(
    z.object({
      studentId: z.string().uuid(),
      rewardName: z.string().min(1).max(100),
      description: z.string().optional(),
      pointsRequired: z.number().positive(),
      rewardType: z.enum(['privilege', 'gift', 'activity']),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { userId } = ctx;

    console.log('[Create Reward] Creating reward:', input);

    const { data: parentProfile, error: profileError } = await supabase
      .from('parent_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (profileError || !parentProfile) {
      throw new Error('Parent profile not found');
    }

    const { data: link, error: linkError } = await supabase
      .from('student_parent_links')
      .select('*')
      .eq('parent_id', parentProfile.id)
      .eq('student_id', input.studentId)
      .single();

    if (linkError || !link) {
      throw new Error('Student not linked to parent');
    }

    const { data: reward, error: insertError } = await supabase
      .from('parent_rewards')
      .insert({
        parent_id: parentProfile.id,
        student_id: input.studentId,
        reward_name: input.rewardName,
        description: input.description,
        points_required: input.pointsRequired,
        reward_type: input.rewardType,
      })
      .select()
      .single();

    if (insertError || !reward) {
      throw new Error('Failed to create reward: ' + insertError?.message);
    }

    console.log('[Create Reward] Reward created:', reward.id);

    return { success: true, reward };
  });
