# Database Schema Design

## Overview
This document describes the complete relational database schema for the CBSE educational app with AI-powered learning, diagnostics, and gamification.

---

## Tables

### 1. users
**Purpose**: Store user authentication and basic profile information (handled by Supabase Auth, but we extend it)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Unique user ID (synced with Supabase auth.users) |
| email | varchar(255) | UNIQUE, NOT NULL | User email |
| role | varchar(20) | NOT NULL, DEFAULT 'student' | User role: 'student', 'parent', 'admin' |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | Account creation timestamp |
| updated_at | timestamptz | NOT NULL, DEFAULT NOW() | Last update timestamp |
| last_login_at | timestamptz | NULL | Last login timestamp |
| is_active | boolean | NOT NULL, DEFAULT true | Account active status |

**Indexes**:
- PRIMARY KEY (id)
- INDEX idx_users_email (email)
- INDEX idx_users_role (role)

---

### 2. student_profiles
**Purpose**: Extended profile information for students

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Profile ID |
| user_id | uuid | FK -> users.id, UNIQUE, NOT NULL | Reference to user |
| full_name | varchar(100) | NOT NULL | Student's full name |
| date_of_birth | date | NULL | Birth date |
| grade | integer | NOT NULL | Current grade (1-12) |
| board | varchar(50) | NOT NULL, DEFAULT 'CBSE' | Education board |
| school_name | varchar(200) | NULL | School name |
| avatar_url | text | NULL | Profile picture URL |
| learning_style | varchar(50) | NULL | Preferred learning style |
| current_streak | integer | NOT NULL, DEFAULT 0 | Days of consecutive activity |
| total_points | integer | NOT NULL, DEFAULT 0 | Total gamification points |
| level | integer | NOT NULL, DEFAULT 1 | Current level |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | Profile creation |
| updated_at | timestamptz | NOT NULL, DEFAULT NOW() | Last update |

**Indexes**:
- PRIMARY KEY (id)
- UNIQUE INDEX idx_student_user (user_id)
- INDEX idx_student_grade (grade)
- INDEX idx_student_points (total_points DESC)

**Relationships**:
- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE

---

### 3. parent_profiles
**Purpose**: Extended profile information for parents

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Profile ID |
| user_id | uuid | FK -> users.id, UNIQUE, NOT NULL | Reference to user |
| full_name | varchar(100) | NOT NULL | Parent's full name |
| phone_number | varchar(20) | NULL | Contact number |
| notification_preferences | jsonb | NOT NULL, DEFAULT '{}' | Notification settings |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | Profile creation |
| updated_at | timestamptz | NOT NULL, DEFAULT NOW() | Last update |

**Indexes**:
- PRIMARY KEY (id)
- UNIQUE INDEX idx_parent_user (user_id)

**Relationships**:
- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE

---

### 4. student_parent_links
**Purpose**: Many-to-many relationship between students and parents

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Link ID |
| student_id | uuid | FK -> student_profiles.id, NOT NULL | Student reference |
| parent_id | uuid | FK -> parent_profiles.id, NOT NULL | Parent reference |
| relationship | varchar(50) | NULL | Relationship type (father, mother, guardian) |
| is_primary | boolean | NOT NULL, DEFAULT false | Primary guardian flag |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | Link creation |

**Indexes**:
- PRIMARY KEY (id)
- UNIQUE INDEX idx_student_parent_unique (student_id, parent_id)
- INDEX idx_parent_students (parent_id)

**Relationships**:
- FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE
- FOREIGN KEY (parent_id) REFERENCES parent_profiles(id) ON DELETE CASCADE

---

### 5. subjects
**Purpose**: Master table for all subjects (CBSE curriculum)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Subject ID |
| name | varchar(100) | NOT NULL | Subject name |
| code | varchar(20) | UNIQUE, NOT NULL | Subject code |
| grade | integer | NOT NULL | Grade level |
| description | text | NULL | Subject description |
| icon_url | text | NULL | Subject icon |
| color | varchar(7) | NULL | Display color (hex) |
| is_active | boolean | NOT NULL, DEFAULT true | Active status |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | Creation timestamp |

**Indexes**:
- PRIMARY KEY (id)
- UNIQUE INDEX idx_subject_code (code)
- INDEX idx_subject_grade (grade)
- INDEX idx_subject_active (is_active)

---

