# Database Setup Instructions

## Overview
This guide will walk you through setting up the complete database schema for your CBSE Educational App in Supabase.

---

## Prerequisites

1. **Supabase Project**: You already have your project at https://ziaqpnuvvlnemxiwjckp.supabase.co
2. **Project Credentials**:
   - Project URL: `https://ziaqpnuvvlnemxiwjckp.supabase.co`
   - Anon Key: Already configured in your app

---

## Step-by-Step Setup

### Step 1: Access Supabase SQL Editor

1. Go to https://supabase.com/dashboard/projects
2. Select your project: `ziaqpnuvvlnemxiwjckp`
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query** button

### Step 2: Run the Main Schema

1. Open the file `supabase-schema-complete.sql` from your project
2. Copy the **entire contents** of the file
3. Paste it into the Supabase SQL Editor
4. Click **Run** button (or press Cmd/Ctrl + Enter)
5. Wait for the execution to complete (should take 10-30 seconds)
6. You should see a success message

**What this creates**:
- ✅ 17 database tables
- ✅ All foreign key relationships
- ✅ Indexes for performance
- ✅ Database functions (calculate_quiz_score, update_student_points, etc.)
- ✅ Triggers (auto-update updated_at timestamps)
- ✅ Row Level Security (RLS) policies
- ✅ Admin access policies

### Step 3: Seed Subject Data

1. Click **New Query** in SQL Editor again
2. Open the file `supabase-seed-subjects.sql`
3. Copy and paste its contents
4. Click **Run**
5. You should see a confirmation message with the number of subjects created

**What this creates**:
- ✅ 23+ CBSE subjects for grades 9-12
- ✅ Subjects for Science, Commerce streams
- ✅ Color-coded subjects for better UI

### Step 4: Verify the Setup

Run this verification query in SQL Editor:

```sql
-- Check table creation
SELECT 
  schemaname,
  tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Check subjects
SELECT COUNT(*) as total_subjects FROM public.subjects;

-- Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

Expected results:
- **17 tables** in public schema
- **23+ subjects** in subjects table
- **Multiple RLS policies** for each table

---

## Database Structure Overview

### Core Tables

| Table | Purpose | Key Relationships |
|-------|---------|-------------------|
| **users** | User authentication & roles | Base table for all profiles |
| **student_profiles** | Student extended info | Links to users |
| **parent_profiles** | Parent extended info | Links to users |
| **student_parent_links** | Parent-student relationships | M:N junction table |
| **subjects** | CBSE subjects catalog | Referenced by chapters, quizzes |
| **chapters** | Topics within subjects | Belongs to subjects |
| **student_subject_settings** | Student's subject preferences | Links students to subjects |

### Learning & Assessment Tables

| Table | Purpose |
|-------|---------|
| **pain_points** | Track student difficulties |
| **uploads** | Document/image uploads for AI analysis |
| **diagnostics** | AI diagnostic assessment results |
| **quizzes** | Quiz definitions |
| **quiz_questions** | Individual quiz questions |
| **quiz_attempts** | Student quiz attempt records |
| **learning_sessions** | Track learning time & activities |

### Gamification Tables

| Table | Purpose |
|-------|---------|
| **gamification** | Badges, achievements, milestones |
| **parent_rewards** | Parent-defined reward system |

### System Tables

| Table | Purpose |
|-------|---------|
| **ai_logs** | Log all AI API calls for debugging |

---

## Security Features (RLS Policies)

The schema includes comprehensive Row Level Security:

### Students Can:
- ✅ View and update their own profile
- ✅ Manage their own pain points, uploads, quizzes
- ✅ View their own diagnostics and learning sessions
- ✅ View public subjects and chapters
- ✅ View rewards set by their parents

### Parents Can:
- ✅ View and update their own profile
- ✅ View all data of linked students
- ✅ Create and manage rewards for their students
- ✅ View student progress, quiz attempts, diagnostics

### Admins Can:
- ✅ Full access to all tables
- ✅ Manage subjects, chapters, quizzes

---

## Database Functions Available

### 1. `update_updated_at_column()`
Automatically updates the `updated_at` timestamp on record updates.

### 2. `calculate_quiz_score(attempt_id uuid)`
Calculates percentage score for a quiz attempt.

**Usage**:
```sql
SELECT calculate_quiz_score('attempt-uuid-here');
```

### 3. `update_student_points(student_id uuid, points_to_add integer)`
Updates student's total points and recalculates level.

**Usage**:
```sql
SELECT update_student_points('student-uuid', 50);
```

### 4. `check_achievements(student_id uuid)`
Checks and awards achievements based on student activity.

**Usage**:
```sql
SELECT check_achievements('student-uuid');
```

---

## Next Steps for Your App

### 1. Create tRPC Procedures

Now that the database is set up, create tRPC routes to interact with it. Here are the key operations you'll need:

#### Student Operations:
- `student.create` - Create student profile during onboarding
- `student.update` - Update profile settings
- `student.getProfile` - Get current student profile
- `student.getProgress` - Get learning progress stats

#### Subject Operations:
- `subject.list` - List all subjects for grade
- `subject.getByGrade` - Get subjects by grade
- `subject.setPreferences` - Save student subject preferences

#### Pain Points:
- `painPoints.create` - Report a new difficulty
- `painPoints.list` - Get all pain points for student
- `painPoints.resolve` - Mark pain point as resolved

#### Diagnostics:
- `diagnostic.create` - Create new diagnostic
- `diagnostic.analyze` - Run AI analysis on uploaded work
- `diagnostic.getResults` - Get diagnostic results

#### Quiz Operations:
- `quiz.list` - Get available quizzes
- `quiz.start` - Start a quiz attempt
- `quiz.submit` - Submit quiz answers
- `quiz.getResults` - Get attempt results

### 2. Update Your AppStateContext

Modify `contexts/AppStateContext.tsx` to use Supabase data instead of AsyncStorage:

```typescript
// Fetch student profile from Supabase
const profileQuery = trpc.student.getProfile.useQuery();

