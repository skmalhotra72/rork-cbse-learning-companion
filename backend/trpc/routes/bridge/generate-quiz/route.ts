import { studentProcedure } from "../../../create-context";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { generateQuiz } from "@/services/aiService";
import { CBSEClass, Subject } from "@/constants/cbse";
import { withAILogging } from "@/services/aiLogger";

const inputSchema = z.object({
  concept: z.string(),
  subject: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  questionCount: z.number().min(1).max(10).optional(),
});

export const generateQuizProcedure = studentProcedure
  .input(inputSchema)
  .mutation(async ({ ctx, input }) => {
    console.log('[generateQuiz] Generating quiz for:', input.concept);

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

    const questions = await withAILogging(
      ctx.supabase,
      {
        operationType: 'CREATE_QUIZ',
        userId: ctx.userId,
        studentId: studentProfile.id,
      },
      () => generateQuiz({
        subject: input.subject as Subject,
        studentClass: String(studentProfile.grade) as CBSEClass,
        concept: input.concept,
        difficulty: input.difficulty || 'medium',
        questionCount: input.questionCount || 5,
      })
    );

    console.log('[generateQuiz] Quiz generated with', questions.length, 'questions');

    return {
      questions,
      concept: input.concept,
      subject: input.subject,
    };
  });
