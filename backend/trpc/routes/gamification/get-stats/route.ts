import { protectedProcedure } from "../../../create-context";
import { supabase } from "@/lib/supabase";
import { BADGES, checkBadgeEarned, getXPForNextLevel, getXPProgress, type StudentStats } from "@/constants/gamification";

export const getStatsProcedure = protectedProcedure.query(async ({ ctx }) => {
  const { userId } = ctx;

  console.log('[Get Stats] Fetching stats for user:', userId);

  const { data: studentProfile, error: profileError } = await supabase
    .from('student_profiles')
    .select('id, total_points, level, current_streak')
    .eq('user_id', userId)
    .single();

  if (profileError || !studentProfile) {
    throw new Error('Student profile not found');
  }

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
    totalXP: studentProfile.total_points,
    level: studentProfile.level,
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
  
  const availableBadges = BADGES.map(badge => ({
    ...badge,
    earned: existingBadgeNames.has(badge.name),
    progress: checkBadgeEarned(badge, stats) ? 100 : getProgressForBadge(badge, stats),
  }));

  return {
    stats,
    xpForNextLevel: getXPForNextLevel(stats.totalXP),
    xpProgress: getXPProgress(stats.totalXP),
    badges: availableBadges,
  };
});

function getProgressForBadge(badge: any, stats: StudentStats): number {
  const { type, target } = badge.condition;
  let current = 0;

  switch (type) {
    case 'streak':
      current = stats.currentStreak;
      break;
    case 'xp':
      current = stats.totalXP;
      break;
    case 'quiz_count':
      current = stats.quizCount;
      break;
    case 'lesson_count':
      current = stats.lessonCount;
      break;
    case 'gap_count':
      current = stats.gapCount;
      break;
    case 'perfect_score':
      current = stats.perfectScoreCount;
      break;
  }

  return Math.min((current / target) * 100, 100);
}
