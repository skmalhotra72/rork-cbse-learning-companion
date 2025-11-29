import { adminProcedure } from "../../../create-context";
import { TRPCError } from "@trpc/server";

export const getStudentStatsProcedure = adminProcedure
  .query(async ({ ctx }) => {
    console.log('[getStudentStats] Fetching student statistics');

    try {
      const { data: totalStudents } = await ctx.supabase
        .from('student_profiles')
        .select('id', { count: 'exact', head: true });

      const { data: totalSubjects } = await ctx.supabase
        .from('subjects')
        .select('id', { count: 'exact', head: true });

      const { data: totalDiagnostics } = await ctx.supabase
        .from('diagnostics')
        .select('id', { count: 'exact', head: true });

      const { data: totalQuizAttempts } = await ctx.supabase
        .from('quiz_attempts')
        .select('id', { count: 'exact', head: true });

      const { data: leaderboard } = await ctx.supabase
        .from('student_profiles')
        .select('id, full_name, total_points, level, current_streak')
        .order('total_points', { ascending: false })
        .limit(10);

      const { data: recentActivity } = await ctx.supabase
        .from('learning_sessions')
        .select(`
          id,
          session_type,
          started_at,
          duration_minutes,
          points_earned,
          student_id,
          student_profiles!inner(full_name)
        `)
        .order('started_at', { ascending: false })
        .limit(20);

      console.log('[getStudentStats] Stats fetched successfully');

      return {
        totalStudents: totalStudents || 0,
        totalSubjects: totalSubjects || 0,
        totalDiagnostics: totalDiagnostics || 0,
        totalQuizAttempts: totalQuizAttempts || 0,
        leaderboard: leaderboard || [],
        recentActivity: recentActivity || [],
      };
    } catch (error) {
      console.error('[getStudentStats] Error fetching stats:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch student statistics',
      });
    }
  });
