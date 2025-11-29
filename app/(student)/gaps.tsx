import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Modal } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { trpc, trpcClient } from '@/lib/trpc';
import colors from '@/constants/colors';
import { Target, BookOpen, CheckCircle, X, Award } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useToast } from '@/contexts/ToastContext';

export default function GapsScreen() {
  const router = useRouter();
  const { showBadgeUnlocked, showLevelUp, showXPEarned } = useToast();
  const [selectedGap, setSelectedGap] = useState<any>(null);
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [currentQuiz, setCurrentQuiz] = useState<any>(null);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizResult, setQuizResult] = useState<any>(null);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);

  const gapsQuery = trpc.diagnostics.getGaps.useQuery();
  const generateLessonMutation = trpc.bridge.generateLesson.useMutation();
  const completeLessonMutation = trpc.bridge.completeLesson.useMutation();
  const generateQuizMutation = trpc.bridge.generateQuiz.useMutation();
  const submitQuizMutation = trpc.bridge.submitQuiz.useMutation();

  const activeGaps = gapsQuery.data?.activeGaps || [];
  const completedGaps = gapsQuery.data?.completedGaps || [];

  const handleStartLesson = async (gap: any) => {
    setSelectedGap(gap);
    try {
      const result = await generateLessonMutation.mutateAsync({
        gapConcept: gap.concept,
        chapter: gap.chapter,
        subject: gap.subject,
      });
      setCurrentLesson(result.lesson);
      setShowLessonModal(true);
    } catch (error) {
      console.error('[GapsScreen] Error generating lesson:', error);
    }
  };

  const handleCompleteLesson = async () => {
    if (!selectedGap) return;

    try {
      const result = await completeLessonMutation.mutateAsync({
        gapConcept: selectedGap.concept,
        chapter: selectedGap.chapter,
      });

      console.log('[GapsScreen] Lesson completed, XP earned:', result.xpEarned);
      showXPEarned(result.xpEarned, 'Lesson completed!');
      setShowLessonModal(false);

      const quizResult = await generateQuizMutation.mutateAsync({
        concept: selectedGap.concept,
        subject: selectedGap.subject,
        difficulty: 'medium',
        questionCount: 5,
      });

      setCurrentQuiz(quizResult);
      setQuizAnswers(new Array(quizResult.questions.length).fill(-1));
      setShowQuizModal(true);
    } catch (error) {
      console.error('[GapsScreen] Error:', error);
      setShowLessonModal(false);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!currentQuiz || !selectedGap) return;

    try {
      const result = await submitQuizMutation.mutateAsync({
        concept: selectedGap.concept,
        chapter: selectedGap.chapter,
        subject: selectedGap.subject,
        questions: currentQuiz.questions,
        answers: quizAnswers,
      });

      setQuizResult(result);
      setShowQuizModal(false);
      
      if (result.newBadges && result.newBadges.length > 0) {
        result.newBadges.forEach((badge: any, index: number) => {
          setTimeout(() => {
            showBadgeUnlocked(badge.name, badge.icon, badge.description);
          }, index * 2000);
        });
      }
      
      const statsQuery = await trpcClient.gamification.getStats.query();
      const oldLevel = statsQuery.stats.level - (result.newLevel > statsQuery.stats.level ? 1 : 0);
      if (result.newLevel > oldLevel) {
        const delay = (result.newBadges?.length || 0) * 2000 + 1000;
        setTimeout(() => showLevelUp(result.newLevel), delay);
      }
      
      setShowResultModal(true);

      await gapsQuery.refetch();
    } catch (error) {
      console.error('[GapsScreen] Error submitting quiz:', error);
    }
  };

  const handleCloseResult = () => {
    setShowResultModal(false);
    setQuizResult(null);
    setCurrentQuiz(null);
    setCurrentLesson(null);
    setSelectedGap(null);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return colors.accent.red;
      case 'moderate': return colors.accent.orange;
      case 'minor': return colors.accent.orange;
      default: return colors.textSecondary;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Target color={colors.primary} size={32} />
          <Text style={styles.title}>Bridge Your Gaps</Text>
          <Text style={styles.subtitle}>
            Complete micro-lessons and quizzes to master concepts
          </Text>
        </View>

        {gapsQuery.isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={colors.primary} size="large" />
            <Text style={styles.loadingText}>Loading your gaps...</Text>
          </View>
        ) : activeGaps.length === 0 && completedGaps.length === 0 ? (
          <View style={styles.emptyState}>
            <Target color={colors.textLight} size={64} />
            <Text style={styles.emptyTitle}>No Gaps Yet</Text>
            <Text style={styles.emptyDescription}>
              Run a diagnosis first to identify your knowledge gaps
            </Text>
            <TouchableOpacity
              style={styles.diagnoseButton}
              onPress={() => router.push('/(student)/diagnose' as any)}
            >
              <Text style={styles.diagnoseButtonText}>Diagnose Now</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {activeGaps.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Active Gaps ({activeGaps.length})</Text>
                {activeGaps.map((gap: any) => (
                  <View key={gap.id} style={styles.gapCard}>
                    <View style={styles.gapHeader}>
                      <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(gap.severity) + '20' }]}>
                        <Text style={[styles.severityText, { color: getSeverityColor(gap.severity) }]}>
                          {gap.severity}
                        </Text>
                      </View>
                      <View style={[styles.subjectBadge, { backgroundColor: gap.subjectColor + '20' }]}>
                        <Text style={[styles.subjectBadgeText, { color: gap.subjectColor }]}>
                          {gap.subject}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.gapConcept}>{gap.concept}</Text>
                    <Text style={styles.gapChapter}>{gap.chapter}</Text>
                    <Text style={styles.gapDescription}>{gap.description}</Text>
                    
                    <TouchableOpacity
                      style={styles.startButton}
                      onPress={() => handleStartLesson(gap)}
                      activeOpacity={0.7}
                    >
                      <LinearGradient
                        colors={[colors.primary, colors.primaryDark]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.startButtonGradient}
                      >
                        <BookOpen color={colors.surface} size={20} />
                        <Text style={styles.startButtonText}>Start Learning</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {completedGaps.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Completed ({completedGaps.length})</Text>
                {completedGaps.map((gap: any) => (
                  <View key={gap.id} style={[styles.gapCard, styles.completedGapCard]}>
                    <View style={styles.gapHeader}>
                      <CheckCircle color={colors.accent.green} size={24} />
                      <Text style={styles.completedLabel}>Mastered</Text>
                    </View>
                    <Text style={styles.gapConcept}>{gap.concept}</Text>
                    <Text style={styles.gapChapter}>{gap.chapter}</Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      <Modal visible={showLessonModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Micro-Lesson</Text>
              <TouchableOpacity onPress={() => setShowLessonModal(false)}>
                <X color={colors.text} size={24} />
              </TouchableOpacity>
            </View>
            
            {generateLessonMutation.isPending ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator color={colors.primary} size="large" />
                <Text style={styles.loadingText}>Generating your lesson...</Text>
              </View>
            ) : currentLesson ? (
              <ScrollView style={styles.lessonScroll}>
                <Text style={styles.lessonTitle}>{currentLesson.title}</Text>
                <Text style={styles.lessonContent}>{currentLesson.content}</Text>
                
                <Text style={styles.examplesTitle}>Examples:</Text>
                {currentLesson.examples.map((example: string, idx: number) => (
                  <View key={idx} style={styles.exampleCard}>
                    <Text style={styles.exampleNumber}>{idx + 1}</Text>
                    <Text style={styles.exampleText}>{example}</Text>
                  </View>
                ))}

                <TouchableOpacity
                  style={styles.continueButton}
                  onPress={handleCompleteLesson}
                  disabled={completeLessonMutation.isPending}
                >
                  <LinearGradient
                    colors={[colors.primary, colors.primaryDark]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.continueButtonGradient}
                  >
                    {completeLessonMutation.isPending ? (
                      <ActivityIndicator color={colors.surface} />
                    ) : (
                      <Text style={styles.continueButtonText}>Continue to Quiz</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>

      <Modal visible={showQuizModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Practice Quiz</Text>
              <TouchableOpacity onPress={() => setShowQuizModal(false)}>
                <X color={colors.text} size={24} />
              </TouchableOpacity>
            </View>

            {generateQuizMutation.isPending ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator color={colors.primary} size="large" />
                <Text style={styles.loadingText}>Generating quiz...</Text>
              </View>
            ) : currentQuiz ? (
              <ScrollView style={styles.quizScroll}>
                {currentQuiz.questions.map((question: any, qIdx: number) => (
                  <View key={question.id} style={styles.questionCard}>
                    <Text style={styles.questionNumber}>Question {qIdx + 1}</Text>
                    <Text style={styles.questionText}>{question.question}</Text>
                    
                    <View style={styles.optionsContainer}>
                      {question.options.map((option: string, oIdx: number) => (
                        <TouchableOpacity
                          key={oIdx}
                          style={[
                            styles.optionButton,
                            quizAnswers[qIdx] === oIdx && styles.optionButtonSelected,
                          ]}
                          onPress={() => {
                            const newAnswers = [...quizAnswers];
                            newAnswers[qIdx] = oIdx;
                            setQuizAnswers(newAnswers);
                          }}
                        >
                          <View style={[
                            styles.optionRadio,
                            quizAnswers[qIdx] === oIdx && styles.optionRadioSelected,
                          ]} />
                          <Text style={[
                            styles.optionText,
                            quizAnswers[qIdx] === oIdx && styles.optionTextSelected,
                          ]}>
                            {option}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                ))}

                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    quizAnswers.includes(-1) && styles.submitButtonDisabled,
                  ]}
                  onPress={handleSubmitQuiz}
                  disabled={quizAnswers.includes(-1) || submitQuizMutation.isPending}
                >
                  <LinearGradient
                    colors={quizAnswers.includes(-1) ? [colors.border, colors.border] : [colors.primary, colors.primaryDark]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.submitButtonGradient}
                  >
                    {submitQuizMutation.isPending ? (
                      <ActivityIndicator color={colors.surface} />
                    ) : (
                      <Text style={styles.submitButtonText}>Submit Answers</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>

      <Modal visible={showResultModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.resultModal}>
            <View style={styles.resultHeader}>
              <Award color={quizResult?.passed ? colors.accent.green : colors.accent.orange} size={64} />
            </View>
            <Text style={styles.resultTitle}>
              {quizResult?.passed ? 'Great Job!' : 'Keep Practicing!'}
            </Text>
            <Text style={styles.resultScore}>{quizResult?.score}%</Text>
            <Text style={styles.resultDetails}>
              {quizResult?.correctCount} out of {quizResult?.totalQuestions} correct
            </Text>
            <View style={styles.xpBadge}>
              <Text style={styles.xpText}>+{quizResult?.xpEarned} XP</Text>
            </View>

            <TouchableOpacity style={styles.closeButton} onPress={handleCloseResult}>
              <Text style={styles.closeButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text,
  },
  emptyDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  diagnoseButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  diagnoseButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.surface,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 12,
  },
  gapCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  completedGapCard: {
    opacity: 0.7,
  },
  gapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    fontSize: 12,
    fontWeight: '600' as const,
    textTransform: 'capitalize',
  },
  subjectBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  subjectBadgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  completedLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.accent.green,
  },
  gapConcept: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 4,
  },
  gapChapter: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  gapDescription: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 16,
  },
  startButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.surface,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text,
  },
  modalLoading: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  lessonScroll: {
    padding: 20,
  },
  lessonTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 16,
  },
  lessonContent: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    marginBottom: 24,
  },
  examplesTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 12,
  },
  exampleCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    gap: 12,
  },
  exampleNumber: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  exampleText: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
  continueButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 24,
    marginBottom: 20,
  },
  continueButtonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.surface,
  },
  quizScroll: {
    padding: 20,
  },
  questionCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.primary,
    marginBottom: 8,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 16,
    lineHeight: 22,
  },
  optionsContainer: {
    gap: 8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
  },
  optionButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  optionRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
  },
  optionRadioSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  optionTextSelected: {
    color: colors.primary,
    fontWeight: '600' as const,
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 24,
    marginBottom: 20,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.surface,
  },
  resultModal: {
    backgroundColor: colors.background,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  resultHeader: {
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 8,
  },
  resultScore: {
    fontSize: 48,
    fontWeight: '700' as const,
    color: colors.primary,
    marginBottom: 8,
  },
  resultDetails: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  xpBadge: {
    backgroundColor: colors.accent.green + '20',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
  },
  xpText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.accent.green,
  },
  closeButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.surface,
  },
});
