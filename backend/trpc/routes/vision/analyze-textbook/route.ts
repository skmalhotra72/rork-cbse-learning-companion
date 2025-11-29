import { studentProcedure } from "../../../create-context";
import { z } from "zod";
import { analyzeTextbookImage } from "@/services/aiService";

export const analyzeTextbookProcedure = studentProcedure
  .input(
    z.object({
      imageBase64: z.string(),
      studentQuestion: z.string(),
      subjectCode: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const { imageBase64, studentQuestion, subjectCode } = input;

    console.log("[Vision] Analyzing textbook image for student:", ctx.userId);

    const { data: studentProfile, error: profileError } = await ctx.supabase
      .from("student_profiles")
      .select("id, grade")
      .eq("user_id", ctx.userId)
      .single();

    if (profileError || !studentProfile) {
      throw new Error("Student profile not found");
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

    const uploadRecord = await ctx.supabase
      .from("uploads")
      .insert({
        student_id: studentProfile.id,
        file_url: "base64_image",
        file_name: `textbook_help_${Date.now()}.jpg`,
        file_type: "image/jpeg",
        file_size: imageBase64.length,
        upload_type: "textbook_help",
        processing_status: "processing",
      })
      .select()
      .single();

    if (uploadRecord.error) {
      console.error("[Vision] Error creating upload record:", uploadRecord.error);
      throw new Error("Failed to create upload record");
    }

    try {
      const analysis = await analyzeTextbookImage({
        imageBase64,
        studentQuestion,
        subject: subject.name as any,
        studentClass: String(studentProfile.grade) as any,
      });

      await ctx.supabase
        .from("uploads")
        .update({
          processing_status: "completed",
          ai_analysis: {
            explanation: analysis.explanation,
            relatedConcepts: analysis.relatedConcepts,
            timestamp: new Date().toISOString(),
          },
          processed_at: new Date().toISOString(),
        })
        .eq("id", uploadRecord.data.id);

      console.log("[Vision] Analysis completed successfully");

      return {
        uploadId: uploadRecord.data.id,
        explanation: analysis.explanation,
        relatedConcepts: analysis.relatedConcepts,
        subjectName: subject.name,
      };
    } catch (error) {
      console.error("[Vision] Error analyzing image:", error);

      await ctx.supabase
        .from("uploads")
        .update({
          processing_status: "failed",
          error_message: error instanceof Error ? error.message : "Unknown error",
        })
        .eq("id", uploadRecord.data.id);

      throw error;
    }
  });
