-- =====================================================
-- MISSING TABLES FIX FOR SUPABASE
-- =====================================================
-- Run this SQL in Supabase SQL Editor if tables are missing
-- This extracts the specific tables that were reported missing
-- =====================================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: concept_gaps (Alternative naming for pain_points?)
-- =====================================================
-- NOTE: This appears to be referenced in code but the schema uses "pain_points"
-- Creating this as a view or renaming consideration

-- If you want a separate concept_gaps table:
CREATE TABLE IF NOT EXISTS public.concept_gaps (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id uuid NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  chapter_id uuid REFERENCES public.chapters(id) ON DELETE SET NULL,
  concept_name varchar(200) NOT NULL,
  gap_description text NOT NULL,
  severity integer NOT NULL CHECK (severity BETWEEN 1 AND 5),
  status varchar(20) NOT NULL DEFAULT 'identified' CHECK (status IN ('identified', 'working_on', 'resolved')),
  prerequisite_concepts jsonb,
  recommended_resources jsonb,
  ai_diagnosis jsonb,
  diagnostic_id uuid REFERENCES public.diagnostics(id) ON DELETE SET NULL,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

-- Indexes for concept_gaps
CREATE INDEX IF NOT EXISTS idx_concept_gaps_student ON public.concept_gaps(student_id);
CREATE INDEX IF NOT EXISTS idx_concept_gaps_subject ON public.concept_gaps(subject_id);
CREATE INDEX IF NOT EXISTS idx_concept_gaps_chapter ON public.concept_gaps(chapter_id);
CREATE INDEX IF NOT EXISTS idx_concept_gaps_status ON public.concept_gaps(status);
CREATE INDEX IF NOT EXISTS idx_concept_gaps_severity ON public.concept_gaps(severity DESC);

-- =====================================================
-- TABLE: quiz_results (Alternative naming for quiz_attempts?)
-- =====================================================
-- NOTE: The schema uses "quiz_attempts" but code might reference "quiz_results"

-- If you want a separate quiz_results table (summary/cached results):
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

-- Indexes for quiz_results
CREATE INDEX IF NOT EXISTS idx_quiz_results_student ON public.quiz_results(student_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_quiz ON public.quiz_results(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_subject ON public.quiz_results(subject_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_chapter ON public.quiz_results(chapter_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_score ON public.quiz_results(score_percentage DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_results_completed ON public.quiz_results(completed_at DESC);

-- =====================================================
-- TABLE: learning_sessions (Should already exist)
-- =====================================================
-- This table is in the main schema, but adding here for completeness

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

-- Indexes for learning_sessions
CREATE INDEX IF NOT EXISTS idx_session_student ON public.learning_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_session_subject ON public.learning_sessions(subject_id);
CREATE INDEX IF NOT EXISTS idx_session_chapter ON public.learning_sessions(chapter_id);
CREATE INDEX IF NOT EXISTS idx_session_started ON public.learning_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_session_type ON public.learning_sessions(session_type);

-- =====================================================
-- TABLE: badges_earned (Alternative naming for gamification?)
-- =====================================================
-- NOTE: The schema uses "gamification" but code might reference "badges_earned"

-- If you want a separate badges_earned table:
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

-- Indexes for badges_earned
CREATE INDEX IF NOT EXISTS idx_badges_student ON public.badges_earned(student_id);
CREATE INDEX IF NOT EXISTS idx_badges_type ON public.badges_earned(badge_type);
CREATE INDEX IF NOT EXISTS idx_badges_earned_at ON public.badges_earned(earned_at DESC);
CREATE INDEX IF NOT EXISTS idx_badges_rarity ON public.badges_earned(rarity);

-- =====================================================
-- TABLE: parent_rewards (Should already exist)
-- =====================================================
-- This table is in the main schema, but adding here for completeness

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

-- Indexes for parent_rewards
CREATE INDEX IF NOT EXISTS idx_reward_parent ON public.parent_rewards(parent_id);
CREATE INDEX IF NOT EXISTS idx_reward_student ON public.parent_rewards(student_id);
CREATE INDEX IF NOT EXISTS idx_reward_active ON public.parent_rewards(is_active);
CREATE INDEX IF NOT EXISTS idx_reward_redeemed ON public.parent_rewards(is_redeemed);

-- =====================================================
-- TRIGGERS FOR NEW TABLES
-- =====================================================

-- Trigger for concept_gaps updated_at
CREATE TRIGGER update_concept_gaps_updated_at 
  BEFORE UPDATE ON public.concept_gaps
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for parent_rewards updated_at (if function exists)
CREATE TRIGGER update_parent_rewards_updated_at 
  BEFORE UPDATE ON public.parent_rewards
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE public.concept_gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges_earned ENABLE ROW LEVEL SECURITY;

-- RLS Policies for concept_gaps
CREATE POLICY "Students can manage own concept gaps" 
  ON public.concept_gaps FOR ALL 
  USING (
    student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Parents can view linked students concept gaps" 
  ON public.concept_gaps FOR SELECT 
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

-- Admin policies for all new tables
CREATE POLICY "Admins have full access to concept_gaps" 
  ON public.concept_gaps FOR ALL 
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

CREATE POLICY "Admins have full access to badges_earned" 
  ON public.badges_earned FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE public.concept_gaps IS 'Track specific conceptual gaps identified through diagnostics';
COMMENT ON TABLE public.quiz_results IS 'Cached/summarized quiz results for faster analytics';
COMMENT ON TABLE public.badges_earned IS 'Track badges and achievements earned by students';

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Run this to verify all tables exist
SELECT 
  schemaname,
  tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'concept_gaps',
    'quiz_results', 
    'learning_sessions',
    'badges_earned',
    'parent_rewards'
  )
ORDER BY tablename;

-- =====================================================
-- DONE!
-- =====================================================