### 6. chapters
**Purpose**: Chapters/topics within each subject

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Chapter ID |
| subject_id | uuid | FK -> subjects.id, NOT NULL | Parent subject |
| chapter_number | integer | NOT NULL | Chapter sequence number |
| name | varchar(200) | NOT NULL | Chapter name |
| description | text | NULL | Chapter description |
| estimated_hours | numeric(4,2) | NULL | Estimated learning hours |
| difficulty_level | varchar(20) | NULL | easy, medium, hard |
| prerequisites | jsonb | NULL | Array of prerequisite chapter IDs |
| learning_objectives | jsonb | NULL | Array of learning objectives |
| is_active | boolean | NOT NULL, DEFAULT true | Active status |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | timestamptz | NOT NULL, DEFAULT NOW() | Last update |

**Indexes**:
- PRIMARY KEY (id)
- INDEX idx_chapter_subject (subject_id)
- INDEX idx_chapter_number (subject_id, chapter_number)
- INDEX idx_chapter_difficulty (difficulty_level)

**Relationships**:
- FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE

---

### 7. student_subject_settings
**Purpose**: Student's selected subjects and their settings

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Setting ID |
| student_id | uuid | FK -> student_profiles.id, NOT NULL | Student reference |
| subject_id | uuid | FK -> subjects.id, NOT NULL | Subject reference |
| is_enabled | boolean | NOT NULL, DEFAULT true | Subject enabled for student |
| difficulty_preference | varchar(20) | NULL | Student's difficulty preference |
| weekly_goal_hours | numeric(4,2) | NULL | Weekly learning goal |
| notification_enabled | boolean | NOT NULL, DEFAULT true | Enable notifications |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | timestamptz | NOT NULL, DEFAULT NOW() | Last update |

**Indexes**:
- PRIMARY KEY (id)
- UNIQUE INDEX idx_student_subject_unique (student_id, subject_id)
- INDEX idx_student_subjects (student_id)

**Relationships**:
- FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE
- FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE

---

### 8. pain_points
**Purpose**: Track student-reported difficulties and struggles

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Pain point ID |
| student_id | uuid | FK -> student_profiles.id, NOT NULL | Student reference |
| subject_id | uuid | FK -> subjects.id, NOT NULL | Related subject |
| chapter_id | uuid | FK -> chapters.id, NULL | Related chapter |
| pain_type | varchar(50) | NOT NULL | Type: 'concept', 'calculation', 'memory', etc |
| description | text | NOT NULL | Detailed description |
| severity | integer | NOT NULL, CHECK (severity BETWEEN 1 AND 5) | Severity level 1-5 |
| status | varchar(20) | NOT NULL, DEFAULT 'active' | Status: active, addressed, resolved |
| ai_suggestions | jsonb | NULL | AI-generated suggestions |
| resolved_at | timestamptz | NULL | Resolution timestamp |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | timestamptz | NOT NULL, DEFAULT NOW() | Last update |

**Indexes**:
- PRIMARY KEY (id)
- INDEX idx_pain_student (student_id)
- INDEX idx_pain_subject (subject_id)
- INDEX idx_pain_chapter (chapter_id)
- INDEX idx_pain_status (status)
- INDEX idx_pain_created (created_at DESC)

**Relationships**:
- FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE
- FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
- FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE SET NULL

---

### 9. uploads
**Purpose**: Track document/image uploads for AI analysis

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Upload ID |
| student_id | uuid | FK -> student_profiles.id, NOT NULL | Uploader reference |
| file_url | text | NOT NULL | Supabase storage URL |
| file_name | varchar(255) | NOT NULL | Original filename |
| file_type | varchar(50) | NOT NULL | MIME type |
| file_size | bigint | NOT NULL | File size in bytes |
| upload_type | varchar(50) | NOT NULL | Type: 'diagnostic', 'worksheet', 'notes' |
| processing_status | varchar(20) | NOT NULL, DEFAULT 'pending' | Status: pending, processing, completed, failed |
| ai_analysis | jsonb | NULL | AI analysis results |
| error_message | text | NULL | Error message if failed |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | Upload timestamp |
| processed_at | timestamptz | NULL | Processing completion time |

**Indexes**:
- PRIMARY KEY (id)
- INDEX idx_upload_student (student_id)
- INDEX idx_upload_status (processing_status)
- INDEX idx_upload_type (upload_type)
- INDEX idx_upload_created (created_at DESC)

**Relationships**:
- FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE

---

