-- =====================================================
-- CREATE MISSING TABLES FOR SUPABASE
-- =====================================================
-- This SQL creates all tables that are missing from your Supabase database
-- Run this in the Supabase SQL Editor
-- =====================================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CREATE MISSING TABLES
-- =====================================================

-- 1. progress_data
CREATE TABLE IF NOT EXISTS public.progress_data (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id uuid NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  chapter_id uuid REFERENCES public.chapters(id) ON DELETE SET NULL,
  progress_percentage numeric(5,2) NOT NULL DEFAULT 0,
  concepts_mastered integer NOT NULL DEFAULT 0,
  concepts_total integer NOT NULL DEFAULT 0,
  time_spent_minutes integer NOT NULL DEFAULT 0,
  last_activity_at timestamptz,
  is_completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

-- 2. quiz_results
CREATE TABLE IF NOT EXISTS public.quiz_results (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_attempt_id uuid UNIQUE NOT NULL REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  quiz_id uuid NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  chapter_id uuid REFERENCES public.chapters(id) ON DELETE SET NULL,
  score_percentage numeric(5,2) NOT NULL,
  points_earned integer NOT NULL DEFAULT 0,
  total_questions integer NOT NULL,
  correct_answers integer NOT NULL,
  incorrect_answers integer NOT NULL,
  time_taken_seconds integer,
  difficulty_level varchar(20) NOT NULL,
  is_passed boolean NOT NULL,
  strengths jsonb,
  weaknesses jsonb,
  topic_scores jsonb,
  completed_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

-- 3. learning_sessions (should exist, but creating if not)
CREATE TABLE IF NOT EXISTS public.learning_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id uuid NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  chapter_id uuid REFERENCES public.chapters(id) ON DELETE SET NULL,
  session_type varchar(50) NOT NULL,
  started_at timestamptz NOT NULL DEFAULT NOW(),
  ended_at timestamptz,
  duration_minutes integer,
  activities jsonb,
  topics_covered jsonb,
  progress_made jsonb,
  notes text,
  points_earned integer NOT NULL DEFAULT 0
);

-- 4. badges_earned
CREATE TABLE IF NOT EXISTS public.badges_earned (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id uuid NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  badge_id varchar(100) NOT NULL,
  badge_name varchar(100) NOT NULL,
  badge_description text,
  badge_type varchar(50) NOT NULL,
  icon_url text,
  points_awarded integer NOT NULL DEFAULT 0,
  rarity varchar(20) CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  requirements_met jsonb,
  metadata jsonb,
  earned_at timestamptz NOT NULL DEFAULT NOW()
);

-- 5. parent_rewards (should exist, but creating if not)
CREATE TABLE IF NOT EXISTS public.parent_rewards (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id uuid NOT NULL REFERENCES public.parent_profiles(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  reward_name varchar(100) NOT NULL,
  description text,
  points_required integer NOT NULL,
  reward_type varchar(50) NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  is_redeemed boolean NOT NULL DEFAULT false,
  redeemed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

-- 6. chapter_progress
CREATE TABLE IF NOT EXISTS public.chapter_progress (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id uuid NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  chapter_id uuid NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  progress_percentage numeric(5,2) NOT NULL DEFAULT 0,
  lessons_completed integer NOT NULL DEFAULT 0,
  lessons_total integer NOT NULL DEFAULT 0,
  quizzes_completed integer NOT NULL DEFAULT 0,
  quizzes_passed integer NOT NULL DEFAULT 0,
  time_spent_minutes integer NOT NULL DEFAULT 0,
  is_unlocked boolean NOT NULL DEFAULT false,
  is_completed boolean NOT NULL DEFAULT false,
  last_accessed_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, chapter_id)
);

-- 7. completed_lessons
CREATE TABLE IF NOT EXISTS public.completed_lessons (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id uuid NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  chapter_id uuid NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  lesson_id varchar(100) NOT NULL,
  lesson_title varchar(200) NOT NULL,
  lesson_type varchar(50) NOT NULL,
  time_spent_minutes integer NOT NULL DEFAULT 0,
  comprehension_score numeric(5,2),
  notes text,
  resources_used jsonb,
  completed_at timestamptz NOT NULL DEFAULT NOW(),
  created_at timestamptz NOT NULL DEFAULT NOW()
);

-- 8. student_badges
CREATE TABLE IF NOT EXISTS public.student_badges (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id uuid NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  badge_id varchar(100) NOT NULL,
  badge_category varchar(50) NOT NULL,
  earned_count integer NOT NULL DEFAULT 1,
  last_earned_at timestamptz NOT NULL DEFAULT NOW(),
  created_at timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, badge_id)
);

-- =====================================================
-- CREATE INDEXES
-- =====================================================

-- progress_data indexes
CREATE INDEX IF NOT EXISTS idx_progress_student ON public.progress_data(student_id);
CREATE INDEX IF NOT EXISTS idx_progress_subject ON public.progress_data(subject_id);
CREATE INDEX IF NOT EXISTS idx_progress_chapter ON public.progress_data(chapter_id);
CREATE INDEX IF NOT EXISTS idx_progress_updated ON public.progress_data(updated_at DESC);

-- quiz_results indexes
CREATE INDEX IF NOT EXISTS idx_quiz_results_student ON public.quiz_results(student_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_quiz ON public.quiz_results(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_subject ON public.quiz_results(subject_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_chapter ON public.quiz_results(chapter_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_score ON public.quiz_results(score_percentage DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_results_completed ON public.quiz_results(completed_at DESC);

-- learning_sessions indexes
CREATE INDEX IF NOT EXISTS idx_session_student ON public.learning_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_session_subject ON public.learning_sessions(subject_id);
CREATE INDEX IF NOT EXISTS idx_session_chapter ON public.learning_sessions(chapter_id);
CREATE INDEX IF NOT EXISTS idx_session_started ON public.learning_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_session_type ON public.learning_sessions(session_type);

-- badges_earned indexes
CREATE INDEX IF NOT EXISTS idx_badges_student ON public.badges_earned(student_id);
CREATE INDEX IF NOT EXISTS idx_badges_type ON public.badges_earned(badge_type);
CREATE INDEX IF NOT EXISTS idx_badges_earned_at ON public.badges_earned(earned_at DESC);
CREATE INDEX IF NOT EXISTS idx_badges_rarity ON public.badges_earned(rarity);

-- parent_rewards indexes
CREATE INDEX IF NOT EXISTS idx_reward_parent ON public.parent_rewards(parent_id);
CREATE INDEX IF NOT EXISTS idx_reward_student ON public.parent_rewards(student_id);
CREATE INDEX IF NOT EXISTS idx_reward_active ON public.parent_rewards(is_active);
CREATE INDEX IF NOT EXISTS idx_reward_redeemed ON public.parent_rewards(is_redeemed);

-- chapter_progress indexes
CREATE INDEX IF NOT EXISTS idx_chapter_progress_student ON public.chapter_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_chapter_progress_chapter ON public.chapter_progress(chapter_id);
CREATE INDEX IF NOT EXISTS idx_chapter_progress_subject ON public.chapter_progress(subject_id);
CREATE INDEX IF NOT EXISTS idx_chapter_progress_completed ON public.chapter_progress(is_completed);
CREATE INDEX IF NOT EXISTS idx_chapter_progress_updated ON public.chapter_progress(updated_at DESC);

-- completed_lessons indexes
CREATE INDEX IF NOT EXISTS idx_completed_lessons_student ON public.completed_lessons(student_id);
CREATE INDEX IF NOT EXISTS idx_completed_lessons_chapter ON public.completed_lessons(chapter_id);
CREATE INDEX IF NOT EXISTS idx_completed_lessons_completed ON public.completed_lessons(completed_at DESC);

-- student_badges indexes
CREATE INDEX IF NOT EXISTS idx_student_badges_student ON public.student_badges(student_id);
CREATE INDEX IF NOT EXISTS idx_student_badges_badge ON public.student_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_student_badges_category ON public.student_badges(badge_category);

-- =====================================================
-- CREATE OR UPDATE TRIGGER FUNCTION (if not exists)
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- CREATE TRIGGERS
-- =====================================================

-- Trigger for progress_data updated_at
DROP TRIGGER IF EXISTS update_progress_data_updated_at ON public.progress_data;
CREATE TRIGGER update_progress_data_updated_at 
  BEFORE UPDATE ON public.progress_data
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for parent_rewards updated_at
DROP TRIGGER IF EXISTS update_parent_rewards_updated_at ON public.parent_rewards;
CREATE TRIGGER update_parent_rewards_updated_at 
  BEFORE UPDATE ON public.parent_rewards
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for chapter_progress updated_at
DROP TRIGGER IF EXISTS update_chapter_progress_updated_at ON public.chapter_progress;
CREATE TRIGGER update_chapter_progress_updated_at 
  BEFORE UPDATE ON public.chapter_progress
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.progress_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges_earned ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapter_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.completed_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_badges ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CREATE RLS POLICIES
-- =====================================================

-- RLS Policies for progress_data
CREATE POLICY "Students can manage own progress" 
  ON public.progress_data FOR ALL 
  USING (
    student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Parents can view linked students progress" 
  ON public.progress_data FOR SELECT 
  USING (
    student_id IN (
      SELECT student_id FROM student_parent_links
      WHERE parent_id IN (
        SELECT id FROM parent_profiles WHERE user_id = auth.uid()
      )
    )
  );

-- RLS Policies for quiz_results
CREATE POLICY "Students can view own quiz results" 
  ON public.quiz_results FOR SELECT 
  USING (
    student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Parents can view linked students quiz results" 
  ON public.quiz_results FOR SELECT 
  USING (
    student_id IN (
      SELECT student_id FROM student_parent_links
      WHERE parent_id IN (
        SELECT id FROM parent_profiles WHERE user_id = auth.uid()
      )
    )
  );

-- RLS Policies for learning_sessions
CREATE POLICY "Students can manage own sessions" 
  ON public.learning_sessions FOR ALL 
  USING (
    student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Parents can view linked students sessions" 
  ON public.learning_sessions FOR SELECT 
  USING (
    student_id IN (
      SELECT student_id FROM student_parent_links
      WHERE parent_id IN (
        SELECT id FROM parent_profiles WHERE user_id = auth.uid()
      )
    )
  );

-- RLS Policies for badges_earned
CREATE POLICY "Students can view own badges" 
  ON public.badges_earned FOR SELECT 
  USING (
    student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Parents can view linked students badges" 
  ON public.badges_earned FOR SELECT 
  USING (
    student_id IN (
      SELECT student_id FROM student_parent_links
      WHERE parent_id IN (
        SELECT id FROM parent_profiles WHERE user_id = auth.uid()
      )
    )
  );

-- RLS Policies for parent_rewards
CREATE POLICY "Parents can manage own rewards" 
  ON public.parent_rewards FOR ALL 
  USING (
    parent_id IN (SELECT id FROM parent_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Students can view own rewards" 
  ON public.parent_rewards FOR SELECT 
  USING (
    student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid())
  );

-- RLS Policies for chapter_progress
CREATE POLICY "Students can manage own chapter progress" 
  ON public.chapter_progress FOR ALL 
  USING (
    student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Parents can view linked students chapter progress" 
  ON public.chapter_progress FOR SELECT 
  USING (
    student_id IN (
      SELECT student_id FROM student_parent_links
      WHERE parent_id IN (
        SELECT id FROM parent_profiles WHERE user_id = auth.uid()
      )
    )
  );

-- RLS Policies for completed_lessons
CREATE POLICY "Students can manage own completed lessons" 
  ON public.completed_lessons FOR ALL 
  USING (
    student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Parents can view linked students completed lessons" 
  ON public.completed_lessons FOR SELECT 
  USING (
    student_id IN (
      SELECT student_id FROM student_parent_links
      WHERE parent_id IN (
        SELECT id FROM parent_profiles WHERE user_id = auth.uid()
      )
    )
  );

-- RLS Policies for student_badges
CREATE POLICY "Students can manage own badges" 
  ON public.student_badges FOR ALL 
  USING (
    student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Parents can view linked students badges summary" 
  ON public.student_badges FOR SELECT 
  USING (
    student_id IN (
      SELECT student_id FROM student_parent_links
      WHERE parent_id IN (
        SELECT id FROM parent_profiles WHERE user_id = auth.uid()
      )
    )
  );

-- Admin policies for all new tables
CREATE POLICY "Admins have full access to progress_data" 
  ON public.progress_data FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins have full access to quiz_results" 
  ON public.quiz_results FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins have full access to learning_sessions" 
  ON public.learning_sessions FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins have full access to badges_earned" 
  ON public.badges_earned FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins have full access to parent_rewards" 
  ON public.parent_rewards FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins have full access to chapter_progress" 
  ON public.chapter_progress FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins have full access to completed_lessons" 
  ON public.completed_lessons FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins have full access to student_badges" 
  ON public.student_badges FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- ADD COMMENTS
-- =====================================================

COMMENT ON TABLE public.progress_data IS 'Track overall subject/chapter progress for students';
COMMENT ON TABLE public.quiz_results IS 'Cached/summarized quiz results for faster analytics';
COMMENT ON TABLE public.learning_sessions IS 'Track learning activity and time spent';
COMMENT ON TABLE public.badges_earned IS 'Track badges and achievements earned by students';
COMMENT ON TABLE public.parent_rewards IS 'Parent-defined rewards for student achievements';
COMMENT ON TABLE public.chapter_progress IS 'Track detailed chapter-level progress';
COMMENT ON TABLE public.completed_lessons IS 'Track individual lesson completions';
COMMENT ON TABLE public.student_badges IS 'Summary of badges earned by students';

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================

-- Run this to verify all tables exist
SELECT 
  schemaname,
  tablename,
  'EXISTS' as status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'progress_data',
    'quiz_results', 
    'learning_sessions',
    'badges_earned',
    'parent_rewards',
    'chapter_progress',
    'completed_lessons',
    'student_badges'
  )
ORDER BY tablename;

-- =====================================================
-- DONE!
-- =====================================================
-- All missing tables have been created with:
-- ✅ Proper foreign key constraints
-- ✅ Indexes for performance
-- ✅ Row Level Security policies
-- ✅ Triggers for updated_at columns
-- ✅ Admin access policies
-- =====================================================
