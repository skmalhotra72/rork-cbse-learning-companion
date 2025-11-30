import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://gevcprpgzxbozzqgjgmk.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdldmNwcnBnenhib3p6cWdqZ21rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0Mjg3NzAsImV4cCI6MjA4MDAwNDc3MH0.9-1guPwT280YvFQWcVZGPIq65_TvH2H3wFQoZE2TElk';

console.log('🔍 Verifying Supabase Connection...\n');
console.log('📍 URL:', supabaseUrl);
console.log('🔑 Key:', supabaseAnonKey.substring(0, 30) + '...\n');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyConnection() {
  try {
    console.log('1️⃣ Testing basic connection...');
    const { data: healthData, error: healthError } = await supabase
      .from('subjects')
      .select('count')
      .limit(1);

    if (healthError) {
      console.log('❌ Connection test failed:', healthError.message);
      return;
    }

    console.log('✅ Basic connection successful!\n');

    console.log('2️⃣ Checking tables...');
    const tables = [
      'users',
      'student_profiles', 
      'parent_profiles',
      'subjects',
      'chapters',
      'concept_gaps',
      'progress_data',
      'quiz_results',
      'badges',
      'student_badges',
      'parent_rewards'
    ];

    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .select('count')
        .limit(1);

      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: accessible`);
      }
    }

    console.log('\n✨ Supabase verification complete!');
    console.log('\n📋 Summary:');
    console.log('   - Project ID: gevcprpgzxbozzqgjgmk');
    console.log('   - Connection: ✅ Working');
    console.log('   - Ready to use!');

  } catch (err) {
    console.log('❌ Unexpected error:', err);
  }
}

verifyConnection();
