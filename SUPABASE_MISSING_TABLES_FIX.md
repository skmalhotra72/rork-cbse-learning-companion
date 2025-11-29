# 🔧 Supabase Missing Tables Fix

## Issue
The following tables were reported as missing in your Supabase database:
- `concept_gaps`
- `quiz_results`
- `learning_sessions`
- `badges_earned`
- `parent_rewards`

## Root Cause
Some of these tables use different names in the schema vs. what the code might be referencing:
- `pain_points` (schema) vs `concept_gaps` (code?)
- `quiz_attempts` (schema) vs `quiz_results` (code?)
- `gamification` (schema) vs `badges_earned` (code?)

## Solution

### Option 1: Run the Missing Tables SQL (Recommended)

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project: `e5gqefhofcuk6mx6gujbr`

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run the Missing Tables Script**
   - Copy all contents from `supabase-missing-tables.sql`
   - Paste into the SQL editor
   - Click "Run" (or press Cmd/Ctrl + Enter)

4. **Verify Tables Created**
   The script includes a verification query at the end. You should see:
   ```
   concept_gaps
   quiz_results
   learning_sessions
   badges_earned
   parent_rewards
   ```

### Option 2: Run Complete Schema (Fresh Start)

If you want to start fresh:

1. **Drop existing schema** (⚠️ This will delete all data!)
   ```sql
   DROP SCHEMA public CASCADE;
   CREATE SCHEMA public;
   GRANT ALL ON SCHEMA public TO postgres;
   GRANT ALL ON SCHEMA public TO public;
   ```

2. **Run complete schema**
   - Copy all contents from `supabase-schema-complete.sql`
   - Paste and run in SQL Editor

3. **Run seed data**
   - Copy all contents from `supabase-seed-subjects.sql`
   - Paste and run in SQL Editor

## What Each Table Does

### 1. concept_gaps
**Purpose:** Track specific conceptual knowledge gaps identified through AI diagnostics

**Key Fields:**
- `concept_name` - The specific concept the student struggles with
- `gap_description` - Detailed description of the gap
- `severity` - How critical is this gap (1-5)
- `status` - identified → working_on → resolved
- `prerequisite_concepts` - What concepts are needed first
- `recommended_resources` - AI-generated learning resources

**Used For:**
- Bridge mode learning path generation
- Personalized diagnostics
- Progress tracking

### 2. quiz_results
**Purpose:** Cached/summarized quiz results for faster analytics and reporting

**Key Fields:**
- `quiz_attempt_id` - Links to the detailed attempt
- `score_percentage` - Final score
- `strengths` - Topics the student is strong in
- `weaknesses` - Topics needing improvement
- `topic_scores` - Breakdown by topic

**Used For:**
- Parent dashboard analytics
- Progress reports
- Performance trends
- Subject-wise analysis

### 3. learning_sessions
**Purpose:** Track all learning activities with time spent and progress

**Key Fields:**
- `session_type` - study, practice, quiz, diagnostic
- `duration_minutes` - Time spent learning
- `topics_covered` - What was studied
- `progress_made` - Measurable progress
- `points_earned` - Gamification points

**Used For:**
- Time tracking
- Activity logs
- Streak calculation
- Parent monitoring
- Study pattern analysis

### 4. badges_earned
**Purpose:** Track badges and achievements earned by students

**Key Fields:**
- `badge_id` - Unique badge identifier
- `badge_name` - "First Quiz Master", "7-Day Streak", etc.
- `badge_type` - streak, achievement, milestone, mastery
- `rarity` - common, rare, epic, legendary
- `points_awarded` - Bonus points for earning

**Used For:**
- Gamification system
- Student motivation
- Progress visualization
- Parent rewards integration

### 5. parent_rewards
**Purpose:** Parent-defined rewards that students can redeem with points

**Key Fields:**
- `reward_name` - "Extra 30 mins gaming", "Ice cream treat"
- `points_required` - How many points needed to redeem
- `reward_type` - privilege, gift, activity
- `is_redeemed` - Whether student has claimed it
- `redeemed_at` - When it was redeemed

**Used For:**
- Parent engagement
- Real-world motivation
- Points redemption
- Family rewards system

## Table Relationships

