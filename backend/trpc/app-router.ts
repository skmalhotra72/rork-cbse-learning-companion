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
import { awardXpProcedure } from "./routes/gamification/award-xp/route";
import { checkBadgesProcedure } from "./routes/gamification/check-badges/route";
import { updateStreakProcedure } from "./routes/gamification/update-streak/route";
import { getBadgesProcedure } from "./routes/gamification/get-badges/route";
import { getLeaderboardProcedure } from "./routes/gamification/get-leaderboard/route";
import { createRewardProcedure } from "./routes/rewards/create-reward/route";
import { getRewardsProcedure } from "./routes/rewards/get-rewards/route";
import { redeemRewardProcedure } from "./routes/rewards/redeem-reward/route";
import { updateRewardProcedure } from "./routes/rewards/update-reward/route";

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
  gamification: createTRPCRouter({
    awardXp: awardXpProcedure,
    checkBadges: checkBadgesProcedure,
    updateStreak: updateStreakProcedure,
    getBadges: getBadgesProcedure,
    getLeaderboard: getLeaderboardProcedure,
  }),
  rewards: createTRPCRouter({
    create: createRewardProcedure,
    get: getRewardsProcedure,
    redeem: redeemRewardProcedure,
    update: updateRewardProcedure,
  }),
});

export type AppRouter = typeof appRouter;
