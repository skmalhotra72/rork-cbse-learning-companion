import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';

const onboardingInputSchema = z.object({
  fullName: z.string().min(1),
  grade: z.number().min(9).max(12),
  subjects: z.array(z.string()),
  subjectRatings: z.record(z.string(), z.enum(['struggling', 'okay', 'confident', 'expert'])),
  painPoints: z.record(z.string(), z.array(z.string())),
});

export const completeOnboardingProcedure = protectedProcedure
  .input(onboardingInputSchema)
  .mutation(async ({ input, ctx }) => {
    console.log('[Onboarding] Starting onboarding completion for user:', ctx.userId);

    try {
      const { data: existingProfile, error: fetchError } = await ctx.supabase
        .from('student_profiles')
        .select('id')
        .eq('user_id', ctx.userId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('[Onboarding] Error fetching profile:', fetchError);
        throw fetchError;
      }

      let profileId: string;

      if (existingProfile) {
        console.log('[Onboarding] Updating existing profile:', existingProfile.id);
        const { error: updateError } = await ctx.supabase
          .from('student_profiles')
          .update({
            full_name: input.fullName,
            grade: input.grade,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingProfile.id);

        if (updateError) {
          console.error('[Onboarding] Error updating profile:', updateError);
          throw updateError;
        }

        profileId = existingProfile.id;
      } else {
        console.log('[Onboarding] Creating new student profile');
        const { data: newProfile, error: createError } = await ctx.supabase
          .from('student_profiles')
          .insert({
            user_id: ctx.userId,
            full_name: input.fullName,
            grade: input.grade,
            board: 'CBSE',
          })
          .select()
          .single();

        if (createError || !newProfile) {
          console.error('[Onboarding] Error creating profile:', createError);
          throw createError;
        }

        profileId = newProfile.id;
      }

      const { data: subjects } = await ctx.supabase
        .from('subjects')
        .select('id, name')
        .in('name', input.subjects)
        .eq('grade', input.grade);

      if (subjects && subjects.length > 0) {
        console.log('[Onboarding] Found subjects:', subjects.length);

        const subjectSettings = subjects.map((subject) => {
          const rating = input.subjectRatings[subject.name as keyof typeof input.subjectRatings];
          return {
            student_id: profileId,
            subject_id: subject.id,
            is_enabled: true,
            difficulty_preference: rating || 'okay',
          };
        });

        const { error: settingsError } = await ctx.supabase
          .from('student_subject_settings')
          .upsert(subjectSettings, {
            onConflict: 'student_id,subject_id',
            ignoreDuplicates: false,
          });

        if (settingsError) {
          console.error('[Onboarding] Error saving subject settings:', settingsError);
        }

        const painPointsData: {
          student_id: string;
          subject_id: string;
          pain_type: string;
          description: string;
          severity: number;
          status: string;
        }[] = [];
        for (const subject of subjects) {
          const painPointTexts = input.painPoints[subject.name as keyof typeof input.painPoints] || [];
          for (const painText of painPointTexts) {
            if (painText && painText.trim().length > 0) {
              painPointsData.push({
                student_id: profileId,
                subject_id: subject.id,
                pain_type: 'concept',
                description: painText,
                severity: 3,
                status: 'active',
              });
            }
          }
        }

        if (painPointsData.length > 0) {
          console.log('[Onboarding] Saving pain points:', painPointsData.length);
          const { error: painError } = await ctx.supabase
            .from('pain_points')
            .insert(painPointsData);

          if (painError) {
            console.error('[Onboarding] Error saving pain points:', painError);
          }
        }
      }

      console.log('[Onboarding] Onboarding completed successfully');

      return {
        success: true,
        profileId,
      };
    } catch (error) {
      console.error('[Onboarding] Error during onboarding:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to complete onboarding',
      });
    }
  });

export default completeOnboardingProcedure;
