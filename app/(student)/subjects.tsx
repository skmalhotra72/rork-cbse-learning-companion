import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import colors from '@/constants/colors';
import { BookOpen } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function SubjectsScreen() {
  const router = useRouter();
  const { profile, role } = useAuth();

  if (!profile || role !== 'student') {
    return null;
  }

  const studentProfile = profile as any;
  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English'];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>Your Subjects</Text>
        <Text style={styles.subtitle}>Class {studentProfile.grade} • CBSE</Text>

        <View style={styles.subjectsList}>
          {subjects.map((subject, index) => (
            <TouchableOpacity
              key={subject}
              style={styles.subjectCard}
              onPress={() => router.push(`/(student)/subject/${subject}` as any)}
            >
              <View style={[styles.subjectIcon, { backgroundColor: colors.accent.blue + '20' }]}>
                <BookOpen color={colors.accent.blue} size={24} />
              </View>
              <View style={styles.subjectInfo}>
                <Text style={styles.subjectName}>{subject}</Text>
                <Text style={styles.subjectProgress}>{(index + 1) * 15}% complete</Text>
              </View>
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  subjectsList: {
    gap: 12,
  },
  subjectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  subjectIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subjectInfo: {
    flex: 1,
  },
  subjectName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 4,
  },
  subjectProgress: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
