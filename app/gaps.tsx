import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppState, useActiveGaps } from '@/contexts/AppStateContext';
import { generateMicroLesson, generateQuiz } from '@/services/aiService';
import { MicroLesson, QuizQuestion } from '@/constants/cbse';
import colors from '@/constants/colors';
import {
  BookOpen,
  CheckCircle2,
  Play,
  Award,
} from 'lucide-react-native';

export default function GapsScreen() {
  const router = useRouter();
  const { profile, completeLesson, addXP } = useAppState();
  const activeGaps = useActiveGaps();
  const [selectedGapId, setSelectedGapId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentLesson, setCurrentLesson] = useState<MicroLesson | null>(null);
  const [currentQuiz, setCurrentQuiz] = useState<QuizQuestion[] | null>(null);

  if (!profile) {
    return null;
  }

  const handleStartLesson = async (gapId: string) => {
    const gap = activeGaps.find((g) => g.id === gapId);
    if (!gap) return;

    setLoading(true);
    setSelectedGapId(gapId);

    try {
      const lesson = await generateMicroLesson({
        subject: gap.subject,
        studentClass: profile.class,
        concept: gap.concept,
        chapter: gap.chapter,
      });

      lesson.gapId = gapId;
      setCurrentLesson(lesson);
    } catch (error) {
      console.error('Error generating lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteLesson = async () => {
    if (!currentLesson) return;

    completeLesson(currentLesson.id);
    addXP(30);

    const gap = activeGaps.find((g) => g.id === currentLesson.gapId);
    if (!gap) return;

    setLoading(true);

    try {
      const quiz = await generateQuiz({
        subject: gap.subject,
        studentClass: profile.class,
        concept: gap.concept,
        difficulty: 'easy',
        questionCount: 5,
      });

      setCurrentQuiz(quiz);
    } catch (error) {
      console.error('Error generating quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = () => {
    if (!currentQuiz) return;
    router.push({
      pathname: '/quiz' as any,
      params: { questions: JSON.stringify(currentQuiz) },
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return colors.danger;
      case 'moderate':
        return colors.warning;
      case 'minor':
        return colors.accent.blue;
      default:
        return colors.textSecondary;
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '🚨';
      case 'moderate':
        return '⚠️';
      case 'minor':
        return 'ℹ️';
      default:
        return '📌';
    }
  };

  if (currentLesson && !currentQuiz) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          <View style={styles.lessonHeader}>
            <View style={styles.lessonIconContainer}>
              <BookOpen color={colors.primary} size={32} />
            </View>
            <Text style={styles.lessonTitle}>{currentLesson.title}</Text>
          </View>

          <View style={styles.lessonContent}>
            <Text style={styles.lessonText}>{currentLesson.content}</Text>
          </View>

          {currentLesson.examples.length > 0 && (
            <View style={styles.examplesSection}>
              <Text style={styles.examplesTitle}>Examples</Text>
              {currentLesson.examples.map((example, index) => (
                <View key={index} style={styles.exampleCard}>
                  <Text style={styles.exampleNumber}>Example {index + 1}</Text>
                  <Text style={styles.exampleText}>{example}</Text>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={styles.completeButton}
            onPress={handleCompleteLesson}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.surface} size="small" />
            ) : (
              <>
                <CheckCircle2 color={colors.surface} size={20} />
                <Text style={styles.completeButtonText}>Complete & Take Quiz</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (currentQuiz) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.quizReadyContainer}>
            <View style={styles.quizReadyIcon}>
              <Award color={colors.secondary} size={48} />
            </View>
            <Text style={styles.quizReadyTitle}>Quiz Ready!</Text>
            <Text style={styles.quizReadyDescription}>
              Test your understanding with {currentQuiz.length} questions
            </Text>
            <TouchableOpacity style={styles.startQuizButton} onPress={handleStartQuiz}>
              <Play color={colors.surface} size={20} fill={colors.surface} />
              <Text style={styles.startQuizButtonText}>Start Quiz</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (activeGaps.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🎉</Text>
          <Text style={styles.emptyTitle}>No Active Gaps!</Text>
          <Text style={styles.emptyDescription}>
            Great job! You can diagnose more subjects from the dashboard.
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Back to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Bridge Your Gaps</Text>
          <Text style={styles.description}>
            Start with any gap to unlock personalized micro-lessons
          </Text>
        </View>

        <View style={styles.gapsList}>
          {activeGaps.map((gap) => (
            <View key={gap.id} style={styles.gapCard}>
              <View style={styles.gapHeader}>
                <View style={styles.gapHeaderLeft}>
                  <Text style={styles.severityIcon}>{getSeverityIcon(gap.severity)}</Text>
                  <View>
                    <Text style={styles.gapSubject}>{gap.subject}</Text>
                    <Text
                      style={[
                        styles.gapSeverity,
                        { color: getSeverityColor(gap.severity) },
                      ]}
                    >
                      {gap.severity.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={styles.gapConcept}>{gap.concept}</Text>
              <Text style={styles.gapDescription}>{gap.description}</Text>

              {gap.prerequisites.length > 0 && (
                <View style={styles.prerequisitesSection}>
                  <Text style={styles.prerequisitesTitle}>Prerequisites:</Text>
                  {gap.prerequisites.map((prereq, index) => (
                    <View key={index} style={styles.prerequisiteItem}>
                      <Text style={styles.prerequisiteBullet}>•</Text>
                      <Text style={styles.prerequisiteText}>{prereq}</Text>
                    </View>
                  ))}
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.startButton,
                  loading && selectedGapId === gap.id && styles.buttonDisabled,
                ]}
                onPress={() => handleStartLesson(gap.id)}
                disabled={loading}
              >
                {loading && selectedGapId === gap.id ? (
                  <ActivityIndicator color={colors.surface} size="small" />
                ) : (
                  <>
                    <Play color={colors.surface} size={16} fill={colors.surface} />
                    <Text style={styles.startButtonText}>Start Learning</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
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
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  gapsList: {
    gap: 16,
  },
  gapCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  gapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  gapHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  severityIcon: {
    fontSize: 28,
  },
  gapSubject: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 2,
  },
  gapSeverity: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  gapConcept: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 4,
  },
  gapDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  prerequisitesSection: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  prerequisitesTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 8,
  },
  prerequisiteItem: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  prerequisiteBullet: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  prerequisiteText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  startButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  startButtonText: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: '600' as const,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 12,
  },
  emptyDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  backButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  backButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  lessonHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  lessonIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  lessonTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.text,
    textAlign: 'center',
  },
  lessonContent: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  lessonText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 26,
  },
  examplesSection: {
    marginBottom: 20,
  },
  examplesTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 12,
  },
  exampleCard: {
    backgroundColor: colors.accent.blue + '10',
    borderLeftWidth: 4,
    borderLeftColor: colors.accent.blue,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  exampleNumber: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: colors.accent.blue,
    marginBottom: 8,
    textTransform: 'uppercase' as const,
  },
  exampleText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
  completeButton: {
    backgroundColor: colors.success,
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  completeButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  quizReadyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  quizReadyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.secondary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  quizReadyTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 12,
  },
  quizReadyDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  startQuizButton: {
    backgroundColor: colors.secondary,
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  startQuizButtonText: {
    color: colors.surface,
    fontSize: 18,
    fontWeight: '600' as const,
  },
});
