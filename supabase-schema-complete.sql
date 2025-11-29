-- =====================================================
-- Complete Database Schema for CBSE Educational App
-- =====================================================
-- This file contains all tables, indexes, functions, 
-- triggers, and RLS policies
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLES
-- =====================================================

-- 1. USERS TABLE
-- Note: Supabase Auth creates auth.users automatically
-- This extends it with additional fields
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email varchar(255) UNIQUE NOT NULL,
  role varchar(20) NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'parent', 'admin')),
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  last_login_at timestamptz,
  is_active boolean NOT NULL DEFAULT true
);

-- 2. STUDENT PROFILES
CREATE TABLE IF NOT EXISTS public.student_profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  full_name varchar(100) NOT NULL,
  date_of_birth date,
  grade integer NOT NULL CHECK (grade BETWEEN 1 AND 12),
  board varchar(50) NOT NULL DEFAULT 'CBSE',
  school_name varchar(200),
  avatar_url text,
  learning_style varchar(50),
  current_streak integer NOT NULL DEFAULT 0,
  total_points integer NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

-- 3. PARENT PROFILES
CREATE TABLE IF NOT EXISTS public.parent_profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  full_name varchar(100) NOT NULL,
  phone_number varchar(20),
  notification_preferences jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

-- 4. STUDENT-PARENT LINKS (Many-to-Many)
CREATE TABLE IF NOT EXISTS public.student_parent_links (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id uuid NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  parent_id uuid NOT NULL REFERENCES public.parent_profiles(id) ON DELETE CASCADE,
  relationship varchar(50),
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, parent_id)
);

-- 5. SUBJECTS
CREATE TABLE IF NOT EXISTS public.subjects (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name varchar(100) NOT NULL,
  code varchar(20) UNIQUE NOT NULL,
  grade integer NOT NULL CHECK (grade BETWEEN 1 AND 12),
  description text,
  icon_url text,
  color varchar(7),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

-- 6. CHAPTERS
CREATE TABLE IF NOT EXISTS public.chapters (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  chapter_number integer NOT NULL,
  name varchar(200) NOT NULL,
  description text,
  estimated_hours numeric(4,2),
  difficulty_level varchar(20) CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
  prerequisites jsonb,
  learning_objectives jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

-- 7. STUDENT SUBJECT SETTINGS
CREATE TABLE IF NOT EXISTS public.student_subject_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id uuid NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  is_enabled boolean NOT NULL DEFAULT true,
  difficulty_preference varchar(20),
  weekly_goal_hours numeric(4,2),
  notification_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, subject_id)
);

-- 8. PAIN POINTS
CREATE TABLE IF NOT EXISTS public.pain_points (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id uuid NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  chapter_id uuid REFERENCES public.chapters(id) ON DELETE SET NULL,
  pain_type varchar(50) NOT NULL,
  description text NOT NULL,
  severity integer NOT NULL CHECK (severity BETWEEN 1 AND 5),
  status varchar(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'addressed', 'resolved')),
  ai_suggestions jsonb,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

-- 9. UPLOADS
CREATE TABLE IF NOT EXISTS public.uploads (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id uuid NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  file_url text NOT NULL,
  file_name varchar(255) NOT NULL,
  file_type varchar(50) NOT NULL,
  file_size bigint NOT NULL,
  upload_type varchar(50) NOT NULL,
  processing_status varchar(20) NOT NULL DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  ai_analysis jsonb,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  processed_at timestamptz
);

