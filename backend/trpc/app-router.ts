import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import signupStudentProcedure from "./routes/auth/signup-student/route";
import signupParentProcedure from "./routes/auth/signup-parent/route";
import loginProcedure from "./routes/auth/login/route";
import logoutProcedure from "./routes/auth/logout/route";
import meProcedure from "./routes/auth/me/route";
import linkStudentProcedure from "./routes/auth/link-student/route";
import completeOnboardingProcedure from "./routes/onboarding/complete-onboarding/route";
import { runDiagnosisProcedure } from "./routes/diagnostics/run-diagnosis/route";
import { getGapsProcedure } from "./routes/diagnostics/get-gaps/route";
import { getSubjectsProcedure } from "./routes/diagnostics/get-subjects/route";
import { generateLessonProcedure } from "./routes/bridge/generate-lesson/route";
import { completeLessonProcedure } from "./routes/bridge/complete-lesson/route";
import { generateQuizProcedure } from "./routes/bridge/generate-quiz/route";
import { submitQuizProcedure } from "./routes/bridge/submit-quiz/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  auth: createTRPCRouter({
    signupStudent: signupStudentProcedure,
    signupParent: signupParentProcedure,
    login: loginProcedure,
    logout: logoutProcedure,
    me: meProcedure,
    linkStudent: linkStudentProcedure,
  }),
  onboarding: createTRPCRouter({
    complete: completeOnboardingProcedure,
  }),
  diagnostics: createTRPCRouter({
    runDiagnosis: runDiagnosisProcedure,
    getGaps: getGapsProcedure,
    getSubjects: getSubjectsProcedure,
  }),
  bridge: createTRPCRouter({
    generateLesson: generateLessonProcedure,
    completeLesson: completeLessonProcedure,
    generateQuiz: generateQuizProcedure,
    submitQuiz: submitQuizProcedure,
  }),
});

export type AppRouter = typeof appRouter;