```
student_profiles (1) ────< (*) concept_gaps
                    └────< (*) quiz_results
                    └────< (*) learning_sessions
                    └────< (*) badges_earned
                    └────< (*) parent_rewards

parent_profiles (1) ────< (*) parent_rewards

subjects (1) ────< (*) concept_gaps
            └────< (*) quiz_results
            └────< (*) learning_sessions

chapters (1) ────< (*) concept_gaps
            └────< (*) quiz_results
            └────< (*) learning_sessions

quizzes (1) ────< (*) quiz_results

quiz_attempts (1) ────< (1) quiz_results

diagnostics (1) ────< (*) concept_gaps
```

## Verification Checklist

After running the SQL, verify everything is set up:

- [ ] All 5 tables exist in Supabase
- [ ] Each table has proper indexes
- [ ] Row Level Security (RLS) is enabled
- [ ] RLS policies are created
- [ ] Triggers are set up (for updated_at columns)
- [ ] Foreign key relationships are valid
- [ ] No errors in Supabase logs

### Quick Verification Query

Run this in SQL Editor:
```sql
-- Check if all tables exist
SELECT 
  tablename,
  (SELECT COUNT(*) FROM pg_indexes WHERE tablename = t.tablename) as index_count,
  rowsecurity as rls_enabled
FROM pg_tables t
WHERE schemaname = 'public'
  AND tablename IN (
    'concept_gaps',
    'quiz_results', 
    'learning_sessions',
    'badges_earned',
    'parent_rewards'
  )
ORDER BY tablename;
```

Expected output:
```
concept_gaps      | 5+ | true
quiz_results      | 6+ | true
learning_sessions | 5+ | true
badges_earned     | 4+ | true
parent_rewards    | 4+ | true
```

## Code Integration

After tables are created, your tRPC routes should work:

### Example: Creating a concept gap
```typescript
// backend/trpc/routes/diagnostics/get-gaps/route.ts
export const getGapsProcedure = protectedProcedure
  .input(z.object({ studentId: z.string().uuid() }))
  .query(async ({ ctx, input }) => {
    const { data, error } = await ctx.supabase
      .from('concept_gaps')
      .select('*, subject:subjects(*), chapter:chapters(*)')
      .eq('student_id', input.studentId)
      .eq('status', 'identified')
      .order('severity', { ascending: false });

    if (error) throw error;
    return data;
  });
```

### Example: Awarding a badge
```typescript
// backend/trpc/routes/gamification/award-badge/route.ts
export const awardBadgeProcedure = protectedProcedure
  .input(z.object({
    studentId: z.string().uuid(),
    badgeId: z.string(),
    badgeName: z.string(),
    points: z.number()
  }))
  .mutation(async ({ ctx, input }) => {
    const { data, error } = await ctx.supabase
      .from('badges_earned')
      .insert({
        student_id: input.studentId,
        badge_id: input.badgeId,
        badge_name: input.badgeName,
        badge_type: 'achievement',
        points_awarded: input.points
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  });
```

## Troubleshooting

### Error: "function update_updated_at_column() does not exist"
**Solution:** Run the complete schema first (`supabase-schema-complete.sql`) which includes this function.

### Error: "relation does not exist"
**Solution:** Check that you're running the SQL in the correct Supabase project.

### Error: "permission denied"
**Solution:** Make sure you're using the SQL Editor as a project admin, not the anon key.

### Tables created but RLS blocking access
**Solution:** Verify the RLS policies are created. Check with:
```sql
SELECT tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename IN (
  'concept_gaps', 'quiz_results', 'learning_sessions', 
  'badges_earned', 'parent_rewards'
);
```

## Next Steps

1. ✅ Create missing tables (run SQL)
2. ✅ Verify tables exist
3. ✅ Test with a simple query
4. Update tRPC routes to use these tables
5. Test authentication flow
6. Test data flow from frontend → backend → Supabase
7. Monitor Supabase logs for any errors

## Additional Resources

- **Full Schema:** `supabase-schema-complete.sql`
- **Schema Docs:** `DATABASE_SCHEMA.md`
- **Architecture:** `DATABASE_ARCHITECTURE.md`
- **Setup Guide:** `DATABASE_SETUP_GUIDE.md`
- **Quick Reference:** `DATABASE_QUICK_REFERENCE.md`

---

**Status:** Ready to execute ✅  
**Estimated Time:** 2-3 minutes  
**Risk Level:** Low (CREATE IF NOT EXISTS prevents conflicts)

Run the SQL and verify - your database will be complete! 🚀
