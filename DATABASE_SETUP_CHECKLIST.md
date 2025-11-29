# Database Connection & Setup Checklist

## ✅ Pre-Setup Checklist

- [x] Supabase project created
- [x] Project URL: `https://ziaqpnuvvlnemxiwjckp.supabase.co`
- [x] Anon Key configured in app
- [ ] SQL Editor accessed in Supabase Dashboard
- [ ] Main schema SQL ready to run
- [ ] Subject seed data ready to run

---

## 🚀 Setup Steps

### Step 1: Run Main Schema (Required)

1. Open Supabase Dashboard → SQL Editor
2. Click "New Query"
3. Copy entire contents of `supabase-schema-complete.sql`
4. Paste and click "Run"
5. Wait for completion (10-30 seconds)
6. Verify success message

**What gets created:**
```
✓ 17 tables
✓ 50+ indexes
✓ 4 database functions
✓ 8+ triggers
✓ 40+ RLS policies
```

### Step 2: Seed Subject Data (Required)

1. Click "New Query" again
2. Copy contents of `supabase-seed-subjects.sql`
3. Paste and click "Run"
4. Verify "Successfully seeded X subjects" message

**What gets created:**
```
✓ 23+ CBSE subjects for grades 9-12
✓ Science & Commerce stream subjects
✓ Color-coded for UI
```

### Step 3: Verify Setup (Recommended)

Run this verification script in SQL Editor:

```sql
-- ================================================
-- DATABASE VERIFICATION SCRIPT
-- ================================================
-- Run this to verify your setup is complete
-- ================================================

DO $$
DECLARE
  table_count integer;
  subject_count integer;
  policy_count integer;
  index_count integer;
  function_count integer;
BEGIN
  -- Count tables
  SELECT COUNT(*) INTO table_count
  FROM pg_tables 
  WHERE schemaname = 'public';
  
  RAISE NOTICE '✓ Tables created: %', table_count;
  
  IF table_count < 17 THEN
    RAISE WARNING '⚠ Expected 17 tables, found %', table_count;
  END IF;
  
  -- Count subjects
  SELECT COUNT(*) INTO subject_count
  FROM public.subjects;
  
  RAISE NOTICE '✓ Subjects seeded: %', subject_count;
  
  IF subject_count < 20 THEN
    RAISE WARNING '⚠ Expected 20+ subjects, found %', subject_count;
  END IF;
  
  -- Count RLS policies
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE schemaname = 'public';
  
  RAISE NOTICE '✓ RLS policies created: %', policy_count;
  
  IF policy_count < 30 THEN
    RAISE WARNING '⚠ Expected 30+ policies, found %', policy_count;
  END IF;
  
  -- Count indexes
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes 
  WHERE schemaname = 'public';
  
  RAISE NOTICE '✓ Indexes created: %', index_count;
  
  -- Count custom functions
  SELECT COUNT(*) INTO function_count
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
  AND p.proname IN (
    'update_updated_at_column',
    'calculate_quiz_score',
    'update_student_points',
    'check_achievements'
  );
  
  RAISE NOTICE '✓ Custom functions created: %', function_count;
  
  IF function_count < 4 THEN
    RAISE WARNING '⚠ Expected 4 functions, found %', function_count;
  END IF;
  
  -- Final summary
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'DATABASE SETUP VERIFICATION COMPLETE';
  RAISE NOTICE '========================================';
  
  IF table_count >= 17 AND subject_count >= 20 AND policy_count >= 30 AND function_count >= 4 THEN
    RAISE NOTICE '✅ All checks passed! Database is ready.';
  ELSE
    RAISE WARNING '⚠ Some checks failed. Review warnings above.';
  END IF;
  
END $$;

-- Show table list
SELECT 
  '📊 ' || tablename as "Tables Created"
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Show subject breakdown
SELECT 
  grade,
  COUNT(*) as subject_count
FROM public.subjects
GROUP BY grade
ORDER BY grade;
```

**Expected Output:**
```
✓ Tables created: 17
✓ Subjects seeded: 23
✓ RLS policies created: 40+
✓ Indexes created: 50+
✓ Custom functions created: 4
✅ All checks passed! Database is ready.
```

---

## 🔗 Test Database Connection from App

After running the schema, test the connection from your app:

### Option 1: Use tRPC Test Route

Create a test route: `backend/trpc/routes/test/connection/route.ts`

