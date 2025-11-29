# Database Quick Reference

## Table Relationships Map

```
┌─────────────────────────────────────────────────────────────────────┐
│                         AUTHENTICATION & PROFILES                    │
└─────────────────────────────────────────────────────────────────────┘

    auth.users (Supabase Auth)
         │
         ├──────────────────────────┐
         │                          │
         ▼                          ▼
    ┌─────────┐              ┌──────────────┐
    │  users  │              │              │
    │  table  │              │              │
    └────┬────┘              │              │
         │                   │              │
    ┌────┴────┬──────────────┴──────┐       │
    │         │                     │       │
    ▼         ▼                     ▼       │
┌─────────┐  ┌──────────┐    ┌─────────────▼────┐
│student_ │  │ parent_  │    │                   │
│profiles │  │profiles  │    │                   │
└────┬────┘  └─────┬────┘    │                   │
     │             │         │                   │
     │             │         │                   │
     └──────┬──────┘         │                   │
            │                │                   │
            ▼                │                   │
    ┌───────────────┐        │                   │
    │student_parent_│        │                   │
    │    links      │        │                   │
    └───────────────┘        │                   │


┌─────────────────────────────────────────────────────────────────────┐
│                      CURRICULUM & CONTENT                            │
└─────────────────────────────────────────────────────────────────────┘

    ┌──────────┐
    │ subjects │  (CBSE curriculum)
    └────┬─────┘
         │
         ├──────────────────┬─────────────┬──────────────┐
         │                  │             │              │
         ▼                  ▼             ▼              ▼
    ┌─────────┐      ┌──────────┐  ┌─────────┐   ┌──────────┐
    │chapters │      │ quizzes  │  │student_ │   │learning_ │
    └─────────┘      └────┬─────┘  │subject_ │   │sessions  │
                          │        │settings │   └──────────┘
                          ▼        └─────────┘
                   ┌──────────┐
                   │  quiz_   │
                   │questions │
                   └──────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                    LEARNING & ASSESSMENT                             │
└─────────────────────────────────────────────────────────────────────┘

    student_profiles
         │
         ├────────┬────────┬────────────┬───────────┬──────────┐
         │        │        │            │           │          │
         ▼        ▼        ▼            ▼           ▼          ▼
    ┌────────┐ ┌────┐ ┌──────────┐ ┌────────┐ ┌─────────┐ ┌────────┐
    │  pain_ │ │up  │ │diagnos   │ │  quiz_ │ │learning_│ │gamifi  │
    │ points │ │load│ │  tics    │ │attempts│ │sessions │ │cation  │
    └────────┘ └─s──┘ └──────────┘ └────────┘ └─────────┘ └────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                        GAMIFICATION                                  │
└─────────────────────────────────────────────────────────────────────┘

    student_profiles ────────────────┐
         │                           │
         │                           │
         ▼                           ▼
    ┌──────────────┐         ┌──────────────┐
    │ gamification │         │   parent_    │
    │ (badges)     │         │   rewards    │
    └──────────────┘         └──────────────┘
                                     ▲
                                     │
                              parent_profiles


┌─────────────────────────────────────────────────────────────────────┐
│                           SYSTEM                                     │
└─────────────────────────────────────────────────────────────────────┘

    ┌──────────┐
    │ ai_logs  │  (Logs all AI API calls)
    └──────────┘
         ▲
         │
    All AI operations
```

---

## Primary Keys & Foreign Keys

### users
- **PK**: `id` (uuid)
- **FK**: References `auth.users.id`

### student_profiles
- **PK**: `id` (uuid)
- **FK**: `user_id` → `users.id`

### parent_profiles
- **PK**: `id` (uuid)
- **FK**: `user_id` → `users.id`

### student_parent_links
- **PK**: `id` (uuid)
- **FK**: `student_id` → `student_profiles.id`
- **FK**: `parent_id` → `parent_profiles.id`

### subjects
- **PK**: `id` (uuid)
- **Unique**: `code`

### chapters
- **PK**: `id` (uuid)
- **FK**: `subject_id` → `subjects.id`

### student_subject_settings
- **PK**: `id` (uuid)
- **FK**: `student_id` → `student_profiles.id`
- **FK**: `subject_id` → `subjects.id`
- **Unique**: `(student_id, subject_id)`

### pain_points
- **PK**: `id` (uuid)
- **FK**: `student_id` → `student_profiles.id`
- **FK**: `subject_id` → `subjects.id`
- **FK**: `chapter_id` → `chapters.id` (nullable)

### uploads
- **PK**: `id` (uuid)
- **FK**: `student_id` → `student_profiles.id`

### diagnostics
- **PK**: `id` (uuid)
- **FK**: `student_id` → `student_profiles.id`
- **FK**: `subject_id` → `subjects.id`
- **FK**: `chapter_id` → `chapters.id` (nullable)
- **FK**: `upload_id` → `uploads.id` (nullable)

