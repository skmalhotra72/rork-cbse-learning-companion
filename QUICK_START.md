# 🚨 QUICK START: Fix Supabase Connection

## The Problem (What You're Seeing)

❌ **Supabase icon is NOT active** (gray/inactive)
❌ **No tables in Supabase Database** (empty schema)

---

## The Solution (3 Simple Steps)

### ⚡ STEP 1: Create Database Tables (5 minutes)

**Copy this entire SQL file and run it in Supabase:**

1. Open: https://supabase.com/dashboard/project/ziaqpnuvvlnemxiwjckp
2. Click: **SQL Editor** (left sidebar)
3. Click: **"New Query"**
4. Open file: `supabase-setup.sql` from your project
5. **Copy ALL the code** from that file
6. Paste into SQL Editor
7. Click: **"Run"** button

✅ **Result:** You'll see 9 tables in "Table Editor"

---

### ⚡ STEP 2: Fix app.json (2 minutes)

**Edit your `app.json` file:**

Find this part:
```json
"experiments": {
  "typedRoutes": true
}
```

Change it to this (add comma and `extra` field):
```json
"experiments": {
  "typedRoutes": true
},
"extra": {
  "EXPO_PUBLIC_SUPABASE_URL": "https://ziaqpnuvvlnemxiwjckp.supabase.co",
  "EXPO_PUBLIC_SUPABASE_ANON_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppYXFwbnV2dmxuZW14aXdqY2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0MTk3ODgsImV4cCI6MjA3OTk5NTc4OH0.z3qfPEu_KEWfg5kJ4JAftFERhAB3TzeuibxH8ZzP-XA"
}
```

✅ **Result:** App can now read Supabase credentials

---

### ⚡ STEP 3: Add OpenAI Key + Restart (3 minutes)

**A) Get OpenAI API Key:**
1. Go to: https://platform.openai.com/api-keys
2. Click: **"+ Create new secret key"**
3. Copy the key (starts with `sk-proj-...`)

**B) Edit `env.local` file:**

Find this line:
```env
OPENAI_API_KEY=your-openai-api-key-here
```

Replace with your key:
```env
OPENAI_API_KEY=sk-proj-YOUR_ACTUAL_KEY_HERE
```

**C) Restart Expo:**
```bash
npx expo start -c
```

✅ **Result:** Supabase icon turns GREEN and AI features work!

---

## ✅ Verification Checklist

After completing all 3 steps:

- [ ] Supabase icon is GREEN/active in Rork app
- [ ] 9 tables visible in Supabase Dashboard Table Editor
- [ ] Can create student profile in app
- [ ] Profile data appears in Supabase Dashboard
- [ ] AI diagnosis feature works

---

## 📍 File Locations

Files you need to edit:
- `app.json` (in project root)
- `env.local` (in project root)
- `supabase-setup.sql` (copy this to Supabase SQL Editor)

Files that are ready (don't edit):
- `lib/supabase.ts` ✅
- `services/supabaseService.ts` ✅

---

## 🆘 If Something Goes Wrong

### Issue: Can't find `supabase-setup.sql`
**Solution:** It's in your project root folder, same level as `package.json`

### Issue: SQL Editor shows errors
**Solution:** Make sure you copied the ENTIRE file, including the beginning and end

### Issue: app.json syntax error after editing
**Solution:** Make sure you added the comma after `experiments` closing brace

### Issue: Supabase icon still not green
**Solution:**
1. Check you added `extra` field correctly in `app.json`
2. Make sure you restarted with: `npx expo start -c`
3. Check browser console for error messages

### Issue: OpenAI features not working
**Solution:**
1. Verify the key in `env.local` starts with `sk-`
2. Check you have credits in OpenAI account
3. Restart the server after adding the key

---

## 💡 Why This is Needed

**Why add `extra` to app.json?**
- Expo needs explicit configuration to expose environment variables to the app
- Without it, the app can't see your Supabase credentials

**Why run SQL in Supabase?**
- Your Supabase project is empty by default
- You need to create tables to store app data

**Why add OpenAI key?**
- AI features (diagnosis, quiz generation) use OpenAI API
- Without key, AI features won't work

---

## 🎯 Time Estimate

- **Step 1 (SQL):** 5 minutes
- **Step 2 (app.json):** 2 minutes
- **Step 3 (OpenAI + Restart):** 3 minutes

**Total:** ~10 minutes

---

## ✨ What You'll Get After This

Once complete, your app will have:

✅ Cloud database storage (Supabase)
✅ Real-time data sync across devices
✅ AI-powered diagnosis and recommendations
✅ Secure data with Row Level Security
✅ Persistent progress tracking
✅ Parent rewards system
✅ Badge and achievement system

---

## 📞 Still Need Help?

Refer to these detailed guides:
- `SUPABASE_SETUP_GUIDE.md` - Complete Supabase setup
- `API_KEYS_GUIDE.md` - API configuration details
- `SUPABASE_STATUS.md` - Technical overview

---

**Created:** 2025-11-29
**Purpose:** Quick reference for Supabase connection setup