### 10. diagnostics
**Purpose**: Store diagnostic assessment results

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Diagnostic ID |
| student_id | uuid | FK -> student_profiles.id, NOT NULL | Student reference |
| subject_id | uuid | FK -> subjects.id, NOT NULL | Subject being assessed |
| chapter_id | uuid | FK -> chapters.id, NULL | Specific chapter |
| diagnostic_type | varchar(50) | NOT NULL | Type: 'initial', 'progress', 'final' |
| upload_id | uuid | FK -> uploads.id, NULL | Related upload if any |
| questions_data | jsonb | NOT NULL | Questions and answers |
| score_percentage | numeric(5,2) | NULL | Score percentage |
| strengths | jsonb | NULL | Identified strengths |
| weaknesses | jsonb | NULL | Identified weaknesses |
| knowledge_gaps | jsonb | NULL | Specific gaps found |
| recommendations | jsonb | NULL | AI recommendations |
| time_taken_minutes | integer | NULL | Time taken to complete |
| completed_at | timestamptz | NULL | Completion timestamp |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | Creation timestamp |

**Indexes**:
- PRIMARY KEY (id)
- INDEX idx_diagnostic_student (student_id)
- INDEX idx_diagnostic_subject (subject_id)
- INDEX idx_diagnostic_chapter (chapter_id)
- INDEX idx_diagnostic_type (diagnostic_type)
- INDEX idx_diagnostic_completed (completed_at DESC)

**Relationships**:
- FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE
- FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
- FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE SET NULL
- FOREIGN KEY (upload_id) REFERENCES uploads(id) ON DELETE SET NULL

---

### 11. quizzes
**Purpose**: Quiz/test definitions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Quiz ID |
| subject_id | uuid | FK -> subjects.id, NOT NULL | Subject reference |
| chapter_id | uuid | FK -> chapters.id, NULL | Chapter reference |
| title | varchar(200) | NOT NULL | Quiz title |
| description | text | NULL | Quiz description |
| quiz_type | varchar(50) | NOT NULL | Type: 'practice', 'assessment', 'adaptive' |
| difficulty_level | varchar(20) | NOT NULL | easy, medium, hard |
| total_questions | integer | NOT NULL | Number of questions |
| duration_minutes | integer | NULL | Time limit |
| passing_percentage | numeric(5,2) | NOT NULL, DEFAULT 60 | Pass threshold |
| points_per_question | integer | NOT NULL, DEFAULT 10 | Points awarded |
| is_adaptive | boolean | NOT NULL, DEFAULT false | Adaptive difficulty |
| is_active | boolean | NOT NULL, DEFAULT true | Active status |
| created_by | uuid | FK -> users.id, NULL | Creator reference |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | timestamptz | NOT NULL, DEFAULT NOW() | Last update |

**Indexes**:
- PRIMARY KEY (id)
- INDEX idx_quiz_subject (subject_id)
- INDEX idx_quiz_chapter (chapter_id)
- INDEX idx_quiz_type (quiz_type)
- INDEX idx_quiz_difficulty (difficulty_level)
- INDEX idx_quiz_active (is_active)

**Relationships**:
- FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
- FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE SET NULL
- FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL

---

### 12. quiz_questions
**Purpose**: Individual quiz questions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Question ID |
| quiz_id | uuid | FK -> quizzes.id, NOT NULL | Parent quiz |
| question_number | integer | NOT NULL | Question order |
| question_text | text | NOT NULL | Question content |
| question_type | varchar(20) | NOT NULL | Type: 'mcq', 'true_false', 'numeric' |
| options | jsonb | NULL | Answer options (for MCQ) |
| correct_answer | text | NOT NULL | Correct answer |
| explanation | text | NULL | Answer explanation |
| difficulty_level | varchar(20) | NOT NULL | easy, medium, hard |
| points | integer | NOT NULL, DEFAULT 10 | Points for this question |
| image_url | text | NULL | Question image if any |
| hints | jsonb | NULL | Array of hints |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | Creation timestamp |

**Indexes**:
- PRIMARY KEY (id)
- INDEX idx_question_quiz (quiz_id)
- INDEX idx_question_number (quiz_id, question_number)

**Relationships**:
- FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE

---

