import { z } from "zod";
import { protectedProcedure } from "../../../create-context";
import { generateQuiz } from "@/services/aiService";
import { supabase } from "@/lib/supabase";

export const generateTextbookQuizProcedure = protectedProcedure
  .input(
    z.object({
      uploadId: z.string(),
      concept: z.string(),
      subject: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const { uploadId, concept, subject } = input;
    const userId = ctx.userId;

    console.log(`[Generate Textbook Quiz] Creating quiz for concept: ${concept}`);

    const { data: studentProfile } = await supabase
      .from("student_profiles")
      .select("id, grade")
      .eq("user_id", userId)
      .single();

    if (!studentProfile) {
      throw new Error("Student profile not found");
    }

    const { data: upload } = await supabase
      .from("uploads")
      .select("*")
      .eq("id", uploadId)
      .eq("student_id", studentProfile.id)
      .single();

    if (!upload) {
      throw new Error("Upload not found");
    }

    try {
      const quizQuestions = await generateQuiz({
        subject: subject as any,
        studentClass: studentProfile.grade as any,
        concept,
        difficulty: "easy",
        questionCount: 3,
      });

      console.log(`[Generate Textbook Quiz] Generated ${quizQuestions.length} questions`);

      return {
        questions: quizQuestions,
      };
    } catch (error) {
      console.error("[Generate Textbook Quiz] Error:", error);
      throw new Error("Failed to generate quiz");
    }
  });

export default generateTextbookQuizProcedure;
