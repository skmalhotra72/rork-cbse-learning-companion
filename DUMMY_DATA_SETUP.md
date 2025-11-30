# Dummy Data Setup Guide

This guide will help you populate your Supabase database with test data and provide login credentials for testing the application.

---

## 📋 Prerequisites

- Supabase project is set up and connected
- All database tables are created (run the schema SQL files first)
- Subjects are seeded (run `supabase-seed-subjects.sql`)

---

## 🚀 Step-by-Step Setup

### Step 1: Create User Accounts in Supabase Auth

Go to your Supabase Dashboard → Authentication → Users, and create these accounts:

#### Student Accounts

1. **Student 1 (Rahul Sharma - Grade 10)**
   - Email: `student1@test.com`
   - Password: `Test@123456`
   - Confirm Email: ✅ (Enable)

2. **Student 2 (Priya Patel - Grade 12)**
   - Email: `student2@test.com`
   - Password: `Test@123456`
   - Confirm Email: ✅ (Enable)

#### Parent Accounts

3. **Parent 1 (Mr. Rajesh Sharma)**
   - Email: `parent1@test.com`
   - Password: `Test@123456`
   - Confirm Email: ✅ (Enable)

4. **Parent 2 (Mrs. Anjali Patel)**
   - Email: `parent2@test.com`
   - Password: `Test@123456`
   - Confirm Email: ✅ (Enable)

---

### Step 2: Get User UUIDs

After creating the accounts, note down the UUID for each user from the Supabase Authentication dashboard.

---

### Step 3: Update the SQL Script

Open `supabase-dummy-data.sql` and replace these placeholder UUIDs with the actual UUIDs from Step 2:

```sql
-- Replace these:
'11111111-1111-1111-1111-111111111111' → (Rahul's UUID from Supabase Auth)
'22222222-2222-2222-2222-222222222222' → (Priya's UUID from Supabase Auth)
'33333333-3333-3333-3333-333333333333' → (Mr. Sharma's UUID from Supabase Auth)
'44444444-4444-4444-4444-444444444444' → (Mrs. Patel's UUID from Supabase Auth)
```

**Example:**
```sql
-- Before
('11111111-1111-1111-1111-111111111111', 'student1@test.com', 'student', ...)

-- After (with real UUID)
('a7b3c4d5-1234-5678-90ab-cdef12345678', 'student1@test.com', 'student', ...)
```

---

### Step 4: Run the SQL Script

1. Go to Supabase Dashboard → SQL Editor
2. Create a new query
3. Copy the entire contents of `supabase-dummy-data.sql`
4. Click **Run** to execute

---

### Step 5: Verify Data Creation

After running the script, verify the data was created:

```sql
-- Check students
SELECT full_name, grade, total_points, current_streak, level 
FROM student_profiles;

-- Check parents
SELECT full_name, phone_number 
FROM parent_profiles;

-- Check student-parent links
SELECT 
  s.full_name as student_name,
  p.full_name as parent_name,
  spl.relationship
FROM student_parent_links spl
JOIN student_profiles s ON s.id = spl.student_id
JOIN parent_profiles p ON p.id = spl.parent_id;

-- Check learning activity
SELECT COUNT(*) as session_count FROM learning_sessions;
SELECT COUNT(*) as badge_count FROM badges_earned;
SELECT COUNT(*) as reward_count FROM parent_rewards;
```

---

## 🔑 Login Credentials

### Student Accounts

#### Student 1: Rahul Sharma (Grade 10)
```
Email: student1@test.com
Password: Test@123456

Profile Details:
- Grade: 10 (CBSE)
- School: Delhi Public School
- Current Streak: 7 days
- Total Points: 850
- Level: 9
- Learning Style: Visual
```

#### Student 2: Priya Patel (Grade 12)
```
Email: student2@test.com
Password: Test@123456

Profile Details:
- Grade: 12 (CBSE)
- School: Modern High School
- Current Streak: 14 days
- Total Points: 1520
- Level: 16
- Learning Style: Kinesthetic
```

---

### Parent Accounts

#### Parent 1: Mr. Rajesh Sharma
```
Email: parent1@test.com
Password: Test@123456

Details:
- Relationship: Father
- Linked to: Rahul Sharma (Student 1)
- Phone: +91-9876543210
- Notifications: Email, SMS, Push enabled
```

#### Parent 2: Mrs. Anjali Patel
```
Email: parent2@test.com
Password: Test@123456

Details:
- Relationship: Mother
- Linked to: Priya Patel (Student 2)
- Phone: +91-9876543211
- Notifications: Email and Push enabled
```

---

## 📊 What Data is Created?

The dummy data script creates:

