import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { trpc } from '@/lib/trpc';
import colors from '@/constants/colors';
import { BADGES, RARITY_COLORS, RARITY_GRADIENTS } from '@/constants/gamification';
import { Award, Lock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function BadgesScreen() {
  const { profile, role } = useAuth();
  const studentProfile = profile as any;
  
  const badgesQuery = trpc.gamification.getBadges.useQuery(
    { studentId: studentProfile?.id },
    { enabled: !!studentProfile?.id && role === 'student' }
  );

  if (!profile || role !== 'student') {
    return null;
  }

  const earnedBadgeIds = new Set(
    (badgesQuery.data?.badges || []).map((b: any) => b.metadata?.badgeId)
  );

  const groupedBadges = {
    common: BADGES.filter((b) => b.rarity === 'common'),
    rare: BADGES.filter((b) => b.rarity === 'rare'),
    epic: BADGES.filter((b) => b.rarity === 'epic'),
    legendary: BADGES.filter((b) => b.rarity === 'legendary'),
  };

  const rarityOrder: Array<'legendary' | 'epic' | 'rare' | 'common'> = ['legendary', 'epic', 'rare', 'common'];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Award color={colors.primary} size={32} />
          <Text style={styles.title}>Badges & Achievements</Text>
          <Text style={styles.subtitle}>
            {badgesQuery.data?.badges.length || 0} / {BADGES.length} unlocked
          </Text>
        </View>

        {badgesQuery.isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : (
          rarityOrder.map((rarity) => (
            <View key={rarity} style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.rarityDot, { backgroundColor: RARITY_COLORS[rarity] }]} />
                <Text style={styles.sectionTitle}>
                  {rarity.charAt(0).toUpperCase() + rarity.slice(1)} Badges
                </Text>
              </View>
              <View style={styles.badgesGrid}>
                {groupedBadges[rarity].map((badge) => {
                  const isUnlocked = earnedBadgeIds.has(badge.id);
                  return (
                    <View key={badge.id} style={styles.badgeCard}>
                      <LinearGradient
                        colors={isUnlocked ? RARITY_GRADIENTS[rarity] : [colors.surfaceLight, colors.border]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.badgeGradient}
                      >
                        {isUnlocked ? (
                          <Text style={styles.badgeIcon}>{badge.icon}</Text>
                        ) : (
                          <Lock color={colors.textLight} size={24} />
                        )}
                      </LinearGradient>
                      <Text style={[styles.badgeName, !isUnlocked && styles.lockedText]}>
                        {badge.name}
                      </Text>
                      <Text style={[styles.badgeDesc, !isUnlocked && styles.lockedText]}>
                        {badge.description}
                      </Text>
                      {!isUnlocked && (
                        <Text style={styles.badgeRequirement}>
                          {badge.requirement.type === 'streak' && `${badge.requirement.value} day streak`}
                          {badge.requirement.type === 'points' && `${badge.requirement.value} points`}
                          {badge.requirement.type === 'gaps_closed' && `Close ${badge.requirement.value} gaps`}
                          {badge.requirement.type === 'quizzes' && `${badge.requirement.value} quizzes`}
                          {badge.requirement.type === 'perfect_scores' && `${badge.requirement.value} perfect scores`}
                          {badge.requirement.type === 'level' && `Reach level ${badge.requirement.value}`}
                        </Text>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          ))
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
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.text,
    marginTop: 12,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  rarityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badgeCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeIcon: {
    fontSize: 40,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  badgeRequirement: {
    fontSize: 11,
    color: colors.textLight,
    textAlign: 'center',
    fontWeight: '600' as const,
  },
  lockedText: {
    opacity: 0.5,
  },
});