### 13. quiz_attempts
**Purpose**: Track student quiz attempts and results

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Attempt ID |
| quiz_id | uuid | FK -> quizzes.id, NOT NULL | Quiz reference |
| student_id | uuid | FK -> student_profiles.id, NOT NULL | Student reference |
| attempt_number | integer | NOT NULL, DEFAULT 1 | Attempt sequence |
| started_at | timestamptz | NOT NULL, DEFAULT NOW() | Start timestamp |
| completed_at | timestamptz | NULL | Completion timestamp |
| status | varchar(20) | NOT NULL, DEFAULT 'in_progress' | Status: in_progress, completed, abandoned |
| answers | jsonb | NOT NULL, DEFAULT '[]' | Student answers |
| score | numeric(5,2) | NULL | Score percentage |
| points_earned | integer | NOT NULL, DEFAULT 0 | Points earned |
| time_taken_seconds | integer | NULL | Time taken |
| correct_count | integer | NULL | Number correct |
| incorrect_count | integer | NULL | Number incorrect |
| is_passed | boolean | NULL | Pass/fail status |
| feedback | jsonb | NULL | Question-by-question feedback |

**Indexes**:
- PRIMARY KEY (id)
- INDEX idx_attempt_quiz (quiz_id)
- INDEX idx_attempt_student (student_id)
- INDEX idx_attempt_student_quiz (student_id, quiz_id)
- INDEX idx_attempt_completed (completed_at DESC)
- INDEX idx_attempt_status (status)

**Relationships**:
- FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
- FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE

---

### 14. learning_sessions
**Purpose**: Track learning activity and time spent

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Session ID |
| student_id | uuid | FK -> student_profiles.id, NOT NULL | Student reference |
| subject_id | uuid | FK -> subjects.id, NOT NULL | Subject studied |
| chapter_id | uuid | FK -> chapters.id, NULL | Chapter studied |
| session_type | varchar(50) | NOT NULL | Type: 'study', 'practice', 'quiz', 'diagnostic' |
| started_at | timestamptz | NOT NULL, DEFAULT NOW() | Session start |
| ended_at | timestamptz | NULL | Session end |
| duration_minutes | integer | NULL | Duration in minutes |
| activities | jsonb | NULL | Detailed activities log |
| topics_covered | jsonb | NULL | Topics covered |
| progress_made | jsonb | NULL | Progress metrics |
| notes | text | NULL | Session notes |
| points_earned | integer | NOT NULL, DEFAULT 0 | Points earned |

**Indexes**:
- PRIMARY KEY (id)
- INDEX idx_session_student (student_id)
- INDEX idx_session_subject (subject_id)
- INDEX idx_session_chapter (chapter_id)
- INDEX idx_session_started (started_at DESC)
- INDEX idx_session_type (session_type)

**Relationships**:
- FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE
- FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
- FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE SET NULL

---

### 15. gamification
**Purpose**: Track badges, achievements, and rewards

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Achievement ID |
| student_id | uuid | FK -> student_profiles.id, NOT NULL | Student reference |
| achievement_type | varchar(50) | NOT NULL | Type: 'badge', 'milestone', 'streak' |
| achievement_name | varchar(100) | NOT NULL | Achievement name |
| description | text | NULL | Achievement description |
| icon_url | text | NULL | Achievement icon |
| points_awarded | integer | NOT NULL, DEFAULT 0 | Points awarded |
| rarity | varchar(20) | NULL | Rarity: common, rare, epic, legendary |
| metadata | jsonb | NULL | Additional data |
| earned_at | timestamptz | NOT NULL, DEFAULT NOW() | Earned timestamp |

**Indexes**:
- PRIMARY KEY (id)
- INDEX idx_achievement_student (student_id)
- INDEX idx_achievement_type (achievement_type)
- INDEX idx_achievement_earned (earned_at DESC)

**Relationships**:
- FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE

---

### 16. parent_rewards
**Purpose**: Parent-defined rewards for student achievements

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Reward ID |
| parent_id | uuid | FK -> parent_profiles.id, NOT NULL | Parent reference |
| student_id | uuid | FK -> student_profiles.id, NOT NULL | Student reference |
| reward_name | varchar(100) | NOT NULL | Reward name |
| description | text | NULL | Reward description |
| points_required | integer | NOT NULL | Points needed |
| reward_type | varchar(50) | NOT NULL | Type: 'privilege', 'gift', 'activity' |
| is_active | boolean | NOT NULL, DEFAULT true | Active status |
| is_redeemed | boolean | NOT NULL, DEFAULT false | Redeemed status |
| redeemed_at | timestamptz | NULL | Redemption timestamp |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | timestamptz | NOT NULL, DEFAULT NOW() | Last update |

