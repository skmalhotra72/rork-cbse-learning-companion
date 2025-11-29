export type CBSEClass = '9' | '10' | '11' | '12';

export type Subject = 
  | 'Mathematics'
  | 'Science'
  | 'Physics'
  | 'Chemistry'
  | 'Biology'
  | 'English'
  | 'Social Science'
  | 'Computer Science';

export const SUBJECTS_BY_CLASS: Record<CBSEClass, Subject[]> = {
  '9': ['Mathematics', 'Science', 'English', 'Social Science'],
  '10': ['Mathematics', 'Science', 'English', 'Social Science'],
  '11': ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Computer Science'],
  '12': ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Computer Science'],
};

export type DifficultyLevel = 'struggling' | 'okay' | 'confident' | 'expert';

export interface Chapter {
  id: string;
  name: string;
  subject: Subject;
  class: CBSEClass;
  prerequisites?: string[];
}

export interface ConceptGap {
  id: string;
  subject: Subject;
  chapter: string;
  concept: string;
  severity: 'critical' | 'moderate' | 'minor';
  description: string;
  prerequisites: string[];
  detectedAt: number;
}

export interface MicroLesson {
  id: string;
  gapId: string;
  title: string;
  content: string;
  examples: string[];
  completed: boolean;
  completedAt?: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  concept: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuizResult {
  id: string;
  gapId?: string;
  questions: QuizQuestion[];
  answers: number[];
  score: number;
  completedAt: number;
  xpEarned: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt?: number;
}

export const BADGE_DEFINITIONS: Badge[] = [
  { id: 'first_lesson', name: 'First Step', description: 'Complete your first lesson', icon: '🎯' },
  { id: 'week_streak', name: 'Consistent Learner', description: '7-day learning streak', icon: '🔥' },
  { id: 'quiz_master', name: 'Quiz Master', description: 'Score 100% on a quiz', icon: '🏆' },
  { id: 'gap_closer', name: 'Gap Closer', description: 'Close your first concept gap', icon: '✨' },
  { id: 'level_5', name: 'Rising Star', description: 'Reach Level 5', icon: '⭐' },
  { id: 'chapter_complete', name: 'Chapter Champion', description: 'Master an entire chapter', icon: '📚' },
];

export interface StudentProfile {
  name: string;
  class: CBSEClass;
  subjects: Subject[];
  subjectRatings: Record<Subject, DifficultyLevel>;
  painPoints: Record<Subject, string[]>;
  onboardingComplete: boolean;
}

export interface ProgressData {
  xp: number;
  level: number;
  streakDays: number;
  lastActivityDate: string;
  conceptGaps: ConceptGap[];
  completedLessons: string[];
  quizResults: QuizResult[];
  badges: string[];
  chapterProgress: Record<string, number>;
}

export interface ParentReward {
  id: string;
  title: string;
  description: string;
  type: 'xp_milestone' | 'streak_milestone' | 'badge_unlock' | 'custom';
  targetValue: number;
  completed: boolean;
  completedAt?: number;
}

export const XP_PER_LEVEL = 100;

export function calculateLevel(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

export function getXPForNextLevel(xp: number): number {
  const currentLevel = calculateLevel(xp);
  return currentLevel * XP_PER_LEVEL;
}

export const CHAPTER_DATA: Record<Subject, Record<CBSEClass, Chapter[]>> = {
  'Mathematics': {
    '9': [
      { id: 'math9-1', name: 'Number Systems', subject: 'Mathematics', class: '9' },
      { id: 'math9-2', name: 'Polynomials', subject: 'Mathematics', class: '9', prerequisites: ['math9-1'] },
      { id: 'math9-3', name: 'Linear Equations in Two Variables', subject: 'Mathematics', class: '9', prerequisites: ['math9-1'] },
      { id: 'math9-4', name: 'Quadrilaterals', subject: 'Mathematics', class: '9' },
      { id: 'math9-5', name: 'Triangles', subject: 'Mathematics', class: '9', prerequisites: ['math9-4'] },
    ],
    '10': [
      { id: 'math10-1', name: 'Real Numbers', subject: 'Mathematics', class: '10' },
      { id: 'math10-2', name: 'Polynomials', subject: 'Mathematics', class: '10', prerequisites: ['math10-1'] },
      { id: 'math10-3', name: 'Pair of Linear Equations', subject: 'Mathematics', class: '10' },
      { id: 'math10-4', name: 'Quadratic Equations', subject: 'Mathematics', class: '10', prerequisites: ['math10-2'] },
      { id: 'math10-5', name: 'Arithmetic Progressions', subject: 'Mathematics', class: '10' },
    ],
    '11': [
      { id: 'math11-1', name: 'Sets', subject: 'Mathematics', class: '11' },
      { id: 'math11-2', name: 'Relations and Functions', subject: 'Mathematics', class: '11', prerequisites: ['math11-1'] },
      { id: 'math11-3', name: 'Trigonometric Functions', subject: 'Mathematics', class: '11' },
      { id: 'math11-4', name: 'Complex Numbers', subject: 'Mathematics', class: '11' },
      { id: 'math11-5', name: 'Linear Inequalities', subject: 'Mathematics', class: '11' },
    ],
    '12': [
      { id: 'math12-1', name: 'Relations and Functions', subject: 'Mathematics', class: '12' },
      { id: 'math12-2', name: 'Inverse Trigonometric Functions', subject: 'Mathematics', class: '12' },
      { id: 'math12-3', name: 'Matrices', subject: 'Mathematics', class: '12' },
      { id: 'math12-4', name: 'Determinants', subject: 'Mathematics', class: '12', prerequisites: ['math12-3'] },
      { id: 'math12-5', name: 'Continuity and Differentiability', subject: 'Mathematics', class: '12' },
    ],
  },
  'Science': {
    '9': [
      { id: 'sci9-1', name: 'Matter in Our Surroundings', subject: 'Science', class: '9' },
      { id: 'sci9-2', name: 'Atoms and Molecules', subject: 'Science', class: '9', prerequisites: ['sci9-1'] },
      { id: 'sci9-3', name: 'Motion', subject: 'Science', class: '9' },
      { id: 'sci9-4', name: 'Force and Laws of Motion', subject: 'Science', class: '9', prerequisites: ['sci9-3'] },
      { id: 'sci9-5', name: 'The Fundamental Unit of Life', subject: 'Science', class: '9' },
    ],
    '10': [
      { id: 'sci10-1', name: 'Chemical Reactions and Equations', subject: 'Science', class: '10' },
      { id: 'sci10-2', name: 'Acids, Bases and Salts', subject: 'Science', class: '10' },
      { id: 'sci10-3', name: 'Light - Reflection and Refraction', subject: 'Science', class: '10' },
      { id: 'sci10-4', name: 'Electricity', subject: 'Science', class: '10' },
      { id: 'sci10-5', name: 'Life Processes', subject: 'Science', class: '10' },
    ],
    '11': [],
    '12': [],
  },
  'Physics': {
    '9': [],
    '10': [],
    '11': [
      { id: 'phy11-1', name: 'Physical World', subject: 'Physics', class: '11' },
      { id: 'phy11-2', name: 'Units and Measurements', subject: 'Physics', class: '11' },
      { id: 'phy11-3', name: 'Motion in a Straight Line', subject: 'Physics', class: '11' },
      { id: 'phy11-4', name: 'Motion in a Plane', subject: 'Physics', class: '11', prerequisites: ['phy11-3'] },
      { id: 'phy11-5', name: 'Laws of Motion', subject: 'Physics', class: '11', prerequisites: ['phy11-3'] },
    ],
    '12': [
      { id: 'phy12-1', name: 'Electric Charges and Fields', subject: 'Physics', class: '12' },
      { id: 'phy12-2', name: 'Electrostatic Potential and Capacitance', subject: 'Physics', class: '12', prerequisites: ['phy12-1'] },
      { id: 'phy12-3', name: 'Current Electricity', subject: 'Physics', class: '12' },
      { id: 'phy12-4', name: 'Magnetic Effects of Current', subject: 'Physics', class: '12', prerequisites: ['phy12-3'] },
      { id: 'phy12-5', name: 'Electromagnetic Induction', subject: 'Physics', class: '12', prerequisites: ['phy12-4'] },
    ],
  },
  'Chemistry': {
    '9': [],
    '10': [],
    '11': [
      { id: 'chem11-1', name: 'Some Basic Concepts of Chemistry', subject: 'Chemistry', class: '11' },
      { id: 'chem11-2', name: 'Structure of Atom', subject: 'Chemistry', class: '11', prerequisites: ['chem11-1'] },
      { id: 'chem11-3', name: 'Chemical Bonding', subject: 'Chemistry', class: '11', prerequisites: ['chem11-2'] },
      { id: 'chem11-4', name: 'States of Matter', subject: 'Chemistry', class: '11' },
      { id: 'chem11-5', name: 'Thermodynamics', subject: 'Chemistry', class: '11' },
    ],
    '12': [
      { id: 'chem12-1', name: 'The Solid State', subject: 'Chemistry', class: '12' },
      { id: 'chem12-2', name: 'Solutions', subject: 'Chemistry', class: '12' },
      { id: 'chem12-3', name: 'Electrochemistry', subject: 'Chemistry', class: '12' },
      { id: 'chem12-4', name: 'Chemical Kinetics', subject: 'Chemistry', class: '12' },
      { id: 'chem12-5', name: 'Surface Chemistry', subject: 'Chemistry', class: '12' },
    ],
  },
  'Biology': {
    '9': [],
    '10': [],
    '11': [
      { id: 'bio11-1', name: 'The Living World', subject: 'Biology', class: '11' },
      { id: 'bio11-2', name: 'Biological Classification', subject: 'Biology', class: '11', prerequisites: ['bio11-1'] },
      { id: 'bio11-3', name: 'Cell: The Unit of Life', subject: 'Biology', class: '11' },
      { id: 'bio11-4', name: 'Biomolecules', subject: 'Biology', class: '11', prerequisites: ['bio11-3'] },
      { id: 'bio11-5', name: 'Photosynthesis', subject: 'Biology', class: '11', prerequisites: ['bio11-3'] },
    ],
    '12': [
      { id: 'bio12-1', name: 'Reproduction in Organisms', subject: 'Biology', class: '12' },
      { id: 'bio12-2', name: 'Sexual Reproduction in Flowering Plants', subject: 'Biology', class: '12' },
      { id: 'bio12-3', name: 'Human Reproduction', subject: 'Biology', class: '12' },
      { id: 'bio12-4', name: 'Principles of Inheritance', subject: 'Biology', class: '12' },
      { id: 'bio12-5', name: 'Molecular Basis of Inheritance', subject: 'Biology', class: '12', prerequisites: ['bio12-4'] },
    ],
  },
  'English': {
    '9': [],
    '10': [],
    '11': [],
    '12': [],
  },
  'Social Science': {
    '9': [],
    '10': [],
    '11': [],
    '12': [],
  },
  'Computer Science': {
    '9': [],
    '10': [],
    '11': [],
    '12': [],
  },
};
