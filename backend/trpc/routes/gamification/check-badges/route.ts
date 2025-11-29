import { z } from "zod";
import { protectedProcedure } from "../../../create-context";
import { BADGES } from "@/constants/gamification";

export const checkBadgesProcedure = protectedProcedure
  .input(
    z.object({
      studentId: z.string().uuid(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    console.log("[Gamification] Checking badges for student:", input.studentId);

    const { data: studentProfile, error: profileError } = await ctx.supabase
      .from("student_profiles")
      .select("*")
      .eq("id", input.studentId)
      .single();

    if (profileError || !studentProfile) {
      throw new Error("Student not found");
    }

    const { data: existingBadges } = await ctx.supabase
      .from("gamification")
      .select("*")
      .eq("student_id", input.studentId)
      .eq("achievement_type", "badge");

    const earnedBadgeIds = new Set(
      (existingBadges || []).map((b: any) => b.metadata?.badgeId).filter(Boolean)
    );

    const { data: gapsClosed } = await ctx.supabase
      .from("diagnostics")
      .select("id")
      .eq("student_id", input.studentId)
      .eq("status", "resolved");

    const { data: quizAttempts } = await ctx.supabase
      .from("quiz_attempts")
      .select("score, is_passed")
      .eq("student_id", input.studentId)
      .eq("status", "completed");

    const perfectScores = (quizAttempts || []).filter(
      (a: any) => a.score === 100
    ).length;

    const stats = {
      streak: studentProfile.current_streak,
      points: studentProfile.total_points,
      gaps_closed: (gapsClosed || []).length,
      quizzes: (quizAttempts || []).length,
      perfect_scores: perfectScores,
      level: studentProfile.level,
    };

    const newBadges: any[] = [];

    for (const badge of BADGES) {
      if (earnedBadgeIds.has(badge.id)) {
        continue;
      }

      const statValue = stats[badge.requirement.type];
      if (statValue >= badge.requirement.value) {
        const { error: insertError } = await ctx.supabase
          .from("gamification")
          .insert({
            student_id: input.studentId,
            achievement_type: "badge",
            achievement_name: badge.name,
            description: badge.description,
            icon_url: badge.icon,
            points_awarded: badge.points,
            rarity: badge.rarity,
            metadata: { badgeId: badge.id },
            earned_at: new Date().toISOString(),
          });

        if (!insertError) {
          newBadges.push(badge);

          const { error: xpError } = await ctx.supabase
            .from("student_profiles")
            .update({
              total_points: studentProfile.total_points + badge.points,
            })
            .eq("id", input.studentId);

          if (xpError) {
            console.error("[Gamification] Failed to award badge XP:", xpError);
          }
        }
      }
    }

    console.log(`[Gamification] Awarded ${newBadges.length} new badges`);

    return {
      newBadges,
      stats,
    };
  });
