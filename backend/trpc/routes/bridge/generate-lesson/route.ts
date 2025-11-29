import { studentProcedure } from "../../../create-context";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { generateMicroLesson } from "@/services/aiService";
import { CBSEClass, Subject } from "@/constants/cbse";
import { withAILogging } from "@/services/aiLogger";

const inputSchema = z.object({
  gapConcept: z.string(),
  chapter: z.string(),
  subject: z.string(),
});

export const generateLessonProcedure = studentProcedure
  .input(inputSchema)
  .mutation(async ({ ctx, input }) => {
    console.log('[generateLesson] Generating lesson for:', input.gapConcept);

    const { data: studentProfile, error: profileError } = await ctx.supabase
      .from('student_profiles')
      .select('id, grade')
      .eq('user_id', ctx.userId)
      .single();

    if (profileError || !studentProfile) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Student profile not found',
      });
    }

    const lesson = await withAILogging(
      ctx.supabase,
      {
        operationType: 'MICRO_LESSON',
        userId: ctx.userId,
        studentId: studentProfile.id,
      },
      () => generateMicroLesson({
        subject: input.subject as Subject,
        studentClass: String(studentProfile.grade) as CBSEClass,
        concept: input.gapConcept,
        chapter: input.chapter,
      })
    );

    console.log('[generateLesson] Lesson generated successfully');

    return {
      lesson: {
        ...lesson,
        concept: input.gapConcept,
        chapter: input.chapter,
        subject: input.subject,
      },
    };
  });