// Fetch selected subjects
const subjectsQuery = trpc.student.getSubjects.useQuery();
```

### 3. Connect Authentication

Make sure Supabase Auth is properly integrated:
- Sign up creates user in `auth.users`
- Profile creation adds to `student_profiles` or `parent_profiles`
- Role is set in `users.role`

### 4. Test Data Flow

Create a test flow:
1. Sign up as student
2. Complete onboarding (creates profile)
3. Select subjects (creates student_subject_settings)
4. Report a pain point
5. Take a diagnostic quiz
6. View progress

---

## Monitoring & Maintenance

### Check Database Health

```sql
-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY size_bytes DESC;

-- Check recent activity
SELECT 
  COUNT(*) as total_students,
  COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as students_this_week
FROM student_profiles;

-- Check AI usage
SELECT 
  ai_service,
  operation_type,
  COUNT(*) as total_calls,
  SUM(tokens_used) as total_tokens,
  SUM(cost) as total_cost
FROM ai_logs
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY ai_service, operation_type;
```

### Backup Strategy

Supabase automatically backs up your database, but you can also:

1. **Manual Backup**: Use SQL Editor to export data
2. **Regular Exports**: Set up scheduled exports via Supabase Dashboard
3. **Point-in-Time Recovery**: Available in Supabase (check your plan)

---

## Troubleshooting

### Issue: "permission denied for schema public"

**Solution**: Make sure you're running queries as the postgres user in SQL Editor.

### Issue: "relation already exists"

**Solution**: The table already exists. Either:
- Drop the table first: `DROP TABLE IF EXISTS table_name CASCADE;`
- Or skip the table creation

### Issue: RLS policies blocking access

**Solution**: Check if policies are correctly set up:
```sql
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

### Issue: Foreign key constraint fails

**Solution**: Make sure referenced tables exist before creating dependent tables.

---

## Sample Data for Testing

Want to add test data? Run this:

```sql
-- Create a test student user (you'll need to create auth user first via signup)
-- Then run this with the actual auth UUID:

INSERT INTO student_profiles (user_id, full_name, grade, total_points, level)
VALUES ('your-auth-user-uuid', 'Test Student', 10, 250, 3);

-- Add some pain points
INSERT INTO pain_points (student_id, subject_id, pain_type, description, severity)
SELECT 
  sp.id,
  s.id,
  'concept',
  'Having trouble understanding quadratic equations',
  4
FROM student_profiles sp
CROSS JOIN subjects s
WHERE sp.full_name = 'Test Student' 
  AND s.code = 'MATH-10';
```

---

## Database Diagram

You can visualize the database schema using:

1. **Supabase Dashboard**: Go to Database → Schema Visualizer
2. **External Tools**: 
   - [dbdiagram.io](https://dbdiagram.io)
   - [DBeaver](https://dbeaver.io/)
   - [pgAdmin](https://www.pgadmin.org/)

Connect using your Supabase connection string (available in Project Settings → Database).

---

## Support

If you encounter issues:

1. Check Supabase logs: Dashboard → Logs
2. Verify RLS policies are not blocking legitimate access
3. Check foreign key constraints are properly set
4. Ensure auth.users entries exist before creating profiles

---

## Migration History

Keep track of schema changes:

| Version | Date | Description |
|---------|------|-------------|
| 1.0.0 | 2025-01-XX | Initial schema with 17 tables |
| 1.1.0 | TBD | Add chapter seed data |
| 1.2.0 | TBD | Add sample quiz questions |

---

## Summary

✅ Complete relational database schema created
✅ Row Level Security enabled for data protection
✅ Database functions for common operations
✅ Triggers for automatic timestamp updates
✅ CBSE subjects seeded for grades 9-12
✅ Comprehensive indexes for performance
✅ Ready for production use

Your database is now ready! The Supabase icon in the Rork app should now be active, showing a successful connection.

Next step: Build tRPC procedures to interact with this database from your React Native app.
