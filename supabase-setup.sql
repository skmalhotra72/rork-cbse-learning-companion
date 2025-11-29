-- ============================================
-- CBSE Learning Companion Database Schema
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- (Go to: Supabase Dashboard > SQL Editor > New Query)
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. STUDENT PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.student_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_name TEXT NOT NULL,
    standard INTEGER NOT NULL CHECK (standard BETWEEN 1 AND 12),
    board TEXT NOT NULL DEFAULT 'CBSE',
    preferred_language TEXT DEFAULT 'English',
    learning_style TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. PROGRESS DATA TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.progress_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    streak_days INTEGER DEFAULT 0,
    last_activity_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id)
);

-- ============================================
-- 3. CONCEPT GAPS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.concept_gaps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    chapter TEXT NOT NULL,
    topic TEXT NOT NULL,
    difficulty_level TEXT CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
    identified_date DATE DEFAULT CURRENT_DATE,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. COMPLETED LESSONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.completed_lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    lesson_id TEXT NOT NULL,
    subject TEXT NOT NULL,
    chapter TEXT NOT NULL,
    completion_date DATE DEFAULT CURRENT_DATE,
    time_spent_minutes INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, lesson_id)
);

-- ============================================
-- 5. QUIZ RESULTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.quiz_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    quiz_id TEXT NOT NULL,
    subject TEXT NOT NULL,
    chapter TEXT NOT NULL,
    topic TEXT,
    score INTEGER CHECK (score >= 0 AND score <= 100),
    total_questions INTEGER,
    correct_answers INTEGER,
    completion_date DATE DEFAULT CURRENT_DATE,
    time_taken_minutes INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. BADGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.student_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    badge_id TEXT NOT NULL,
    earned_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, badge_id)
);

-- ============================================
-- 7. CHAPTER PROGRESS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.chapter_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    chapter_id TEXT NOT NULL,
    chapter_name TEXT NOT NULL,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    last_accessed DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, chapter_id)
);

-- ============================================
-- 8. PARENT REWARDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.parent_rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    xp_required INTEGER NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 9. AI DIAGNOSES TABLE (for tracking AI diagnostic sessions)
-- ============================================
CREATE TABLE IF NOT EXISTS public.ai_diagnoses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    chapter TEXT NOT NULL,
    diagnosis_text TEXT,
    recommendations JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_student_profiles_standard ON public.student_profiles(standard);
CREATE INDEX IF NOT EXISTS idx_progress_student_id ON public.progress_data(student_id);
CREATE INDEX IF NOT EXISTS idx_concept_gaps_student_id ON public.concept_gaps(student_id);
CREATE INDEX IF NOT EXISTS idx_concept_gaps_resolved ON public.concept_gaps(resolved);
CREATE INDEX IF NOT EXISTS idx_completed_lessons_student_id ON public.completed_lessons(student_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_student_id ON public.quiz_results(student_id);
CREATE INDEX IF NOT EXISTS idx_student_badges_student_id ON public.student_badges(student_id);
CREATE INDEX IF NOT EXISTS idx_chapter_progress_student_id ON public.chapter_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_parent_rewards_student_id ON public.parent_rewards(student_id);
CREATE INDEX IF NOT EXISTS idx_ai_diagnoses_student_id ON public.ai_diagnoses(student_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concept_gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.completed_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapter_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_diagnoses ENABLE ROW LEVEL SECURITY;

-- For now, allow all operations with anon key (you can make this more restrictive later)
-- Student Profiles
CREATE POLICY "Allow all operations on student_profiles" ON public.student_profiles FOR ALL USING (true) WITH CHECK (true);

-- Progress Data
CREATE POLICY "Allow all operations on progress_data" ON public.progress_data FOR ALL USING (true) WITH CHECK (true);

-- Concept Gaps
CREATE POLICY "Allow all operations on concept_gaps" ON public.concept_gaps FOR ALL USING (true) WITH CHECK (true);

-- Completed Lessons
CREATE POLICY "Allow all operations on completed_lessons" ON public.completed_lessons FOR ALL USING (true) WITH CHECK (true);

-- Quiz Results
CREATE POLICY "Allow all operations on quiz_results" ON public.quiz_results FOR ALL USING (true) WITH CHECK (true);

-- Student Badges
CREATE POLICY "Allow all operations on student_badges" ON public.student_badges FOR ALL USING (true) WITH CHECK (true);

-- Chapter Progress
CREATE POLICY "Allow all operations on chapter_progress" ON public.chapter_progress FOR ALL USING (true) WITH CHECK (true);

-- Parent Rewards
CREATE POLICY "Allow all operations on parent_rewards" ON public.parent_rewards FOR ALL USING (true) WITH CHECK (true);

-- AI Diagnoses
CREATE POLICY "Allow all operations on ai_diagnoses" ON public.ai_diagnoses FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- FUNCTIONS & TRIGGERS for auto-updating timestamps
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_student_profiles_updated_at BEFORE UPDATE ON public.student_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_progress_data_updated_at BEFORE UPDATE ON public.progress_data
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_concept_gaps_updated_at BEFORE UPDATE ON public.concept_gaps
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chapter_progress_updated_at BEFORE UPDATE ON public.chapter_progress
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_parent_rewards_updated_at BEFORE UPDATE ON public.parent_rewards
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '✅ Database schema created successfully!';
    RAISE NOTICE '📊 Tables created: 9';
    RAISE NOTICE '🔒 Row Level Security enabled on all tables';
    RAISE NOTICE '⚡ Performance indexes created';
    RAISE NOTICE '🎉 Your CBSE Learning Companion database is ready!';
END $$;