-- 10. DIAGNOSTICS
CREATE TABLE IF NOT EXISTS public.diagnostics (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id uuid NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  chapter_id uuid REFERENCES public.chapters(id) ON DELETE SET NULL,
  diagnostic_type varchar(50) NOT NULL,
  upload_id uuid REFERENCES public.uploads(id) ON DELETE SET NULL,
  questions_data jsonb NOT NULL,
  score_percentage numeric(5,2),
  strengths jsonb,
  weaknesses jsonb,
  knowledge_gaps jsonb,
  recommendations jsonb,
  time_taken_minutes integer,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

-- 11. QUIZZES
CREATE TABLE IF NOT EXISTS public.quizzes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  chapter_id uuid REFERENCES public.chapters(id) ON DELETE SET NULL,
  title varchar(200) NOT NULL,
  description text,
  quiz_type varchar(50) NOT NULL,
  difficulty_level varchar(20) NOT NULL CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
  total_questions integer NOT NULL,
  duration_minutes integer,
  passing_percentage numeric(5,2) NOT NULL DEFAULT 60,
  points_per_question integer NOT NULL DEFAULT 10,
  is_adaptive boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

-- 12. QUIZ QUESTIONS
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id uuid NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_number integer NOT NULL,
  question_text text NOT NULL,
  question_type varchar(20) NOT NULL CHECK (question_type IN ('mcq', 'true_false', 'numeric')),
  options jsonb,
  correct_answer text NOT NULL,
  explanation text,
  difficulty_level varchar(20) NOT NULL CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
  points integer NOT NULL DEFAULT 10,
  image_url text,
  hints jsonb,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

-- 13. QUIZ ATTEMPTS
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id uuid NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  attempt_number integer NOT NULL DEFAULT 1,
  started_at timestamptz NOT NULL DEFAULT NOW(),
  completed_at timestamptz,
  status varchar(20) NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  answers jsonb NOT NULL DEFAULT '[]',
  score numeric(5,2),
  points_earned integer NOT NULL DEFAULT 0,
  time_taken_seconds integer,
  correct_count integer,
  incorrect_count integer,
  is_passed boolean,
  feedback jsonb
);

-- 14. LEARNING SESSIONS
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

-- 15. GAMIFICATION
CREATE TABLE IF NOT EXISTS public.gamification (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id uuid NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  achievement_type varchar(50) NOT NULL,
  achievement_name varchar(100) NOT NULL,
  description text,
  icon_url text,
  points_awarded integer NOT NULL DEFAULT 0,
  rarity varchar(20) CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  metadata jsonb,
  earned_at timestamptz NOT NULL DEFAULT NOW()
);

-- 16. PARENT REWARDS
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

-- 17. AI LOGS
CREATE TABLE IF NOT EXISTS public.ai_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  student_id uuid REFERENCES public.student_profiles(id) ON DELETE SET NULL,
  ai_service varchar(50) NOT NULL,
  operation_type varchar(50) NOT NULL,
  request_data jsonb,
  response_data jsonb,
  tokens_used integer,
  cost numeric(10,4),
  duration_ms integer,
  status varchar(20) NOT NULL,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Users
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Student Profiles
CREATE INDEX IF NOT EXISTS idx_student_user ON public.student_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_student_grade ON public.student_profiles(grade);
CREATE INDEX IF NOT EXISTS idx_student_points ON public.student_profiles(total_points DESC);

-- Parent Profiles
CREATE INDEX IF NOT EXISTS idx_parent_user ON public.parent_profiles(user_id);

-- Student-Parent Links
CREATE INDEX IF NOT EXISTS idx_parent_students ON public.student_parent_links(parent_id);
CREATE INDEX IF NOT EXISTS idx_student_parents ON public.student_parent_links(student_id);

-- Subjects
CREATE INDEX IF NOT EXISTS idx_subject_code ON public.subjects(code);
CREATE INDEX IF NOT EXISTS idx_subject_grade ON public.subjects(grade);
CREATE INDEX IF NOT EXISTS idx_subject_active ON public.subjects(is_active);

-- Chapters
CREATE INDEX IF NOT EXISTS idx_chapter_subject ON public.chapters(subject_id);
CREATE INDEX IF NOT EXISTS idx_chapter_number ON public.chapters(subject_id, chapter_number);
CREATE INDEX IF NOT EXISTS idx_chapter_difficulty ON public.chapters(difficulty_level);

-- Student Subject Settings
CREATE INDEX IF NOT EXISTS idx_student_subjects ON public.student_subject_settings(student_id);
CREATE INDEX IF NOT EXISTS idx_subject_students ON public.student_subject_settings(subject_id);

-- Pain Points
CREATE INDEX IF NOT EXISTS idx_pain_student ON public.pain_points(student_id);
CREATE INDEX IF NOT EXISTS idx_pain_subject ON public.pain_points(subject_id);
CREATE INDEX IF NOT EXISTS idx_pain_chapter ON public.pain_points(chapter_id);
CREATE INDEX IF NOT EXISTS idx_pain_status ON public.pain_points(status);
CREATE INDEX IF NOT EXISTS idx_pain_created ON public.pain_points(created_at DESC);

