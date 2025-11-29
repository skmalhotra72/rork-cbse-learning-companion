import { z } from "zod";
import { protectedProcedure } from "../../../create-context";
import { TRPCError } from "@trpc/server";
import { analyzeTextbookImage, generateQuiz } from "@/services/aiService";
import { Subject, CBSEClass } from "@/constants/cbse";

export const processTextbookProcedure = protectedProcedure
  .input(
    z.object({
      uploadId: z.string(),
      studentQuestion: z.string(),
      subject: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.userId;
    console.log("[Process Textbook] Processing upload:", input.uploadId);

    const { supabase } = ctx;
    const { uploadId, studentQuestion, subject } = input;

    const studentProfile = await supabase
      .from("student_profiles")
      .select("id, grade")
      .eq("user_id", userId)
      .single();

    if (studentProfile.error || !studentProfile.data) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Student profile not found",
      });
    }

    const studentId = studentProfile.data.id;
    const studentClass = studentProfile.data.grade as CBSEClass;

    const uploadRecord = await supabase
      .from("uploads")
      .select("*")
      .eq("id", uploadId)
      .eq("student_id", studentId)
      .single();

    if (uploadRecord.error || !uploadRecord.data) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Upload not found",
      });
    }

    await supabase
      .from("uploads")
      .update({ processing_status: "processing" })
      .eq("id", uploadId);

    try {
      const imageBase64 = uploadRecord.data.file_url;

      const visionResult = await analyzeTextbookImage({
        imageBase64,
        studentQuestion,
        subject: subject as Subject,
        studentClass,
      });

      const mainConcept = visionResult.relatedConcepts[0] || "General Concept";

      const quizQuestions = await generateQuiz({
        subject: subject as Subject,
        studentClass,
        concept: mainConcept,
        difficulty: 'easy',
        questionCount: 3,
      });

      const aiAnalysis = {
        explanation: visionResult.explanation,
        relatedConcepts: visionResult.relatedConcepts,
        mainConcept,
        quiz: quizQuestions,
        processedAt: new Date().toISOString(),
      };

      await supabase
        .from("uploads")
        .update({
          processing_status: "completed",
          ai_analysis: aiAnalysis,
          processed_at: new Date().toISOString(),
        })
        .eq("id", uploadId);

      console.log("[Process Textbook] Processing completed for upload:", uploadId);

      return {
        uploadId,
        explanation: visionResult.explanation,
        relatedConcepts: visionResult.relatedConcepts,
        mainConcept,
        quiz: quizQuestions,
      };
    } catch (error: any) {
      console.error("[Process Textbook] Error processing:", error);

      await supabase
        .from("uploads")
        .update({
          processing_status: "failed",
          error_message: error.message || "Processing failed",
        })
        .eq("id", uploadId);

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message || "Failed to process textbook image",
      });
    }
  });
