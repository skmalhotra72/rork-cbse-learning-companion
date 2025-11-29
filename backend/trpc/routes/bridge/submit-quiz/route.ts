import { studentProcedure } from "../../../create-context";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { XP_RULES, calculateLevel, BADGES, checkBadgeEarned, type StudentStats } from "@/constants/gamification";

const inputSchema = z.object({
  concept: z.string(),
  chapter: z.string(),
  subject: z.string(),
  subjectId: z.string().uuid().optional(),
  questions: z.array(z.object({
    id: z.string(),
    question: z.string(),
    options: z.array(z.string()),
    correctAnswer: z.number(),
    explanation: z.string(),
    concept: z.string(),
    difficulty: z.enum(['easy', 'medium', 'hard']),
  })),
  answers: z.array(z.number()),
});

export const submitQuizProcedure = studentProcedure
  .input(inputSchema)
  .mutation(async ({ ctx, input }) => {
    console.log('[submitQuiz] Submitting quiz for:', input.concept);

    const { data: studentProfile, error: profileError } = await ctx.supabase
      .from('student_profiles')
      .select('id, total_points')
      .eq('user_id', ctx.userId)
      .single();

    if (profileError || !studentProfile) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Student profile not found',
      });
    }

    const correctCount = input.questions.filter(
      (q, idx) => q.correctAnswer === input.answers[idx]
    ).length;
    const score = Math.round((correctCount / input.questions.length) * 100);

    const xpEarned = score === 100 ? XP_RULES.QUIZ_PERFECT_SCORE : XP_RULES.QUIZ_COMPLETED;

    const { error: sessionError } = await ctx.supabase
      .from('learning_sessions')
      .insert({
        student_id: studentProfile.id,
        subject_id: input.subjectId || null,
        session_type: 'quiz',
        started_at: new Date().toISOString(),
        ended_at: new Date().toISOString(),
        duration_minutes: 5,
        activities: {
          action: 'completed_quiz',
          concept: input.concept,
          chapter: input.chapter,
          score,
          correctCount,
          totalQuestions: input.questions.length,
        },
        points_earned: xpEarned,
      });

    if (sessionError) {
      console.error('[submitQuiz] Error storing session:', sessionError);
    }

    const newTotalPoints = studentProfile.total_points + xpEarned;
    const newLevel = calculateLevel(newTotalPoints);

    const { error: updateError } = await ctx.supabase
      .from('student_profiles')
      .update({
        total_points: newTotalPoints,
        level: newLevel,
      })
      .eq('id', studentProfile.id);

    if (updateError) {
      console.error('[submitQuiz] Error updating profile:', updateError);
    }

    const { data: quizCount } = await ctx.supabase
      .from('quiz_attempts')
      .select('id', { count: 'exact' })
      .eq('student_id', studentProfile.id)
      .eq('status', 'completed');

    const { data: lessonSessions } = await ctx.supabase
      .from('learning_sessions')
      .select('id', { count: 'exact' })
      .eq('student_id', studentProfile.id)
      .eq('session_type', 'study');

    const { data: gapsDiagnostics } = await ctx.supabase
      .from('diagnostics')
      .select('knowledge_gaps')
      .eq('student_id', studentProfile.id)
      .not('completed_at', 'is', null);

    const completedGapsCount = (gapsDiagnostics || []).reduce((count: number, diagnostic: any) => {
      const gaps = diagnostic.knowledge_gaps as any[];
      return count + (gaps?.filter((g: any) => g.status === 'completed').length || 0);
    }, 0);

    const { data: perfectScores } = await ctx.supabase
      .from('quiz_attempts')
      .select('id', { count: 'exact' })
      .eq('student_id', studentProfile.id)
      .eq('status', 'completed')
      .gte('score', 100);

    const stats: StudentStats = {
      totalXP: newTotalPoints,
      level: newLevel,
      currentStreak: 0,
      quizCount: (quizCount?.length || 0) + 1,
      lessonCount: lessonSessions?.length || 0,
      gapCount: completedGapsCount,
      perfectScoreCount: score === 100 ? (perfectScores?.length || 0) + 1 : (perfectScores?.length || 0),
    };

    const { data: existingBadges } = await ctx.supabase
      .from('gamification')
      .select('achievement_name')
      .eq('student_id', studentProfile.id)
      .eq('achievement_type', 'badge');

    const existingBadgeNames = new Set((existingBadges || []).map((b: any) => b.achievement_name));
    const newlyEarnedBadges = [];

    for (const badge of BADGES) {
      if (!existingBadgeNames.has(badge.name) && checkBadgeEarned(badge, stats)) {
        await ctx.supabase.from('gamification').insert({
          student_id: studentProfile.id,
          achievement_type: 'badge',
          achievement_name: badge.name,
          description: badge.description,
          points_awarded: badge.xpReward,
          rarity: badge.rarity,
          metadata: { badge_id: badge.id, icon: badge.icon },
        });
        newlyEarnedBadges.push(badge);
        console.log('[submitQuiz] Badge earned:', badge.name);
      }
    }

    console.log('[submitQuiz] Quiz submitted, score:', score, ', XP awarded:', xpEarned);

    return {
      score,
      correctCount,
      totalQuestions: input.questions.length,
      xpEarned,
      newTotalPoints,
      newLevel,
      passed: score >= 60,
      newBadges: newlyEarnedBadges,
    };
  });
