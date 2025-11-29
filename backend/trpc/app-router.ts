import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import signupStudentProcedure from "./routes/auth/signup-student/route";
import signupParentProcedure from "./routes/auth/signup-parent/route";
import loginProcedure from "./routes/auth/login/route";
import logoutProcedure from "./routes/auth/logout/route";
import meProcedure from "./routes/auth/me/route";
import linkStudentProcedure from "./routes/auth/link-student/route";
import completeOnboardingProcedure from "./routes/onboarding/complete-onboarding/route";

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
});

export type AppRouter = typeof appRouter;
