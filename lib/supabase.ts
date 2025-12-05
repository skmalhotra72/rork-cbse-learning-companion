import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log('[Supabase] Initializing client...');
console.log('[Supabase] URL:', supabaseUrl);
console.log('[Supabase] Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'MISSING');
console.log('[Supabase] Source:', process.env.EXPO_PUBLIC_SUPABASE_URL ? 'env.local' : 'app.json');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[Supabase] Missing credentials!');
  console.error('[Supabase] URL from env:', process.env.EXPO_PUBLIC_SUPABASE_URL);
  console.error('[Supabase] URL from app.json:', Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL);
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
