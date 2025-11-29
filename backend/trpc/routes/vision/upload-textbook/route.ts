import { z } from "zod";
import { protectedProcedure } from "../../../create-context";
import { TRPCError } from "@trpc/server";

export const uploadTextbookProcedure = protectedProcedure
  .input(
    z.object({
      imageBase64: z.string(),
      fileName: z.string(),
      fileSize: z.number(),
      mimeType: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.userId;
    console.log("[Upload Textbook] Starting upload for user:", userId);

    const { supabase } = ctx;
    const { imageBase64, fileName, fileSize, mimeType } = input;

    const studentProfile = await supabase
      .from("student_profiles")
      .select("id")
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
      .insert({
        student_id: studentId,
        file_url: imageBase64,
        file_name: fileName,
        file_type: mimeType,
        file_size: fileSize,
        upload_type: "textbook_help",
        processing_status: "pending",
      })
      .select()
      .single();

    if (uploadRecord.error || !uploadRecord.data) {
      console.error("[Upload Textbook] Error saving upload:", uploadRecord.error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to save upload",
      });
    }

    console.log("[Upload Textbook] Upload saved with ID:", uploadRecord.data.id);

    return {
      uploadId: uploadRecord.data.id,
      status: "pending",
    };
  });