### quizzes
- **PK**: `id` (uuid)
- **FK**: `subject_id` → `subjects.id`
- **FK**: `chapter_id` → `chapters.id` (nullable)
- **FK**: `created_by` → `users.id` (nullable)

### quiz_questions
- **PK**: `id` (uuid)
- **FK**: `quiz_id` → `quizzes.id`

### quiz_attempts
- **PK**: `id` (uuid)
- **FK**: `quiz_id` → `quizzes.id`
- **FK**: `student_id` → `student_profiles.id`

### learning_sessions
- **PK**: `id` (uuid)
- **FK**: `student_id` → `student_profiles.id`
- **FK**: `subject_id` → `subjects.id`
- **FK**: `chapter_id` → `chapters.id` (nullable)

### gamification
- **PK**: `id` (uuid)
- **FK**: `student_id` → `student_profiles.id`

### parent_rewards
- **PK**: `id` (uuid)
- **FK**: `parent_id` → `parent_profiles.id`
- **FK**: `student_id` → `student_profiles.id`

### ai_logs
- **PK**: `id` (uuid)
- **FK**: `user_id` → `users.id` (nullable)
- **FK**: `student_id` → `student_profiles.id` (nullable)

---

## Common Query Patterns

### Get Student with All Related Data

```sql
SELECT 
  sp.*,
  u.email,
  u.role,
  (
    SELECT json_agg(s.*)
    FROM subjects s
    JOIN student_subject_settings sss ON s.id = sss.subject_id
    WHERE sss.student_id = sp.id AND sss.is_enabled = true
  ) as selected_subjects,
  (
    SELECT COUNT(*)
    FROM pain_points pp
    WHERE pp.student_id = sp.id AND pp.status = 'active'
  ) as active_pain_points,
  (
    SELECT COUNT(*)
    FROM quiz_attempts qa
    WHERE qa.student_id = sp.id AND qa.status = 'completed'
  ) as completed_quizzes
FROM student_profiles sp
JOIN users u ON sp.user_id = u.id
WHERE sp.id = 'student-uuid';
```

### Get Student Progress for a Subject

```sql
SELECT 
  s.name as subject_name,
  COUNT(DISTINCT ls.id) as total_sessions,
  SUM(ls.duration_minutes) as total_minutes,
  COUNT(DISTINCT qa.id) as quizzes_taken,
  AVG(qa.score) as average_score,
  COUNT(DISTINCT CASE WHEN qa.is_passed THEN qa.id END) as quizzes_passed
FROM subjects s
LEFT JOIN learning_sessions ls ON s.id = ls.subject_id AND ls.student_id = 'student-uuid'
LEFT JOIN quiz_attempts qa ON s.id = (
  SELECT subject_id FROM quizzes WHERE id = qa.quiz_id
) AND qa.student_id = 'student-uuid'
WHERE s.id = 'subject-uuid'
GROUP BY s.id, s.name;
```

### Get Parent Dashboard Data

```sql
SELECT 
  sp.full_name,
  sp.grade,
  sp.current_streak,
  sp.total_points,
  sp.level,
  (
    SELECT COUNT(*) 
    FROM learning_sessions ls 
    WHERE ls.student_id = sp.id 
    AND ls.started_at > NOW() - INTERVAL '7 days'
  ) as sessions_this_week,
  (
    SELECT AVG(qa.score)
    FROM quiz_attempts qa
    WHERE qa.student_id = sp.id 
    AND qa.completed_at > NOW() - INTERVAL '30 days'
  ) as avg_score_last_month
FROM student_profiles sp
JOIN student_parent_links spl ON sp.id = spl.student_id
JOIN parent_profiles pp ON spl.parent_id = pp.id
WHERE pp.user_id = 'parent-auth-uuid';
```

### Get Available Quizzes for Student

```sql
SELECT 
  q.*,
  s.name as subject_name,
  c.name as chapter_name,
  (
    SELECT COUNT(*)
    FROM quiz_attempts qa
    WHERE qa.quiz_id = q.id AND qa.student_id = 'student-uuid'
  ) as attempts_count,
  (
    SELECT MAX(qa.score)
    FROM quiz_attempts qa
    WHERE qa.quiz_id = q.id AND qa.student_id = 'student-uuid'
  ) as best_score
FROM quizzes q
JOIN subjects s ON q.subject_id = s.id
LEFT JOIN chapters c ON q.chapter_id = c.id
WHERE q.is_active = true
AND s.id IN (
  SELECT subject_id 
  FROM student_subject_settings 
  WHERE student_id = 'student-uuid' AND is_enabled = true
)
ORDER BY q.created_at DESC;
```

### Get AI Usage Statistics

```sql
SELECT 
  DATE_TRUNC('day', created_at) as date,
  ai_service,
  operation_type,
  COUNT(*) as total_calls,
  SUM(tokens_used) as total_tokens,
  SUM(cost) as total_cost,
  AVG(duration_ms) as avg_duration_ms
FROM ai_logs
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at), ai_service, operation_type
ORDER BY date DESC, total_calls DESC;
```

