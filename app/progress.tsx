import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppState } from '@/contexts/AppStateContext';
import { Subject } from '@/constants/cbse';
import colors from '@/constants/colors';
import {
  X,
  TrendingUp,
  Award,
  Target,
  BookOpen,
  BarChart3,
  Calendar,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProgressScreen() {
  const router = useRouter();
  const { profile, progress } = useAppState();

  if (!profile) {
    return null;
  }


  const currentLevelXP = progress.xp % 100;
  const levelProgress = (currentLevelXP / 100) * 100;

  const quizStats = {
    total: progress.quizResults.length,
    avgScore: progress.quizResults.length > 0
      ? Math.round(
          progress.quizResults.reduce((sum, r) => sum + r.score, 0) / progress.quizResults.length
        )
      : 0,
    perfect: progress.quizResults.filter((r) => r.score === 100).length,
  };

  const subjectStats: Record<Subject, { quizzes: number; avgScore: number; gaps: number }> = {} as any;
  profile.subjects.forEach((subject) => {
    const subjectQuizzes = progress.quizResults.filter((q) =>
      q.questions.some((quest) => quest.concept.toLowerCase().includes(subject.toLowerCase()))
    );
    subjectStats[subject] = {
      quizzes: subjectQuizzes.length,
      avgScore: subjectQuizzes.length > 0
        ? Math.round(subjectQuizzes.reduce((sum, r) => sum + r.score, 0) / subjectQuizzes.length)
        : 0,
      gaps: progress.conceptGaps.filter((g) => g.subject === subject).length,
    };
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <X color={colors.text} size={24} />
          </TouchableOpacity>
          <Text style={styles.title}>Progress</Text>
          <View style={{ width: 24 }} />
        </View>

        <LinearGradient
          colors={[colors.accent.blue, colors.accent.purple]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.levelCard}
        >
          <View style={styles.levelHeader}>
            <View style={styles.levelIconContainer}>
              <TrendingUp color={colors.surface} size={32} />
            </View>
            <View style={styles.levelInfo}>
              <Text style={styles.levelText}>Level {progress.level}</Text>
              <Text style={styles.levelSubtext}>
                {currentLevelXP} / 100 XP
              </Text>
            </View>
          </View>
          <View style={styles.levelProgressContainer}>
            <View style={styles.levelProgressBar}>
              <View style={[styles.levelProgressFill, { width: `${levelProgress}%` }]} />
            </View>
            <Text style={styles.levelProgressText}>
              {100 - currentLevelXP} XP to Level {progress.level + 1}
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.statsGrid}>
          <View style={styles.miniStatCard}>
            <View style={[styles.miniStatIcon, { backgroundColor: colors.accent.orange + '20' }]}>
              <Calendar color={colors.accent.orange} size={24} />
            </View>
            <Text style={styles.miniStatValue}>{progress.streakDays}</Text>
            <Text style={styles.miniStatLabel}>Day Streak</Text>
          </View>

          <View style={styles.miniStatCard}>
            <View style={[styles.miniStatIcon, { backgroundColor: colors.accent.green + '20' }]}>
              <BookOpen color={colors.accent.green} size={24} />
            </View>
            <Text style={styles.miniStatValue}>{progress.completedLessons.length}</Text>
            <Text style={styles.miniStatLabel}>Lessons Done</Text>
          </View>

          <View style={styles.miniStatCard}>
            <View style={[styles.miniStatIcon, { backgroundColor: colors.accent.purple + '20' }]}>
              <Award color={colors.accent.purple} size={24} />
            </View>
            <Text style={styles.miniStatValue}>{progress.badges.length}</Text>
            <Text style={styles.miniStatLabel}>Badges</Text>
          </View>

          <View style={styles.miniStatCard}>
            <View style={[styles.miniStatIcon, { backgroundColor: colors.danger + '20' }]}>
              <Target color={colors.danger} size={24} />
            </View>
            <Text style={styles.miniStatValue}>{progress.conceptGaps.length}</Text>
            <Text style={styles.miniStatLabel}>Active Gaps</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <BarChart3 color={colors.primary} size={24} />
            <Text style={styles.sectionTitle}>Quiz Performance</Text>
          </View>

          <View style={styles.quizStatsCard}>
            <View style={styles.quizStatRow}>
              <Text style={styles.quizStatLabel}>Total Quizzes</Text>
              <Text style={styles.quizStatValue}>{quizStats.total}</Text>
            </View>
            <View style={styles.quizStatRow}>
              <Text style={styles.quizStatLabel}>Average Score</Text>
              <Text style={[styles.quizStatValue, { color: colors.accent.blue }]}>
                {quizStats.avgScore}%
              </Text>
            </View>
            <View style={styles.quizStatRow}>
              <Text style={styles.quizStatLabel}>Perfect Scores</Text>
              <Text style={[styles.quizStatValue, { color: colors.success }]}>
                {quizStats.perfect}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subject Breakdown</Text>
          <View style={styles.subjectsStats}>
            {profile.subjects.map((subject) => {
              const stats = subjectStats[subject];
              const rating = profile.subjectRatings[subject];
              let emoji = '📚';
              if (rating === 'struggling') emoji = '😰';
              else if (rating === 'okay') emoji = '😐';
              else if (rating === 'confident') emoji = '😊';
              else if (rating === 'expert') emoji = '🚀';

              return (
                <View key={subject} style={styles.subjectStatCard}>
                  <View style={styles.subjectStatHeader}>
                    <Text style={styles.subjectEmoji}>{emoji}</Text>
                    <View style={styles.subjectStatInfo}>
                      <Text style={styles.subjectStatName}>{subject}</Text>
                      <Text style={styles.subjectStatRating}>{rating}</Text>
                    </View>
                  </View>

                  <View style={styles.subjectStatDetails}>
                    <View style={styles.subjectStatItem}>
                      <Text style={styles.subjectStatItemLabel}>Quizzes</Text>
                      <Text style={styles.subjectStatItemValue}>{stats.quizzes}</Text>
                    </View>
                    <View style={styles.subjectStatDivider} />
                    <View style={styles.subjectStatItem}>
                      <Text style={styles.subjectStatItemLabel}>Avg Score</Text>
                      <Text style={[
                        styles.subjectStatItemValue,
                        { color: stats.avgScore >= 80 ? colors.success : stats.avgScore >= 60 ? colors.warning : colors.danger }
                      ]}>
                        {stats.avgScore}%
                      </Text>
                    </View>
                    <View style={styles.subjectStatDivider} />
                    <View style={styles.subjectStatItem}>
                      <Text style={styles.subjectStatItemLabel}>Gaps</Text>
                      <Text style={[styles.subjectStatItemValue, { color: colors.danger }]}>
                        {stats.gaps}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {progress.quizResults.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <View style={styles.activityList}>
              {progress.quizResults.slice(-5).reverse().map((quiz) => (
                <View key={quiz.id} style={styles.activityItem}>
                  <View style={styles.activityIconContainer}>
                    <Award
                      color={
                        quiz.score >= 80
                          ? colors.success
                          : quiz.score >= 60
                          ? colors.warning
                          : colors.danger
                      }
                      size={20}
                    />
                  </View>
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityTitle}>Quiz Completed</Text>
                    <Text style={styles.activityDate}>
                      {new Date(quiz.completedAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.activityScore,
                      {
                        color:
                          quiz.score >= 80
                            ? colors.success
                            : quiz.score >= 60
                            ? colors.warning
                            : colors.danger,
                      },
                    ]}
                  >
                    {quiz.score}%
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.text,
  },
  levelCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  levelIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelInfo: {
    flex: 1,
  },
  levelText: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.surface,
    marginBottom: 4,
  },
  levelSubtext: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  levelProgressContainer: {
    gap: 8,
  },
  levelProgressBar: {
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  levelProgressFill: {
    height: '100%',
    backgroundColor: colors.surface,
  },
  levelProgressText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.surface,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  miniStatCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  miniStatIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  miniStatValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.text,
  },
  miniStatLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text,
  },
  quizStatsCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  quizStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quizStatLabel: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  quizStatValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text,
  },
  subjectsStats: {
    gap: 12,
  },
  subjectStatCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  subjectStatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  subjectEmoji: {
    fontSize: 40,
  },
  subjectStatInfo: {
    flex: 1,
  },
  subjectStatName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 4,
  },
  subjectStatRating: {
    fontSize: 14,
    color: colors.textSecondary,
    textTransform: 'capitalize' as const,
  },
  subjectStatDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subjectStatItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  subjectStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.borderLight,
  },
  subjectStatItemLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  subjectStatItemValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 4,
  },
  activityDate: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  activityScore: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
});
