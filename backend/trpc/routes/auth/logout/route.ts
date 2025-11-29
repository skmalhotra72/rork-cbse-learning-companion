import { publicProcedure } from '../../../create-context';

export const logoutProcedure = publicProcedure
  .mutation(async ({ ctx }) => {
    console.log('[Auth] Logout request');

    await ctx.supabase.auth.signOut();
    console.log('[Auth] Session invalidated');

    return { success: true };
  });

export default logoutProcedure;
