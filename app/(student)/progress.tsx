import { View, Text, StyleSheet, ScrollView, SafeAreaView, Dimensions } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { trpc } from '@/lib/trpc';
import colors from '@/constants/colors';
import { getNextLevelProgress } from '@/constants/gamification';
import { Award, BookOpen, Target, Zap, Flame } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function ProgressScreen() {
  const { profile, role } = useAuth();

  if (!profile || role !== 'student') {
    return null;
  }

  const studentProfile = profile as any;
  
  const gapsQuery = trpc.diagnostics.getGaps.useQuery();
  const badgesQuery = trpc.gamification.getBadges.useQuery(
    { studentId: studentProfile.id }
  );
  
  const levelProgress = getNextLevelProgress(studentProfile.totalPoints);
  const pointsToNextLevel = levelProgress.nextLevelPoints - studentProfile.totalPoints;
  
  const gapsClosed = gapsQuery.data?.completedGaps.length || 0;
  const totalBadges = badgesQuery.data?.badges.length || 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>Your Progress</Text>

        <View style={styles.levelCard}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.levelGradient}
          >
            <View style={styles.levelHeader}>
              <Text style={styles.levelTitle}>Level {levelProgress.currentLevel}</Text>
              <Zap color={colors.surface} size={24} />
            </View>
            <Text style={styles.levelXp}>{studentProfile.totalPoints} XP</Text>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${levelProgress.progress}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {pointsToNextLevel} XP to Level {levelProgress.nextLevel}
              </Text>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIconSmall, { backgroundColor: colors.accent.orange + '20' }]}>
              <Flame color={colors.accent.orange} size={20} />
            </View>
            <Text style={styles.statValue}>{studentProfile.currentStreak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconSmall, { backgroundColor: colors.accent.purple + '20' }]}>
              <Award color={colors.accent.purple} size={20} />
            </View>
            <Text style={styles.statValue}>{totalBadges}</Text>
            <Text style={styles.statLabel}>Badges</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconSmall, { backgroundColor: colors.accent.green + '20' }]}>
              <Target color={colors.accent.green} size={20} />
            </View>
            <Text style={styles.statValue}>{gapsClosed}</Text>
            <Text style={styles.statLabel}>Gaps Closed</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconSmall, { backgroundColor: colors.accent.blue + '20' }]}>
              <BookOpen color={colors.accent.blue} size={20} />
            </View>
            <Text style={styles.statValue}>{gapsQuery.data?.gaps.length || 0}</Text>
            <Text style={styles.statLabel}>Total Gaps</Text>
          </View>
        </View>

        {badgesQuery.data && badgesQuery.data.badges.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Badges</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.badgesRow}>
                {badgesQuery.data.badges.slice(0, 5).map((badge: any) => (
                  <View key={badge.id} style={styles.badgeMini}>
                    <View style={styles.badgeMiniIcon}>
                      <Text style={styles.badgeMiniEmoji}>{badge.icon_url}</Text>
                    </View>
                    <Text style={styles.badgeMiniName} numberOfLines={2}>
                      {badge.achievement_name}
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>
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
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 24,
  },
  levelCard: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
  },
  levelGradient: {
    padding: 24,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.surface,
  },
  levelXp: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 16,
  },
  progressBarContainer: {
    gap: 8,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.surface,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600' as const,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: (width - 52) / 2,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  statIconSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 16,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 12,
    paddingRight: 20,
  },
  badgeMini: {
    width: 80,
    alignItems: 'center',
  },
  badgeMiniIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  badgeMiniEmoji: {
    fontSize: 32,
  },
  badgeMiniName: {
    fontSize: 11,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '600' as const,
  },
});