-- Uploads
CREATE INDEX IF NOT EXISTS idx_upload_student ON public.uploads(student_id);
CREATE INDEX IF NOT EXISTS idx_upload_status ON public.uploads(processing_status);
CREATE INDEX IF NOT EXISTS idx_upload_type ON public.uploads(upload_type);
CREATE INDEX IF NOT EXISTS idx_upload_created ON public.uploads(created_at DESC);

-- Diagnostics
CREATE INDEX IF NOT EXISTS idx_diagnostic_student ON public.diagnostics(student_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_subject ON public.diagnostics(subject_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_chapter ON public.diagnostics(chapter_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_type ON public.diagnostics(diagnostic_type);
CREATE INDEX IF NOT EXISTS idx_diagnostic_completed ON public.diagnostics(completed_at DESC);

-- Quizzes
CREATE INDEX IF NOT EXISTS idx_quiz_subject ON public.quizzes(subject_id);
CREATE INDEX IF NOT EXISTS idx_quiz_chapter ON public.quizzes(chapter_id);
CREATE INDEX IF NOT EXISTS idx_quiz_type ON public.quizzes(quiz_type);
CREATE INDEX IF NOT EXISTS idx_quiz_difficulty ON public.quizzes(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_quiz_active ON public.quizzes(is_active);

-- Quiz Questions
CREATE INDEX IF NOT EXISTS idx_question_quiz ON public.quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_question_number ON public.quiz_questions(quiz_id, question_number);

-- Quiz Attempts
CREATE INDEX IF NOT EXISTS idx_attempt_quiz ON public.quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_attempt_student ON public.quiz_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_attempt_student_quiz ON public.quiz_attempts(student_id, quiz_id);
CREATE INDEX IF NOT EXISTS idx_attempt_completed ON public.quiz_attempts(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_attempt_status ON public.quiz_attempts(status);

-- Learning Sessions
CREATE INDEX IF NOT EXISTS idx_session_student ON public.learning_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_session_subject ON public.learning_sessions(subject_id);
CREATE INDEX IF NOT EXISTS idx_session_chapter ON public.learning_sessions(chapter_id);
CREATE INDEX IF NOT EXISTS idx_session_started ON public.learning_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_session_type ON public.learning_sessions(session_type);

-- Gamification
CREATE INDEX IF NOT EXISTS idx_achievement_student ON public.gamification(student_id);
CREATE INDEX IF NOT EXISTS idx_achievement_type ON public.gamification(achievement_type);
CREATE INDEX IF NOT EXISTS idx_achievement_earned ON public.gamification(earned_at DESC);

-- Parent Rewards
CREATE INDEX IF NOT EXISTS idx_reward_parent ON public.parent_rewards(parent_id);
CREATE INDEX IF NOT EXISTS idx_reward_student ON public.parent_rewards(student_id);
CREATE INDEX IF NOT EXISTS idx_reward_active ON public.parent_rewards(is_active);
CREATE INDEX IF NOT EXISTS idx_reward_redeemed ON public.parent_rewards(is_redeemed);

-- AI Logs
CREATE INDEX IF NOT EXISTS idx_ailog_user ON public.ai_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ailog_student ON public.ai_logs(student_id);
CREATE INDEX IF NOT EXISTS idx_ailog_service ON public.ai_logs(ai_service);
CREATE INDEX IF NOT EXISTS idx_ailog_operation ON public.ai_logs(operation_type);
CREATE INDEX IF NOT EXISTS idx_ailog_created ON public.ai_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ailog_status ON public.ai_logs(status);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Function: Calculate quiz score
CREATE OR REPLACE FUNCTION calculate_quiz_score(attempt_id uuid)
RETURNS numeric AS $$
DECLARE
  total_questions integer;
  correct_answers integer;
  score_pct numeric;
BEGIN
  SELECT 
    COUNT(*),
    SUM(CASE WHEN (answers->>'is_correct')::boolean THEN 1 ELSE 0 END)
  INTO total_questions, correct_answers
  FROM quiz_attempts
  WHERE id = attempt_id;
  
  IF total_questions > 0 THEN
    score_pct := (correct_answers::numeric / total_questions::numeric) * 100;
  ELSE
    score_pct := 0;
  END IF;
  
  RETURN score_pct;
END;
$$ LANGUAGE plpgsql;

-- Function: Update student points and level
CREATE OR REPLACE FUNCTION update_student_points(
  p_student_id uuid,
  p_points_to_add integer
)
RETURNS void AS $$
DECLARE
  new_total_points integer;
  new_level integer;
BEGIN
  UPDATE student_profiles
  SET total_points = total_points + p_points_to_add
  WHERE id = p_student_id
  RETURNING total_points INTO new_total_points;
  
  -- Calculate new level (100 points per level)
  new_level := FLOOR(new_total_points / 100) + 1;
  
  UPDATE student_profiles
  SET level = new_level
  WHERE id = p_student_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Check and award achievements
CREATE OR REPLACE FUNCTION check_achievements(p_student_id uuid)
RETURNS void AS $$
DECLARE
  streak_count integer;
  quiz_count integer;
BEGIN
  -- Check streak achievements
  SELECT current_streak INTO streak_count
  FROM student_profiles
  WHERE id = p_student_id;
  
  IF streak_count = 7 THEN
    INSERT INTO gamification (student_id, achievement_type, achievement_name, description, points_awarded, rarity)
    VALUES (p_student_id, 'badge', '7-Day Streak', 'Completed 7 consecutive days of learning', 50, 'rare')
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Add more achievement checks here
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger: Update updated_at on all tables with that column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_profiles_updated_at BEFORE UPDATE ON public.student_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parent_profiles_updated_at BEFORE UPDATE ON public.parent_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chapters_updated_at BEFORE UPDATE ON public.chapters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_subject_settings_updated_at BEFORE UPDATE ON public.student_subject_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pain_points_updated_at BEFORE UPDATE ON public.pain_points
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quizzes_updated_at BEFORE UPDATE ON public.quizzes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parent_rewards_updated_at BEFORE UPDATE ON public.parent_rewards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_parent_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_subject_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pain_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for USERS
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for STUDENT PROFILES
CREATE POLICY "Students can view own profile" ON public.student_profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Students can update own profile" ON public.student_profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Parents can view linked students" ON public.student_profiles
  FOR SELECT USING (
    id IN (
      SELECT student_id FROM student_parent_links
      WHERE parent_id IN (
        SELECT id FROM parent_profiles WHERE user_id = auth.uid()
      )
    )
  );

-- RLS Policies for PARENT PROFILES
CREATE POLICY "Parents can view own profile" ON public.parent_profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Parents can update own profile" ON public.parent_profiles
  FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for STUDENT-PARENT LINKS
CREATE POLICY "Students can view own links" ON public.student_parent_links
  FOR SELECT USING (
    student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Parents can view own links" ON public.student_parent_links
  FOR SELECT USING (
    parent_id IN (SELECT id FROM parent_profiles WHERE user_id = auth.uid())
  );

-- RLS Policies for SUBJECTS (Public read)
CREATE POLICY "Anyone can view active subjects" ON public.subjects
  FOR SELECT USING (is_active = true);

-- RLS Policies for CHAPTERS (Public read)
CREATE POLICY "Anyone can view active chapters" ON public.chapters
  FOR SELECT USING (is_active = true);

-- RLS Policies for STUDENT SUBJECT SETTINGS
CREATE POLICY "Students can manage own settings" ON public.student_subject_settings
  FOR ALL USING (
    student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid())
  );

-- RLS Policies for PAIN POINTS
CREATE POLICY "Students can manage own pain points" ON public.pain_points
  FOR ALL USING (
    student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Parents can view linked students pain points" ON public.pain_points
  FOR SELECT USING (
    student_id IN (
      SELECT student_id FROM student_parent_links
      WHERE parent_id IN (
        SELECT id FROM parent_profiles WHERE user_id = auth.uid()
      )
    )
  );

-- RLS Policies for UPLOADS
CREATE POLICY "Students can manage own uploads" ON public.uploads
  FOR ALL USING (
    student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid())
  );

-- RLS Policies for DIAGNOSTICS
CREATE POLICY "Students can view own diagnostics" ON public.diagnostics
  FOR SELECT USING (
    student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Parents can view linked students diagnostics" ON public.diagnostics
  FOR SELECT USING (
    student_id IN (
      SELECT student_id FROM student_parent_links
      WHERE parent_id IN (
        SELECT id FROM parent_profiles WHERE user_id = auth.uid()
      )
    )
  );

-- RLS Policies for QUIZZES (Public read for active)
CREATE POLICY "Anyone can view active quizzes" ON public.quizzes
  FOR SELECT USING (is_active = true);

-- RLS Policies for QUIZ QUESTIONS (Public read)
CREATE POLICY "Anyone can view quiz questions" ON public.quiz_questions
  FOR SELECT USING (true);

-- RLS Policies for QUIZ ATTEMPTS
CREATE POLICY "Students can manage own attempts" ON public.quiz_attempts
  FOR ALL USING (
    student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Parents can view linked students attempts" ON public.quiz_attempts
  FOR SELECT USING (
    student_id IN (
      SELECT student_id FROM student_parent_links
      WHERE parent_id IN (
        SELECT id FROM parent_profiles WHERE user_id = auth.uid()
      )
    )
  );

-- RLS Policies for LEARNING SESSIONS
CREATE POLICY "Students can manage own sessions" ON public.learning_sessions
  FOR ALL USING (
    student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Parents can view linked students sessions" ON public.learning_sessions
  FOR SELECT USING (
    student_id IN (
      SELECT student_id FROM student_parent_links
      WHERE parent_id IN (
        SELECT id FROM parent_profiles WHERE user_id = auth.uid()
      )
    )
  );

-- RLS Policies for GAMIFICATION
CREATE POLICY "Students can view own achievements" ON public.gamification
  FOR SELECT USING (
    student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Parents can view linked students achievements" ON public.gamification
  FOR SELECT USING (
    student_id IN (
      SELECT student_id FROM student_parent_links
      WHERE parent_id IN (
        SELECT id FROM parent_profiles WHERE user_id = auth.uid()
      )
    )
  );

-- RLS Policies for PARENT REWARDS
CREATE POLICY "Parents can manage own rewards" ON public.parent_rewards
  FOR ALL USING (
    parent_id IN (SELECT id FROM parent_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Students can view own rewards" ON public.parent_rewards
  FOR SELECT USING (
    student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid())
  );

-- RLS Policies for AI LOGS (Admin only - can be adjusted)
CREATE POLICY "Users can view own AI logs" ON public.ai_logs
  FOR SELECT USING (user_id = auth.uid());

-- =====================================================
-- ADMIN POLICIES (Apply to all tables)
-- =====================================================

-- Note: Create admin policies for users with role = 'admin'
-- These give full access to admins

DO $$
DECLARE
  table_name text;
BEGIN
  FOR table_name IN 
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    EXECUTE format('
      CREATE POLICY "Admins have full access" ON public.%I
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM public.users WHERE id = auth.uid() AND role = ''admin''
          )
        );
    ', table_name);
  END LOOP;
END $$;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE public.users IS 'User authentication and basic profile information';
COMMENT ON TABLE public.student_profiles IS 'Extended profile information for students';
COMMENT ON TABLE public.parent_profiles IS 'Extended profile information for parents';
COMMENT ON TABLE public.student_parent_links IS 'Many-to-many relationship between students and parents';
COMMENT ON TABLE public.subjects IS 'Master table for all subjects (CBSE curriculum)';
COMMENT ON TABLE public.chapters IS 'Chapters/topics within each subject';
COMMENT ON TABLE public.student_subject_settings IS 'Student selected subjects and their settings';
COMMENT ON TABLE public.pain_points IS 'Track student-reported difficulties and struggles';
COMMENT ON TABLE public.uploads IS 'Track document/image uploads for AI analysis';
COMMENT ON TABLE public.diagnostics IS 'Store diagnostic assessment results';
COMMENT ON TABLE public.quizzes IS 'Quiz/test definitions';
COMMENT ON TABLE public.quiz_questions IS 'Individual quiz questions';
COMMENT ON TABLE public.quiz_attempts IS 'Track student quiz attempts and results';
COMMENT ON TABLE public.learning_sessions IS 'Track learning activity and time spent';
COMMENT ON TABLE public.gamification IS 'Track badges, achievements, and rewards';
COMMENT ON TABLE public.parent_rewards IS 'Parent-defined rewards for student achievements';
COMMENT ON TABLE public.ai_logs IS 'Log all AI interactions for debugging and analysis';
