import { TRPCError } from '@trpc/server';
import { publicProcedure } from '../../../create-context';
import { loginSchema } from '../../../../types/auth';

export const loginProcedure = publicProcedure
  .input(loginSchema)
  .mutation(async ({ input, ctx }) => {
    console.log('[Auth] Login request:', { email: input.email });

    const { data: authData, error: authError } = await ctx.supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (authError || !authData.user || !authData.session) {
      console.error('[Auth] Login error:', authError);
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: authError?.message || 'Invalid email or password',
      });
    }

    console.log('[Auth] User authenticated:', authData.user.id);

    const { data: userData, error: userError } = await ctx.supabase
      .from('users')
      .select('role')
      .eq('id', authData.user.id)
      .single();

    if (userError || !userData) {
      console.error('[Auth] Error fetching user role:', userError);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch user data',
      });
    }

    console.log('[Auth] User role:', userData.role);

    await ctx.supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', authData.user.id);

    let profile = null;

    if (userData.role === 'student') {
      const { data: studentProfile, error: profileError } = await ctx.supabase
        .from('student_profiles')
        .select('*')
        .eq('user_id', authData.user.id)
        .single();

      if (profileError || !studentProfile) {
        console.error('[Auth] Error fetching student profile:', profileError);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch student profile',
        });
      }

      profile = {
        id: studentProfile.id,
        userId: studentProfile.user_id,
        fullName: studentProfile.full_name,
        email: input.email,
        grade: studentProfile.grade,
        board: studentProfile.board,
        schoolName: studentProfile.school_name || undefined,
        dateOfBirth: studentProfile.date_of_birth || undefined,
        avatarUrl: studentProfile.avatar_url || undefined,
        currentStreak: studentProfile.current_streak,
        totalPoints: studentProfile.total_points,
        level: studentProfile.level,
      };
    } else if (userData.role === 'parent') {
      const { data: parentProfile, error: profileError } = await ctx.supabase
        .from('parent_profiles')
        .select(`
          *,
          student_parent_links!student_parent_links_parent_id_fkey (
            student_id,
            relationship,
            is_primary,
            student_profiles!student_parent_links_student_id_fkey (
              id,
              full_name,
              grade
            )
          )
        `)
        .eq('user_id', authData.user.id)
        .single();

      if (profileError || !parentProfile) {
        console.error('[Auth] Error fetching parent profile:', profileError);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch parent profile',
        });
      }

      const linkedStudents = (parentProfile.student_parent_links || []).map((link: {
        relationship: string;
        is_primary: boolean;
        student_profiles: {
          id: string;
          full_name: string;
          grade: number;
        };
      }) => ({
        id: link.student_profiles.id,
        fullName: link.student_profiles.full_name,
        grade: link.student_profiles.grade,
        relationship: link.relationship || undefined,
        isPrimary: link.is_primary,
      }));

      profile = {
        id: parentProfile.id,
        userId: parentProfile.user_id,
        fullName: parentProfile.full_name,
        email: input.email,
        phoneNumber: parentProfile.phone_number || undefined,
        linkedStudents,
      };
    }

    console.log('[Auth] Login successful');

    return {
      user: {
        id: authData.user.id,
        email: input.email,
        role: userData.role,
      },
      session: authData.session,
      profile,
    };
  });

export default loginProcedure;
