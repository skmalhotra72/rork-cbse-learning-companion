import { z } from "zod";
import { protectedProcedure } from "../../../create-context";
import { calculateLevel } from "@/constants/gamification";

export const awardXpProcedure = protectedProcedure
  .input(
    z.object({
      studentId: z.string().uuid(),
      xpAmount: z.number().int().positive(),
      reason: z.string(),
      metadata: z.record(z.string(), z.any()).optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    console.log("[Gamification] Awarding XP:", input);

    const { data: studentProfile, error: fetchError } = await ctx.supabase
      .from("student_profiles")
      .select("*")
      .eq("id", input.studentId)
      .single();

    if (fetchError || !studentProfile) {
      console.error("[Gamification] Student not found:", fetchError);
      throw new Error("Student not found");
    }

    const oldPoints = studentProfile.total_points;
    const newPoints = oldPoints + input.xpAmount;
    const oldLevel = calculateLevel(oldPoints);
    const newLevel = calculateLevel(newPoints);
    const leveledUp = newLevel > oldLevel;

    const { error: updateError } = await ctx.supabase
      .from("student_profiles")
      .update({
        total_points: newPoints,
        level: newLevel,
        updated_at: new Date().toISOString(),
      })
      .eq("id", input.studentId);

    if (updateError) {
      console.error("[Gamification] Error updating points:", updateError);
      throw new Error("Failed to update points");
    }

    const { error: sessionError } = await ctx.supabase
      .from("learning_sessions")
      .insert({
        student_id: input.studentId,
        subject_id: "00000000-0000-0000-0000-000000000000",
        session_type: "xp_award",
        started_at: new Date().toISOString(),
        ended_at: new Date().toISOString(),
        duration_minutes: 0,
        points_earned: input.xpAmount,
        notes: input.reason,
        activities: input.metadata || {},
      });

    if (sessionError) {
      console.warn(
        "[Gamification] Could not log XP session:",
        sessionError
      );
    }

    if (leveledUp) {
      console.log(
        `[Gamification] Level up! ${oldLevel} -> ${newLevel}`
      );
    }

    return {
      success: true,
      oldPoints,
      newPoints,
      xpAwarded: input.xpAmount,
      oldLevel,
      newLevel,
      leveledUp,
    };
  });
