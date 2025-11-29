import { studentProcedure } from "../../../create-context";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { calculateLevel, XP_RULES } from "@/constants/gamification";

const inputSchema = z.object({
  gapConcept: z.string(),
  chapter: z.string(),
  subjectId: z.string().uuid().optional(),
});

export const completeLessonProcedure = studentProcedure
  .input(inputSchema)
  .mutation(async ({ ctx, input }) => {
    console.log('[completeLesson] Completing lesson for:', input.gapConcept);

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

    const xpEarned = XP_RULES.LESSON_COMPLETION;

    const { error: sessionError } = await ctx.supabase
      .from('learning_sessions')
      .insert({
        student_id: studentProfile.id,
        subject_id: input.subjectId || null,
        session_type: 'study',
        started_at: new Date().toISOString(),
        ended_at: new Date().toISOString(),
        duration_minutes: 10,
        activities: {
          action: 'completed_lesson',
          gapConcept: input.gapConcept,
          chapter: input.chapter,
        },
        points_earned: xpEarned,
      });

    if (sessionError) {
      console.error('[completeLesson] Error storing session:', sessionError);
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
      console.error('[completeLesson] Error updating profile:', updateError);
    }

    console.log('[completeLesson] Lesson completed, awarded', xpEarned, 'XP');

    return {
      xpEarned,
      newTotalPoints,
      newLevel,
      studentId: studentProfile.id,
    };
  });
