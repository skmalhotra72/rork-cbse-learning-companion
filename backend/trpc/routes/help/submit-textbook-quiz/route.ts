import { z } from "zod";
import { protectedProcedure } from "../../../create-context";
import { supabase } from "@/lib/supabase";

export const submitTextbookQuizProcedure = protectedProcedure
  .input(
    z.object({
      uploadId: z.string(),
      answers: z.array(
        z.object({
          questionId: z.string(),
          selectedAnswer: z.number(),
          isCorrect: z.boolean(),
        })
      ),
      totalQuestions: z.number(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const { uploadId, answers, totalQuestions } = input;
    const userId = ctx.userId;

    console.log(`[Submit Textbook Quiz] Processing quiz submission for upload ${uploadId}`);

    const { data: studentProfile } = await supabase
      .from("student_profiles")
      .select("id, total_points, level")
      .eq("user_id", userId)
      .single();

    if (!studentProfile) {
      throw new Error("Student profile not found");
    }

    const correctCount = answers.filter((a) => a.isCorrect).length;
    const scorePercentage = (correctCount / totalQuestions) * 100;
    const xpEarned = Math.round(correctCount * 15);

    console.log(`[Submit Textbook Quiz] Score: ${scorePercentage}%, XP: ${xpEarned}`);

    const { data: currentUpload } = await supabase
      .from("uploads")
      .select("ai_analysis")
      .eq("id", uploadId)
      .single();

    const updatedAnalysis = {
      ...(currentUpload?.ai_analysis || {}),
      quizCompleted: true,
      score: scorePercentage,
      xpEarned,
      correctCount,
      totalQuestions,
    };

    await supabase
      .from("uploads")
      .update({ ai_analysis: updatedAnalysis })
      .eq("id", uploadId);

    const newTotalPoints = studentProfile.total_points + xpEarned;
    const newLevel = Math.floor(newTotalPoints / 100) + 1;

    await supabase
      .from("student_profiles")
      .update({
        total_points: newTotalPoints,
        level: newLevel,
      })
      .eq("id", studentProfile.id);

    if (scorePercentage === 100) {
      await supabase.from("gamification").insert({
        student_id: studentProfile.id,
        achievement_type: "quiz_perfect",
        achievement_name: "Perfect Understanding!",
        description: "Got all questions correct on textbook help",
        points_awarded: 25,
        rarity: "rare",
      });
    }

    console.log(`[Submit Textbook Quiz] Submission complete`);

    return {
      xpEarned,
      scorePercentage,
      correctCount,
      totalQuestions,
      newLevel,
      newTotalPoints,
      isPerfect: scorePercentage === 100,
    };
  });

export default submitTextbookQuizProcedure;
