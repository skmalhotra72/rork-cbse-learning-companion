import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import {
  StudentProfile,
  ProgressData,
  ConceptGap,
  QuizResult,
  ParentReward,
  calculateLevel,
  BADGE_DEFINITIONS,
} from '@/constants/cbse';

const STORAGE_KEYS = {
  PROFILE: '@cbse_app_profile',
  PROGRESS: '@cbse_app_progress',
  REWARDS: '@cbse_app_rewards',
};

const DEFAULT_PROGRESS: ProgressData = {
  xp: 0,
  level: 1,
  streakDays: 0,
  lastActivityDate: new Date().toISOString().split('T')[0],
  conceptGaps: [],
  completedLessons: [],
  quizResults: [],
  badges: [],
  chapterProgress: {},
};

export const [AppStateProvider, useAppState] = createContextHook(() => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [progress, setProgress] = useState<ProgressData>(DEFAULT_PROGRESS);
  const [rewards, setRewards] = useState<ParentReward[]>([]);

  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      console.log('[AppState] Loading profile from AsyncStorage...');
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.PROFILE);
        console.log('[AppState] Profile loaded:', stored ? 'exists' : 'null');
        return stored ? JSON.parse(stored) : null;
      } catch (error) {
        console.error('[AppState] Error loading profile:', error);
        return null;
      }
    },
    staleTime: 0,
    retry: false,
  });

  const progressQuery = useQuery({
    queryKey: ['progress'],
    queryFn: async () => {
      console.log('[AppState] Loading progress from AsyncStorage...');
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.PROGRESS);
        console.log('[AppState] Progress loaded:', stored ? 'exists' : 'using default');
        return stored ? JSON.parse(stored) : DEFAULT_PROGRESS;
      } catch (error) {
        console.error('[AppState] Error loading progress:', error);
        return DEFAULT_PROGRESS;
      }
    },
    staleTime: 0,
    retry: false,
  });

  const rewardsQuery = useQuery({
    queryKey: ['rewards'],
    queryFn: async () => {
      console.log('[AppState] Loading rewards from AsyncStorage...');
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.REWARDS);
        console.log('[AppState] Rewards loaded:', stored ? 'exists' : 'empty array');
        return stored ? JSON.parse(stored) : [];
      } catch (error) {
        console.error('[AppState] Error loading rewards:', error);
        return [];
      }
    },
    staleTime: 0,
    retry: false,
  });

  useEffect(() => {
    if (profileQuery.data !== undefined) {
      setProfile(profileQuery.data);
    }
  }, [profileQuery.data]);

  useEffect(() => {
    if (progressQuery.data) {
      setProgress(progressQuery.data);
    }
  }, [progressQuery.data]);

  useEffect(() => {
    if (rewardsQuery.data) {
      setRewards(rewardsQuery.data);
    }
  }, [rewardsQuery.data]);

  const saveProfileMutation = useMutation({
    mutationFn: async (newProfile: StudentProfile) => {
      await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(newProfile));
      return newProfile;
    },
    onSuccess: (data) => {
      setProfile(data);
    },
  });

  const saveProgressMutation = useMutation({
    mutationFn: async (newProgress: ProgressData) => {
      await AsyncStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(newProgress));
      return newProgress;
    },
    onSuccess: (data) => {
      setProgress(data);
    },
  });

  const saveRewardsMutation = useMutation({
    mutationFn: async (newRewards: ParentReward[]) => {
      await AsyncStorage.setItem(STORAGE_KEYS.REWARDS, JSON.stringify(newRewards));
      return newRewards;
    },
    onSuccess: (data) => {
      setRewards(data);
    },
  });

  const updateProfile = (updates: Partial<StudentProfile>) => {
    if (!profile) return;
    const updated = { ...profile, ...updates };
    saveProfileMutation.mutate(updated);
  };

  const addXP = (amount: number) => {
    const newXP = progress.xp + amount;
    const newLevel = calculateLevel(newXP);
    const leveledUp = newLevel > progress.level;

    const updated = {
      ...progress,
      xp: newXP,
      level: newLevel,
    };

    saveProgressMutation.mutate(updated);

    return { newXP, newLevel, leveledUp };
  };

  const updateStreak = () => {
    const today = new Date().toISOString().split('T')[0];
    const lastDate = new Date(progress.lastActivityDate);
    const todayDate = new Date(today);
    
    const diffTime = todayDate.getTime() - lastDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    let newStreakDays = progress.streakDays;

    if (diffDays === 0) {
      return;
    } else if (diffDays === 1) {
      newStreakDays = progress.streakDays + 1;
    } else {
      newStreakDays = 1;
    }

    const updated = {
      ...progress,
      streakDays: newStreakDays,
      lastActivityDate: today,
    };

    saveProgressMutation.mutate(updated);

    if (newStreakDays === 7 && !progress.badges.includes('week_streak')) {
      unlockBadge('week_streak');
    }
  };

  const addConceptGap = (gap: ConceptGap) => {
    const updated = {
      ...progress,
      conceptGaps: [...progress.conceptGaps, gap],
    };
    saveProgressMutation.mutate(updated);
  };

  const removeConceptGap = (gapId: string) => {
    const updated = {
      ...progress,
      conceptGaps: progress.conceptGaps.filter((g) => g.id !== gapId),
    };
    saveProgressMutation.mutate(updated);
  };

  const completeLesson = (lessonId: string) => {
    if (progress.completedLessons.includes(lessonId)) return;

    const updated = {
      ...progress,
      completedLessons: [...progress.completedLessons, lessonId],
    };

    saveProgressMutation.mutate(updated);

    if (progress.completedLessons.length === 0) {
      unlockBadge('first_lesson');
    }
  };

  const addQuizResult = (result: QuizResult) => {
    const updated = {
      ...progress,
      quizResults: [...progress.quizResults, result],
    };
    saveProgressMutation.mutate(updated);

    if (result.score === 100 && !progress.badges.includes('quiz_master')) {
      unlockBadge('quiz_master');
    }
  };

  const unlockBadge = (badgeId: string) => {
    if (progress.badges.includes(badgeId)) return;

    const updated = {
      ...progress,
      badges: [...progress.badges, badgeId],
    };
    saveProgressMutation.mutate(updated);

    addXP(50);
  };

  const addReward = (reward: ParentReward) => {
    const updated = [...rewards, reward];
    saveRewardsMutation.mutate(updated);
  };

  const completeReward = (rewardId: string) => {
    const updated = rewards.map((r) =>
      r.id === rewardId ? { ...r, completed: true, completedAt: Date.now() } : r
    );
    saveRewardsMutation.mutate(updated);
  };

  const isLoading = profileQuery.isLoading || progressQuery.isLoading || rewardsQuery.isLoading;
  
  console.log('[AppState] State:', {
    isLoading,
    profileLoading: profileQuery.isLoading,
    progressLoading: progressQuery.isLoading,
    rewardsLoading: rewardsQuery.isLoading,
    hasProfile: !!profile,
  });

  return {
    profile,
    progress,
    rewards,
    isLoading,
    updateProfile,
    addXP,
    updateStreak,
    addConceptGap,
    removeConceptGap,
    completeLesson,
    addQuizResult,
    unlockBadge,
    addReward,
    completeReward,
  };
});

export function useUnlockedBadges() {
  const { progress } = useAppState();
  return BADGE_DEFINITIONS.filter((b) => progress.badges.includes(b.id));
}

export function useActiveGaps() {
  const { progress } = useAppState();
  return progress.conceptGaps.filter((gap) => {
    const hasCompletedLesson = progress.completedLessons.some((l) => l.startsWith(gap.id));
    return !hasCompletedLesson;
  });
}
