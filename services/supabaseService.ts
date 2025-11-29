import { supabase } from '@/lib/supabase';
import {
  StudentProfile,
  ProgressData,
  ConceptGap,
  QuizResult,
  ParentReward,
} from '@/constants/cbse';

export type DatabaseStudentProfile = {
  id: string;
  student_name: string;
  standard: number;
  board: string;
  preferred_language: string;
  learning_style?: string;
  created_at: string;
  updated_at: string;
};

export type DatabaseProgressData = {
  id: string;
  student_id: string;
  xp: number;
  level: number;
  streak_days: number;
  last_activity_date: string;
  created_at: string;
  updated_at: string;
};

export type DatabaseConceptGap = {
  id: string;
  student_id: string;
  subject: string;
  chapter: string;
  topic: string;
  difficulty_level?: 'easy' | 'medium' | 'hard';
  identified_date: string;
  resolved: boolean;
  resolved_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
};

export type DatabaseQuizResult = {
  id: string;
  student_id: string;
  quiz_id: string;
  subject: string;
  chapter: string;
  topic?: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  completion_date: string;
  time_taken_minutes?: number;
  created_at: string;
};

export type DatabaseParentReward = {
  id: string;
  student_id: string;
  title: string;
  description?: string;
  xp_required: number;
  completed: boolean;
  completed_at?: string;
  created_at: string;
  updated_at: string;
};

export const supabaseService = {
  async createStudentProfile(profile: StudentProfile) {
    const { data, error } = await supabase
      .from('student_profiles')
      .insert({
        student_name: profile.name,
        standard: parseInt(profile.class),
        board: 'CBSE',
        preferred_language: 'English',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getStudentProfile(studentId: string) {
    const { data, error } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('id', studentId)
      .single();

    if (error) throw error;
    return data as DatabaseStudentProfile;
  },

  async updateStudentProfile(
    studentId: string,
    updates: Partial<StudentProfile>
  ) {
    const { data, error } = await supabase
      .from('student_profiles')
      .update({
        student_name: updates.name,
        standard: updates.class ? parseInt(updates.class) : undefined,
      })
      .eq('id', studentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async createOrUpdateProgress(studentId: string, progress: ProgressData) {
    const { data, error } = await supabase
      .from('progress_data')
      .upsert({
        student_id: studentId,
        xp: progress.xp,
        level: progress.level,
        streak_days: progress.streakDays,
        last_activity_date: progress.lastActivityDate,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getProgress(studentId: string) {
    const { data, error } = await supabase
      .from('progress_data')
      .select('*')
      .eq('student_id', studentId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as DatabaseProgressData | null;
  },

  async addConceptGap(studentId: string, gap: ConceptGap) {
    const { data, error } = await supabase
      .from('concept_gaps')
      .insert({
        id: gap.id,
        student_id: studentId,
        subject: gap.subject,
        chapter: gap.chapter,
        topic: gap.concept,
        difficulty_level: gap.severity === 'critical' ? 'hard' : gap.severity === 'moderate' ? 'medium' : 'easy',
        identified_date: new Date(gap.detectedAt).toISOString().split('T')[0],
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getConceptGaps(studentId: string) {
    const { data, error } = await supabase
      .from('concept_gaps')
      .select('*')
      .eq('student_id', studentId)
      .eq('resolved', false)
      .order('identified_date', { ascending: false });

    if (error) throw error;
    return data as DatabaseConceptGap[];
  },

  async resolveConceptGap(gapId: string) {
    const { data, error } = await supabase
      .from('concept_gaps')
      .update({
        resolved: true,
        resolved_date: new Date().toISOString().split('T')[0],
      })
      .eq('id', gapId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async addCompletedLesson(studentId: string, lessonId: string, subject: string, chapter: string) {
    const { data, error } = await supabase
      .from('completed_lessons')
      .insert({
        student_id: studentId,
        lesson_id: lessonId,
        subject,
        chapter,
      })
      .select()
      .single();

    if (error && error.code !== '23505') throw error;
    return data;
  },

  async getCompletedLessons(studentId: string) {
    const { data, error } = await supabase
      .from('completed_lessons')
      .select('lesson_id')
      .eq('student_id', studentId);

    if (error) throw error;
    return (data || []).map((l) => l.lesson_id);
  },

  async addQuizResult(studentId: string, result: QuizResult, subject: string, chapter: string) {
    const { data, error } = await supabase
      .from('quiz_results')
      .insert({
        id: result.id,
        student_id: studentId,
        quiz_id: result.gapId || result.id,
        subject,
        chapter,
        score: result.score,
        total_questions: result.questions.length,
        correct_answers: result.answers.filter((a, i) => a === result.questions[i].correctAnswer).length,
        completion_date: new Date(result.completedAt).toISOString().split('T')[0],
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getQuizResults(studentId: string) {
    const { data, error } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('student_id', studentId)
      .order('completion_date', { ascending: false });

    if (error) throw error;
    return data as DatabaseQuizResult[];
  },

  async addBadge(studentId: string, badgeId: string) {
    const { data, error } = await supabase
      .from('student_badges')
      .insert({
        student_id: studentId,
        badge_id: badgeId,
      })
      .select()
      .single();

    if (error && error.code !== '23505') throw error;
    return data;
  },

  async getBadges(studentId: string) {
    const { data, error } = await supabase
      .from('student_badges')
      .select('badge_id')
      .eq('student_id', studentId);

    if (error) throw error;
    return (data || []).map((b) => b.badge_id);
  },

  async addReward(studentId: string, reward: ParentReward) {
    const { data, error } = await supabase
      .from('parent_rewards')
      .insert({
        id: reward.id,
        student_id: studentId,
        title: reward.title,
        description: reward.description,
        xp_required: reward.targetValue,
        completed: reward.completed,
        completed_at: reward.completedAt ? new Date(reward.completedAt).toISOString() : null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getRewards(studentId: string) {
    const { data, error } = await supabase
      .from('parent_rewards')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as DatabaseParentReward[];
  },

  async completeReward(rewardId: string) {
    const { data, error } = await supabase
      .from('parent_rewards')
      .update({
        completed: true,
        completed_at: new Date().toISOString(),
      })
      .eq('id', rewardId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateChapterProgress(
    studentId: string,
    subject: string,
    chapterId: string,
    chapterName: string,
    progressPercentage: number
  ) {
    const { data, error } = await supabase
      .from('chapter_progress')
      .upsert({
        student_id: studentId,
        subject,
        chapter_id: chapterId,
        chapter_name: chapterName,
        progress_percentage: progressPercentage,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getChapterProgress(studentId: string) {
    const { data, error } = await supabase
      .from('chapter_progress')
      .select('*')
      .eq('student_id', studentId);

    if (error) throw error;
    return data || [];
  },

  async saveDiagnosis(studentId: string, subject: string, chapter: string, diagnosisText: string, recommendations: unknown) {
    const { data, error } = await supabase
      .from('ai_diagnoses')
      .insert({
        student_id: studentId,
        subject,
        chapter,
        diagnosis_text: diagnosisText,
        recommendations,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
