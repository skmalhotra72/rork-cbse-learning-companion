import { protectedProcedure } from "../../../create-context";
import { supabase } from "@/lib/supabase";

export const updateStreakProcedure = protectedProcedure.mutation(async ({ ctx }) => {
  const { userId } = ctx;

  console.log('[Update Streak] Updating streak for user:', userId);

  const { data: studentProfile, error: profileError } = await supabase
    .from('student_profiles')
    .select('id, current_streak, updated_at')
    .eq('user_id', userId)
    .single();

  if (profileError || !studentProfile) {
    throw new Error('Student profile not found');
  }

  const lastUpdated = new Date(studentProfile.updated_at);
  const now = new Date();
  const daysDiff = Math.floor((now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24));

  let newStreak = studentProfile.current_streak;

  if (daysDiff === 0) {
    console.log('[Update Streak] Already updated today');
    return {
      streak: newStreak,
      updated: false,
    };
  } else if (daysDiff === 1) {
    newStreak += 1;
    console.log('[Update Streak] Incrementing streak to:', newStreak);
  } else {
    newStreak = 1;
    console.log('[Update Streak] Streak reset to 1 (days diff:', daysDiff, ')');
  }

  const { error: updateError } = await supabase
    .from('student_profiles')
    .update({
      current_streak: newStreak,
    })
    .eq('id', studentProfile.id);

  if (updateError) {
    throw new Error('Failed to update streak: ' + updateError.message);
  }

  return {
    streak: newStreak,
    updated: true,
  };
});
