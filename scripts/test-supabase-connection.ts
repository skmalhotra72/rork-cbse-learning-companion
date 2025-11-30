import { supabase } from '@/lib/supabase';

/**
 * Test Supabase Connection
 * Run this to verify your Supabase setup is working
 */

export async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase Connection...\n');

  try {
    const { data, error } = await supabase
      .from('subjects')
      .select('id, name, code, grade')
      .limit(5);

    if (error) {
      console.error('❌ Connection FAILED:', error.message);
      console.error('\n📋 Possible issues:');
      console.error('1. Database tables not created yet');
      console.error('2. Wrong credentials in env.local');
      console.error('3. RLS policies blocking access\n');
      return false;
    }

    console.log('✅ Connection SUCCESSFUL!\n');
    console.log('📊 Sample subjects from database:');
    console.table(data);
    
    const totalCount = data?.length || 0;
    console.log(`\n✅ Found ${totalCount} subjects in database`);
    console.log('✅ Supabase is working correctly!\n');
    
    return true;
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return false;
  }
}

export async function testAllTables() {
  console.log('🔍 Checking all required tables...\n');

  const requiredTables = [
    'users',
    'student_profiles',
    'parent_profiles',
    'student_parent_links',
    'subjects',
    'chapters',
    'student_subject_settings',
    'diagnostics',
    'concept_gaps',
    'learning_sessions',
    'quizzes',
    'quiz_questions',
    'quiz_attempts',
    'quiz_results',
    'badges_earned',
    'gamification',
    'parent_rewards',
    'uploads',
    'ai_logs',
    'activity_logs',
  ];

  let allExist = true;

  for (const table of requiredTables) {
    try {
      const { error } = await supabase.from(table).select('id').limit(1);
      
      if (error) {
        console.log(`❌ ${table} - MISSING or INACCESSIBLE`);
        allExist = false;
      } else {
        console.log(`✅ ${table} - EXISTS`);
      }
    } catch {
      console.log(`❌ ${table} - ERROR`);
      allExist = false;
    }
  }

  console.log('\n' + '='.repeat(50));
  
  if (allExist) {
    console.log('✅ All tables exist! Database is ready.');
  } else {
    console.log('❌ Some tables are missing. Run the SQL scripts in Supabase.');
    console.log('\nSee: FIX_SUPABASE_CONNECTION.md for instructions');
  }
  
  return allExist;
}

if (require.main === module) {
  (async () => {
    await testSupabaseConnection();
    console.log('\n');
    await testAllTables();
  })();
}
