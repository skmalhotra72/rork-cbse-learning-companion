import { studentProcedure } from "../../../create-context";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { calculateLevel, XP_RULES } from "@/constants/gamification";

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

    const isPerfect = score === 100;
    const xpEarned = isPerfect ? XP_RULES.QUIZ_PERFECT_SCORE : XP_RULES.QUIZ_COMPLETION;

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



    console.log('[submitQuiz] Quiz submitted, score:', score, ', XP awarded:', xpEarned);

    return {
      score,
      correctCount,
      totalQuestions: input.questions.length,
      xpEarned,
      newTotalPoints,
      newLevel,
      passed: score >= 60,
      isPerfect,
      studentId: studentProfile.id,
    };
  });