### For Each Student:
- ✅ User profile with authentication
- ✅ Student profile with stats (points, level, streak)
- ✅ 12+ chapter progress records
- ✅ 15+ learning sessions
- ✅ 5+ concept gaps
- ✅ 8+ quiz results
- ✅ 5+ badges earned
- ✅ 4+ diagnostic assessments
- ✅ 3+ pain points
- ✅ 6+ quiz attempts
- ✅ 20+ completed lessons
- ✅ Multiple gamification achievements
- ✅ AI interaction logs

### For Each Parent:
- ✅ User profile with authentication
- ✅ Parent profile with contact info
- ✅ Link to their student(s)
- ✅ 3-5 rewards created for their student
- ✅ Notification preferences

---

## 🧪 Testing Scenarios

### Student Testing

1. **Login as Student 1 (Rahul)**
   - View dashboard with 850 points and 7-day streak
   - Check subjects (Grade 10: Math, Science, Social Science, etc.)
   - View chapter progress (various completion levels)
   - See badges earned (Quiz Master, 7-Day Streak, Math Wizard)
   - Check active pain points (Quadratic Equations, Chemical Formulas)
   - View learning sessions history
   - Take available quizzes

2. **Login as Student 2 (Priya)**
   - View dashboard with 1520 points and 14-day streak (higher level)
   - Check Grade 12 subjects
   - See advanced badges (14-Day Streak, Perfect Score)
   - Review diagnostics and recommendations

### Parent Testing

3. **Login as Parent 1 (Mr. Sharma)**
   - View Rahul's progress and analytics
   - Check Rahul's learning time and activity
   - Review created rewards:
     - "Extra 30 minutes gaming" (100 points)
     - "Movie Night" (200 points)
     - "Pizza Party" (300 points - already redeemed)
   - Create new rewards
   - View Rahul's badges and achievements

4. **Login as Parent 2 (Mrs. Patel)**
   - View Priya's progress (more advanced student)
   - See detailed analytics for Grade 12 student
   - Review created rewards:
     - "New Book" (250 points)
     - "Weekend Outing" (500 points)
   - Monitor Priya's study patterns

---

## 🐛 Troubleshooting

### Error: "violates foreign key constraint"

**Cause**: UUIDs in the script don't match the actual Supabase Auth UUIDs.

**Solution**: 
1. Make sure you created all 4 user accounts in Supabase Auth first
2. Copy the exact UUIDs from the Authentication dashboard
3. Replace ALL occurrences of the placeholder UUIDs in the script

### Error: "duplicate key value violates unique constraint"

**Cause**: Data already exists, trying to insert again.

**Solution**: 
- The script uses `ON CONFLICT DO NOTHING` to prevent duplicates
- If you want to reset, delete existing data first:
```sql
-- Delete in this order (respects foreign keys)
DELETE FROM ai_logs;
DELETE FROM quiz_attempts;
DELETE FROM completed_lessons;
DELETE FROM learning_sessions;
DELETE FROM quiz_results;
DELETE FROM badges_earned;
DELETE FROM student_badges;
DELETE FROM chapter_progress;
DELETE FROM parent_rewards;
DELETE FROM gamification;
DELETE FROM diagnostics;
DELETE FROM pain_points;
DELETE FROM concept_gaps;
DELETE FROM progress_data;
DELETE FROM student_parent_links;
DELETE FROM student_profiles;
DELETE FROM parent_profiles;
DELETE FROM users WHERE email LIKE '%@test.com';
```

### Error: "relation does not exist"

**Cause**: Missing tables in the database.

**Solution**: Run the complete schema setup first:
1. `supabase-schema-complete.sql`
2. `supabase-create-missing-tables.sql`
3. `supabase-seed-subjects.sql`
4. Then run `supabase-dummy-data.sql`

---

## ✅ Verification Checklist

After setup, verify:

- [ ] All 4 users can login (2 students + 2 parents)
- [ ] Student dashboards show points, levels, and streaks
- [ ] Parents can see their linked student's data
- [ ] Subjects are visible for appropriate grades
- [ ] Chapter progress is displayed
- [ ] Badges and achievements are shown
- [ ] Parent rewards are listed
- [ ] Learning sessions appear in history
- [ ] Quiz attempts are recorded

---

## 📝 Notes

- **Passwords**: All test accounts use `Test@123456` for easy testing
- **Data Realism**: Data is generated with realistic values and timestamps
- **Relationships**: Students are properly linked to their parents
- **Variety**: Different students have different progress levels for testing various scenarios
- **Timestamps**: Data is backdated by 1-45 days to simulate real usage

---

## 🔄 Resetting Data

To reset and start fresh:

1. Delete test data (see Troubleshooting section)
2. Delete test users from Supabase Auth dashboard
3. Follow this guide again from Step 1

---

## 📞 Need Help?

If you encounter issues:
1. Check the Supabase Dashboard → SQL Editor → Query history for errors
2. Verify all prerequisite tables exist
3. Confirm UUIDs match exactly
4. Check the console for any RLS policy errors

---

**Happy Testing! 🎉**
