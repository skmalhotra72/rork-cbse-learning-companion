import { studentProcedure } from "../../../create-context";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const getGapsProcedure = studentProcedure.query(async ({ ctx }) => {
  console.log('[getGaps] Fetching gaps for student:', ctx.userId);

  const { data: studentProfile, error: profileError } = await ctx.supabase
    .from('student_profiles')
    .select('id')
    .eq('user_id', ctx.userId)
    .single();

  if (profileError || !studentProfile) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Student profile not found',
    });
  }

  const { data: diagnostics, error: diagnosticsError } = await ctx.supabase
    .from('diagnostics')
    .select(`
      id,
      subject_id,
      knowledge_gaps,
      completed_at,
      subjects (
        id,
        name,
        color
      )
    `)
    .eq('student_id', studentProfile.id)
    .order('completed_at', { ascending: false });

  if (diagnosticsError) {
    console.error('[getGaps] Error fetching diagnostics:', diagnosticsError);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to fetch diagnostics',
    });
  }

  const { data: completedLessons } = await ctx.supabase
    .from('learning_sessions')
    .select('activities, chapter_id')
    .eq('student_id', studentProfile.id)
    .eq('session_type', 'study')
    .not('activities->gapConcept', 'is', null);

  const completedGapConcepts = new Set(
    (completedLessons || [])
      .map((session: any) => session.activities?.gapConcept)
      .filter(Boolean)
  );

  const gaps = (diagnostics || []).flatMap((diagnostic: any) => {
    const knowledgeGaps = diagnostic.knowledge_gaps || [];
    return knowledgeGaps.map((gap: any, index: number) => ({
      id: `${diagnostic.id}_${index}`,
      diagnosticId: diagnostic.id,
      subject: diagnostic.subjects?.name || 'Unknown',
      subjectColor: diagnostic.subjects?.color || '#6366f1',
      chapter: gap.chapter,
      concept: gap.concept,
      severity: gap.severity,
      description: gap.description,
      prerequisites: gap.prerequisites || [],
      completed: completedGapConcepts.has(gap.concept),
    }));
  });

  console.log('[getGaps] Found', gaps.length, 'total gaps,', gaps.filter((g: any) => !g.completed).length, 'active');

  return {
    gaps,
    activeGaps: gaps.filter((g: any) => !g.completed),
    completedGaps: gaps.filter((g: any) => g.completed),
  };
});
