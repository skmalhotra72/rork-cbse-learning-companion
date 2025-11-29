import { z } from "zod";
import { protectedProcedure } from "../../../create-context";

export const getLeaderboardProcedure = protectedProcedure
  .input(
    z.object({
      limit: z.number().int().positive().optional().default(20),
      grade: z.number().int().optional(),
    })
  )
  .query(async ({ input, ctx }) => {
    console.log("[Gamification] Getting leaderboard");

    let query = ctx.supabase
      .from("student_profiles")
      .select("id, full_name, grade, total_points, level, current_streak")
      .order("total_points", { ascending: false })
      .limit(input.limit);

    if (input.grade) {
      query = query.eq("grade", input.grade);
    }

    const { data: students, error } = await query;

    if (error) {
      console.error("[Gamification] Error fetching leaderboard:", error);
      throw new Error("Failed to fetch leaderboard");
    }

    return {
      leaderboard: (students || []).map((student, index) => ({
        rank: index + 1,
        studentId: student.id,
        fullName: student.full_name,
        grade: student.grade,
        totalPoints: student.total_points,
        level: student.level,
        currentStreak: student.current_streak,
      })),
    };
  });
