import { studentProcedure } from "../../../create-context";
import { z } from "zod";

export const submitConceptQuizProcedure = studentProcedure
  .input(
    z.object({
      uploadId: z.string().uuid(),
      answers: z.array(
        z.object({
          questionId: z.string(),
          selectedAnswer: z.number(),
          correctAnswer: z.number(),
          isCorrect: z.boolean(),
        })
      ),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const { uploadId, answers } = input;

    console.log("[Vision Quiz] Submitting quiz for upload:", uploadId);

    const { data: studentProfile, error: profileError } = await ctx.supabase
      .from("student_profiles")
      .select("*")
      .eq("user_id", ctx.userId)
      .single();

    if (profileError || !studentProfile) {
      throw new Error("Student profile not found");
    }

    const { data: upload, error: uploadError } = await ctx.supabase
      .from("uploads")
      .select("*")
      .eq("id", uploadId)
      .eq("student_id", studentProfile.id)
      .single();

    if (uploadError || !upload) {
      throw new Error("Upload not found");
    }

    const correctCount = answers.filter((a) => a.isCorrect).length;
    const totalQuestions = answers.length;
    const scorePercentage = (correctCount / totalQuestions) * 100;

    const xpPerQuestion = 10;
    const xpAwarded = correctCount * xpPerQuestion;

    await ctx.supabase
      .from("student_profiles")
      .update({
        total_points: studentProfile.total_points + xpAwarded,
      })
      .eq("id", studentProfile.id);

    await ctx.supabase.from("learning_sessions").insert({
      student_id: studentProfile.id,
      subject_id: null,
      session_type: "vision_concept_quiz",
      started_at: new Date().toISOString(),
      ended_at: new Date().toISOString(),
      duration_minutes: 2,
      activities: {
        action: "completed_vision_quiz",
        uploadId,
        correctCount,
        totalQuestions,
      },
      points_earned: xpAwarded,
    });

    console.log(
      `[Vision Quiz] Quiz completed: ${correctCount}/${totalQuestions} correct, awarded ${xpAwarded} XP`
    );

    return {
      correctCount,
      totalQuestions,
      scorePercentage,
      xpAwarded,
      passed: scorePercentage >= 60,
    };
  });
