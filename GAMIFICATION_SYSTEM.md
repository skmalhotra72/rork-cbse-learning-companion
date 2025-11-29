# Gamification System Documentation

## Overview
Complete gamification system with XP, levels, badges, streaks, leaderboards, and parent-managed rewards.

## Features Implemented

### 1. XP (Experience Points) System
- **XP Rules** (constants/gamification.ts):
  - Quiz completion: 50 XP
  - Perfect quiz score: 100 XP
  - Lesson completion: 30 XP
  - Diagnostic completion: 75 XP
  - Gap closed: 100 XP
  - Daily login: 10 XP
  - Streak bonus: 5 XP per day

### 2. Level System
- **20 Levels** with exponentially increasing thresholds
- Level progression visualization
- Progress bar showing XP to next level
- Automatic level calculation based on total points

### 3. Badge System
- **18 Unique Badges** across 4 rarity tiers:
  - **Common** (gray): First Steps, 3-Day Streak, Rising Star, Gap Closer, Perfect Score, Level 5
  - **Rare** (blue): Week Warrior, Bright Mind, Knowledge Builder, Perfectionist, Level 10
  - **Epic** (purple): Monthly Master, Genius, Master Learner, Flawless Scholar
  - **Legendary** (gold): Century Scholar, Legend, Level 20
  
- Badge requirements based on:
  - Streaks (3, 7, 30, 100 days)
  - Total points (500, 1000, 5000, 10000)
  - Gaps closed (1, 5, 20, 50)
  - Perfect quiz scores (1, 10, 50)
  - Level milestones (5, 10, 20)

### 4. Streak Tracking
- Daily activity tracking
- Automatic streak increment on consecutive days
- Streak reset if day missed
- Streak displayed prominently on dashboard and progress screen

### 5. Parent Rewards System
- Parents can create custom rewards for students
- **Reward Types**:
  - Privilege (e.g., extra screen time)
  - Gift (e.g., toy, game)
  - Activity (e.g., movie night, park visit)
  
- **Reward Properties**:
  - Name and description
  - Points required to unlock
  - Redemption tracking
  - Active/inactive status
  
- Students can redeem rewards when they have enough points
- Points are deducted upon redemption

### 6. Leaderboard
- Grade-filtered leaderboards
- Displays:
  - Rank
  - Student name
  - Total points
  - Current level
  - Current streak

## Backend API Endpoints

### Gamification Routes
- `gamification.awardXp` - Award XP to student
- `gamification.checkBadges` - Check and award new badges
- `gamification.updateStreak` - Update daily streak
- `gamification.getBadges` - Get student's earned badges
- `gamification.getLeaderboard` - Get leaderboard (filterable by grade)

### Rewards Routes
- `rewards.create` - Create new reward (parent only)
- `rewards.get` - Get rewards for student
- `rewards.redeem` - Redeem a reward
- `rewards.update` - Update reward details (parent only)

## UI Screens

### Student Screens
1. **Badges Screen** (`app/(student)/badges.tsx`):
   - Displays all badges grouped by rarity
   - Shows locked vs unlocked state
   - Displays requirements for locked badges
   - Beautiful gradient backgrounds per rarity

2. **Progress Screen** (`app/(student)/progress.tsx`):
   - Level card with XP progress bar
   - Stats grid (streak, badges, gaps closed)
   - Recent badges carousel
   - Visual level progression

3. **Dashboard** (`app/(student)/index.tsx`):
   - Already displays level, points, and streak
   - Shows progress summary
   - Quick access to all features

### Parent Screens
1. **Rewards Screen** (`app/(parent)/rewards.tsx`):
   - Create custom rewards modal
   - View all active rewards
   - Student selection (if multiple children)
   - Current points display
   - Reward status (available/redeemed)
   - Type-based icons and colors

## Integration Points

### Award XP When:
1. Student completes a quiz:
   ```typescript
   await trpc.gamification.awardXp.mutate({
     studentId: profile.id,
     xpAmount: XP_RULES.QUIZ_COMPLETION,
     reason: 'Quiz completed',
     metadata: { quizId, score }
   });
   ```

2. Student closes a knowledge gap:
   ```typescript
   await trpc.gamification.awardXp.mutate({
     studentId: profile.id,
     xpAmount: XP_RULES.GAP_CLOSED,
     reason: 'Knowledge gap closed',
     metadata: { gapId, chapterId }
   });
   ```

3. Student completes a lesson:
   ```typescript
   await trpc.gamification.awardXp.mutate({
     studentId: profile.id,
     xpAmount: XP_RULES.LESSON_COMPLETION,
     reason: 'Lesson completed',
     metadata: { lessonId }
   });
   ```

