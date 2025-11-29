import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { trpc } from '@/lib/trpc';
import colors from '@/constants/colors';
import { Target, BookOpen, HelpCircle, Award, Users, TrendingUp } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function StudentDashboard() {
  const router = useRouter();
  const { profile, role } = useAuth();
  const gapsQuery = trpc.diagnostics.getGaps.useQuery();

  if (!profile || role !== 'student') {
    return null;
  }

  const studentProfile = profile as any;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.name}>{studentProfile.fullName}</Text>
          </View>
          <TouchableOpacity
            style={styles.parentButton}
            onPress={() => router.push('/(parent)' as any)}
          >
            <Users color={colors.primary} size={20} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{studentProfile.level}</Text>
            <Text style={styles.statLabel}>Level</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{studentProfile.totalPoints}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{studentProfile.currentStreak}</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
        </View>

        {gapsQuery.isLoading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator color={colors.primary} size="small" />
          </View>
        ) : gapsQuery.data && gapsQuery.data.activeGaps.length > 0 ? (
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <TrendingUp color={colors.primary} size={24} />
              <Text style={styles.progressTitle}>Your Progress</Text>
            </View>
            <View style={styles.progressStats}>
              <View style={styles.progressStat}>
                <Text style={styles.progressValue}>{gapsQuery.data.activeGaps.length}</Text>
                <Text style={styles.progressLabel}>Active Gaps</Text>
              </View>
              <View style={styles.progressStat}>
                <Text style={styles.progressValue}>{gapsQuery.data.completedGaps.length}</Text>
                <Text style={styles.progressLabel}>Completed</Text>
              </View>
              <View style={styles.progressStat}>
                <Text style={styles.progressValue}>
                  {Math.round((gapsQuery.data.completedGaps.length / (gapsQuery.data.gaps.length || 1)) * 100)}%
                </Text>
                <Text style={styles.progressLabel}>Progress</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Learning Path</Text>
            <Text style={styles.sectionDescription}>
              Start by identifying your knowledge gaps
            </Text>
          </View>
        )}

        <TouchableOpacity 
          style={styles.actionCard} 
          activeOpacity={0.7}
          onPress={() => router.push('/(student)/diagnose' as any)}
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.actionCardGradient}
          >
            <View style={styles.actionCardContent}>
              <View style={styles.actionCardIcon}>
                <Target color={colors.surface} size={28} />
              </View>
              <View style={styles.actionCardText}>
                <Text style={styles.actionCardTitle}>Diagnose My Gaps</Text>
                <Text style={styles.actionCardDescription}>
                  AI will analyze your weak areas
                </Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionCard} 
          activeOpacity={0.7}
          onPress={() => router.push('/(student)/gaps' as any)}
        >
          <View style={styles.actionCardOutline}>
            <View style={styles.actionCardContent}>
              <View style={[styles.actionCardIcon, { backgroundColor: colors.accent.green + '20' }]}>
                <BookOpen color={colors.accent.green} size={28} />
              </View>
              <View style={styles.actionCardText}>
                <Text style={[styles.actionCardTitle, { color: colors.text }]}>
                  Bridge My Gaps
                </Text>
                <Text style={[styles.actionCardDescription, { color: colors.textSecondary }]}>
                  Learn with micro-lessons
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionCard} 
          activeOpacity={0.7}
          onPress={() => router.push('/(student)/textbook-help' as any)}
        >
          <View style={styles.actionCardOutline}>
            <View style={styles.actionCardContent}>
              <View style={[styles.actionCardIcon, { backgroundColor: colors.accent.orange + '20' }]}>
                <HelpCircle color={colors.accent.orange} size={28} />
              </View>
              <View style={styles.actionCardText}>
                <Text style={[styles.actionCardTitle, { color: colors.text }]}>
                  I&apos;m Stuck!
                </Text>
                <Text style={[styles.actionCardDescription, { color: colors.textSecondary }]}>
                  Upload textbook & get help
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionCard} 
          activeOpacity={0.7}
          onPress={() => router.push('/(student)/badges' as any)}
        >
          <View style={styles.actionCardOutline}>
            <View style={styles.actionCardContent}>
              <View style={[styles.actionCardIcon, { backgroundColor: colors.accent.purple + '20' }]}>
                <Award color={colors.accent.purple} size={28} />
              </View>
              <View style={styles.actionCardText}>
                <Text style={[styles.actionCardTitle, { color: colors.text }]}>
                  View Badges
                </Text>
                <Text style={[styles.actionCardDescription, { color: colors.textSecondary }]}>
                  Track your achievements
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
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
  parentButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  name: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.text,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
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
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  actionCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionCardGradient: {
    padding: 20,
  },
  actionCardOutline: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 20,
  },
  actionCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  actionCardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionCardText: {
    flex: 1,
  },
  actionCardTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.surface,
    marginBottom: 4,
  },
  actionCardDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  loadingCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  progressCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
  },
  progressStats: {
    flexDirection: 'row',
    gap: 16,
  },
  progressStat: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  progressValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.primary,
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
