import { z } from "zod";
import { protectedProcedure } from "../../../create-context";
import { analyzeTextbookImage } from "@/services/aiService";
import { supabase } from "@/lib/supabase";

export const analyzeTextbookProcedure = protectedProcedure
  .input(
    z.object({
      imageBase64: z.string(),
      studentQuestion: z.string(),
      subject: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const { imageBase64, studentQuestion, subject } = input;
    const userId = ctx.userId;

    console.log(`[Analyze Textbook] Processing image for user ${userId}`);

    const { data: studentProfile } = await supabase
      .from("student_profiles")
      .select("id, grade")
      .eq("user_id", userId)
      .single();

    if (!studentProfile) {
      throw new Error("Student profile not found");
    }

    const uploadId = crypto.randomUUID();
    
    const { error: uploadError } = await supabase
      .from("uploads")
      .insert({
        id: uploadId,
        student_id: studentProfile.id,
        file_url: "data:image/base64",
        file_name: `textbook_${Date.now()}.jpg`,
        file_type: "image/jpeg",
        file_size: imageBase64.length,
        upload_type: "textbook_help",
        processing_status: "processing",
      })
      .select()
      .single();

    if (uploadError) {
      console.error("[Analyze Textbook] Upload creation error:", uploadError);
      throw new Error("Failed to create upload record");
    }

    try {
      const aiResult = await analyzeTextbookImage({
        imageBase64,
        studentQuestion,
        subject: subject as any,
        studentClass: studentProfile.grade as any,
      });

      await supabase
        .from("uploads")
        .update({
          processing_status: "completed",
          ai_analysis: {
            explanation: aiResult.explanation,
            relatedConcepts: aiResult.relatedConcepts,
            studentQuestion,
            subject,
          },
          processed_at: new Date().toISOString(),
        })
        .eq("id", uploadId);

      console.log(`[Analyze Textbook] Analysis complete for upload ${uploadId}`);

      return {
        uploadId,
        explanation: aiResult.explanation,
        relatedConcepts: aiResult.relatedConcepts,
      };
    } catch (error) {
      console.error("[Analyze Textbook] AI analysis error:", error);

      await supabase
        .from("uploads")
        .update({
          processing_status: "failed",
          error_message: error instanceof Error ? error.message : "Unknown error",
        })
        .eq("id", uploadId);

      throw new Error("Failed to analyze textbook image");
    }
  });

export default analyzeTextbookProcedure;