### Get Student Achievements

```sql
SELECT 
  achievement_type,
  achievement_name,
  description,
  points_awarded,
  rarity,
  earned_at
FROM gamification
WHERE student_id = 'student-uuid'
ORDER BY earned_at DESC;
```

### Get Pain Points with AI Suggestions

```sql
SELECT 
  pp.*,
  s.name as subject_name,
  c.name as chapter_name,
  pp.ai_suggestions
FROM pain_points pp
JOIN subjects s ON pp.subject_id = s.id
LEFT JOIN chapters c ON pp.chapter_id = c.id
WHERE pp.student_id = 'student-uuid'
AND pp.status = 'active'
ORDER BY pp.severity DESC, pp.created_at DESC;
```

---

## Indexes for Performance

All indexes are automatically created by the schema. Key indexes include:

### Lookup Indexes
- `idx_users_email` - Fast user lookup by email
- `idx_student_user` - Fast profile lookup by user_id
- `idx_subject_code` - Fast subject lookup by code

### Query Optimization Indexes
- `idx_student_points` - Leaderboard queries
- `idx_attempt_completed` - Recent quiz results
- `idx_session_started` - Recent learning activity
- `idx_pain_created` - Latest pain points

### Foreign Key Indexes
- All foreign keys have indexes for join performance
- Junction table indexes for M:N relationships

---

## Data Types Reference

### UUID
All IDs use `uuid` type for global uniqueness and security.

### Timestamps
- `timestamptz` - Timezone-aware timestamps
- Always stored in UTC
- Converted to local time in application

### JSONB
Used for flexible data storage:
- `notification_preferences` - Parent settings
- `ai_suggestions` - AI-generated content
- `questions_data` - Quiz questions with dynamic structure
- `metadata` - Achievement metadata

### Numeric
- `numeric(5,2)` - Percentages (e.g., 95.50)
- `numeric(10,4)` - Costs (e.g., 0.0025)

### Text vs Varchar
- `text` - No length limit (descriptions, AI responses)
- `varchar(n)` - Fixed max length (names, codes)

---

## RLS Policy Summary

| User Role | Can Access | Restrictions |
|-----------|-----------|--------------|
| **Student** | Own profile, subjects, chapters, quizzes | Cannot see other students' data |
| **Parent** | Linked students' full data | Only students they're linked to |
| **Admin** | Everything | No restrictions |
| **Public** | Active subjects & chapters | Read-only |

---

## Database Functions

### Auto-Update Timestamps
```sql
-- Triggered automatically on UPDATE
update_updated_at_column()
```

### Calculate Quiz Score
```sql
-- Returns percentage score
SELECT calculate_quiz_score('attempt-uuid');
```

### Update Student Points
```sql
-- Updates points and recalculates level
SELECT update_student_points('student-uuid', 50);
```

### Check Achievements
```sql
-- Awards achievements based on activity
SELECT check_achievements('student-uuid');
```

---

## Performance Tips

1. **Use Indexes**: All critical queries have indexes
2. **Batch Operations**: Use transactions for multiple inserts
3. **Pagination**: Always use LIMIT and OFFSET for large datasets
4. **Select Specific Columns**: Avoid `SELECT *` in production
5. **Use JSONB Indexes**: Add GIN indexes for frequently queried JSONB fields

```sql
-- Example: Add GIN index for JSONB search
CREATE INDEX idx_diagnostics_knowledge_gaps 
ON diagnostics USING GIN (knowledge_gaps);
```

---

## Backup & Recovery

### Export Data
```sql
-- Export students
COPY student_profiles TO '/path/to/students.csv' CSV HEADER;

-- Export with query
COPY (
  SELECT * FROM student_profiles WHERE grade = 10
) TO '/path/to/grade10.csv' CSV HEADER;
```

### Restore from Backup
- Use Supabase Dashboard → Database → Restore
- Or run SQL script from backup

---

## Monitoring Queries

### Database Size
```sql
SELECT 
  pg_size_pretty(pg_database_size(current_database())) as db_size;
```

### Table Sizes
```sql
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Active Connections
```sql
SELECT 
  COUNT(*) as active_connections,
  state
FROM pg_stat_activity
WHERE datname = current_database()
GROUP BY state;
```

### Slow Queries
```sql
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

---

## Next Steps

1. ✅ Run `supabase-schema-complete.sql` in Supabase
2. ✅ Run `supabase-seed-subjects.sql` for CBSE subjects
3. ✅ Verify tables and policies
4. 🔲 Create tRPC procedures for CRUD operations
5. 🔲 Update AppStateContext to use Supabase
6. 🔲 Test authentication flow
7. 🔲 Add sample quiz questions
8. 🔲 Implement AI integration with logging

---

This database schema is production-ready and scales to thousands of students with proper indexing and RLS policies!
