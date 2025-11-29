import { z } from "zod";
import { protectedProcedure } from "../../../create-context";
import { supabase } from "@/lib/supabase";
import { BADGES, checkBadgeEarned, calculateLevel, type StudentStats } from "@/constants/gamification";

export const awardXPProcedure = protectedProcedure
  .input(
    z.object({
      xpAmount: z.number().positive(),
      source: z.enum(['quiz', 'lesson', 'diagnostic', 'daily_login', 'gap_bridged', 'help_question']),
      sourceId: z.string().optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { userId } = ctx;

    console.log('[Award XP] Awarding XP:', input);

    const { data: studentProfile, error: profileError } = await supabase
      .from('student_profiles')
      .select('id, total_points, level, current_streak')
      .eq('user_id', userId)
      .single();

    if (profileError || !studentProfile) {
      throw new Error('Student profile not found');
    }

    const newTotalPoints = studentProfile.total_points + input.xpAmount;
    const newLevel = calculateLevel(newTotalPoints);

    const { error: updateError } = await supabase
      .from('student_profiles')
      .update({
        total_points: newTotalPoints,
        level: newLevel,
      })
      .eq('id', studentProfile.id);

    if (updateError) {
      throw new Error('Failed to update XP: ' + updateError.message);
    }

    console.log('[Award XP] XP awarded successfully. New total:', newTotalPoints);

    const { data: quizCount } = await supabase
      .from('quiz_attempts')
      .select('id', { count: 'exact' })
      .eq('student_id', studentProfile.id)
      .eq('status', 'completed');

    const { data: lessonSessions } = await supabase
      .from('learning_sessions')
      .select('id', { count: 'exact' })
      .eq('student_id', studentProfile.id)
      .eq('session_type', 'study');

    const { data: gapsDiagnostics } = await supabase
      .from('diagnostics')
      .select('knowledge_gaps')
      .eq('student_id', studentProfile.id)
      .not('completed_at', 'is', null);

    const completedGapsCount = (gapsDiagnostics || []).reduce((count, diagnostic) => {
      const gaps = diagnostic.knowledge_gaps as any[];
      return count + (gaps?.filter((g: any) => g.status === 'completed').length || 0);
    }, 0);

    const { data: perfectScores } = await supabase
      .from('quiz_attempts')
      .select('id', { count: 'exact' })
      .eq('student_id', studentProfile.id)
      .eq('status', 'completed')
      .gte('score', 100);

    const stats: StudentStats = {
      totalXP: newTotalPoints,
      level: newLevel,
      currentStreak: studentProfile.current_streak,
      quizCount: quizCount?.length || 0,
      lessonCount: lessonSessions?.length || 0,
      gapCount: completedGapsCount,
      perfectScoreCount: perfectScores?.length || 0,
    };

    const { data: existingBadges } = await supabase
      .from('gamification')
      .select('achievement_name')
      .eq('student_id', studentProfile.id)
      .eq('achievement_type', 'badge');

    const existingBadgeNames = new Set((existingBadges || []).map(b => b.achievement_name));

    const newlyEarnedBadges = [];
    for (const badge of BADGES) {
      if (!existingBadgeNames.has(badge.name) && checkBadgeEarned(badge, stats)) {
        await supabase.from('gamification').insert({
          student_id: studentProfile.id,
          achievement_type: 'badge',
          achievement_name: badge.name,
          description: badge.description,
          points_awarded: badge.xpReward,
          rarity: badge.rarity,
          metadata: { badge_id: badge.id, icon: badge.icon },
        });

        newlyEarnedBadges.push(badge);
        console.log('[Award XP] Badge earned:', badge.name);
      }
    }

    return {
      success: true,
      newTotalXP: newTotalPoints,
      newLevel,
      leveledUp: newLevel > studentProfile.level,
      newBadges: newlyEarnedBadges,
    };
  });
