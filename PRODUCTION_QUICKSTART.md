# 🚀 Production Quick Start Guide

Get your CBSE Learning Companion app live in production in **under 2 hours**.

---

## Prerequisites Checklist

Before starting, ensure you have:

- [ ] GitHub account (for code repository)
- [ ] Expo account (free - https://expo.dev)
- [ ] Supabase account (free - https://supabase.com)
- [ ] Vercel account (free - https://vercel.com)
- [ ] Apple Developer Account ($99/year - for iOS)
- [ ] Google Play Developer Account ($25 one-time - for Android)
- [ ] Rork platform access (for AI features)

**Time estimate**: 1-2 hours for backend/database, additional 2-4 hours for app store builds

---

## Step 1: Database Setup (15 minutes)

### 1.1 Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click **"New Project"**
3. Fill in:
   - **Name**: CBSE Learning Companion
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users (e.g., Singapore for India)
4. Click **"Create new project"** (takes 1-2 minutes)

### 1.2 Run Database Migrations

1. In Supabase Dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Open `supabase-schema-complete.sql` from your project
4. Copy all contents and paste into the query editor
5. Click **"Run"** (bottom right)
6. You should see: **"Success. No rows returned"**

### 1.3 Seed Subject Data

1. In SQL Editor, create another **"New Query"**
2. Open `supabase-seed-subjects.sql`
3. Copy all contents and paste
4. Click **"Run"**
5. Verify: Go to **Table Editor** → `subjects` table → should see CBSE subjects

### 1.4 Configure Storage

1. Go to **Storage** (left sidebar)
2. Click **"Create a new bucket"**
3. Bucket name: `uploads`
4. Public bucket: **OFF**
5. Click **"Create bucket"**
6. Click on `uploads` bucket → **Policies** tab → **New Policy**
7. Choose **"For full customization"**
8. Paste this policy:

```sql
-- Allow authenticated users to upload
CREATE POLICY "Users can upload files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'uploads');

-- Allow authenticated users to view files
CREATE POLICY "Users can view files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'uploads');
```

### 1.5 Get API Keys

1. Go to **Settings** → **API** (left sidebar)
2. Copy these values:
   - **Project URL** → Save as `SUPABASE_URL`
   - **anon public** key → Save as `SUPABASE_ANON_KEY`
   - **service_role** key → Save as `SUPABASE_SERVICE_ROLE_KEY` ⚠️ Keep secret!

**✅ Database setup complete!**

---

## Step 2: Backend Deployment (20 minutes)

### 2.1 Prepare Repository

```bash
# If not already done, push your code to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2.2 Deploy to Vercel

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `./`
   - Leave build settings as default
5. Click **"Deploy"** (wait 1-2 minutes)

### 2.3 Add Environment Variables

1. After deployment, go to **Project Settings** → **Environment Variables**
2. Add these variables:

| Name | Value | Note |
|------|-------|------|
| `SUPABASE_URL` | Your Supabase project URL | From Step 1.5 |
| `SUPABASE_ANON_KEY` | Your anon key | From Step 1.5 |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key | From Step 1.5 |
| `NODE_ENV` | `production` | Set environment |
| `EXPO_PUBLIC_TOOLKIT_URL` | `https://toolkit.rork.com` | AI toolkit |

3. Click **"Save"** for each

### 2.4 Redeploy with Environment Variables

1. Go to **Deployments** tab
2. Click **"..."** on the latest deployment → **"Redeploy"**
3. Check **"Use existing Build Cache"**
4. Click **"Redeploy"**

### 2.5 Test Backend

1. Copy your Vercel deployment URL (e.g., `https://your-project.vercel.app`)
2. Visit: `https://your-project.vercel.app/api/`
3. You should see: `{"status":"ok","message":"API is running"}`

**✅ Backend deployed!**

---

## Step 3: Update App Configuration (10 minutes)

### 3.1 Update .env.local

```bash
# In your project root
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Frontend-accessible
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Backend (from Vercel)
EXPO_PUBLIC_RORK_API_BASE_URL=https://your-project.vercel.app

# AI Toolkit
EXPO_PUBLIC_TOOLKIT_URL=https://toolkit.rork.com
```

### 3.2 Update app.json

Edit `app.json`:

```json
{
  "expo": {
    "name": "CBSE Learning Companion",
    "slug": "cbse-learning-companion",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.yourcompany.cbse",
      "buildNumber": "1"
    },
    "android": {
      "package": "com.yourcompany.cbse",
      "versionCode": 1
    },
    "extra": {
      "EXPO_PUBLIC_SUPABASE_URL": "https://your-project.supabase.co",
      "EXPO_PUBLIC_SUPABASE_ANON_KEY": "your-anon-key"
    }
  }
}
```

⚠️ **Important**: Change `com.yourcompany.cbse` to your unique identifier!

**✅ Configuration updated!**

---

## Step 4: Test Locally (10 minutes)

```bash
# Install dependencies (if not already done)
bun install

# Start development server
bun start
```

Test key features:
- [ ] Sign up as student
- [ ] Complete onboarding
- [ ] Run diagnostics
- [ ] Try a quiz
- [ ] Sign up as parent
- [ ] Link student account

**✅ Local testing complete!**

---

## Step 5: Build for Production (30 minutes)

### 5.1 Install EAS CLI

```bash
npm install -g eas-cli
```

### 5.2 Login to Expo

```bash
eas login
```

Enter your Expo credentials.

### 5.3 Configure EAS

```bash
eas build:configure
```

This creates `eas.json`. Use the default configuration.

### 5.4 Build for iOS (if publishing to App Store)

```bash
eas build --platform ios --profile production
```

**What happens:**
1. EAS uploads your code
2. Builds on Expo's servers
3. Provides download link when done (15-30 minutes)

**You'll need:**
- Apple Developer Account ($99/year)
- App created in App Store Connect
- Bundle identifier matching your app.json

### 5.5 Build for Android (if publishing to Play Store)

```bash
eas build --platform android --profile production
```

**What happens:**
1. EAS uploads your code
2. Builds Android App Bundle (.aab)
3. Provides download link when done (15-30 minutes)

**You'll need:**
- Google Play Developer Account ($25 one-time)
- App created in Play Console
- Package name matching your app.json

### 5.6 Build for Both

```bash
eas build --platform all --profile production
```

**✅ Builds in progress! Wait for completion (~30 mins)**

---

## Step 6: Submit to App Stores (1-2 hours)

### 6.1 iOS App Store

#### Prepare App Store Connect

1. Go to https://appstoreconnect.apple.com
2. Click **"My Apps"** → **"+"** → **"New App"**
3. Fill in:
   - **Platform**: iOS
   - **Name**: CBSE Learning Companion
   - **Primary Language**: English
   - **Bundle ID**: (select the one you configured)
   - **SKU**: cbse-learning-companion
4. Click **"Create"**

#### Fill in App Information

1. **App Information** tab:
   - Category: Education
   - Privacy Policy URL: (your URL)
2. **Pricing and Availability**:
   - Free or Paid
   - Select countries
3. **App Privacy**:
   - Complete questionnaire about data collection

#### Add Screenshots & Metadata

Required screenshot sizes:
- 6.7" iPhone (1290 x 2796 pixels) - 3-10 images
- 5.5" iPhone (1242 x 2208 pixels) - 3-10 images

Use iPhone simulator or physical device to capture.

#### Submit for Review

```bash
# Upload build to App Store
eas submit --platform ios

# Or submit directly from App Store Connect
# Go to build and click "Submit for Review"
```

**Review time**: 1-3 days

### 6.2 Google Play Store

#### Prepare Play Console

1. Go to https://play.google.com/console
2. Click **"Create app"**
3. Fill in:
   - **App name**: CBSE Learning Companion
   - **Default language**: English
   - **App or game**: App
   - **Free or paid**: Free
4. Complete declarations and click **"Create app"**

#### Fill in Store Listing

1. **Store listing**:
   - Short description (80 chars)
   - Full description (4000 chars)
   - App icon (512 x 512 PNG)
   - Feature graphic (1024 x 500 PNG)
   - Screenshots (at least 2)
2. **Categorization**:
   - App category: Education
   - Target age: Teen
3. **Contact details**:
   - Email, phone, website
   - Privacy policy URL

#### Submit for Review

```bash
# Upload build to Play Store
eas submit --platform android
```

Then in Play Console:
1. Go to **Release** → **Production**
2. Click **"Create new release"**
3. Select your uploaded build
4. Add release notes
5. Click **"Review release"** → **"Start rollout to Production"**

**Review time**: Few hours to 1 day

**✅ Apps submitted for review!**

---

## Step 7: Post-Launch Setup (15 minutes)

### 7.1 Set Up Monitoring

1. In Vercel Dashboard → **Analytics** → Enable (free)
2. In Supabase → **Database** → **Backups** → Verify daily backups enabled
3. Bookmark these URLs:
   - Supabase Dashboard
   - Vercel Dashboard
   - App Store Connect
   - Play Console

### 7.2 Test OTA Updates

```bash
# Publish a test update
eas update --branch production --message "Initial production deployment"
```

This enables over-the-air updates for future bug fixes!

### 7.3 Create Admin Account

1. Open your app
2. Sign up as a parent user
3. Note down credentials
4. Use this for monitoring analytics: `/admin-analytics`

**✅ Production setup complete!**

---

## Verification Checklist

Before going live, verify:

- [ ] Backend health check returns 200 OK
- [ ] Database tables have correct data
- [ ] Storage bucket accepts uploads
- [ ] Student signup flow works
- [ ] Parent signup flow works
- [ ] Diagnostics AI generates gaps
- [ ] Quiz generation works
- [ ] XP and badges update correctly
- [ ] Rewards system functional
- [ ] Image upload and AI analysis works
- [ ] Mobile app connects to backend
- [ ] No console errors on critical flows

---

## Troubleshooting

### Backend returns CORS error
**Solution**: Verify backend deployed correctly and URL is set in `EXPO_PUBLIC_RORK_API_BASE_URL`

### "Cannot connect to database"
**Solution**: Check Supabase credentials in Vercel environment variables

### Build fails on EAS
**Solution**: 
1. Check `eas build:view <build-id>` for logs
2. Verify `app.json` bundle identifiers are unique
3. Ensure no syntax errors: `npx tsc --noEmit`

### App crashes on launch
**Solution**:
1. Check environment variables in `app.json`
2. Verify backend is accessible
3. Check Expo logs during development

---

## Next Steps

After successful deployment:

1. **Monitor for 24 hours**: Watch for errors, crashes, user feedback
2. **Collect feedback**: Ask beta users to test all features
3. **Fix critical bugs**: Use OTA updates for quick fixes
4. **Prepare marketing**: App Store Optimization (ASO), social media
5. **Scale**: Monitor costs and performance as users grow

---

## Cost Summary

| Service | Free Tier | When to Upgrade | Cost |
|---------|-----------|-----------------|------|
| Supabase | 500MB DB, 1GB storage | DB > 500MB or need backups | $25/month |
| Vercel | 100GB bandwidth | Bandwidth > 100GB | $20/month |
| Expo EAS | 15 builds/month | Unlimited builds needed | $29/month |
| Apple Developer | N/A | Required for iOS | $99/year |
| Google Play | N/A | Required for Android | $25 one-time |

**Total first month**: $124 (one-time) + $0-45/month (ongoing)

---

## Support

- **Deployment Issues**: See `DEPLOYMENT_GUIDE.md`
- **Build Scripts**: See `BUILD_SCRIPTS.md`
- **Hosting Questions**: See `HOSTING_STRATEGY.md`
- **Database Setup**: See `DATABASE_SETUP_GUIDE.md`

---

🎉 **Congratulations! Your app is now live in production!** 🎉

*Monitor closely for the first week and be ready to push updates as needed.*
