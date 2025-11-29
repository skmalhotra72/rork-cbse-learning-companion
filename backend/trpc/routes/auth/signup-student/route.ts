import { TRPCError } from '@trpc/server';
import { publicProcedure } from '../../../create-context';
import { signupStudentSchema, type StudentProfileResponse } from '../../../../types/auth';

export const signupStudentProcedure = publicProcedure
  .input(signupStudentSchema)
  .mutation(async ({ input, ctx }) => {
    console.log('[Auth] Student signup request:', { email: input.email, grade: input.grade });

    const { data: authData, error: authError } = await ctx.supabase.auth.signUp({
      email: input.email,
      password: input.password,
    });

    if (authError || !authData.user) {
      console.error('[Auth] Signup error:', authError);
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: authError?.message || 'Failed to create account',
      });
    }

    console.log('[Auth] User created in auth.users:', authData.user.id);

    try {
      const { error: userError } = await ctx.supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: input.email,
          role: 'student',
        });

      if (userError) {
        console.error('[Auth] Error creating user record:', userError);
        throw userError;
      }

      console.log('[Auth] User record created in public.users');

      const { data: profileData, error: profileError } = await ctx.supabase
        .from('student_profiles')
        .insert({
          user_id: authData.user.id,
          full_name: input.fullName,
          grade: input.grade,
          board: input.board || 'CBSE',
          date_of_birth: input.dateOfBirth || null,
          school_name: input.schoolName || null,
        })
        .select()
        .single();

      if (profileError || !profileData) {
        console.error('[Auth] Error creating student profile:', profileError);
        throw profileError;
      }

      console.log('[Auth] Student profile created:', profileData.id);

      const profile: StudentProfileResponse = {
        id: profileData.id,
        userId: profileData.user_id,
        fullName: profileData.full_name,
        email: input.email,
        grade: profileData.grade,
        board: profileData.board,
        schoolName: profileData.school_name || undefined,
        dateOfBirth: profileData.date_of_birth || undefined,
        avatarUrl: profileData.avatar_url || undefined,
        currentStreak: profileData.current_streak,
        totalPoints: profileData.total_points,
        level: profileData.level,
      };

      console.log('[Auth] Student signup successful');

      return {
        user: {
          id: authData.user.id,
          email: input.email,
          role: 'student' as const,
        },
        session: authData.session,
        profile,
      };
    } catch (error: any) {
      console.error('[Auth] Failed to create profile:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error?.message || 'Failed to create student profile',
      });
    }
  });

export default signupStudentProcedure;
