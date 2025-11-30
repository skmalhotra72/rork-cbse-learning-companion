#!/usr/bin/env bun

console.log('🔍 Verifying Setup...\n');

// Check environment variables
console.log('📋 Checking Environment Variables:');
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'EXPO_PUBLIC_SUPABASE_URL',
  'EXPO_PUBLIC_SUPABASE_ANON_KEY',
  'EXPO_PUBLIC_RORK_API_BASE_URL',
];

let envOk = true;
for (const envVar of requiredEnvVars) {
  // @ts-ignore - dynamic env access needed for verification
  const value = process.env[envVar];
  if (value) {
    console.log(`  ✅ ${envVar}: ${envVar.includes('KEY') ? '***' : value}`);
  } else {
    console.log(`  ❌ ${envVar}: NOT SET`);
    envOk = false;
  }
}

if (!envOk) {
  console.log('\n⚠️  Missing environment variables. Check env.local file.');
  process.exit(1);
}

// Check if backend is running
console.log('\n🔌 Checking Backend Server:');
const backendUrl = process.env.EXPO_PUBLIC_RORK_API_BASE_URL || 'http://localhost:3000';

try {
  const response = await fetch(backendUrl);
  if (response.ok) {
    console.log(`  ✅ Backend is running at ${backendUrl}`);
    
    // Check Supabase connection
    console.log('\n💾 Checking Supabase Connection:');
    const healthResponse = await fetch(`${backendUrl}/health/supabase`);
    const healthData = await healthResponse.json();
    
    if (healthData.connected) {
      console.log('  ✅ Supabase is connected');
    } else {
      console.log('  ❌ Supabase connection failed:', healthData.message);
    }
    
    // Check tRPC endpoint
    console.log('\n📡 Checking tRPC Endpoint:');
    await fetch(`${backendUrl}/api/trpc`);
    console.log(`  ✅ tRPC endpoint is accessible at ${backendUrl}/api/trpc`);
    
  } else {
    console.log(`  ❌ Backend returned status: ${response.status}`);
  }
} catch {
  console.log(`  ❌ Backend is NOT running at ${backendUrl}`);
  console.log(`  ℹ️  Start it with: bun run backend/hono.ts\n`);
  console.log('📖 See START_BACKEND_SERVER.md for detailed instructions');
  process.exit(1);
}

console.log('\n✨ Setup verification complete!');
console.log('\n📱 Ready to start the app. Run: npx expo start');
