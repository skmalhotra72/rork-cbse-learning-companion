# CBSE Learning Companion - Deployment Guide

This guide covers deploying the CBSE Learning Companion app to production, including backend, database, and mobile app deployment.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [Database Setup](#database-setup)
5. [Backend Deployment](#backend-deployment)
6. [Mobile App Build](#mobile-app-build)
7. [Production Checklist](#production-checklist)
8. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Mobile App (Expo)                       │
│  - React Native (iOS/Android/Web)                           │
│  - Expo Router for navigation                               │
│  - tRPC client for API calls                                │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend API (Hono + tRPC)                       │
│  - Node.js server with Hono framework                       │
│  - tRPC for type-safe API                                   │
│  - Authentication & business logic                          │
└────────────┬───────────────────────────┬────────────────────┘
             │                           │
             ▼                           ▼
┌──────────────────────────┐   ┌──────────────────────────────┐
│   Supabase Database      │   │   Rork AI Toolkit            │
│   - PostgreSQL           │   │   - LLM generations          │
│   - Authentication       │   │   - Image analysis           │
│   - File storage         │   │   - Quiz generation          │
└──────────────────────────┘   └──────────────────────────────┘
```

---

## Prerequisites

### Required Accounts & Services

1. **Supabase Account** (Free tier available)
   - Sign up at: https://supabase.com
   - Used for: Database, Auth, File Storage

2. **Rork Platform Access** (For AI features)
   - The app uses Rork AI Toolkit SDK
   - Provides: LLM API, Image analysis, Quiz generation
   - Alternative: Can replace with OpenAI API if self-hosting

3. **Expo Account** (Free tier available)
   - Sign up at: https://expo.dev
   - Used for: App building and deployment

### Required Tools

- Node.js 18+ or Bun
- Git
- EAS CLI: `npm install -g eas-cli`
- Expo CLI (via npx)

---

## Environment Setup

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd cbse-learning-companion
bun install  # or npm install
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in your credentials:

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...your-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-service-key

EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-key

# Backend API (set after deploying backend)
EXPO_PUBLIC_RORK_API_BASE_URL=https://your-backend.com

# Rork AI Toolkit
EXPO_PUBLIC_TOOLKIT_URL=https://toolkit.rork.com
```

### 3. Update app.json

Edit `app.json` to set your app's metadata:

```json
{
  "expo": {
    "name": "CBSE Learning Companion",
    "slug": "cbse-learning-companion",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.yourcompany.cbse"
    },
    "android": {
      "package": "com.yourcompany.cbse"
    },
    "extra": {
      "EXPO_PUBLIC_SUPABASE_URL": "YOUR_URL",
      "EXPO_PUBLIC_SUPABASE_ANON_KEY": "YOUR_KEY"
    }
  }
}
```

---

## Database Setup

### 1. Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in project details:
   - Name: CBSE Learning Companion
   - Database Password: (generate a strong password)
   - Region: (choose closest to your users)

### 2. Run Database Migrations

The project includes complete SQL scripts. Run them in this order:

#### Step 1: Create Schema

Go to Supabase Dashboard → SQL Editor → New Query

Run `supabase-schema-complete.sql`:

```bash
# Copy and paste the contents of supabase-schema-complete.sql
```

This creates all tables:
- users (students & parents)
- diagnostics
- concept_gaps
- lessons
- quizzes
- gamification (xp, badges, streaks)
- rewards
- uploads
- ai_logs
- activity_logs

#### Step 2: Seed Subject Data

Run `supabase-seed-subjects.sql`:

```bash
# Copy and paste the contents of supabase-seed-subjects.sql
```

This populates CBSE subjects and chapters.

### 3. Configure Storage Buckets

1. Go to Storage section in Supabase Dashboard
2. Create a new bucket named: `uploads`
3. Set bucket policy to allow authenticated users:

```sql
-- Allow authenticated users to upload files
CREATE POLICY "Users can upload files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'uploads');

-- Allow users to read their own files
CREATE POLICY "Users can view their files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'uploads');
```

### 4. Enable Row Level Security (RLS)

RLS policies are included in the schema file. Verify they're enabled:

```sql
-- Check RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

All tables should have `rowsecurity = true`.

### 5. Get API Keys

Go to Project Settings → API:
- Copy `Project URL` → Use as `SUPABASE_URL`
- Copy `anon public` key → Use as `SUPABASE_ANON_KEY`
- Copy `service_role` key → Use as `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

---

## Backend Deployment

The backend is a Hono + tRPC server that can be deployed to various platforms.

### Option 1: Deploy to Vercel (Recommended)

Vercel provides easy deployment with automatic HTTPS and scaling.

#### Prerequisites
- Vercel account (free tier available)
- Vercel CLI: `npm i -g vercel`

#### Steps

1. **Create `vercel.json`** (already included in project):

```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/hono.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "backend/hono.ts"
    }
  ]
}
```

2. **Deploy**:

```bash
vercel
```

Follow prompts:
- Link to existing project? No
- Project name: cbse-backend
- Directory: ./

3. **Add Environment Variables**:

In Vercel Dashboard → Project Settings → Environment Variables, add:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NODE_ENV=production`

4. **Redeploy**:

```bash
vercel --prod
```

5. **Get Backend URL**:

Your backend will be at: `https://your-project.vercel.app`

Update `.env.local`:
```env
EXPO_PUBLIC_RORK_API_BASE_URL=https://your-project.vercel.app
```

### Option 2: Deploy to Railway

Railway offers easy deployment with databases included.

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add environment variables
railway variables set SUPABASE_URL=your-url
railway variables set SUPABASE_ANON_KEY=your-key

# Deploy
railway up
```

### Option 3: Self-Hosted (VPS)

If deploying to your own server:

1. **Install dependencies**:
```bash
curl -fsSL https://bun.sh/install | bash
```

2. **Clone and build**:
```bash
git clone <repo>
cd cbse-learning-companion
bun install
```

3. **Create systemd service** (`/etc/systemd/system/cbse-backend.service`):

```ini
[Unit]
Description=CBSE Backend API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/cbse-learning-companion
ExecStart=/usr/local/bin/bun run backend/hono.ts
Restart=always
Environment=NODE_ENV=production
EnvironmentFile=/var/www/cbse-learning-companion/.env.production

[Install]
WantedBy=multi-user.target
```

4. **Start service**:
```bash
sudo systemctl enable cbse-backend
sudo systemctl start cbse-backend
```

5. **Setup Nginx reverse proxy**:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

6. **Get SSL certificate**:
```bash
sudo certbot --nginx -d api.yourdomain.com
```

---

## Mobile App Build

### Development Testing

```bash
# Start development server
bun start

# Run on iOS simulator
bun start --ios

# Run on Android emulator
bun start --android

# Run on web
bun start:web
```

### Production Build with EAS

#### 1. Install and Configure EAS

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS
eas build:configure
```

This creates `eas.json`:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "env": {
        "NODE_ENV": "production"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

#### 2. Build for iOS

```bash
# Production build
eas build --platform ios --profile production

# This will:
# - Bundle your app
# - Upload to Expo's build servers
# - Generate an .ipa file
# - Provide download link
```

**Requirements**:
- Apple Developer Account ($99/year)
- App Store Connect app created
- Bundle identifier set in app.json

#### 3. Build for Android

```bash
# Production build
eas build --platform android --profile production

# This generates an .aab (Android App Bundle)
```

**Requirements**:
- Google Play Developer Account ($25 one-time)
- Signing key (EAS can generate for you)

#### 4. Submit to Stores

```bash
# Submit to App Store
eas submit --platform ios

# Submit to Google Play
eas submit --platform android
```

### Over-The-Air (OTA) Updates

After initial app store approval, push updates instantly:

```bash
# Publish update
eas update --branch production --message "Bug fixes"
```

Users get updates automatically on next app launch.

---

## Production Checklist

### Security

- [ ] All environment variables set correctly
- [ ] `.env.local` added to `.gitignore`
- [ ] Service role keys only in backend, never exposed to frontend
- [ ] RLS policies enabled on all Supabase tables
- [ ] CORS configured properly in backend
- [ ] API rate limiting configured (if using self-hosted)

### Database

- [ ] All migrations run successfully
- [ ] Subject data seeded
- [ ] Storage buckets created and configured
- [ ] Backup strategy in place
- [ ] Database indexes optimized for queries

### Backend

- [ ] Backend deployed and accessible
- [ ] Health check endpoint responding (`/api/`)
- [ ] tRPC endpoints tested
- [ ] Error handling verified
- [ ] Logging configured
- [ ] HTTPS enabled

### Mobile App

- [ ] App built for both iOS and Android
- [ ] App icons and splash screens set
- [ ] App metadata configured (name, description, etc.)
- [ ] Privacy policy URL added
- [ ] Terms of service URL added
- [ ] App Store screenshots prepared
- [ ] Test on physical devices (iOS and Android)

### Monitoring

- [ ] Error tracking setup (consider Sentry)
- [ ] Analytics configured (built-in admin dashboard)
- [ ] Performance monitoring enabled
- [ ] User feedback mechanism in place

### Testing

- [ ] All user flows tested end-to-end
- [ ] Authentication working (student & parent)
- [ ] Diagnostics and gap detection tested
- [ ] Quiz generation and submission working
- [ ] Gamification (XP, badges, streaks) verified
- [ ] Parent rewards system tested
- [ ] Image upload and AI analysis working
- [ ] Cross-platform testing (iOS, Android, Web)

---

## Post-Deployment

### 1. Monitor Initial Launch

- Check error logs daily
- Monitor database performance
- Track user feedback
- Watch for API rate limits

### 2. Regular Maintenance

- **Weekly**: Review AI logs and adjust prompts if needed
- **Monthly**: Optimize database queries based on usage
- **Quarterly**: Update dependencies and security patches

### 3. Scaling Considerations

As usage grows:

- **Database**: Upgrade Supabase plan or migrate to managed PostgreSQL
- **Backend**: Enable horizontal scaling (multiple instances)
- **AI Costs**: Monitor AI usage and optimize prompts
- **Storage**: Plan for image upload growth

---

## Troubleshooting

### Backend Not Connecting

**Symptom**: Frontend can't reach backend API

**Solutions**:
1. Check `EXPO_PUBLIC_RORK_API_BASE_URL` is set correctly
2. Verify backend is running: `curl https://your-backend.com/api/`
3. Check CORS configuration in `backend/hono.ts`
4. Verify SSL certificate is valid

### Database Connection Errors

**Symptom**: "Could not connect to database"

**Solutions**:
1. Verify Supabase URL and keys
2. Check if Supabase project is active (not paused)
3. Confirm RLS policies allow required operations
4. Check network connectivity

### AI Features Not Working

**Symptom**: Diagnostics, quiz generation fails

**Solutions**:
1. Verify `EXPO_PUBLIC_TOOLKIT_URL` is set
2. Check if Rork AI Toolkit is accessible
3. Review `services/aiService.ts` for errors
4. Check `ai_logs` table for failure details

### App Won't Build

**Symptom**: EAS build fails

**Solutions**:
1. Check `app.json` configuration
2. Verify bundle identifiers are unique
3. Ensure all dependencies are compatible with Expo SDK 54
4. Check EAS build logs for specific errors

### Authentication Issues

**Symptom**: Users can't log in/sign up

**Solutions**:
1. Verify Supabase Auth is enabled
2. Check RLS policies on users table
3. Review auth procedures in `backend/trpc/routes/auth/`
4. Test with Supabase Auth logs

---

## Support Resources

- **Expo Documentation**: https://docs.expo.dev
- **Supabase Docs**: https://supabase.com/docs
- **tRPC Docs**: https://trpc.io/docs
- **Rork Platform**: Contact Rork support for AI toolkit issues

---

## Next Steps

After successful deployment:

1. **User Testing**: Invite beta users to test all features
2. **Collect Feedback**: Use in-app feedback or surveys
3. **Iterate**: Fix bugs and add requested features
4. **Market**: Prepare app store optimization (ASO)
5. **Scale**: Monitor growth and scale infrastructure accordingly

---

*Last Updated: 2025-01-29*
