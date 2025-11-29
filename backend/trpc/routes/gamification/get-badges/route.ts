import { protectedProcedure } from "../../../create-context";
import { supabase } from "@/lib/supabase";

export const getBadgesProcedure = protectedProcedure.query(async ({ ctx }) => {
  const { userId } = ctx;

  console.log('[Get Badges] Fetching badges for user:', userId);

  const { data: studentProfile, error: profileError } = await supabase
    .from('student_profiles')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (profileError || !studentProfile) {
    throw new Error('Student profile not found');
  }

  const { data: badges, error: badgesError } = await supabase
    .from('gamification')
    .select('*')
    .eq('student_id', studentProfile.id)
    .eq('achievement_type', 'badge')
    .order('earned_at', { ascending: false });

  if (badgesError) {
    throw new Error('Failed to fetch badges: ' + badgesError.message);
  }

  console.log('[Get Badges] Found badges:', badges?.length || 0);

  return {
    badges: badges || [],
  };
});
