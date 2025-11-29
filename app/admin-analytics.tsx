import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Stack } from 'expo-router';
import { trpc } from '@/lib/trpc';
import { Activity, TrendingUp, Users, Zap } from 'lucide-react-native';

export default function AdminAnalyticsScreen() {
  const [refreshing, setRefreshing] = React.useState(false);

  const systemHealthQuery = trpc.analytics.getSystemHealth.useQuery();
  const aiAnalyticsQuery = trpc.analytics.getAIAnalytics.useQuery({});
  const studentStatsQuery = trpc.analytics.getStudentStats.useQuery();

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      systemHealthQuery.refetch(),
      aiAnalyticsQuery.refetch(),
      studentStatsQuery.refetch(),
    ]);
    setRefreshing(false);
  }, [systemHealthQuery, aiAnalyticsQuery, studentStatsQuery]);

  const isLoading =
    systemHealthQuery.isLoading ||
    aiAnalyticsQuery.isLoading ||
    studentStatsQuery.isLoading;

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <Stack.Screen options={{ title: 'Admin Analytics' }} />
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  const systemHealth = systemHealthQuery.data;
  const aiAnalytics = aiAnalyticsQuery.data;
  const studentStats = studentStatsQuery.data;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Admin Analytics',
          headerStyle: { backgroundColor: '#f9fafb' },
        }}
      />
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Health</Text>
          <View style={styles.grid}>
            <StatCard
              icon={<Users size={24} color="#6366f1" />}
              label="Total Users"
              value={systemHealth?.totalUsers || 0}
              color="#6366f1"
            />
            <StatCard
              icon={<Activity size={24} color="#10b981" />}
              label="Active Today"
              value={systemHealth?.activeUsersToday || 0}
              color="#10b981"
            />
            <StatCard
              icon={<Zap size={24} color="#f59e0b" />}
              label="AI Calls"
              value={systemHealth?.totalAICalls || 0}
              color="#f59e0b"
            />
            <StatCard
              icon={<TrendingUp size={24} color="#ef4444" />}
              label="Error Rate"
              value={`${systemHealth?.errorRate || 0}%`}
              color="#ef4444"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Analytics</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Success Rate</Text>
              <Text style={styles.value}>
                {aiAnalytics?.successRate || 0}%
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Avg Response Time</Text>
              <Text style={styles.value}>
                {aiAnalytics?.averageDuration || 0}ms
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Total Tokens</Text>
              <Text style={styles.value}>
                {(aiAnalytics?.totalTokens || 0).toLocaleString()}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Total Cost</Text>
              <Text style={styles.value}>
                ${aiAnalytics?.totalCost?.toFixed(2) || '0.00'}
              </Text>
            </View>
          </View>

          {aiAnalytics?.callsByType && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Calls by Type</Text>
              {Object.entries(aiAnalytics.callsByType).map(([type, count]) => (
                <View key={type} style={styles.row}>
                  <Text style={styles.label}>{type}</Text>
                  <Text style={styles.value}>{count}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Student Statistics</Text>
          <View style={styles.grid}>
            <StatCard
              icon={<Users size={24} color="#8b5cf6" />}
              label="Total Students"
              value={typeof studentStats?.totalStudents === 'number' ? studentStats.totalStudents : 0}
              color="#8b5cf6"
            />
            <StatCard
              icon={<Activity size={24} color="#ec4899" />}
              label="Diagnostics"
              value={typeof studentStats?.totalDiagnostics === 'number' ? studentStats.totalDiagnostics : 0}
              color="#ec4899"
            />
            <StatCard
              icon={<Zap size={24} color="#14b8a6" />}
              label="Quiz Attempts"
              value={typeof studentStats?.totalQuizAttempts === 'number' ? studentStats.totalQuizAttempts : 0}
              color="#14b8a6"
            />
            <StatCard
              icon={<TrendingUp size={24} color="#f97316" />}
              label="Subjects"
              value={typeof studentStats?.totalSubjects === 'number' ? studentStats.totalSubjects : 0}
              color="#f97316"
            />
          </View>
        </View>

        {studentStats?.leaderboard && studentStats.leaderboard.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Students</Text>
            <View style={styles.card}>
              {studentStats.leaderboard.map((student, index) => (
                <View key={student.id} style={styles.leaderboardItem}>
                  <View style={styles.leaderboardLeft}>
                    <Text style={styles.leaderboardRank}>#{index + 1}</Text>
                    <Text style={styles.leaderboardName}>
                      {student.full_name}
                    </Text>
                  </View>
                  <View style={styles.leaderboardRight}>
                    <Text style={styles.leaderboardPoints}>
                      {student.total_points} XP
                    </Text>
                    <Text style={styles.leaderboardLevel}>
                      Lvl {student.level}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {studentStats?.recentActivity &&
          studentStats.recentActivity.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <View style={styles.card}>
                {studentStats.recentActivity.map((activity) => (
                  <View key={activity.id} style={styles.activityItem}>
                    <View style={styles.activityLeft}>
                      <Text style={styles.activityType}>
                        {activity.session_type}
                      </Text>
                      <Text style={styles.activityStudent}>
                        {(activity as any).student_profiles?.full_name ||
                          'Unknown'}
                      </Text>
                    </View>
                    <View style={styles.activityRight}>
                      <Text style={styles.activityPoints}>
                        +{activity.points_earned} XP
                      </Text>
                      <Text style={styles.activityTime}>
                        {activity.duration_minutes}m
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
      </ScrollView>
    </View>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statIcon}>{icon}</View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: 150,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statIcon: {
    marginBottom: 8,
  },
  statContent: {
    gap: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  leaderboardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  leaderboardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  leaderboardRank: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6366f1',
    width: 32,
  },
  leaderboardName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  leaderboardRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  leaderboardPoints: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  leaderboardLevel: {
    fontSize: 12,
    color: '#6b7280',
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  activityLeft: {
    flex: 1,
    gap: 4,
  },
  activityType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    textTransform: 'capitalize',
  },
  activityStudent: {
    fontSize: 12,
    color: '#6b7280',
  },
  activityRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  activityPoints: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10b981',
  },
  activityTime: {
    fontSize: 12,
    color: '#6b7280',
  },
});
