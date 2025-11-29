import { protectedProcedure } from '../../../create-context';

export const meProcedure = protectedProcedure
  .query(async ({ ctx }) => {
    console.log('[Auth] Me request for user:', ctx.userId);

    const { data: userData, error: userError } = await ctx.supabase
      .from('users')
      .select('role')
      .eq('id', ctx.userId)
      .single();

    if (userError || !userData) {
      console.error('[Auth] Error fetching user:', userError);
      return null;
    }

    let profile = null;

    if (userData.role === 'student') {
      const { data: studentProfile, error: profileError } = await ctx.supabase
        .from('student_profiles')
        .select('*')
        .eq('user_id', ctx.userId)
        .single();

      if (!profileError && studentProfile) {
        profile = {
          id: studentProfile.id,
          userId: studentProfile.user_id,
          fullName: studentProfile.full_name,
          email: ctx.userEmail,
          grade: studentProfile.grade,
          board: studentProfile.board,
          schoolName: studentProfile.school_name || undefined,
          dateOfBirth: studentProfile.date_of_birth || undefined,
          avatarUrl: studentProfile.avatar_url || undefined,
          currentStreak: studentProfile.current_streak,
          totalPoints: studentProfile.total_points,
          level: studentProfile.level,
        };
      }
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
        .eq('user_id', ctx.userId)
        .single();

      if (!profileError && parentProfile) {
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
          email: ctx.userEmail,
          phoneNumber: parentProfile.phone_number || undefined,
          linkedStudents,
        };
      }
    }

    return {
      user: {
        id: ctx.userId,
        email: ctx.userEmail,
        role: userData.role,
      },
      profile,
    };
  });

export default meProcedure;
