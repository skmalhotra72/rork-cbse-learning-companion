# How to Start the App

Since `bunx rork` command is not available, follow these steps to start your app:

## Step 1: Start the Backend API

Open a terminal in the project root and run:
```bash
bun run --watch backend/hono.ts
```

The backend will start on `http://localhost:3000`

You should see output like:
```
🚀 Backend API starting on http://localhost:3000
📡 tRPC endpoint: http://localhost:3000/api/trpc
🏥 Health check: http://localhost:3000/health/supabase
```

## Step 2: Start the Frontend (Expo)

Open a **NEW** terminal (keep the backend running) and run:
```bash
npx expo start
```

This will start the Expo development server.

## Step 3: Test Login

Use the dummy credentials from your previous setup:
- **Student Account**: `student@test.com` / `password123`
- **Parent Account**: `parent@test.com` / `password123`

## Troubleshooting

### If you get "Failed to fetch" error:
1. Make sure the backend is running on port 3000
2. Check the console logs in the backend terminal
3. Verify `EXPO_PUBLIC_RORK_API_BASE_URL=http://localhost:3000` is set in `env.local`

### If backend port 3000 is busy:
You can change the port by editing `backend/hono.ts` and updating the port, then update `EXPO_PUBLIC_RORK_API_BASE_URL` in `env.local` to match.

### For mobile device testing:
1. Get your computer's local IP address (e.g., `192.168.1.100`)
2. Update `EXPO_PUBLIC_RORK_API_BASE_URL` to `http://YOUR_IP:3000`
3. Make sure your phone is on the same WiFi network
4. Restart both backend and frontend

### Using Expo Go Port Issue:
If Expo asks to use a different port (like 8082), just press 'Y' to accept it. This is normal and won't affect functionality.
