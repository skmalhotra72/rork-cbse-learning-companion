export const XP_RULES = {
  QUIZ_COMPLETED: 50,
  QUIZ_PERFECT_SCORE: 100,
  LESSON_COMPLETED: 30,
  GAP_BRIDGED: 80,
  DAILY_LOGIN: 10,
  DIAGNOSTIC_COMPLETED: 60,
  HELP_QUESTION_ASKED: 5,
} as const;

export const LEVEL_THRESHOLD = 100;

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  condition: {
    type: 'streak' | 'xp' | 'quiz_count' | 'lesson_count' | 'gap_count' | 'perfect_score';
    target: number;
  };
  xpReward: number;
}

export const BADGES: BadgeDefinition[] = [
  {
    id: 'first_steps',
    name: 'First Steps',
    description: 'Complete your first lesson',
    icon: '🎯',
    rarity: 'common',
    condition: { type: 'lesson_count', target: 1 },
    xpReward: 20,
  },
  {
    id: 'quiz_master',
    name: 'Quiz Master',
    description: 'Complete 10 quizzes',
    icon: '📝',
    rarity: 'common',
    condition: { type: 'quiz_count', target: 10 },
    xpReward: 50,
  },
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    rarity: 'rare',
    condition: { type: 'streak', target: 7 },
    xpReward: 100,
  },
  {
    id: 'month_champion',
    name: 'Month Champion',
    description: 'Maintain a 30-day streak',
    icon: '⚡',
    rarity: 'epic',
    condition: { type: 'streak', target: 30 },
    xpReward: 500,
  },
  {
    id: 'century_club',
    name: 'Century Club',
    description: 'Reach 100 days streak',
    icon: '💯',
    rarity: 'legendary',
    condition: { type: 'streak', target: 100 },
    xpReward: 2000,
  },
  {
    id: 'gap_closer',
    name: 'Gap Closer',
    description: 'Bridge 5 knowledge gaps',
    icon: '🌉',
    rarity: 'rare',
    condition: { type: 'gap_count', target: 5 },
    xpReward: 150,
  },
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Score 100% on a quiz',
    icon: '⭐',
    rarity: 'rare',
    condition: { type: 'perfect_score', target: 1 },
    xpReward: 100,
  },
  {
    id: 'super_learner',
    name: 'Super Learner',
    description: 'Complete 50 lessons',
    icon: '🚀',
    rarity: 'epic',
    condition: { type: 'lesson_count', target: 50 },
    xpReward: 300,
  },
  {
    id: 'knowledge_seeker',
    name: 'Knowledge Seeker',
    description: 'Reach 1000 XP',
    icon: '📚',
    rarity: 'epic',
    condition: { type: 'xp', target: 1000 },
    xpReward: 200,
  },
  {
    id: 'elite_scholar',
    name: 'Elite Scholar',
    description: 'Reach 5000 XP',
    icon: '👑',
    rarity: 'legendary',
    condition: { type: 'xp', target: 5000 },
    xpReward: 1000,
  },
];

export const RARITY_COLORS = {
  common: '#78716c',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
} as const;

export const RARITY_LABELS = {
  common: 'Common',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
} as const;

export interface StudentStats {
  totalXP: number;
  level: number;
  currentStreak: number;
  quizCount: number;
  lessonCount: number;
  gapCount: number;
  perfectScoreCount: number;
}

export function calculateLevel(xp: number): number {
  return Math.floor(xp / LEVEL_THRESHOLD) + 1;
}

export function getXPForNextLevel(currentXP: number): number {
  const currentLevel = calculateLevel(currentXP);
  return currentLevel * LEVEL_THRESHOLD;
}

export function getXPProgress(currentXP: number): number {
  const levelXP = (calculateLevel(currentXP) - 1) * LEVEL_THRESHOLD;
  const xpInCurrentLevel = currentXP - levelXP;
  return (xpInCurrentLevel / LEVEL_THRESHOLD) * 100;
}

export function checkBadgeEarned(badge: BadgeDefinition, stats: StudentStats): boolean {
  switch (badge.condition.type) {
    case 'streak':
      return stats.currentStreak >= badge.condition.target;
    case 'xp':
      return stats.totalXP >= badge.condition.target;
    case 'quiz_count':
      return stats.quizCount >= badge.condition.target;
    case 'lesson_count':
      return stats.lessonCount >= badge.condition.target;
    case 'gap_count':
      return stats.gapCount >= badge.condition.target;
    case 'perfect_score':
      return stats.perfectScoreCount >= badge.condition.target;
    default:
      return false;
  }
}