### Check Badges After:
- XP awards
- Quiz completions
- Gap closures
- Level ups

```typescript
await trpc.gamification.checkBadges.mutate({
  studentId: profile.id
});
```

### Update Streak:
- On app open/login
- After any learning activity

```typescript
await trpc.gamification.updateStreak.mutate({
  studentId: profile.id
});
```

## Database Tables Used

### student_profiles
- `total_points` - Total XP earned
- `level` - Current level (1-20)
- `current_streak` - Consecutive learning days

### gamification
- Stores earned badges and achievements
- Fields:
  - `achievement_type` - 'badge', 'milestone', 'streak'
  - `achievement_name` - Badge name
  - `description` - Badge description
  - `icon_url` - Emoji or icon
  - `points_awarded` - Bonus XP for earning
  - `rarity` - 'common', 'rare', 'epic', 'legendary'
  - `metadata` - Additional data (badgeId, etc.)
  - `earned_at` - Timestamp

### parent_rewards
- Stores parent-created rewards
- Fields:
  - `parent_id` - Creating parent
  - `student_id` - Target student
  - `reward_name` - Reward title
  - `description` - Details
  - `points_required` - Cost in XP
  - `reward_type` - 'privilege', 'gift', 'activity'
  - `is_active` - Can be redeemed
  - `is_redeemed` - Already claimed
  - `redeemed_at` - Redemption timestamp

### learning_sessions
- Tracks all learning activities
- Used for streak calculation
- Logs XP awards

## Next Steps (Not Implemented Yet)

### Notification System
- Badge unlocked notifications
- Level up celebrations
- Streak reminders
- Reward availability alerts

### Advanced Features
- Weekly/monthly challenges
- Team competitions
- Subject-specific badges
- Achievement sharing
- Parent approval for reward redemption
- Points history and analytics
- Custom badge creation by parents

## Usage Examples

### In Quiz Submission:
```typescript
const submitQuizMutation = trpc.bridge.submitQuiz.useMutation({
  onSuccess: async (data) => {
    // Award XP
    const xp = data.isPerfect ? XP_RULES.QUIZ_PERFECT_SCORE : XP_RULES.QUIZ_COMPLETION;
    await trpc.gamification.awardXp.mutate({
      studentId: profile.id,
      xpAmount: xp,
      reason: `Quiz ${data.isPerfect ? 'perfect' : 'completed'}`,
      metadata: { quizId: data.quizId, score: data.score }
    });
    
    // Check for new badges
    await trpc.gamification.checkBadges.mutate({ studentId: profile.id });
    
    // Update streak
    await trpc.gamification.updateStreak.mutate({ studentId: profile.id });
    
    // Refresh profile
    refreshProfile();
  }
});
```

### In Gap Closure:
```typescript
const completeLessonMutation = trpc.bridge.completeLesson.useMutation({
  onSuccess: async (data) => {
    if (data.gapClosed) {
      await trpc.gamification.awardXp.mutate({
        studentId: profile.id,
        xpAmount: XP_RULES.GAP_CLOSED,
        reason: 'Knowledge gap closed',
        metadata: { gapId: data.gapId }
      });
    }
    
    await trpc.gamification.checkBadges.mutate({ studentId: profile.id });
    await trpc.gamification.updateStreak.mutate({ studentId: profile.id });
  }
});
```

## Constants Reference

```typescript
// From constants/gamification.ts
export const XP_RULES = {
  QUIZ_COMPLETION: 50,
  QUIZ_PERFECT_SCORE: 100,
  LESSON_COMPLETION: 30,
  DIAGNOSTIC_COMPLETION: 75,
  GAP_CLOSED: 100,
  DAILY_LOGIN: 10,
  STREAK_BONUS_PER_DAY: 5,
  HELP_REQUEST: 5,
};

export const LEVEL_THRESHOLDS = [
  0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200,
  4000, 5000, 6200, 7600, 9200, 11000, 13000, 15500, 18500, 22000,
];
```

## Design Patterns

- **Modular Backend**: Each gamification feature has its own tRPC procedure
- **Type Safety**: Full TypeScript types for all gamification data
- **Optimistic Updates**: UI updates immediately, background sync
- **Permission-Based**: Parent procedures check parent role, student procedures check student access
- **Flexible Rewards**: Parents have full control over reward creation and management
- **Scalable Badges**: Easy to add new badges by extending BADGES array

## Performance Considerations

- Badge checking only runs after significant events (not on every page load)
- Leaderboard limited to 20 entries by default (configurable)
- Streak calculation optimized with date-based queries
- Rewards query only loads for selected student
- Badge UI shows locked/unlocked state without fetching full history each time
