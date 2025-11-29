import { z } from "zod";
import { protectedProcedure } from "../../../create-context";
import { TRPCError } from "@trpc/server";
import { XP_RULES } from "@/constants/gamification";

export const submitVisionQuizProcedure = protectedProcedure
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
      score: z.number(),
      timeTaken: z.number(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.userId;
    console.log("[Submit Vision Quiz] User:", userId, "Upload:", input.uploadId);

    const { supabase } = ctx;
    const { uploadId, answers, score, timeTaken } = input;

    const studentProfile = await supabase
      .from("student_profiles")
      .select("id, total_points, level")
      .eq("user_id", userId)
      .single();

    if (studentProfile.error || !studentProfile.data) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Student profile not found",
      });
    }

    const studentId = studentProfile.data.id;

    const uploadRecord = await supabase
      .from("uploads")
      .select("id, ai_analysis")
      .eq("id", uploadId)
      .eq("student_id", studentId)
      .single();

    if (uploadRecord.error || !uploadRecord.data) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Upload not found",
      });
    }

    const totalQuestions = answers.length;
    const correctCount = answers.filter((a) => a.isCorrect).length;
    const scorePercentage = (correctCount / totalQuestions) * 100;

    let xpAwarded = 0;
    if (scorePercentage >= 100) {
      xpAwarded = XP_RULES.QUIZ_PERFECT_SCORE;
    } else if (scorePercentage >= 60) {
      xpAwarded = XP_RULES.QUIZ_COMPLETED;
    } else {
      xpAwarded = Math.floor(XP_RULES.QUIZ_COMPLETED * 0.5);
    }

    const newTotalPoints = studentProfile.data.total_points + xpAwarded;
    const newLevel = Math.floor(newTotalPoints / 100) + 1;

    await supabase
      .from("student_profiles")
      .update({
        total_points: newTotalPoints,
        level: newLevel,
      })
      .eq("id", studentId);

    const quizResult = {
      uploadId,
      answers,
      score,
      scorePercentage,
      correctCount,
      totalQuestions,
      timeTaken,
      completedAt: new Date().toISOString(),
    };

    const updatedAiAnalysis = {
      ...(uploadRecord.data.ai_analysis as any),
      quizResult,
    };

    await supabase
      .from("uploads")
      .update({
        ai_analysis: updatedAiAnalysis,
      })
      .eq("id", uploadId);

    console.log("[Submit Vision Quiz] XP awarded:", xpAwarded);

    return {
      success: true,
      xpAwarded,
      newTotalPoints,
      newLevel,
      scorePercentage,
      correctCount,
      totalQuestions,
    };
  });
