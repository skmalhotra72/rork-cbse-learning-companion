export const XP_RULES = {
  QUIZ_COMPLETION: 50,
  QUIZ_PERFECT_SCORE: 100,
  LESSON_COMPLETION: 30,
  DIAGNOSTIC_COMPLETION: 75,
  GAP_CLOSED: 100,
  DAILY_LOGIN: 10,
  STREAK_BONUS_PER_DAY: 5,
  HELP_REQUEST: 5,
} as const;

export const LEVEL_THRESHOLDS = [
  0,
  100,
  250,
  450,
  700,
  1000,
  1400,
  1900,
  2500,
  3200,
  4000,
  5000,
  6200,
  7600,
  9200,
  11000,
  13000,
  15500,
  18500,
  22000,
];

export function calculateLevel(totalPoints: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalPoints >= LEVEL_THRESHOLDS[i]) {
      return i + 1;
    }
  }
  return 1;
}

export function getNextLevelProgress(totalPoints: number): {
  currentLevel: number;
  nextLevel: number;
  currentLevelPoints: number;
  nextLevelPoints: number;
  progress: number;
} {
  const currentLevel = calculateLevel(totalPoints);
  const nextLevel = currentLevel + 1;
  
  const currentLevelPoints = LEVEL_THRESHOLDS[currentLevel - 1] || 0;
  const nextLevelPoints = LEVEL_THRESHOLDS[currentLevel] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  
  const pointsIntoLevel = totalPoints - currentLevelPoints;
  const pointsNeededForLevel = nextLevelPoints - currentLevelPoints;
  const progress = Math.min((pointsIntoLevel / pointsNeededForLevel) * 100, 100);
  
  return {
    currentLevel,
    nextLevel,
    currentLevelPoints,
    nextLevelPoints,
    progress,
  };
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirement: {
    type: 'streak' | 'points' | 'gaps_closed' | 'quizzes' | 'perfect_scores' | 'level';
    value: number;
  };
  points: number;
}

export const BADGES: Badge[] = [
  {
    id: 'first_steps',
    name: 'First Steps',
    description: 'Complete your first lesson',
    icon: '🎯',
    rarity: 'common',
    requirement: { type: 'gaps_closed', value: 1 },
    points: 50,
  },
  {
    id: 'streak_3',
    name: '3-Day Streak',
    description: 'Learn for 3 consecutive days',
    icon: '🔥',
    rarity: 'common',
    requirement: { type: 'streak', value: 3 },
    points: 30,
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Learn for 7 consecutive days',
    icon: '⚡',
    rarity: 'rare',
    requirement: { type: 'streak', value: 7 },
    points: 100,
  },
  {
    id: 'streak_30',
    name: 'Monthly Master',
    description: 'Learn for 30 consecutive days',
    icon: '🏆',
    rarity: 'epic',
    requirement: { type: 'streak', value: 30 },
    points: 500,
  },
  {
    id: 'streak_100',
    name: 'Century Scholar',
    description: 'Learn for 100 consecutive days',
    icon: '👑',
    rarity: 'legendary',
    requirement: { type: 'streak', value: 100 },
    points: 2000,
  },
  {
    id: 'points_500',
    name: 'Rising Star',
    description: 'Earn 500 total points',
    icon: '⭐',
    rarity: 'common',
    requirement: { type: 'points', value: 500 },
    points: 50,
  },
  {
    id: 'points_1000',
    name: 'Bright Mind',
    description: 'Earn 1000 total points',
    icon: '🌟',
    rarity: 'rare',
    requirement: { type: 'points', value: 1000 },
    points: 100,
  },
  {
    id: 'points_5000',
    name: 'Genius',
    description: 'Earn 5000 total points',
    icon: '💎',
    rarity: 'epic',
    requirement: { type: 'points', value: 5000 },
    points: 500,
  },
  {
    id: 'points_10000',
    name: 'Legend',
    description: 'Earn 10000 total points',
    icon: '🎖️',
    rarity: 'legendary',
    requirement: { type: 'points', value: 10000 },
    points: 1000,
  },
  {
    id: 'gaps_5',
    name: 'Gap Closer',
    description: 'Close 5 knowledge gaps',
    icon: '📚',
    rarity: 'common',
    requirement: { type: 'gaps_closed', value: 5 },
    points: 50,
  },
  {
    id: 'gaps_20',
    name: 'Knowledge Builder',
    description: 'Close 20 knowledge gaps',
    icon: '🧠',
    rarity: 'rare',
    requirement: { type: 'gaps_closed', value: 20 },
    points: 200,
  },
  {
    id: 'gaps_50',
    name: 'Master Learner',
    description: 'Close 50 knowledge gaps',
    icon: '🎓',
    rarity: 'epic',
    requirement: { type: 'gaps_closed', value: 50 },
    points: 500,
  },
  {
    id: 'quiz_perfect',
    name: 'Perfect Score',
    description: 'Get 100% on a quiz',
    icon: '💯',
    rarity: 'common',
    requirement: { type: 'perfect_scores', value: 1 },
    points: 50,
  },
  {
    id: 'quiz_perfect_10',
    name: 'Perfectionist',
    description: 'Get 100% on 10 quizzes',
    icon: '🏅',
    rarity: 'rare',
    requirement: { type: 'perfect_scores', value: 10 },
    points: 300,
  },
  {
    id: 'quiz_perfect_50',
    name: 'Flawless Scholar',
    description: 'Get 100% on 50 quizzes',
    icon: '👨‍🎓',
    rarity: 'epic',
    requirement: { type: 'perfect_scores', value: 50 },
    points: 1000,
  },
  {
    id: 'level_5',
    name: 'Level 5 Achieved',
    description: 'Reach level 5',
    icon: '🎯',
    rarity: 'common',
    requirement: { type: 'level', value: 5 },
    points: 100,
  },
  {
    id: 'level_10',
    name: 'Level 10 Achieved',
    description: 'Reach level 10',
    icon: '🚀',
    rarity: 'rare',
    requirement: { type: 'level', value: 10 },
    points: 300,
  },
  {
    id: 'level_20',
    name: 'Level 20 Achieved',
    description: 'Reach level 20',
    icon: '🌌',
    rarity: 'legendary',
    requirement: { type: 'level', value: 20 },
    points: 1000,
  },
];

export const RARITY_COLORS = {
  common: '#9CA3AF',
  rare: '#3B82F6',
  epic: '#8B5CF6',
  legendary: '#F59E0B',
} as const;

export const RARITY_GRADIENTS = {
  common: ['#9CA3AF', '#6B7280'],
  rare: ['#3B82F6', '#2563EB'],
  epic: ['#8B5CF6', '#7C3AED'],
  legendary: ['#F59E0B', '#D97706'],
} as const;
