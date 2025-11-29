import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import colors from '@/constants/colors';
import { TrendingUp, Award, BookOpen, Target } from 'lucide-react-native';

export default function ProgressScreen() {
  const { profile, role } = useAuth();

  if (!profile || role !== 'student') {
    return null;
  }

  const studentProfile = profile as any;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>Your Progress</Text>

        <View style={styles.statsCard}>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: colors.accent.blue + '20' }]}>
                <TrendingUp color={colors.accent.blue} size={20} />
              </View>
              <View>
                <Text style={styles.statValue}>{studentProfile.totalPoints}</Text>
                <Text style={styles.statLabel}>Total Points</Text>
              </View>
            </View>

            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: colors.accent.purple + '20' }]}>
                <Award color={colors.accent.purple} size={20} />
              </View>
              <View>
                <Text style={styles.statValue}>{studentProfile.level}</Text>
                <Text style={styles.statLabel}>Level</Text>
              </View>
            </View>
          </View>

          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: colors.accent.orange + '20' }]}>
                <BookOpen color={colors.accent.orange} size={20} />
              </View>
              <View>
                <Text style={styles.statValue}>0</Text>
                <Text style={styles.statLabel}>Lessons</Text>
              </View>
            </View>

            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: colors.accent.green + '20' }]}>
                <Target color={colors.accent.green} size={20} />
              </View>
              <View>
                <Text style={styles.statValue}>0</Text>
                <Text style={styles.statLabel}>Gaps Closed</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subject Performance</Text>
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>Chart coming soon</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>Activity feed coming soon</Text>
          </View>
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
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 24,
  },
  statsCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    gap: 16,
    marginBottom: 24,
  },
  statRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
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
  placeholder: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
