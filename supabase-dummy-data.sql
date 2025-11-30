-- =====================================================
-- DUMMY DATA FOR TESTING
-- =====================================================
-- This script creates test users, students, parents, and 
-- populates all tables with realistic dummy data
-- =====================================================

-- =====================================================
-- IMPORTANT: AUTHENTICATION SETUP
-- =====================================================
-- Before running this script, create these users in Supabase Auth Dashboard:
-- 
-- STUDENT ACCOUNTS:
-- 1. Email: student1@test.com, Password: Test@123456
-- 2. Email: student2@test.com, Password: Test@123456
--
-- PARENT ACCOUNTS:
-- 1. Email: parent1@test.com, Password: Test@123456
-- 2. Email: parent2@test.com, Password: Test@123456
--
-- After creating users, note their UUIDs and update below
-- =====================================================

-- =====================================================
-- STEP 1: Insert Users (Manual IDs - Replace with actual Supabase Auth UUIDs)
-- =====================================================

-- You'll need to replace these UUIDs with actual ones from Supabase Auth after signup
-- For now, we'll use placeholder UUIDs that you'll update

-- Insert into public.users table (extending Supabase auth.users)
INSERT INTO public.users (id, email, role, created_at, last_login_at, is_active) VALUES
-- Student 1: Rahul Sharma (Grade 10)
('d2ad5aae-7136-4f04-baec-574cf368f45d', 'student1@test.com', 'student', NOW() - INTERVAL '30 days', NOW(), true),
-- Student 2: Priya Patel (Grade 12)
('f7892af6-0544-4f7e-914d-6a16ce1bb768', 'student2@test.com', 'student', NOW() - INTERVAL '45 days', NOW(), true),
-- Parent 1: Mr. Sharma
('c27979b7-e7fc-4707-b894-daeefba87e60', 'parent1@test.com', 'parent', NOW() - INTERVAL '30 days', NOW(), true),
-- Parent 2: Mrs. Patel
('0faa582f-62aa-4f3c-9526-b6fcb34b8b0d', 'parent2@test.com', 'parent', NOW() - INTERVAL '45 days', NOW(), true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STEP 2: Student Profiles
-- =====================================================

INSERT INTO public.student_profiles (
  id, user_id, full_name, date_of_birth, grade, board, school_name, 
  learning_style, current_streak, total_points, level, created_at
) VALUES
(
  'a1111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  'Rahul Sharma',
  '2009-05-15',
  10,
  'CBSE',
  'Delhi Public School',
  'visual',
  7,
  850,
  9,
  NOW() - INTERVAL '30 days'
),
(
  'a2222222-2222-2222-2222-222222222222',
  '22222222-2222-2222-2222-222222222222',
  'Priya Patel',
  '2007-08-22',
  12,
  'CBSE',
  'Modern High School',
  'kinesthetic',
  14,
  1520,
  16,
  NOW() - INTERVAL '45 days'
)
ON CONFLICT (user_id) DO NOTHING;

-- =====================================================
-- STEP 3: Parent Profiles
-- =====================================================

INSERT INTO public.parent_profiles (
  id, user_id, full_name, phone_number, notification_preferences, created_at
) VALUES
(
  'b3333333-3333-3333-3333-333333333333',
  '33333333-3333-3333-3333-333333333333',
  'Mr. Rajesh Sharma',
  '+91-9876543210',
  '{"email": true, "sms": true, "push": true, "weekly_report": true}',
  NOW() - INTERVAL '30 days'
),
(
  'b4444444-4444-4444-4444-444444444444',
  '44444444-4444-4444-4444-444444444444',
  'Mrs. Anjali Patel',
  '+91-9876543211',
  '{"email": true, "sms": false, "push": true, "weekly_report": true}',
  NOW() - INTERVAL '45 days'
)
ON CONFLICT (user_id) DO NOTHING;

-- =====================================================
-- STEP 4: Link Students to Parents
-- =====================================================

INSERT INTO public.student_parent_links (student_id, parent_id, relationship, is_primary, created_at) VALUES
('a1111111-1111-1111-1111-111111111111', 'b3333333-3333-3333-3333-333333333333', 'father', true, NOW() - INTERVAL '30 days'),
('a2222222-2222-2222-2222-222222222222', 'b4444444-4444-4444-4444-444444444444', 'mother', true, NOW() - INTERVAL '45 days')
ON CONFLICT (student_id, parent_id) DO NOTHING;

-- =====================================================
-- STEP 5: Populate Progress Data (if table exists)
-- =====================================================

INSERT INTO public.progress_data (student_id, subject_id, chapter_id, progress_percentage, last_accessed, time_spent_minutes, mastery_level) 
SELECT 
  'a1111111-1111-1111-1111-111111111111',
  s.id,
  c.id,
  (RANDOM() * 100)::numeric(5,2),
  NOW() - (RANDOM() * INTERVAL '30 days'),
  (RANDOM() * 120)::integer,
  CASE 
    WHEN RANDOM() < 0.3 THEN 'beginner'
    WHEN RANDOM() < 0.7 THEN 'intermediate'
    ELSE 'advanced'
  END
FROM subjects s
CROSS JOIN LATERAL (
  SELECT id FROM chapters WHERE subject_id = s.id LIMIT 3
) c
WHERE s.grade = 10 AND s.is_active = true
ON CONFLICT DO NOTHING;

-- =====================================================
-- STEP 6: Concept Gaps
-- =====================================================

INSERT INTO public.concept_gaps (student_id, subject_id, chapter_id, concept_name, gap_severity, identified_at, status, recommendations)
SELECT 
  'a1111111-1111-1111-1111-111111111111',
  s.id,
  c.id,
  CASE (RANDOM() * 5)::integer
    WHEN 0 THEN 'Quadratic Equations'
    WHEN 1 THEN 'Trigonometric Ratios'
    WHEN 2 THEN 'Chemical Bonding'
    WHEN 3 THEN 'Photosynthesis'
    ELSE 'Cell Division'
  END,
  CASE 
    WHEN RANDOM() < 0.3 THEN 'low'
    WHEN RANDOM() < 0.7 THEN 'medium'
    ELSE 'high'
  END,
  NOW() - (RANDOM() * INTERVAL '15 days'),
  CASE WHEN RANDOM() < 0.5 THEN 'active' ELSE 'addressed' END,
  '["Practice more examples", "Watch video tutorials", "Solve NCERT exercises"]'::jsonb
FROM subjects s
CROSS JOIN LATERAL (
  SELECT id FROM chapters WHERE subject_id = s.id LIMIT 2
) c
WHERE s.grade = 10 AND s.is_active = true
LIMIT 5
ON CONFLICT DO NOTHING;

-- =====================================================
-- STEP 7: Quiz Results
-- =====================================================

INSERT INTO public.quiz_results (student_id, quiz_id, subject_id, chapter_id, score, total_questions, correct_answers, time_taken_seconds, completed_at, difficulty_level)
SELECT 
  'a1111111-1111-1111-1111-111111111111',
  gen_random_uuid(),
  s.id,
  c.id,
  (50 + RANDOM() * 50)::numeric(5,2),
  10,
  (5 + RANDOM() * 5)::integer,
  (300 + RANDOM() * 600)::integer,
  NOW() - (RANDOM() * INTERVAL '20 days'),
  CASE (RANDOM() * 3)::integer
    WHEN 0 THEN 'easy'
    WHEN 1 THEN 'medium'
    ELSE 'hard'
  END
FROM subjects s
CROSS JOIN LATERAL (
  SELECT id FROM chapters WHERE subject_id = s.id LIMIT 2
) c
WHERE s.grade = 10 AND s.is_active = true
LIMIT 8
ON CONFLICT DO NOTHING;

-- =====================================================
-- STEP 8: Learning Sessions
-- =====================================================

INSERT INTO public.learning_sessions (
  student_id, subject_id, chapter_id, session_type, started_at, ended_at, 
  duration_minutes, activities, topics_covered, progress_made, points_earned
)
SELECT 
  'a1111111-1111-1111-1111-111111111111',
  s.id,
  c.id,
  CASE (RANDOM() * 4)::integer
    WHEN 0 THEN 'study'
    WHEN 1 THEN 'practice'
    WHEN 2 THEN 'quiz'
    ELSE 'diagnostic'
  END,
  NOW() - (RANDOM() * INTERVAL '30 days'),
  NOW() - (RANDOM() * INTERVAL '30 days') + (30 + RANDOM() * 60)::integer * INTERVAL '1 minute',
  (30 + RANDOM() * 60)::integer,
  '["Read chapter", "Solved problems", "Took notes"]'::jsonb,
  '["Introduction", "Key concepts", "Examples"]'::jsonb,
  '{"concepts_mastered": 3, "problems_solved": 15}'::jsonb,
  (10 + RANDOM() * 40)::integer
FROM subjects s
CROSS JOIN LATERAL (
  SELECT id FROM chapters WHERE subject_id = s.id LIMIT 2
) c
WHERE s.grade = 10 AND s.is_active = true
LIMIT 15
ON CONFLICT DO NOTHING;

-- =====================================================
-- STEP 9: Badges Earned
-- =====================================================

INSERT INTO public.badges_earned (student_id, badge_id, badge_name, badge_type, description, icon_url, points_awarded, earned_at)
VALUES
('a1111111-1111-1111-1111-111111111111', gen_random_uuid(), 'First Quiz Master', 'quiz_achievement', 'Completed first quiz with 80%+ score', 'https://cdn-icons-png.flaticon.com/512/2583/2583812.png', 50, NOW() - INTERVAL '25 days'),
('a1111111-1111-1111-1111-111111111111', gen_random_uuid(), '7-Day Streak', 'streak', 'Maintained 7-day learning streak', 'https://cdn-icons-png.flaticon.com/512/3588/3588314.png', 100, NOW() - INTERVAL '3 days'),
('a1111111-1111-1111-1111-111111111111', gen_random_uuid(), 'Math Wizard', 'subject_mastery', 'Mastered 5 math chapters', 'https://cdn-icons-png.flaticon.com/512/3426/3426653.png', 150, NOW() - INTERVAL '10 days'),
('a2222222-2222-2222-2222-222222222222', gen_random_uuid(), '14-Day Streak', 'streak', 'Maintained 14-day learning streak', 'https://cdn-icons-png.flaticon.com/512/3588/3588314.png', 200, NOW() - INTERVAL '1 day'),
('a2222222-2222-2222-2222-222222222222', gen_random_uuid(), 'Perfect Score', 'quiz_achievement', 'Scored 100% in a quiz', 'https://cdn-icons-png.flaticon.com/512/2583/2583812.png', 150, NOW() - INTERVAL '5 days')
ON CONFLICT DO NOTHING;

-- =====================================================
-- STEP 10: Parent Rewards
-- =====================================================

INSERT INTO public.parent_rewards (
  parent_id, student_id, reward_name, description, points_required, 
  reward_type, is_active, is_redeemed, created_at
) VALUES
(
  'b3333333-3333-3333-3333-333333333333',
  'a1111111-1111-1111-1111-111111111111',
  'Extra 30 minutes gaming',
  'Get extra 30 minutes of gaming time',
  100,
  'privilege',
  true,
  false,
  NOW() - INTERVAL '28 days'
),
(
  'b3333333-3333-3333-3333-333333333333',
  'a1111111-1111-1111-1111-111111111111',
  'Movie Night',
  'Family movie night of your choice',
  200,
  'activity',
  true,
  false,
  NOW() - INTERVAL '28 days'
),
(
  'b3333333-3333-3333-3333-333333333333',
  'a1111111-1111-1111-1111-111111111111',
  'Pizza Party',
  'Order your favorite pizza',
  300,
  'gift',
  true,
  true,
  NOW() - INTERVAL '15 days'
),
(
  'b4444444-4444-4444-4444-444444444444',
  'a2222222-2222-2222-2222-222222222222',
  'New Book',
  'Get a book of your choice',
  250,
  'gift',
  true,
  false,
  NOW() - INTERVAL '40 days'
),
(
  'b4444444-4444-4444-4444-444444444444',
  'a2222222-2222-2222-2222-222222222222',
  'Weekend Outing',
  'Special weekend trip',
  500,
  'activity',
  true,
  false,
  NOW() - INTERVAL '40 days'
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- STEP 11: Chapter Progress
-- =====================================================

INSERT INTO public.chapter_progress (student_id, chapter_id, subject_id, completion_percentage, time_spent_minutes, last_accessed, status, notes)
SELECT 
  'a1111111-1111-1111-1111-111111111111',
  c.id,
  s.id,
  (30 + RANDOM() * 70)::numeric(5,2),
  (60 + RANDOM() * 300)::integer,
  NOW() - (RANDOM() * INTERVAL '20 days'),
  CASE 
    WHEN RANDOM() < 0.3 THEN 'not_started'
    WHEN RANDOM() < 0.6 THEN 'in_progress'
    ELSE 'completed'
  END,
  'Making good progress'
FROM subjects s
JOIN chapters c ON c.subject_id = s.id
WHERE s.grade = 10 AND s.is_active = true
LIMIT 12
ON CONFLICT DO NOTHING;

-- =====================================================
-- STEP 12: Completed Lessons
-- =====================================================

INSERT INTO public.completed_lessons (student_id, subject_id, chapter_id, lesson_title, completed_at, time_spent_minutes, score, notes)
SELECT 
  'a1111111-1111-1111-1111-111111111111',
  s.id,
  c.id,
  'Lesson ' || (ROW_NUMBER() OVER (PARTITION BY c.id))::text || ': ' || c.name,
  NOW() - (RANDOM() * INTERVAL '25 days'),
  (20 + RANDOM() * 40)::integer,
  (70 + RANDOM() * 30)::numeric(5,2),
  'Lesson completed successfully'
FROM subjects s
JOIN chapters c ON c.subject_id = s.id
WHERE s.grade = 10 AND s.is_active = true
LIMIT 20
ON CONFLICT DO NOTHING;

-- =====================================================
-- STEP 13: Student Badges
-- =====================================================

INSERT INTO public.student_badges (student_id, badge_name, badge_type, description, earned_at, icon_url, points_awarded)
VALUES
('a1111111-1111-1111-1111-111111111111', 'Early Bird', 'time_based', 'Completed lessons before 8 AM', NOW() - INTERVAL '5 days', 'https://cdn-icons-png.flaticon.com/512/3037/3037079.png', 25),
('a1111111-1111-1111-1111-111111111111', 'Night Owl', 'time_based', 'Studied after 10 PM', NOW() - INTERVAL '12 days', 'https://cdn-icons-png.flaticon.com/512/2913/2913133.png', 25),
('a1111111-1111-1111-1111-111111111111', 'Speed Learner', 'achievement', 'Completed 3 chapters in one day', NOW() - INTERVAL '8 days', 'https://cdn-icons-png.flaticon.com/512/3588/3588592.png', 75),
('a2222222-2222-2222-2222-222222222222', 'Consistent Learner', 'streak', 'Studied every day for 2 weeks', NOW() - INTERVAL '2 days', 'https://cdn-icons-png.flaticon.com/512/3588/3588314.png', 150),
('a2222222-2222-2222-2222-222222222222', 'Subject Expert', 'mastery', 'Achieved 90%+ in all Physics quizzes', NOW() - INTERVAL '7 days', 'https://cdn-icons-png.flaticon.com/512/3426/3426653.png', 200)
ON CONFLICT DO NOTHING;

-- =====================================================
-- STEP 14: Diagnostics
-- =====================================================

INSERT INTO public.diagnostics (
  student_id, subject_id, diagnostic_type, questions_data, score_percentage,
  strengths, weaknesses, knowledge_gaps, recommendations, time_taken_minutes, completed_at, created_at
)
SELECT 
  'a1111111-1111-1111-1111-111111111111',
  s.id,
  'initial',
  '{"questions": [{"id": 1, "answer": "B"}, {"id": 2, "answer": "C"}]}'::jsonb,
  (60 + RANDOM() * 35)::numeric(5,2),
  '["Problem solving", "Conceptual understanding"]'::jsonb,
  '["Time management", "Advanced topics"]'::jsonb,
  '["Need practice in complex problems", "Revision required for formulas"]'::jsonb,
  '["Focus on NCERT examples", "Practice previous year questions", "Take mock tests"]'::jsonb,
  (30 + RANDOM() * 30)::integer,
  NOW() - (RANDOM() * INTERVAL '25 days'),
  NOW() - (RANDOM() * INTERVAL '25 days')
FROM subjects s
WHERE s.grade = 10 AND s.is_active = true
LIMIT 4
ON CONFLICT DO NOTHING;

-- =====================================================
-- STEP 15: Pain Points
-- =====================================================

INSERT INTO public.pain_points (
  student_id, subject_id, pain_type, description, severity, status, ai_suggestions, created_at
)
VALUES
(
  'a1111111-1111-1111-1111-111111111111',
  (SELECT id FROM subjects WHERE code = 'MATH_10' LIMIT 1),
  'concept',
  'Finding it difficult to understand quadratic equations word problems',
  4,
  'active',
  '["Break down the problem into steps", "Practice simpler problems first", "Use visual aids"]'::jsonb,
  NOW() - INTERVAL '5 days'
),
(
  'a1111111-1111-1111-1111-111111111111',
  (SELECT id FROM subjects WHERE code = 'SCI_10' LIMIT 1),
  'memory',
  'Cannot remember all chemical formulas',
  3,
  'addressed',
  '["Create flashcards", "Use mnemonics", "Practice writing formulas daily"]'::jsonb,
  NOW() - INTERVAL '15 days'
),
(
  'a2222222-2222-2222-2222-222222222222',
  (SELECT id FROM subjects WHERE code = 'PHY_12' LIMIT 1),
  'calculation',
  'Making errors in electrostatics numerical problems',
  4,
  'active',
  '["Double check calculations", "Review basic formulas", "Practice more problems"]'::jsonb,
  NOW() - INTERVAL '3 days'
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- STEP 16: Quiz Attempts
-- =====================================================

INSERT INTO public.quiz_attempts (
  quiz_id, student_id, attempt_number, started_at, completed_at, status,
  answers, score, points_earned, time_taken_seconds, correct_count, incorrect_count, is_passed
)
SELECT 
  q.id,
  'a1111111-1111-1111-1111-111111111111',
  1,
  NOW() - (RANDOM() * INTERVAL '20 days'),
  NOW() - (RANDOM() * INTERVAL '20 days') + (300 + RANDOM() * 600)::integer * INTERVAL '1 second',
  'completed',
  '[{"question_id": "q1", "answer": "B", "is_correct": true}, {"question_id": "q2", "answer": "A", "is_correct": false}]'::jsonb,
  (60 + RANDOM() * 40)::numeric(5,2),
  (60 + RANDOM() * 40)::integer,
  (300 + RANDOM() * 600)::integer,
  (6 + RANDOM() * 4)::integer,
  (0 + RANDOM() * 4)::integer,
  RANDOM() > 0.3
FROM quizzes q
WHERE q.is_active = true
LIMIT 6
ON CONFLICT DO NOTHING;

-- =====================================================
-- STEP 17: Gamification Achievements
-- =====================================================

INSERT INTO public.gamification (
  student_id, achievement_type, achievement_name, description, 
  icon_url, points_awarded, rarity, metadata, earned_at
) VALUES
(
  'a1111111-1111-1111-1111-111111111111',
  'badge',
  'Quick Learner',
  'Completed a chapter in under 2 hours',
  'https://cdn-icons-png.flaticon.com/512/3588/3588592.png',
  50,
  'common',
  '{"chapter_id": "ch1", "time_minutes": 115}'::jsonb,
  NOW() - INTERVAL '18 days'
),
(
  'a1111111-1111-1111-1111-111111111111',
  'milestone',
  '500 Points',
  'Reached 500 total points',
  'https://cdn-icons-png.flaticon.com/512/2583/2583812.png',
  100,
  'rare',
  '{"total_points": 500}'::jsonb,
  NOW() - INTERVAL '10 days'
),
(
  'a2222222-2222-2222-2222-222222222222',
  'badge',
  'Perfect Week',
  'Studied every day for a week',
  'https://cdn-icons-png.flaticon.com/512/3588/3588314.png',
  150,
  'epic',
  '{"week_start": "2024-11-15", "days": 7}'::jsonb,
  NOW() - INTERVAL '5 days'
),
(
  'a2222222-2222-2222-2222-222222222222',
  'milestone',
  '1000 Points',
  'Reached 1000 total points',
  'https://cdn-icons-png.flaticon.com/512/2583/2583812.png',
  200,
  'legendary',
  '{"total_points": 1000}'::jsonb,
  NOW() - INTERVAL '2 days'
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- STEP 18: AI Logs (Sample interactions)
-- =====================================================

INSERT INTO public.ai_logs (
  user_id, student_id, ai_service, operation_type, request_data, 
  response_data, tokens_used, cost, duration_ms, status, created_at
) VALUES
(
  '11111111-1111-1111-1111-111111111111',
  'a1111111-1111-1111-1111-111111111111',
  'openai',
  'diagnostic_analysis',
  '{"subject": "Mathematics", "chapter": "Quadratic Equations"}'::jsonb,
  '{"gaps_identified": ["Word problems", "Discriminant"], "recommendations": ["Practice more"]}'::jsonb,
  1250,
  0.0375,
  2340,
  'success',
  NOW() - INTERVAL '5 days'
),
(
  '11111111-1111-1111-1111-111111111111',
  'a1111111-1111-1111-1111-111111111111',
  'openai',
  'quiz_generation',
  '{"subject": "Science", "difficulty": "medium", "questions": 10}'::jsonb,
  '{"quiz_id": "q123", "questions_generated": 10}'::jsonb,
  2100,
  0.063,
  3450,
  'success',
  NOW() - INTERVAL '12 days'
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- SUMMARY
-- =====================================================

-- Display summary of created data
DO $$
DECLARE
  student_count integer;
  parent_count integer;
  session_count integer;
  badge_count integer;
  reward_count integer;
BEGIN
  SELECT COUNT(*) INTO student_count FROM student_profiles;
  SELECT COUNT(*) INTO parent_count FROM parent_profiles;
  SELECT COUNT(*) INTO session_count FROM learning_sessions;
  SELECT COUNT(*) INTO badge_count FROM badges_earned WHERE badge_earned IS NOT NULL OR student_id IN (SELECT id FROM student_profiles);
  SELECT COUNT(*) INTO reward_count FROM parent_rewards;
  
  RAISE NOTICE '====================================';
  RAISE NOTICE 'Dummy Data Creation Complete!';
  RAISE NOTICE '====================================';
  RAISE NOTICE 'Students created: %', student_count;
  RAISE NOTICE 'Parents created: %', parent_count;
  RAISE NOTICE 'Learning sessions: %', session_count;
  RAISE NOTICE 'Badges earned: %', badge_count;
  RAISE NOTICE 'Parent rewards: %', reward_count;
  RAISE NOTICE '====================================';
END $$;

-- =====================================================
-- LOGIN CREDENTIALS REFERENCE
-- =====================================================
-- 
-- STUDENT ACCOUNTS:
-- -----------------
-- Student 1 (Rahul Sharma - Grade 10):
--   Email: student1@test.com
--   Password: Test@123456
--   Stats: 850 points, Level 9, 7-day streak
--
-- Student 2 (Priya Patel - Grade 12):
--   Email: student2@test.com
--   Password: Test@123456
--   Stats: 1520 points, Level 16, 14-day streak
--
-- PARENT ACCOUNTS:
-- ----------------
-- Parent 1 (Mr. Rajesh Sharma - Rahul's father):
--   Email: parent1@test.com
--   Password: Test@123456
--   Linked to: Rahul Sharma
--
-- Parent 2 (Mrs. Anjali Patel - Priya's mother):
--   Email: parent2@test.com
--   Password: Test@123456
--   Linked to: Priya Patel
--
-- =====================================================
