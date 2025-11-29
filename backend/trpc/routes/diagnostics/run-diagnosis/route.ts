import { studentProcedure } from "../../../create-context";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { diagnoseGaps } from "@/services/aiService";
import { CBSEClass, Subject } from "@/constants/cbse";

const inputSchema = z.object({
  subjectId: z.string().uuid(),
  selfRating: z.enum(['struggling', 'okay', 'confident', 'expert']),
  painPoints: z.array(z.string()),
});

export const runDiagnosisProcedure = studentProcedure
  .input(inputSchema)
  .mutation(async ({ ctx, input }) => {
    console.log('[runDiagnosis] Starting diagnosis for student:', ctx.userId);

    const { data: studentProfile, error: profileError } = await ctx.supabase
      .from('student_profiles')
      .select('id, grade')
      .eq('user_id', ctx.userId)
      .single();

    if (profileError || !studentProfile) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Student profile not found',
      });
    }

    const { data: subject, error: subjectError } = await ctx.supabase
      .from('subjects')
      .select('*')
      .eq('id', input.subjectId)
      .single();

    if (subjectError || !subject) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Subject not found',
      });
    }

    const aiGaps = await diagnoseGaps({
      studentClass: String(studentProfile.grade) as CBSEClass,
      subject: subject.name as Subject,
      painPoints: input.painPoints,
      selfRating: input.selfRating,
    });

    const knowledgeGaps = aiGaps.map((gap) => ({
      chapter: gap.chapter,
      concept: gap.concept,
      severity: gap.severity,
      description: gap.description,
      prerequisites: gap.prerequisites,
    }));

    const { data: diagnostic, error: diagnosticError } = await ctx.supabase
      .from('diagnostics')
      .insert({
        student_id: studentProfile.id,
        subject_id: input.subjectId,
        diagnostic_type: 'initial',
        questions_data: { painPoints: input.painPoints, selfRating: input.selfRating },
        knowledge_gaps: knowledgeGaps,
        recommendations: { gaps: knowledgeGaps },
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (diagnosticError) {
      console.error('[runDiagnosis] Error storing diagnostic:', diagnosticError);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to store diagnostic results',
      });
    }

    await ctx.supabase.from('learning_sessions').insert({
      student_id: studentProfile.id,
      subject_id: input.subjectId,
      session_type: 'diagnostic',
      started_at: new Date().toISOString(),
      ended_at: new Date().toISOString(),
      duration_minutes: 5,
      activities: { action: 'completed_diagnosis' },
      points_earned: 10,
    });

    const { data: updatedProfile } = await ctx.supabase
      .from('student_profiles')
      .update({
        total_points: (studentProfile as any).total_points + 10,
      })
      .eq('id', studentProfile.id)
      .select()
      .single();

    console.log('[runDiagnosis] Diagnosis completed successfully, awarded 10 XP');

    return {
      diagnosticId: diagnostic.id,
      gaps: aiGaps,
      xpAwarded: 10,
    };
  });
