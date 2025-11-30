# 🔧 Fix Supabase Connection - Step by Step Guide

## 🎯 Problem Summary
Your Rork app cannot connect to Supabase because:
1. ✅ **FIXED**: Backend and frontend were using different Supabase projects
2. ⚠️ **TODO**: Database tables are missing in Supabase

---

## ✅ What I Just Fixed

### 1. Unified Supabase Project
Changed `env.local` so **both backend and frontend** use the same project:
- **Project URL**: `https://ziaqpnuvvlnemxiwjckp.supabase.co`
- **Project ID**: `ziaqpnuvvlnemxiwjckp`

Your `app.json` already had the correct credentials, now `env.local` matches it.

---

## 📋 What YOU Need to Do (3 Steps)

### Step 1: Create All Database Tables

You need to run SQL scripts in your Supabase dashboard to create the missing tables.

#### 1.1 Open Supabase SQL Editor
1. Go to: **https://supabase.com/dashboard/project/ziaqpnuvvlnemxiwjckp/sql**
2. Click **"New Query"** button

#### 1.2 Run Complete Schema First
1. Open the file `supabase-schema-complete.sql` from this project
2. **Copy ALL the SQL** (scroll to the bottom to get everything)
3. Paste it into the SQL Editor
4. Click **"Run"** button or press `Ctrl+Enter`
5. Wait for it to complete (might take 10-30 seconds)

You should see messages like:
```
CREATE EXTENSION
CREATE TABLE
CREATE INDEX
...
```

#### 1.3 Run Missing Tables Fix
1. Click **"New Query"** again
2. Open the file `supabase-missing-tables.sql` from this project
3. **Copy ALL the SQL**
4. Paste it into the SQL Editor
5. Click **"Run"** button

This will create the 5 missing tables:
- ✅ `concept_gaps`
- ✅ `quiz_results`
- ✅ `learning_sessions`
- ✅ `badges_earned`
- ✅ `parent_rewards`

#### 1.4 Seed Subject Data
1. Click **"New Query"** one more time
2. Open the file `supabase-seed-subjects.sql` from this project
3. **Copy ALL the SQL**
4. Paste it into the SQL Editor
5. Click **"Run"** button

This will populate the `subjects` table with CBSE subjects for Classes 9-12.

---

### Step 2: Verify Tables Were Created

1. In Supabase Dashboard, click **"Table Editor"** in the left sidebar
2. You should now see **ALL these tables**:

#### Core Tables:
- `users`
- `student_profiles`
- `parent_profiles`
- `student_parent_links`

#### Academic Tables:
- `subjects`
- `chapters`
- `student_subject_settings`

#### Learning Tables:
- `diagnostics`
- `concept_gaps` ✅ (was missing)
- `learning_sessions` ✅ (was missing)
- `quizzes`
- `quiz_questions`
- `quiz_attempts`
- `quiz_results` ✅ (was missing)

#### Gamification Tables:
- `badges_earned` ✅ (was missing)
- `gamification`
- `parent_rewards` ✅ (was missing)

#### Tracking Tables:
- `uploads`
- `ai_logs`
- `activity_logs`

**Total: 21 tables**

If any tables are missing, check the SQL Editor for errors.

---

### Step 3: Restart Your Expo Server

After creating all tables:

1. **Stop the server**:
   - Press `Ctrl+C` in your terminal

2. **Clear cache and restart**:
   ```bash
   npx expo start -c
   ```

3. **Wait for the server to start**, then check if the Supabase icon is active in Rork

---

## ✅ How to Verify Everything Works

### Test 1: Check Connection
1. In Rork app interface, look for the **Supabase indicator**
2. It should be **green/active** now (not grayed out)

### Test 2: Check Database
1. Go to: https://supabase.com/dashboard/project/ziaqpnuvvlnemxiwjckp/editor
2. Click on `subjects` table
3. You should see **36 rows** of CBSE subjects (Math, Physics, Chemistry, etc.)

### Test 3: Test App Features
1. **Signup/Login**: Create a new student account
2. **Onboarding**: Complete the onboarding flow
3. **Check Database**: 
   - Go to Supabase → Table Editor → `users`
   - You should see your new user
   - Go to `student_profiles`
   - You should see your profile data

---

## 🔍 Troubleshooting

### Issue: "Table X already exists" error
**Solution**: That's fine! It means some tables were already created. Continue running the rest of the SQL.

### Issue: "Relation X does not exist" error
**Solution**: You need to run `supabase-schema-complete.sql` FIRST, then `supabase-missing-tables.sql`.

### Issue: Supabase icon still not active
**Solution**: 
1. Make sure you restarted Expo with `-c` flag
2. Check browser console (F12) for any error messages
3. Check terminal logs for connection errors

### Issue: Authentication not working
**Solution**:
1. Go to Supabase Dashboard → Authentication → Settings
2. Make sure **Email Auth** is enabled
3. Check if the Site URL is correct

---

## 📊 What Each SQL File Does

### `supabase-schema-complete.sql`
- Creates **all core tables** (21 tables)
- Sets up **indexes** for fast queries
- Creates **triggers** for auto-updating timestamps
- Configures **Row Level Security (RLS)** policies
- Creates helper **functions** for data management

### `supabase-missing-tables.sql`
- Creates the **5 specific missing tables** you reported
- Adds additional indexes
- Sets up RLS policies for the new tables
- Creates triggers

### `supabase-seed-subjects.sql`
- Populates `subjects` table with **CBSE curriculum**
- Adds subjects for Classes 9-12:
  - Mathematics
  - Physics
  - Chemistry
  - Biology
  - Computer Science
  - English
  - Social Science
  - Hindi
  - And more...

---

## 🎉 After Setup Complete

Once everything is working, your app will have:

✅ **Data Persistence**: All data saved to cloud database
✅ **Multi-Device Sync**: Access from any device
✅ **Real-time Updates**: Changes sync instantly
✅ **Secure Authentication**: Row-level security
✅ **Parent Portal**: Parents can track student progress
✅ **AI Features**: Diagnostic tools and quiz generation
✅ **Gamification**: Badges, XP, streaks

---

## 📞 Quick Links

- **Supabase Dashboard**: https://supabase.com/dashboard/project/ziaqpnuvvlnemxiwjckp
- **Table Editor**: https://supabase.com/dashboard/project/ziaqpnuvvlnemxiwjckp/editor
- **SQL Editor**: https://supabase.com/dashboard/project/ziaqpnuvvlnemxiwjckp/sql
- **Authentication**: https://supabase.com/dashboard/project/ziaqpnuvvlnemxiwjckp/auth/users

---

## 🚀 Ready to Go?

1. ✅ Run `supabase-schema-complete.sql` in SQL Editor
2. ✅ Run `supabase-missing-tables.sql` in SQL Editor
3. ✅ Run `supabase-seed-subjects.sql` in SQL Editor
4. ✅ Verify all tables in Table Editor
5. ✅ Restart Expo: `npx expo start -c`
6. ✅ Test the app!

---

**Last Updated**: 2025-11-30
**Status**: ⚠️ Awaiting SQL execution
