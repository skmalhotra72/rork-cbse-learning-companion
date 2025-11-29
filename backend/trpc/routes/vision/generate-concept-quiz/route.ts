import { studentProcedure } from "../../../create-context";
import { z } from "zod";
import { generateQuiz } from "@/services/aiService";

export const generateConceptQuizProcedure = studentProcedure
  .input(
    z.object({
      uploadId: z.string().uuid(),
      concept: z.string(),
      subjectCode: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const { uploadId, concept, subjectCode } = input;

    console.log("[Vision Quiz] Generating quiz for concept:", concept);

    const { data: studentProfile, error: profileError } = await ctx.supabase
      .from("student_profiles")
      .select("id, grade")
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

    const { data: subject } = await ctx.supabase
      .from("subjects")
      .select("*")
      .eq("code", subjectCode)
      .eq("grade", studentProfile.grade)
      .single();

    if (!subject) {
      throw new Error("Subject not found");
    }

    const quizQuestions = await generateQuiz({
      subject: subject.name as any,
      studentClass: String(studentProfile.grade) as any,
      concept,
      difficulty: "medium",
      questionCount: 3,
    });

    console.log("[Vision Quiz] Generated", quizQuestions.length, "questions");

    return {
      questions: quizQuestions,
      concept,
      subjectName: subject.name,
    };
  });