**Indexes**:
- PRIMARY KEY (id)
- INDEX idx_reward_parent (parent_id)
- INDEX idx_reward_student (student_id)
- INDEX idx_reward_active (is_active)
- INDEX idx_reward_redeemed (is_redeemed)

**Relationships**:
- FOREIGN KEY (parent_id) REFERENCES parent_profiles(id) ON DELETE CASCADE
- FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE

---

### 17. ai_logs
**Purpose**: Log all AI interactions for debugging and analysis

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Log ID |
| user_id | uuid | FK -> users.id, NULL | User reference |
| student_id | uuid | FK -> student_profiles.id, NULL | Student reference |
| ai_service | varchar(50) | NOT NULL | Service: 'openai', 'gemini', etc |
| operation_type | varchar(50) | NOT NULL | Type: 'chat', 'image_gen', 'analysis' |
| request_data | jsonb | NULL | Request payload |
| response_data | jsonb | NULL | Response data |
| tokens_used | integer | NULL | Tokens consumed |
| cost | numeric(10,4) | NULL | API cost |
| duration_ms | integer | NULL | Request duration |
| status | varchar(20) | NOT NULL | Status: success, error |
| error_message | text | NULL | Error details if failed |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | Timestamp |

**Indexes**:
- PRIMARY KEY (id)
- INDEX idx_ailog_user (user_id)
- INDEX idx_ailog_student (student_id)
- INDEX idx_ailog_service (ai_service)
- INDEX idx_ailog_operation (operation_type)
- INDEX idx_ailog_created (created_at DESC)
- INDEX idx_ailog_status (status)

**Relationships**:
- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
- FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE SET NULL

---

## Text ERD (Entity Relationship Diagram)

```
users (1) ────< (1) student_profiles
users (1) ────< (1) parent_profiles

student_profiles (*) ────< student_parent_links >────(*) parent_profiles

subjects (1) ────< (*) chapters
subjects (1) ────< (*) quizzes
subjects (1) ────< (*) student_subject_settings
subjects (1) ────< (*) pain_points
subjects (1) ────< (*) diagnostics
subjects (1) ────< (*) learning_sessions

student_profiles (1) ────< (*) student_subject_settings
student_profiles (1) ────< (*) pain_points
student_profiles (1) ────< (*) uploads
student_profiles (1) ────< (*) diagnostics
student_profiles (1) ────< (*) quiz_attempts
student_profiles (1) ────< (*) learning_sessions
student_profiles (1) ────< (*) gamification
student_profiles (1) ────< (*) parent_rewards
student_profiles (1) ────< (*) ai_logs

parent_profiles (1) ────< (*) parent_rewards

chapters (1) ────< (*) pain_points
chapters (1) ────< (*) diagnostics
chapters (1) ────< (*) quizzes
chapters (1) ────< (*) learning_sessions

quizzes (1) ────< (*) quiz_questions
quizzes (1) ────< (*) quiz_attempts

uploads (1) ────< (*) diagnostics

Legend:
(1) = One
(*) = Many
────< = One-to-Many
>────< = Many-to-Many (through junction table)
```

---

## Future-Proof Fields & Extensions

### Recommended Additional Fields for Scalability:

#### 1. Multi-language Support
- Add `locale` (varchar) to student_profiles, parent_profiles
- Add `translations` (jsonb) to subjects, chapters, quizzes

#### 2. Multi-tenancy (for schools)
```sql
CREATE TABLE schools (
  id uuid PRIMARY KEY,
  name varchar(200) NOT NULL,
  board varchar(50),
  subscription_tier varchar(50),
  is_active boolean DEFAULT true
);

-- Add to student_profiles, parent_profiles:
school_id uuid REFERENCES schools(id)
```

#### 3. Content Versioning
- Add `version` (integer) to chapters, quizzes
- Add `is_current_version` (boolean)

#### 4. Soft Deletes
- Add `deleted_at` (timestamptz) to all major tables
- Create filtered indexes: `WHERE deleted_at IS NULL`

#### 5. Audit Trail
```sql
CREATE TABLE audit_logs (
  id uuid PRIMARY KEY,
  table_name varchar(100),
  record_id uuid,
  action varchar(20), -- INSERT, UPDATE, DELETE
  old_data jsonb,
  new_data jsonb,
  user_id uuid,
  created_at timestamptz DEFAULT NOW()
);
```

#### 6. Notifications System
```sql
CREATE TABLE notifications (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  type varchar(50),
  title varchar(200),
  message text,
  action_url text,
  is_read boolean DEFAULT false,
  read_at timestamptz,
  created_at timestamptz DEFAULT NOW()
);
```

