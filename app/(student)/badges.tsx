import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import colors from '@/constants/colors';
import { Award, Lock, TrendingUp } from 'lucide-react-native';
import { trpc } from '@/lib/trpc';
import { BADGES, RARITY_COLORS } from '@/constants/gamification';
import { LinearGradient } from 'expo-linear-gradient';

export default function BadgesScreen() {
  const statsQuery = trpc.gamification.getStats.useQuery();

  if (statsQuery.isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const badges = statsQuery.data?.badges || [];
  const stats = statsQuery.data?.stats;
  const earnedCount = badges.filter(b => b.earned).length;
  const totalCount = badges.length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Badges & Achievements</Text>
          <Text style={styles.headerSubtitle}>
            {earnedCount} of {totalCount} earned
          </Text>
        </View>

        {stats && (
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalXP}</Text>
              <Text style={styles.statLabel}>Total XP</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.level}</Text>
              <Text style={styles.statLabel}>Level</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.currentStreak}</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </View>
          </View>
        )}

        <View style={styles.badgesGrid}>
          {badges.map((badge, index) => (
            <TouchableOpacity
              key={badge.id}
              style={[
                styles.badgeCard,
                !badge.earned && styles.badgeCardLocked,
              ]}
              activeOpacity={0.8}
            >
              {badge.earned ? (
                <LinearGradient
                  colors={[
                    RARITY_COLORS[badge.rarity],
                    RARITY_COLORS[badge.rarity] + '80',
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.badgeIconContainer}
                >
                  <Text style={styles.badgeIcon}>{badge.icon}</Text>
                </LinearGradient>
              ) : (
                <View style={[styles.badgeIconContainer, styles.badgeIconLocked]}>
                  <Lock color={colors.textLight} size={24} />
                </View>
              )}
              <Text style={[
                styles.badgeName,
                !badge.earned && styles.badgeNameLocked,
              ]}>
                {badge.name}
              </Text>
              <Text style={styles.badgeDescription} numberOfLines={2}>
                {badge.description}
              </Text>
              {!badge.earned && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${badge.progress}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {Math.round(badge.progress)}%
                  </Text>
                </View>
              )}
              {badge.earned && (
                <View style={styles.badgeReward}>
                  <TrendingUp color={colors.accent.green} size={14} />
                  <Text style={styles.badgeRewardText}>+{badge.xpReward} XP</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    gap: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  badgeCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  badgeCardLocked: {
    opacity: 0.6,
  },
  badgeIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeIconLocked: {
    backgroundColor: colors.border,
  },
  badgeIcon: {
    fontSize: 32,
  },
  badgeName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeNameLocked: {
    color: colors.textSecondary,
  },
  badgeDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  progressContainer: {
    width: '100%',
    marginTop: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  badgeReward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  badgeRewardText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.accent.green,
  },
});
