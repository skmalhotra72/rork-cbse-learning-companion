import { studentProcedure } from "../../../create-context";
import { TRPCError } from "@trpc/server";

export const getSubjectsProcedure = studentProcedure.query(async ({ ctx }) => {
  console.log('[getSubjects] Fetching subjects for student:', ctx.userId);

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

  const { data: subjects, error: subjectsError } = await ctx.supabase
    .from('subjects')
    .select('*')
    .eq('grade', studentProfile.grade)
    .eq('is_active', true)
    .order('name');

  if (subjectsError) {
    console.error('[getSubjects] Error fetching subjects:', subjectsError);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to fetch subjects',
    });
  }

  return subjects || [];
});
