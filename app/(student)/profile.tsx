import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import colors from '@/constants/colors';
import { LogOut } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, role, signOut } = useAuth();

  if (!profile || role !== 'student') {
    return null;
  }

  const studentProfile = profile as any;

  const handleLogout = () => {
    signOut();
    router.replace('/login' as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {studentProfile.fullName[0].toUpperCase()}
            </Text>
          </View>
          <Text style={styles.name}>{studentProfile.fullName}</Text>
          <Text style={styles.email}>{studentProfile.email}</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Grade</Text>
            <Text style={styles.infoValue}>Class {studentProfile.grade}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Board</Text>
            <Text style={styles.infoValue}>{studentProfile.board}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Level</Text>
            <Text style={styles.infoValue}>{studentProfile.level}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Current Streak</Text>
            <Text style={styles.infoValue}>{studentProfile.currentStreak} days</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleLogout}>
            <LogOut color={colors.textSecondary} size={20} />
            <Text style={styles.actionText}>Logout</Text>
          </TouchableOpacity>
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
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: colors.surface,
  },
  name: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    gap: 16,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
  },
  actions: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
  },
});