#### 7. Subscription/Payment (for future monetization)
```sql
CREATE TABLE subscriptions (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  plan varchar(50),
  status varchar(20),
  started_at timestamptz,
  expires_at timestamptz,
  auto_renew boolean DEFAULT true
);
```

#### 8. Study Plans/Goals
```sql
CREATE TABLE study_plans (
  id uuid PRIMARY KEY,
  student_id uuid REFERENCES student_profiles(id),
  subject_id uuid REFERENCES subjects(id),
  target_date date,
  weekly_schedule jsonb,
  is_active boolean DEFAULT true
);
```

---

## Database Migration File Structure

### Recommended Migration Approach

```
supabase/
├── migrations/
│   ├── 20250101000001_create_users_table.sql
│   ├── 20250101000002_create_student_profiles_table.sql
│   ├── 20250101000003_create_parent_profiles_table.sql
│   ├── 20250101000004_create_student_parent_links_table.sql
│   ├── 20250101000005_create_subjects_table.sql
│   ├── 20250101000006_create_chapters_table.sql
│   ├── 20250101000007_create_student_subject_settings_table.sql
│   ├── 20250101000008_create_pain_points_table.sql
│   ├── 20250101000009_create_uploads_table.sql
│   ├── 20250101000010_create_diagnostics_table.sql
│   ├── 20250101000011_create_quizzes_table.sql
│   ├── 20250101000012_create_quiz_questions_table.sql
│   ├── 20250101000013_create_quiz_attempts_table.sql
│   ├── 20250101000014_create_learning_sessions_table.sql
│   ├── 20250101000015_create_gamification_table.sql
│   ├── 20250101000016_create_parent_rewards_table.sql
│   ├── 20250101000017_create_ai_logs_table.sql
│   ├── 20250101000018_create_indexes.sql
│   ├── 20250101000019_create_functions.sql
│   ├── 20250101000020_create_triggers.sql
│   ├── 20250101000021_enable_rls.sql
│   ├── 20250101000022_seed_subjects.sql
│   └── 20250101000023_seed_chapters.sql
│
├── seeds/
│   ├── subjects_cbse.sql
│   ├── chapters_cbse_class_10.sql
│   └── sample_data.sql
│
└── functions/
    ├── update_updated_at_column.sql
    ├── calculate_quiz_score.sql
    ├── update_student_points.sql
    └── check_achievements.sql
```

### Key Migration Considerations:

1. **Order Matters**: Create tables in dependency order (users → profiles → relationships)

2. **Enable UUID Extension**:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

3. **Updated_at Trigger**:
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';
```

4. **Row Level Security (RLS)**:
Enable on all tables with appropriate policies for students/parents/admins

5. **Indexes**: Create after tables to avoid migration failures

6. **Functions**: Create reusable database functions for complex operations

---

## Security Considerations

### Row Level Security Policies

#### Students can only access their own data:
```sql
CREATE POLICY "Students can view own profile"
  ON student_profiles FOR SELECT
  USING (auth.uid() = user_id);
```

#### Parents can view linked students' data:
```sql
CREATE POLICY "Parents can view linked students"
  ON student_profiles FOR SELECT
  USING (
    id IN (
      SELECT student_id FROM student_parent_links
      WHERE parent_id IN (
        SELECT id FROM parent_profiles WHERE user_id = auth.uid()
      )
    )
  );
```

#### Admin full access:
```sql
CREATE POLICY "Admins have full access"
  ON student_profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

---

## Performance Optimization Tips

1. **Partitioning**: Consider partitioning large tables (ai_logs, learning_sessions) by date
2. **Materialized Views**: Create for complex analytics queries
3. **JSONB Indexing**: Use GIN indexes on jsonb columns that are frequently queried
4. **Connection Pooling**: Use Supabase's built-in connection pooling
5. **Query Optimization**: Regular EXPLAIN ANALYZE on slow queries
6. **Archive Strategy**: Move old data (>1 year) to archive tables

---

## Data Retention Policy

| Table | Retention | Archive Strategy |
|-------|-----------|------------------|
| users | Indefinite | Keep active |
| student_profiles | Indefinite | Keep active |
| quiz_attempts | 2 years | Archive to cold storage |
| learning_sessions | 1 year | Archive monthly |
| ai_logs | 6 months | Archive or delete |
| diagnostics | Indefinite | Keep for learning history |
| uploads | 1 year | Delete after processing |

