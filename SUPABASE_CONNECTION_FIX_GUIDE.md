# 🔧 FIX SUPABASE CONNECTION - STEP BY STEP

## ❌ Problem
The Supabase icon in Rork is not turning green because:
1. Row Level Security (RLS) is blocking the health check query
2. The health check endpoint wasn't properly configured

## ✅ Solution (Follow in Order)

### Step 1: Run the RLS Fix SQL Script

1. Open your Supabase project at: https://supabase.com/dashboard/project/gevcprpgzxbozzqgjgmk
2. Go to **SQL Editor** in the left sidebar
3. Click **New query**
4. Copy the contents of `supabase-fix-rls-healthcheck.sql` (in your project root)
5. Paste it into the SQL editor
6. Click **Run** (or press Cmd/Ctrl + Enter)
7. You should see: "Success. No rows returned"

This fixes the RLS policies to allow the anon key to read from subjects table.

### Step 2: Verify Tables Exist

Run this query in the Supabase SQL Editor to check if all tables exist:

\`\`\`sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
\`\`\`

You should see at least these tables:
- subjects
- chapters
- users
- student_profiles
- parent_profiles

If any are missing, run the `supabase-schema-complete.sql` script.

### Step 3: Verify Subjects Table Has Data

Run this query:

\`\`\`sql
SELECT id, name, code, grade 
FROM public.subjects 
LIMIT 5;
\`\`\`

If no rows are returned, run the seed script:
- Open and run `supabase-seed-subjects.sql` in the SQL Editor

### Step 4: Test the Connection from Your App

**Important:** You MUST restart your development server after updating env.local!

1. Stop your development server (Ctrl+C in terminal)
2. Start it again: `bun start`
3. The server will reload the environment variables
4. The health check endpoint will now be available at: `/api/health/supabase`

### Step 5: Verify from Browser

Once your dev server is running, you can test the health endpoint directly:

1. Get your backend URL from the Rork interface (it should show in the terminal)
2. Visit: `https://your-backend-url.rork.workers.dev/api/health/supabase`
3. You should see:

\`\`\`json
{
  "status": "ok",
  "connected": true,
  "message": "Supabase connection successful"
}
\`\`\`

### Step 6: Check Rork Integration Status

1. Go to the Rork dashboard
2. Look for the "Integrations" section
3. The Supabase icon should now be **green** ✅

## 🔍 Troubleshooting

### If the icon is still not green:

**1. Check Environment Variables:**
   - Open `env.local` in your project
   - Verify these values match your Supabase project:
     - `SUPABASE_URL=https://gevcprpgzxbozzqgjgmk.supabase.co`
     - `SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

**2. Check if server restarted:**
   - Make sure you stopped and restarted your dev server
   - Environment variables are only loaded on server start

**3. Check RLS policies in Supabase:**
   - Go to Supabase Dashboard → Authentication → Policies
   - Find the `subjects` table
   - Make sure the policy "Anon can read subjects for health check" exists

**4. Check browser console:**
   - Open browser dev tools (F12)
   - Go to Console tab
   - Look for any errors related to Supabase or /api/health/supabase

**5. Check server logs:**
   - Look at your terminal where the dev server is running
   - Check for any error messages when the health check runs

## 📋 Quick Verification Checklist

- [ ] env.local has correct SUPABASE_URL and SUPABASE_ANON_KEY
- [ ] Both SUPABASE_* and EXPO_PUBLIC_SUPABASE_* variables are set
- [ ] Ran `supabase-fix-rls-healthcheck.sql` in Supabase SQL Editor
- [ ] subjects table exists in Supabase
- [ ] subjects table has at least 1 row of data
- [ ] Restarted development server (stop and start, not just refresh)
- [ ] Waited 10-20 seconds after restart for Rork to check the integration
- [ ] /api/health/supabase endpoint returns {"status": "ok", "connected": true}

## 🎯 Expected Result

After completing all steps:
- ✅ Supabase icon is GREEN in Rork dashboard
- ✅ Health check endpoint returns success
- ✅ App can query the database without errors
- ✅ Authentication works properly

## 🆘 Still Not Working?

If you've completed all steps and it's still not working:

1. Check the exact error message at: `/api/health/supabase`
2. Share the error message for further debugging
3. Verify the Supabase project ID is correct: `gevcprpgzxbozzqgjgmk`
4. Make sure you're not being rate-limited by Supabase (refresh after 1 minute)
