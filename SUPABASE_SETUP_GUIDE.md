# 🚀 Supabase Setup Guide for CBSE Learning Companion

## Current Status

### ✅ Completed Steps:
1. Supabase credentials configured in `env.local`
2. Supabase client initialized in `lib/supabase.ts`
3. Database schema SQL file created

### ⚠️ What Needs to Be Done:

## Step 1: Run Database Migration

You need to create the database tables in your Supabase project. Here's how:

### Option A: Using SQL Editor (Recommended)
1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/ziaqpnuvvlnemxiwjckp
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Open the file `supabase-setup.sql` from this project
5. Copy ALL the SQL code from that file
6. Paste it into the SQL Editor
7. Click **Run** or press `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)
8. You should see success messages indicating tables were created

### Option B: Using Supabase CLI (Advanced)
```bash
# If you have Supabase CLI installed
supabase db push
```

### ✅ What This Creates:
- **9 Database Tables:**
  - `student_profiles` - Store student information
  - `progress_data` - Track XP, levels, streaks
  - `concept_gaps` - Identified learning gaps
  - `completed_lessons` - Lesson completion history
  - `quiz_results` - Quiz performance data
  - `student_badges` - Achievement tracking
  - `chapter_progress` - Chapter-by-chapter progress
  - `parent_rewards` - Parent-set rewards
  - `ai_diagnoses` - AI diagnostic session history

- **Row Level Security (RLS)** enabled on all tables
- **Performance indexes** for faster queries
- **Auto-updating timestamps** via triggers

---

## Step 2: Configure Environment Variables in Expo

The app needs to expose environment variables. Since I cannot edit `app.json` directly, you need to add this manually:

### Edit `app.json`:
Add the following `extra` field inside the `expo` object (after the `experiments` field):

```json
{
  "expo": {
    ...other fields...
    "experiments": {
      "typedRoutes": true
    },
    "extra": {
      "EXPO_PUBLIC_SUPABASE_URL": "https://ziaqpnuvvlnemxiwjckp.supabase.co",
      "EXPO_PUBLIC_SUPABASE_ANON_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppYXFwbnV2dmxuZW14aXdqY2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0MTk3ODgsImV4cCI6MjA3OTk5NTc4OH0.z3qfPEu_KEWfg5kJ4JAftFERhAB3TzeuibxH8ZzP-XA"
    }
  }
}
```

**After editing `app.json`, restart your Expo development server.**

---

## Step 3: Add OpenAI API Key

To enable AI features, you need to add your OpenAI API key:

### Edit `env.local`:
Replace `your-openai-api-key-here` with your actual OpenAI API key:

```env
OPENAI_API_KEY=sk-proj-...your-actual-key-here
```

### Where to get OpenAI API Key:
1. Go to: https://platform.openai.com/api-keys
2. Sign in to your OpenAI account
3. Click "Create new secret key"
4. Copy the key (it starts with `sk-proj-...`)
5. Paste it in `env.local`

---

## Step 4: Restart the App

After completing the above steps:

1. **Stop** the Expo development server (Ctrl+C)
2. **Clear** the cache: `npx expo start -c`
3. **Refresh** the app on your device/emulator

---

## ✅ Verification

After completing all steps, verify the connection:

1. **Check Supabase Dashboard:**
   - Go to: https://supabase.com/dashboard/project/ziaqpnuvvlnemxiwjckp/editor
   - You should see 9 tables under "Tables" in the left sidebar

2. **Check Rork App:**
   - The Supabase icon should now be **green/active**

3. **Test the App:**
   - Go through the onboarding flow
   - Create a student profile
   - Check if data is saved in Supabase Dashboard

---

## 🔧 Troubleshooting

### Issue: Supabase icon still not active
**Solution:**
- Make sure you added the `extra` field in `app.json`
- Restart Expo dev server with cache clear: `npx expo start -c`
- Check browser console / React Native logs for errors

### Issue: Tables not appearing in Supabase
**Solution:**
- Make sure you ran the entire SQL script in the SQL Editor
- Check for any error messages in the SQL Editor output
- Verify you're looking at the correct project

### Issue: "Missing Supabase credentials" error
**Solution:**
- Verify `env.local` has the correct values
- Verify `app.json` has the `extra` field with credentials
- Restart the Expo server

---

## 📊 Database Structure Overview

```
student_profiles (main profile data)
    ↓
    ├── progress_data (XP, level, streak)
    ├── concept_gaps (identified gaps)
    ├── completed_lessons (lesson history)
    ├── quiz_results (quiz performance)
    ├── student_badges (achievements)
    ├── chapter_progress (chapter tracking)
    ├── parent_rewards (rewards system)
    └── ai_diagnoses (AI session history)
```

All child tables are linked to `student_profiles` via foreign keys with CASCADE delete.

---

## 🔐 Security Notes

- Row Level Security (RLS) is enabled on all tables
- Current policies allow all operations (open access for development)
- **For production**, you should:
  - Add authentication (Supabase Auth)
  - Restrict RLS policies to authenticated users only
  - Add user-specific data isolation

---

## 📞 Need Help?

If you encounter any issues:
1. Check the Supabase Dashboard logs
2. Check your app's console logs
3. Verify all steps were completed in order
4. Make sure your Supabase project is active (not paused)

---

## ✨ Next Steps After Setup

Once Supabase is connected, you can:
1. Migrate existing AsyncStorage data to Supabase
2. Implement real-time sync across devices
3. Add user authentication
4. Enable collaborative features (parent dashboard, teacher views)
5. Add data analytics and insights

---

**Last Updated:** 2025-11-29
**Project:** CBSE Learning Companion
**Supabase Project:** ziaqpnuvvlnemxiwjckp
