import { TRPCError } from '@trpc/server';
import { parentProcedure } from '../../../create-context';
import { linkStudentSchema } from '../../../../types/auth';

export const linkStudentProcedure = parentProcedure
  .input(linkStudentSchema)
  .mutation(async ({ input, ctx }) => {
    console.log('[Auth] Link student request:', { studentEmail: input.studentEmail });

    const { data: studentUser, error: studentUserError } = await ctx.supabase
      .from('users')
      .select('id, role')
      .eq('email', input.studentEmail)
      .single();

    if (studentUserError || !studentUser) {
      console.error('[Auth] Student not found:', studentUserError);
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Student account not found with this email',
      });
    }

    if (studentUser.role !== 'student') {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'This account is not a student account',
      });
    }

    const { data: studentProfile, error: profileError } = await ctx.supabase
      .from('student_profiles')
      .select('id')
      .eq('user_id', studentUser.id)
      .single();

    if (profileError || !studentProfile) {
      console.error('[Auth] Student profile not found:', profileError);
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Student profile not found',
      });
    }

    const { data: parentProfile, error: parentProfileError } = await ctx.supabase
      .from('parent_profiles')
      .select('id')
      .eq('user_id', ctx.userId)
      .single();

    if (parentProfileError || !parentProfile) {
      console.error('[Auth] Parent profile not found:', parentProfileError);
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Parent profile not found',
      });
    }

    const { data: existingLink } = await ctx.supabase
      .from('student_parent_links')
      .select('id')
      .eq('student_id', studentProfile.id)
      .eq('parent_id', parentProfile.id)
      .single();

    if (existingLink) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Student is already linked to this parent account',
      });
    }

    const { data: linkData, error: linkError } = await ctx.supabase
      .from('student_parent_links')
      .insert({
        student_id: studentProfile.id,
        parent_id: parentProfile.id,
        relationship: input.relationship || null,
        is_primary: input.isPrimary,
      })
      .select()
      .single();

    if (linkError || !linkData) {
      console.error('[Auth] Error linking student:', linkError);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to link student',
      });
    }

    console.log('[Auth] Student linked successfully');

    return {
      success: true,
      linkId: linkData.id,
    };
  });

export default linkStudentProcedure;
