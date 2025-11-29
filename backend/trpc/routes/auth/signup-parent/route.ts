import { TRPCError } from '@trpc/server';
import { publicProcedure } from '../../../create-context';
import { signupParentSchema, type ParentProfileResponse } from '../../../../types/auth';

export const signupParentProcedure = publicProcedure
  .input(signupParentSchema)
  .mutation(async ({ input, ctx }) => {
    console.log('[Auth] Parent signup request:', { email: input.email });

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
          role: 'parent',
        });

      if (userError) {
        console.error('[Auth] Error creating user record:', userError);
        throw userError;
      }

      console.log('[Auth] User record created in public.users');

      const { data: profileData, error: profileError } = await ctx.supabase
        .from('parent_profiles')
        .insert({
          user_id: authData.user.id,
          full_name: input.fullName,
          phone_number: input.phoneNumber || null,
        })
        .select()
        .single();

      if (profileError || !profileData) {
        console.error('[Auth] Error creating parent profile:', profileError);
        throw profileError;
      }

      console.log('[Auth] Parent profile created:', profileData.id);

      const profile: ParentProfileResponse = {
        id: profileData.id,
        userId: profileData.user_id,
        fullName: profileData.full_name,
        email: input.email,
        phoneNumber: profileData.phone_number || undefined,
        linkedStudents: [],
      };

      console.log('[Auth] Parent signup successful');

      return {
        user: {
          id: authData.user.id,
          email: input.email,
          role: 'parent' as const,
        },
        session: authData.session,
        profile,
      };
    } catch {
      console.error('[Auth] Failed to create profile, cleaning up auth user');
      await ctx.supabase.auth.admin.deleteUser(authData.user.id);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create parent profile',
      });
    }
  });

export default signupParentProcedure;
