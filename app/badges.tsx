import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppState, useUnlockedBadges } from '@/contexts/AppStateContext';
import { BADGE_DEFINITIONS } from '@/constants/cbse';
import colors from '@/constants/colors';
import { X, Award, Lock, TrendingUp } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function BadgesScreen() {
  const router = useRouter();
  const { progress } = useAppState();
  const unlockedBadges = useUnlockedBadges();

  const unlockedCount = unlockedBadges.length;
  const totalCount = BADGE_DEFINITIONS.length;
  const completionPercentage = Math.round((unlockedCount / totalCount) * 100);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <X color={colors.text} size={24} />
          </TouchableOpacity>
          <Text style={styles.title}>Badges</Text>
          <View style={{ width: 24 }} />
        </View>

        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statsCard}
        >
          <View style={styles.statsIconContainer}>
            <Award color={colors.surface} size={48} />
          </View>
          <Text style={styles.statsValue}>
            {unlockedCount} / {totalCount}
          </Text>
          <Text style={styles.statsLabel}>Badges Unlocked</Text>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${completionPercentage}%` }]} />
            </View>
            <Text style={styles.progressText}>{completionPercentage}% Complete</Text>
          </View>
        </LinearGradient>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Unlocked</Text>
          {unlockedBadges.length === 0 ? (
            <View style={styles.emptyState}>
              <Lock color={colors.textLight} size={48} />
              <Text style={styles.emptyStateText}>No badges unlocked yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Complete lessons and quizzes to unlock your first badge!
              </Text>
            </View>
          ) : (
            <View style={styles.badgesGrid}>
              {unlockedBadges.map((badge) => (
                <View key={badge.id} style={styles.badgeCard}>
                  <View style={[styles.badgeIcon, styles.badgeIconUnlocked]}>
                    <Text style={styles.badgeEmoji}>{badge.icon}</Text>
                  </View>
                  <Text style={styles.badgeName}>{badge.name}</Text>
                  <Text style={styles.badgeDescription}>{badge.description}</Text>
                  {badge.earnedAt && (
                    <Text style={styles.badgeDate}>
                      {new Date(badge.earnedAt).toLocaleDateString()}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Locked</Text>
          <View style={styles.badgesGrid}>
            {BADGE_DEFINITIONS.filter((b) => !progress.badges.includes(b.id)).map((badge) => (
              <View key={badge.id} style={[styles.badgeCard, styles.badgeCardLocked]}>
                <View style={[styles.badgeIcon, styles.badgeIconLocked]}>
                  <Lock color={colors.textLight} size={24} />
                </View>
                <Text style={styles.badgeNameLocked}>{badge.name}</Text>
                <Text style={styles.badgeDescriptionLocked}>{badge.description}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.motivationCard}>
          <TrendingUp color={colors.primary} size={32} />
          <Text style={styles.motivationText}>
            Keep learning to unlock more badges and rewards!
          </Text>
        </View>
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
  statsCard: {
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 32,
  },
  statsIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsValue: {
    fontSize: 48,
    fontWeight: '700' as const,
    color: colors.surface,
    marginBottom: 8,
  },
  statsLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 24,
  },
  progressBarContainer: {
    width: '100%',
    gap: 8,
  },
  progressBar: {
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.surface,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.surface,
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 16,
  },
  emptyState: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badgeCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  badgeCardLocked: {
    opacity: 0.6,
  },
  badgeIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeIconUnlocked: {
    backgroundColor: colors.primary + '20',
  },
  badgeIconLocked: {
    backgroundColor: colors.borderLight,
  },
  badgeEmoji: {
    fontSize: 40,
  },
  badgeName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.text,
    textAlign: 'center',
  },
  badgeNameLocked: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  badgeDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  badgeDescriptionLocked: {
    fontSize: 13,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 18,
  },
  badgeDate: {
    fontSize: 11,
    color: colors.primary,
    marginTop: 4,
  },
  motivationCard: {
    backgroundColor: colors.primary + '10',
    borderRadius: 16,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  motivationText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.text,
    lineHeight: 22,
  },
});
