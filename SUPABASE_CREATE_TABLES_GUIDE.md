# How to Create Missing Tables in Supabase

## Quick Setup Steps

### 1. Go to Supabase SQL Editor
1. Open your Supabase dashboard: https://supabase.com/dashboard/project/gevcprpgzxbozzqgjgmk
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**

### 2. Run the SQL Script
1. Open the file `supabase-create-missing-tables.sql` in this project
2. Copy ALL the content
3. Paste it into the Supabase SQL Editor
4. Click **Run** or press `Ctrl/Cmd + Enter`

### 3. Verify Tables Were Created
After running the script, run this verification query in the SQL Editor:

```sql
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
```

You should see all 8 tables listed.

## Tables Being Created

The script creates these missing tables:

1. ✅ **progress_data** - Track overall subject/chapter progress
2. ✅ **quiz_results** - Cached quiz results for analytics
3. ✅ **learning_sessions** - Track learning activity and time
4. ✅ **badges_earned** - Track badges/achievements
5. ✅ **parent_rewards** - Parent-defined rewards system
6. ✅ **chapter_progress** - Detailed chapter-level progress
7. ✅ **completed_lessons** - Individual lesson completions
8. ✅ **student_badges** - Summary of earned badges

## What the Script Does

- Creates all missing tables with proper schema
- Adds foreign key relationships
- Creates indexes for performance
- Sets up Row Level Security (RLS) policies
- Adds triggers for automatic `updated_at` timestamps
- Configures admin access policies

## Troubleshooting

### If you get "relation already exists" errors:
This is fine - it means some tables already exist. The script uses `CREATE TABLE IF NOT EXISTS` so it won't overwrite existing tables.

### If you get foreign key constraint errors:
Make sure the base tables exist first:
- users
- student_profiles
- parent_profiles
- subjects
- chapters
- quizzes
- quiz_attempts

### If RLS policies fail:
Some policies might already exist. You can safely ignore these errors or drop existing policies first:

```sql
-- Drop all policies for a table (if needed)
DROP POLICY IF EXISTS "policy_name" ON table_name;
```

## After Creating Tables

1. Test the connection in your app by running:
   ```bash
   bun run test-supabase.ts
   ```

2. Check if the Supabase indicator turns green in your app

3. Start using the app normally - all database operations should now work!

## Need Help?

If tables still don't show up:
1. Refresh your Supabase dashboard
2. Check the **Table Editor** to see if tables appear there
3. Run the verification query above to confirm tables exist
4. Check for any error messages in the SQL Editor output
