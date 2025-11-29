# 🚨 SETUP REQUIRED - Action Items

## Problem Summary

Your app is **NOT connected to Supabase** because of 2 missing steps:

1. ❌ The `app.json` file is missing configuration to expose Supabase credentials
2. ❌ No database tables exist in your Supabase project

---

## ✅ STEP 1: Create Database Tables in Supabase (5 minutes)

### Instructions:

1. **Open Supabase SQL Editor:**
   - Go to: https://supabase.com/dashboard/project/ziaqpnuvvlnemxiwjckp/sql
   - Or: Dashboard → SQL Editor (left sidebar) → New Query

2. **Copy the SQL Schema:**
   - Open the file `supabase-setup.sql` in this project
   - Copy **ALL the SQL code** (it's 244 lines - make sure you get everything)

3. **Run the SQL:**
   - Paste the code into the SQL Editor
   - Click **"Run"** button (or press `Ctrl+Enter` / `Cmd+Enter`)

4. **Verify Success:**
   - You should see success messages in the results panel
   - Go to **"Table Editor"** in the left sidebar
   - You should now see **9 tables** instead of "No tables in schema":
     - `student_profiles`
     - `progress_data`
     - `concept_gaps`
     - `completed_lessons`
     - `quiz_results`
     - `student_badges`
     - `chapter_progress`
     - `parent_rewards`
     - `ai_diagnoses`

---

## ✅ STEP 2: Update app.json (2 minutes)

### Instructions:

1. **Open `app.json` in your code editor**

2. **Find this section** (around line 56-58):
   ```json
   "experiments": {
     "typedRoutes": true
   }
   ```

3. **Add a comma after the closing brace**, then add the `extra` field:
   ```json
   "experiments": {
     "typedRoutes": true
   },
   "extra": {
     "EXPO_PUBLIC_SUPABASE_URL": "https://ziaqpnuvvlnemxiwjckp.supabase.co",
     "EXPO_PUBLIC_SUPABASE_ANON_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppYXFwbnV2dmxuZW14aXdqY2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0MTk3ODgsImV4cCI6MjA3OTk5NTc4OH0.z3qfPEu_KEWfg5kJ4JAftFERhAB3TzeuibxH8ZzP-XA"
   }
   ```

4. **The complete section should look like this:**
   ```json
   "experiments": {
     "typedRoutes": true
   },
   "extra": {
     "EXPO_PUBLIC_SUPABASE_URL": "https://ziaqpnuvvlnemxiwjckp.supabase.co",
     "EXPO_PUBLIC_SUPABASE_ANON_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppYXFwbnV2dmxuZW14aXdqY2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0MTk3ODgsImV4cCI6MjA3OTk5NTc4OH0.z3qfPEu_KEWfg5kJ4JAftFERhAB3TzeuibxH8ZzP-XA"
   }
   ```
   
   Note: Make sure the closing brace `}` of the `"expo"` object is still at the end!

5. **Save the file**

---

## ✅ STEP 3: Add OpenAI API Key (3 minutes)

### Get Your OpenAI API Key:

1. Go to: https://platform.openai.com/api-keys
2. Sign in to your OpenAI account
3. Click **"+ Create new secret key"**
4. Give it a name like "CBSE Learning App"
5. Copy the key (starts with `sk-proj-...` or `sk-...`)
   
   ⚠️ **Important:** Save this key somewhere safe - you won't be able to see it again!

### Add to Your Project:

1. Open `env.local` in your code editor
2. Find this line:
   ```
   OPENAI_API_KEY=your-openai-api-key-here
   ```
3. Replace `your-openai-api-key-here` with your actual key:
   ```
   OPENAI_API_KEY=sk-proj-YOUR_ACTUAL_KEY_HERE
   ```
4. Save the file

---

## ✅ STEP 4: Restart Expo Server (1 minute)

After completing Steps 1, 2, and 3:

1. **Stop your Expo development server:**
   - In the terminal where Expo is running, press `Ctrl+C` (Windows/Linux) or `Cmd+C` (Mac)

2. **Clear cache and restart:**
   ```bash
   npx expo start -c
   ```
   
   The `-c` flag clears the cache and ensures the new configuration is loaded.

---

## 🎉 Verify Everything is Working

### 1. Check Supabase Icon:
- After restarting, the **Supabase icon in Rork app should be GREEN/ACTIVE**
- This indicates successful connection

### 2. Check Database Tables:
- Go to: https://supabase.com/dashboard/project/ziaqpnuvvlnemxiwjckp/editor
- Click **"Table Editor"** in left sidebar
- You should see **9 tables** (not "No tables in schema")

### 3. Test the App:
- Open your app
- Complete the onboarding flow
- Create a student profile
- Go to Supabase Dashboard → Table Editor → `student_profiles`
- **You should see your profile data saved there!** 🎉

### 4. Test AI Features:
- Go to the "Diagnose" screen
- Upload a test image or answer questions
- AI should analyze and provide feedback

---

## 📋 Quick Copy-Paste for app.json

**Copy this entire section** and replace lines 56-58 in `app.json`:

```json
    "experiments": {
      "typedRoutes": true
    },
    "extra": {
      "EXPO_PUBLIC_SUPABASE_URL": "https://ziaqpnuvvlnemxiwjckp.supabase.co",
      "EXPO_PUBLIC_SUPABASE_ANON_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppYXFwbnV2dmxuZW14aXdqY2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0MTk3ODgsImV4cCI6MjA3OTk5NTc4OH0.z3qfPEu_KEWfg5kJ4JAftFERhAB3TzeuibxH8ZzP-XA"
    }
```

---

## 🔗 Quick Links

- **Supabase Dashboard:** https://supabase.com/dashboard/project/ziaqpnuvvlnemxiwjckp
- **SQL Editor:** https://supabase.com/dashboard/project/ziaqpnuvvlnemxiwjckp/sql
- **Table Editor:** https://supabase.com/dashboard/project/ziaqpnuvvlnemxiwjckp/editor
- **OpenAI API Keys:** https://platform.openai.com/api-keys

---

## 🆘 Troubleshooting

### Supabase icon still not active after restart?
- Make sure you saved `app.json` after adding the `extra` field
- Make sure you restarted with `-c` flag: `npx expo start -c`
- Check the console for any error messages

### Can't see tables in Supabase?
- Make sure you copied ALL the SQL (244 lines)
- Make sure you clicked "Run" in the SQL Editor
- Check for any error messages in the SQL Editor results

### AI features not working?
- Make sure you added your OpenAI API key to `env.local`
- Make sure you restarted Expo server after adding the key
- Check that your OpenAI account has credits/billing enabled

---

## ✅ What You've Already Got

These files are already set up and ready:
- ✅ `lib/supabase.ts` - Supabase client configuration
- ✅ `services/supabaseService.ts` - Database service layer
- ✅ `supabase-setup.sql` - Database schema SQL
- ✅ `env.local` - Environment variables file (just needs OpenAI key)

---

**Total Time Required:** ~10 minutes
**Current Status:** ⚠️ Waiting for you to complete these 4 steps
**Next Step:** Go to Supabase SQL Editor and run the migration (Step 1)
