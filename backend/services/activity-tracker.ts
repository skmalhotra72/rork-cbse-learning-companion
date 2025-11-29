import { SupabaseClient } from "@supabase/supabase-js";

export interface TrackActivityInput {
  studentId: string;
  subjectId: string;
  chapterId?: string;
  activityType: 'study' | 'practice' | 'quiz' | 'diagnostic' | 'textbook_help' | 'bridge_lesson';
  metadata?: any;
  pointsEarned?: number;
}

export async function trackActivity(
  supabase: SupabaseClient,
  input: TrackActivityInput
): Promise<void> {
  try {
    const sessionStart = new Date();
    
    const { error } = await supabase.from('learning_sessions').insert({
      student_id: input.studentId,
      subject_id: input.subjectId,
      chapter_id: input.chapterId || null,
      session_type: input.activityType,
      started_at: sessionStart.toISOString(),
      ended_at: sessionStart.toISOString(),
      duration_minutes: 1,
      activities: input.metadata || {},
      points_earned: input.pointsEarned || 0,
    });

    if (error) {
      console.error('[Activity Tracker] Failed to track activity:', error);
    } else {
      console.log(`[Activity Tracker] Tracked ${input.activityType} activity for student ${input.studentId}`);
    }
  } catch (error) {
    console.error('[Activity Tracker] Exception while tracking activity:', error);
  }
}

export async function updateLoginTimestamp(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) {
      console.error('[Activity Tracker] Failed to update login timestamp:', error);
    } else {
      console.log(`[Activity Tracker] Updated login timestamp for user ${userId}`);
    }
  } catch (error) {
    console.error('[Activity Tracker] Exception while updating login timestamp:', error);
  }
}
