import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppState } from '@/contexts/AppStateContext';
import colors from '@/constants/colors';
import { Flame, Star, TrendingUp, BookOpen, Target, Award, HelpCircle, Users } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function DashboardScreen() {
  const router = useRouter();
  const { profile, progress } = useAppState();

  if (!profile) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.name}>{profile.name}!</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.parentButton}
              onPress={() => router.push('/parent' as any)}
            >
              <Users color={colors.primary} size={20} />
            </TouchableOpacity>
            <View style={styles.levelBadge}>
              <Star color={colors.secondary} size={16} fill={colors.secondary} />
              <Text style={styles.levelText}>Level {progress.level}</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: colors.accent.orange + '20' }]}>
              <Flame color={colors.accent.orange} size={24} />
            </View>
            <Text style={styles.statValue}>{progress.streakDays}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push('/progress' as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.statIcon, { backgroundColor: colors.accent.blue + '20' }]}>
              <TrendingUp color={colors.accent.blue} size={24} />
            </View>
            <Text style={styles.statValue}>{progress.xp}</Text>
            <Text style={styles.statLabel}>Total XP</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push('/badges' as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.statIcon, { backgroundColor: colors.accent.purple + '20' }]}>
              <Award color={colors.accent.purple} size={24} />
            </View>
            <Text style={styles.statValue}>{progress.badges.length}</Text>
            <Text style={styles.statLabel}>Badges</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Learning Path</Text>
          <Text style={styles.sectionDescription}>
            Start by identifying your knowledge gaps
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.actionCard} 
          activeOpacity={0.7}
          onPress={() => router.push('/diagnose' as any)}
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
          onPress={() => router.push('/gaps' as any)}
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
          onPress={() => router.push('/stuck' as any)}
        >
          <View style={styles.actionCardOutline}>
            <View style={styles.actionCardContent}>
              <View style={[styles.actionCardIcon, { backgroundColor: colors.accent.orange + '20' }]}>
                <HelpCircle color={colors.accent.orange} size={28} />
              </View>
              <View style={styles.actionCardText}>
                <Text style={[styles.actionCardTitle, { color: colors.text }]}>
                  {`I'm Stuck!`}
                </Text>
                <Text style={[styles.actionCardDescription, { color: colors.textSecondary }]}>
                  Upload textbook & get help
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Subjects</Text>
        </View>

        <View style={styles.subjectsGrid}>
          {profile.subjects.map((subject) => {
            const rating = profile.subjectRatings[subject];
            let emoji = '📚';
            if (rating === 'struggling') emoji = '😰';
            else if (rating === 'okay') emoji = '😐';
            else if (rating === 'confident') emoji = '😊';
            else if (rating === 'expert') emoji = '🚀';

            return (
              <TouchableOpacity key={subject} style={styles.subjectCard} activeOpacity={0.7}>
                <Text style={styles.subjectEmoji}>{emoji}</Text>
                <Text style={styles.subjectName}>{subject}</Text>
                <Text style={styles.subjectRating}>{rating}</Text>
              </TouchableOpacity>
            );
          })}
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary + '20',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  levelText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.secondary,
  },
  statsGrid: {
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
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
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
  subjectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  subjectCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  subjectEmoji: {
    fontSize: 32,
  },
  subjectName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text,
    textAlign: 'center',
  },
  subjectRating: {
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: 'capitalize' as const,
  },
});