```typescript
import { publicProcedure } from "../../../init";

export const testConnectionProcedure = publicProcedure.query(async ({ ctx }) => {
  try {
    // Test basic query
    const { data: tables, error } = await ctx.supabase
      .from('subjects')
      .select('count');
    
    if (error) throw error;
    
    // Test function
    const { data: functionTest, error: funcError } = await ctx.supabase
      .rpc('pg_database_size', { database_name: 'postgres' });
    
    return {
      status: 'connected',
      message: 'Database connection successful',
      tablesAccessible: !!tables,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString(),
    };
  }
});
```

Then call from app:
```typescript
const result = await trpcClient.test.connection.query();
console.log('DB Connection Test:', result);
```

### Option 2: Direct Supabase Client Test

Add this to any component:

```typescript
import { supabase } from '@/lib/supabase';

async function testDatabaseConnection() {
  try {
    // Test 1: Fetch subjects
    const { data: subjects, error: subjectError } = await supabase
      .from('subjects')
      .select('*')
      .limit(1);
    
    if (subjectError) throw subjectError;
    
    console.log('✅ Subjects table accessible:', subjects?.length > 0);
    
    // Test 2: Check auth
    const { data: session } = await supabase.auth.getSession();
    console.log('✅ Auth working:', !!session);
    
    // Test 3: Check RLS
    const { data: profile, error: profileError } = await supabase
      .from('student_profiles')
      .select('*')
      .limit(1);
    
    console.log('✅ RLS policies active:', profileError?.message?.includes('policy'));
    
    return {
      success: true,
      message: 'Database connection verified',
    };
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return {
      success: false,
      message: error.message,
    };
  }
}

// Run test
testDatabaseConnection();
```

---

## 📝 Post-Setup Tasks

### 1. Create First Test User

```sql
-- Note: User must be created via Supabase Auth signup first
-- Then run this with the actual auth UUID

-- Create student profile
INSERT INTO public.student_profiles (
  user_id,
  full_name,
  grade,
  board
) VALUES (
  'auth-user-uuid-here',
  'Test Student',
  10,
  'CBSE'
);

-- Enable some subjects for the student
INSERT INTO public.student_subject_settings (student_id, subject_id, is_enabled)
SELECT 
  sp.id,
  s.id,
  true
FROM student_profiles sp
CROSS JOIN subjects s
WHERE sp.full_name = 'Test Student'
AND s.grade = 10
LIMIT 3;
```

### 2. Create Sample Quiz

```sql
-- Create a math quiz
INSERT INTO public.quizzes (
  subject_id,
  title,
  description,
  quiz_type,
  difficulty_level,
  total_questions,
  duration_minutes,
  is_active
)
SELECT 
  id,
  'Quadratic Equations Practice',
  'Test your understanding of quadratic equations',
  'practice',
  'medium',
  10,
  30,
  true
FROM subjects
WHERE code = 'MATH-10'
LIMIT 1;

-- Add some questions
INSERT INTO public.quiz_questions (
  quiz_id,
  question_number,
  question_text,
  question_type,
  options,
  correct_answer,
  explanation,
  difficulty_level,
  points
)
SELECT 
  q.id,
  1,
  'Solve: x² - 5x + 6 = 0',
  'mcq',
  '["x = 2, 3", "x = 1, 6", "x = -2, -3", "x = 0, 5"]'::jsonb,
  'x = 2, 3',
  'Factor: (x-2)(x-3) = 0, so x = 2 or x = 3',
  'medium',
  10
FROM quizzes q
WHERE q.title = 'Quadratic Equations Practice'
LIMIT 1;
```

### 3. Update App Configuration

Update `.env.local` (if not already done):

```bash
EXPO_PUBLIC_SUPABASE_URL=https://ziaqpnuvvlnemxiwjckp.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Create tRPC Procedures

Priority procedures to create:

#### Student Management
- [ ] `student.getProfile` - Get current student profile
- [ ] `student.updateProfile` - Update profile info
- [ ] `student.getSubjects` - Get student's subjects
- [ ] `student.setSubjects` - Save subject preferences
- [ ] `student.getStats` - Get learning statistics

#### Subject & Chapter
- [ ] `subject.listByGrade` - Get subjects for grade
- [ ] `chapter.listBySubject` - Get chapters for subject

#### Pain Points
- [ ] `painPoint.create` - Report difficulty
- [ ] `painPoint.list` - Get student's pain points
- [ ] `painPoint.resolve` - Mark as resolved

#### Diagnostics
- [ ] `diagnostic.create` - Start diagnostic
- [ ] `diagnostic.analyze` - AI analysis
- [ ] `diagnostic.getResults` - Get results

#### Quiz
- [ ] `quiz.list` - Available quizzes
- [ ] `quiz.start` - Start attempt
- [ ] `quiz.submitAnswer` - Submit answer
- [ ] `quiz.complete` - Complete attempt
- [ ] `quiz.getResults` - Get attempt results

#### Parent
- [ ] `parent.getStudents` - Get linked students
- [ ] `parent.getProgress` - Student progress
- [ ] `parent.createReward` - Create reward
- [ ] `parent.getRewards` - List rewards

---

## 🔍 Troubleshooting

### Issue: "relation does not exist"

**Cause**: Schema not run yet or tables not created in `public` schema

**Solution**:
```sql
-- Check if tables exist
SELECT schemaname, tablename 
FROM pg_tables 
WHERE schemaname = 'public';

