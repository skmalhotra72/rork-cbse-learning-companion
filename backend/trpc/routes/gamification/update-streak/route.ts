import { z } from "zod";
import { protectedProcedure } from "../../../create-context";

export const updateStreakProcedure = protectedProcedure
  .input(
    z.object({
      studentId: z.string().uuid(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    console.log("[Gamification] Updating streak for student:", input.studentId);

    const { data: studentProfile, error: profileError } = await ctx.supabase
      .from("student_profiles")
      .select("*")
      .eq("id", input.studentId)
      .single();

    if (profileError || !studentProfile) {
      throw new Error("Student not found");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: todaySessions } = await ctx.supabase
      .from("learning_sessions")
      .select("id")
      .eq("student_id", input.studentId)
      .gte("started_at", today.toISOString())
      .limit(1);

    if ((todaySessions || []).length > 0) {
      console.log("[Gamification] Already logged activity today");
      return {
        streak: studentProfile.current_streak,
        updated: false,
      };
    }

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const { data: yesterdaySessions } = await ctx.supabase
      .from("learning_sessions")
      .select("id")
      .eq("student_id", input.studentId)
      .gte("started_at", yesterday.toISOString())
      .lt("started_at", today.toISOString())
      .limit(1);

    let newStreak: number;
    if ((yesterdaySessions || []).length > 0) {
      newStreak = studentProfile.current_streak + 1;
    } else {
      newStreak = 1;
    }

    const { error: updateError } = await ctx.supabase
      .from("student_profiles")
      .update({
        current_streak: newStreak,
        updated_at: new Date().toISOString(),
      })
      .eq("id", input.studentId);

    if (updateError) {
      console.error("[Gamification] Error updating streak:", updateError);
      throw new Error("Failed to update streak");
    }

    console.log(`[Gamification] Streak updated: ${studentProfile.current_streak} -> ${newStreak}`);

    return {
      streak: newStreak,
      updated: true,
      streakIncrease: newStreak > studentProfile.current_streak,
    };
  });
