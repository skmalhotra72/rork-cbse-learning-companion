// Run this to check API connection
// Usage: npx tsx debug-api-connection.ts

const apiUrl = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;

console.log('\n=== API Connection Debug ===\n');
console.log('Environment Variables:');
console.log('EXPO_PUBLIC_RORK_API_BASE_URL:', apiUrl || '❌ NOT SET');
console.log('\nExpected format: http://localhost:PORT or https://tunnel-url');
console.log('\n=========================\n');

if (!apiUrl) {
  console.error('⚠️  API URL is not configured!');
  console.log('\nTo fix:');
  console.log('1. When you run "bun start", look for the server URL in the terminal');
  console.log('2. Add it to env.local as: EXPO_PUBLIC_RORK_API_BASE_URL=<url>');
  console.log('3. Restart the app\n');
  process.exit(1);
}

// Test the connection
fetch(`${apiUrl}/api`)
  .then(res => res.json())
  .then(data => {
    console.log('✅ API is reachable:', data);
  })
  .catch(err => {
    console.error('❌ Failed to reach API:', err.message);
  });