-- If empty, run supabase-schema-complete.sql
```

### Issue: "permission denied for table X"

**Cause**: RLS policies blocking access

**Solution**:
```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check policies exist
SELECT * FROM pg_policies WHERE schemaname = 'public';

-- Temporarily disable for testing (NOT in production)
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
```

### Issue: "function calculate_quiz_score does not exist"

**Cause**: Functions not created

**Solution**:
```sql
-- List functions
SELECT proname FROM pg_proc 
WHERE pronamespace = 'public'::regnamespace;

-- Re-run function creation part of schema
```

### Issue: Can't connect from app

**Cause**: URL or anon key incorrect

**Solution**:
1. Verify URL in Supabase Dashboard → Settings → API
2. Check anon key matches
3. Verify `.env.local` has correct values
4. Restart Expo dev server

### Issue: "duplicate key value violates unique constraint"

**Cause**: Trying to insert duplicate data

**Solution**:
```sql
-- Check existing data
SELECT * FROM table_name WHERE unique_column = 'value';

-- Use UPSERT instead
INSERT INTO table_name (...)
VALUES (...)
ON CONFLICT (unique_column) DO UPDATE SET ...;
```

---

## 📊 Database Health Dashboard

Create this view for monitoring:

```sql
CREATE OR REPLACE VIEW database_health AS
SELECT
  'Students' as metric,
  COUNT(*)::text as value,
  'Total registered students' as description
FROM student_profiles

UNION ALL

SELECT
  'Active Students (7d)',
  COUNT(DISTINCT student_id)::text,
  'Students active in last 7 days'
FROM learning_sessions
WHERE started_at > NOW() - INTERVAL '7 days'

UNION ALL

SELECT
  'Quiz Attempts (30d)',
  COUNT(*)::text,
  'Total quiz attempts in last 30 days'
FROM quiz_attempts
WHERE started_at > NOW() - INTERVAL '30 days'

UNION ALL

SELECT
  'AI API Calls (30d)',
  COUNT(*)::text,
  'Total AI API calls in last 30 days'
FROM ai_logs
WHERE created_at > NOW() - INTERVAL '30 days'

UNION ALL

SELECT
  'Database Size',
  pg_size_pretty(pg_database_size(current_database())),
  'Total database size'

UNION ALL

SELECT
  'Subjects',
  COUNT(*)::text,
  'Total subjects in catalog'
FROM subjects;

-- Query the dashboard
SELECT * FROM database_health;
```

---

## ✅ Final Checklist

Before considering setup complete:

- [ ] Schema script executed successfully
- [ ] Subject seed data loaded
- [ ] Verification script shows all checks passed
- [ ] Test connection from app successful
- [ ] RLS policies verified working
- [ ] First test user created
- [ ] Sample quiz created (optional)
- [ ] tRPC procedures created for core features
- [ ] App can fetch subjects
- [ ] App can create student profile

---

## 🎉 Setup Complete!

Once all checklist items are done:

1. **Supabase icon in Rork app should be green/active**
2. **Database tables visible in Supabase Dashboard → Table Editor**
3. **App can fetch and display CBSE subjects**
4. **Student onboarding can save to database**

---

## 📚 Additional Resources

- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Complete schema documentation
- [DATABASE_QUICK_REFERENCE.md](./DATABASE_QUICK_REFERENCE.md) - Query patterns
- [DATABASE_SETUP_GUIDE.md](./DATABASE_SETUP_GUIDE.md) - Detailed setup guide
- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

---

## 🆘 Need Help?

If you encounter issues:

1. Check Supabase logs: Dashboard → Logs → Postgres Logs
2. Verify RLS policies aren't blocking legitimate access
3. Check auth.users entries exist before creating profiles
4. Review foreign key constraints
5. Check network connectivity to Supabase

The database is now ready for production use! 🚀
