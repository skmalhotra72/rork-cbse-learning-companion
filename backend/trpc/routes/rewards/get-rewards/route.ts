import { z } from "zod";
import { protectedProcedure } from "../../../create-context";
import { supabase } from "@/lib/supabase";

export const getRewardsProcedure = protectedProcedure
  .input(
    z.object({
      studentId: z.string().uuid().optional(),
    }).optional()
  )
  .query(async ({ ctx, input }) => {
    const { userId, userRole } = ctx;

    console.log('[Get Rewards] Fetching rewards for user:', userId, 'role:', userRole);

    if (userRole === 'student') {
      const { data: studentProfile, error: profileError } = await supabase
        .from('student_profiles')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (profileError || !studentProfile) {
        throw new Error('Student profile not found');
      }

      const { data: rewards, error: rewardsError } = await supabase
        .from('parent_rewards')
        .select('*')
        .eq('student_id', studentProfile.id)
        .eq('is_active', true)
        .order('points_required', { ascending: true });

      if (rewardsError) {
        throw new Error('Failed to fetch rewards: ' + rewardsError.message);
      }

      return { rewards: rewards || [] };
    } else if (userRole === 'parent') {
      const { data: parentProfile, error: profileError } = await supabase
        .from('parent_profiles')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (profileError || !parentProfile) {
        throw new Error('Parent profile not found');
      }

      let query = supabase
        .from('parent_rewards')
        .select('*, student_profiles!parent_rewards_student_id_fkey(full_name)')
        .eq('parent_id', parentProfile.id);

      if (input?.studentId) {
        query = query.eq('student_id', input.studentId);
      }

      const { data: rewards, error: rewardsError } = await query
        .order('created_at', { ascending: false });

      if (rewardsError) {
        throw new Error('Failed to fetch rewards: ' + rewardsError.message);
      }

      return { rewards: rewards || [] };
    }

    throw new Error('Invalid user role');
  });
