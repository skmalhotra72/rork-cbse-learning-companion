import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gevcprpgzxbozzqgjgmk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdldmNwcnBnenhib3p6cWdqZ21rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0Mjg3NzAsImV4cCI6MjA4MDAwNDc3MH0.9-1guPwT280YvFQWcVZGPIq65_TvH2H3wFQoZE2TElk';

async function testConnection() {
  console.log('🔍 Testing Supabase connection...');
  console.log('URL:', supabaseUrl);
  console.log('');

  const supabase = createClient(supabaseUrl, supabaseKey);

  const tables = [
    'subjects',
    'student_profiles', 
    'progress_data',
    'concept_gaps',
    'quiz_results',
    'learning_sessions',
    'badges_earned',
    'parent_rewards',
    'chapter_progress',
    'completed_lessons',
    'student_badges'
  ];

  console.log('📊 Checking tables...\n');

  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('id').limit(1);
      
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: OK`);
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  console.log('\n✨ Test complete!');
}

testConnection();
