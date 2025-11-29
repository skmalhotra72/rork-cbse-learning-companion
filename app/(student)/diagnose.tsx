import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';

import { trpc } from '@/lib/trpc';
import colors from '@/constants/colors';
import { Target, ChevronRight, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const DIFFICULTY_OPTIONS = [
  { value: 'struggling', label: 'Struggling', emoji: '😓' },
  { value: 'okay', label: 'Okay', emoji: '😐' },
  { value: 'confident', label: 'Confident', emoji: '😊' },
  { value: 'expert', label: 'Expert', emoji: '🚀' },
] as const;

export default function DiagnoseScreen() {
  const router = useRouter();
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selfRating, setSelfRating] = useState<string | null>(null);
  const [painPoints, setPainPoints] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);

  const subjectsQuery = trpc.diagnostics.getSubjects.useQuery();
  const runDiagnosisMutation = trpc.diagnostics.runDiagnosis.useMutation();

  const handleRunDiagnosis = async () => {
    if (!selectedSubject || !selfRating) return;

    setIsRunning(true);
    try {
      const painPointsArray = painPoints
        .split('\n')
        .map(p => p.trim())
        .filter(p => p.length > 0);

      const result = await runDiagnosisMutation.mutateAsync({
        subjectId: selectedSubject,
        selfRating: selfRating as any,
        painPoints: painPointsArray,
      });

      console.log('[DiagnoseScreen] Diagnosis completed, XP awarded:', result.xpAwarded);
      router.push('/(student)/gaps' as any);
    } catch (error) {
      console.error('[DiagnoseScreen] Error running diagnosis:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const subjects = subjectsQuery.data || [];
  const canProceed = selectedSubject && selfRating;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Target color={colors.primary} size={32} />
          </View>
          <Text style={styles.title}>Let&apos;s Find Your Knowledge Gaps</Text>
          <Text style={styles.subtitle}>
            Our AI will analyze your responses to identify where you need support
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Select a Subject</Text>
          {subjectsQuery.isLoading ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />
          ) : (
            <View style={styles.optionsGrid}>
              {subjects.map((subject: any) => (
                <TouchableOpacity
                  key={subject.id}
                  style={[
                    styles.subjectCard,
                    selectedSubject === subject.id && styles.subjectCardSelected,
                  ]}
                  onPress={() => setSelectedSubject(subject.id)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.subjectColorBadge,
                      { backgroundColor: subject.color || colors.primary },
                    ]}
                  />
                  <Text
                    style={[
                      styles.subjectName,
                      selectedSubject === subject.id && styles.subjectNameSelected,
                    ]}
                  >
                    {subject.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. How do you feel about this subject?</Text>
          <View style={styles.optionsGrid}>
            {DIFFICULTY_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.difficultyCard,
                  selfRating === option.value && styles.difficultyCardSelected,
                ]}
                onPress={() => setSelfRating(option.value)}
                activeOpacity={0.7}
              >
                <Text style={styles.difficultyEmoji}>{option.emoji}</Text>
                <Text
                  style={[
                    styles.difficultyLabel,
                    selfRating === option.value && styles.difficultyLabelSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. What are you struggling with? (Optional)</Text>
          <Text style={styles.sectionDescription}>
            Write each point on a new line. For example: &quot;I don&apos;t understand quadratic equations&quot;
          </Text>
          <TextInput
            style={styles.textArea}
            value={painPoints}
            onChangeText={setPainPoints}
            placeholder="List your pain points here..."
            placeholderTextColor={colors.textLight}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={[styles.analyzeButton, !canProceed && styles.analyzeButtonDisabled]}
          onPress={handleRunDiagnosis}
          disabled={!canProceed || isRunning}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={canProceed ? [colors.primary, colors.primaryDark] : [colors.border, colors.border]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.analyzeButtonGradient}
          >
            {isRunning ? (
              <ActivityIndicator color={colors.surface} size="small" />
            ) : (
              <>
                <Sparkles color={colors.surface} size={24} />
                <Text style={styles.analyzeButtonText}>Analyze with AI</Text>
                <ChevronRight color={colors.surface} size={24} />
              </>
            )}
          </LinearGradient>
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
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  optionsGrid: {
    gap: 12,
  },
  subjectCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: colors.border,
  },
  subjectCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  subjectColorBadge: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
  },
  subjectNameSelected: {
    color: colors.primary,
  },
  difficultyCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: colors.border,
  },
  difficultyCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  difficultyEmoji: {
    fontSize: 24,
  },
  difficultyLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
  },
  difficultyLabelSelected: {
    color: colors.primary,
  },
  textArea: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    minHeight: 120,
    borderWidth: 1,
    borderColor: colors.border,
  },
  analyzeButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 16,
  },
  analyzeButtonDisabled: {
    opacity: 0.5,
  },
  analyzeButtonGradient: {
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  analyzeButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.surface,
  },
});
