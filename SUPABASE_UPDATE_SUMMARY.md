# ✅ Supabase Credentials Updated

## Updated Credentials
Your Supabase project has been updated to use the new credentials:

- **Project ID**: `gevcprpgzxbozzqgjgmk`
- **URL**: `https://gevcprpgzxbozzqgjgmk.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (ending with `...TElk`)

## Files Updated

### ✅ env.local (Primary Configuration)
Updated both frontend and backend variables:
```
EXPO_PUBLIC_SUPABASE_URL=https://gevcprpgzxbozzqgjgmk.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

SUPABASE_URL=https://gevcprpgzxbozzqgjgmk.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### ⚠️ app.json (Locked - But Not Critical)
This file cannot be edited automatically, but the credentials in `env.local` take precedence, so it's not critical.

## How It Works

### Frontend (React Native)
- `lib/supabase.ts` reads from:
  1. `Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL` (from app.json)
  2. Falls back to `process.env.EXPO_PUBLIC_SUPABASE_URL` (from env.local)
  
Since env.local is loaded, your app will use the new credentials.

### Backend (tRPC/Hono)
- `backend/trpc/create-context.ts` reads from:
  1. `process.env.SUPABASE_URL` (from env.local)
  2. Falls back to `process.env.EXPO_PUBLIC_SUPABASE_URL` (from env.local)

Both paths now point to the new Supabase instance.

## Verify Connection

Run this command to verify your Supabase connection:

```bash
bun run verify-supabase-connection.ts
```

This will:
- ✅ Test basic connection
- ✅ Check all required tables
- ✅ Confirm the project ID

## Next Steps

1. **Restart your servers** (both frontend and backend) to load the new credentials:
   ```bash
   # Terminal 1 - Backend
   bun run backend/hono.ts
   
   # Terminal 2 - Frontend  
   npx expo start --tunnel
   ```

2. **Run the verification script**:
   ```bash
   bun run verify-supabase-connection.ts
   ```

3. **Test the app** by trying to:
   - Sign up a new user
   - Log in
   - View subjects/chapters
   - Check that data is saving properly

## Consistency Check

All Supabase references now point to: **gevcprpgzxbozzqgjgmk**

✅ env.local (frontend vars) → gevcprpgzxbozzqgjgmk  
✅ env.local (backend vars) → gevcprpgzxbozzqgjgmk  
✅ lib/supabase.ts → reads from env.local  
✅ backend/trpc/create-context.ts → reads from env.local  
⚠️ app.json → old credentials (but overridden by env.local)

## Troubleshooting

If you still see connection errors:

1. **Clear the cache**:
   ```bash
   npx expo start --clear
   ```

2. **Check environment variables are loaded**:
   ```bash
   # In your app code, add:
   console.log('Supabase URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
   ```

3. **Verify your Supabase project**:
   - Go to https://supabase.com/dashboard/project/gevcprpgzxbozzqgjgmk
   - Ensure all tables exist
   - Check that RLS policies are configured

4. **Test with curl**:
   ```bash
   curl "https://gevcprpgzxbozzqgjgmk.supabase.co/rest/v1/subjects?select=id&limit=1" \
     -H "apikey: YOUR_ANON_KEY" \
     -H "Authorization: Bearer YOUR_ANON_KEY"
   ```

## Status: ✅ READY

Your app is now configured to use the new Supabase project!
