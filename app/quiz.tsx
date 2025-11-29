import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Animated,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAppState } from '@/contexts/AppStateContext';
import { QuizQuestion } from '@/constants/cbse';
import colors from '@/constants/colors';
import { CheckCircle2, XCircle, Trophy, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function QuizScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { addQuizResult, addXP, unlockBadge, updateStreak } = useAppState();

  const questions: QuizQuestion[] = params.questions
    ? JSON.parse(params.questions as string)
    : [];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [quizComplete, setQuizComplete] = useState<boolean>(false);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleSelectAnswer = (optionIndex: number) => {
    if (showExplanation) return;
    setSelectedAnswer(optionIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    setShowExplanation(true);
    setAnswers([...answers, selectedAnswer]);
  };

  const handleNextQuestion = () => {
    if (isLastQuestion) {
      handleCompleteQuiz();
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const handleCompleteQuiz = () => {
    const allAnswers = [...answers, selectedAnswer as number];
    let correctCount = 0;

    questions.forEach((q, index) => {
      if (allAnswers[index] === q.correctAnswer) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / questions.length) * 100);
    const xpEarned = correctCount * 10;

    const quizResult = {
      id: `quiz_${Date.now()}`,
      questions,
      answers: allAnswers,
      score,
      completedAt: Date.now(),
      xpEarned,
    };

    addQuizResult(quizResult);
    addXP(xpEarned);
    updateStreak();

    if (score === 100) {
      unlockBadge('quiz_master');
    }

    setQuizComplete(true);
  };

  if (quizComplete) {
    const allAnswers = [...answers, selectedAnswer as number];
    let correctCount = 0;

    questions.forEach((q, index) => {
      if (allAnswers[index] === q.correctAnswer) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / questions.length) * 100);

    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <LinearGradient
            colors={
              score >= 80
                ? (colors.gradient.success as any)
                : score >= 60
                ? (colors.gradient.warning as any)
                : (colors.gradient.primary as any)
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.resultsGradient}
          >
            <View style={styles.resultsContainer}>
              <View style={styles.resultsIconContainer}>
                <Trophy color={colors.surface} size={60} />
              </View>
              <Text style={styles.resultsTitle}>Quiz Complete!</Text>
              <Text style={styles.resultsScore}>{score}%</Text>
              <Text style={styles.resultsSubtitle}>
                {correctCount} out of {questions.length} correct
              </Text>

              <View style={styles.resultsStats}>
                <View style={styles.resultsStat}>
                  <Text style={styles.resultsStatValue}>+{correctCount * 10}</Text>
                  <Text style={styles.resultsStatLabel}>XP Earned</Text>
                </View>
                <View style={styles.resultsStatDivider} />
                <View style={styles.resultsStat}>
                  <Text style={styles.resultsStatValue}>{score}%</Text>
                  <Text style={styles.resultsStatLabel}>Accuracy</Text>
                </View>
              </View>

              {score >= 80 && (
                <Text style={styles.resultsMessage}>
                  {`Excellent work! You've mastered this concept.`}
                </Text>
              )}
              {score >= 60 && score < 80 && (
                <Text style={styles.resultsMessage}>
                  Good job! Review the explanations to strengthen your understanding.
                </Text>
              )}
              {score < 60 && (
                <Text style={styles.resultsMessage}>
                  Keep practicing! Consider reviewing the lesson again.
                </Text>
              )}

              <TouchableOpacity
                style={styles.doneButton}
                onPress={() => router.push('/dashboard' as any)}
              >
                <Text style={styles.doneButtonText}>Back to Dashboard</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentQuestion) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No questions available</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {currentQuestionIndex + 1} / {questions.length}
          </Text>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
        >
          <Text style={styles.questionNumber}>Question {currentQuestionIndex + 1}</Text>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>

          <View style={styles.optionsList}>
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === currentQuestion.correctAnswer;
              const showResult = showExplanation;

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionCard,
                    isSelected && !showResult && styles.optionSelected,
                    showResult && isCorrect && styles.optionCorrect,
                    showResult && isSelected && !isCorrect && styles.optionIncorrect,
                  ]}
                  onPress={() => handleSelectAnswer(index)}
                  disabled={showExplanation}
                >
                  <View style={styles.optionContent}>
                    <Text style={styles.optionLetter}>
                      {String.fromCharCode(65 + index)}
                    </Text>
                    <Text
                      style={[
                        styles.optionText,
                        showResult && isCorrect && styles.optionTextCorrect,
                      ]}
                    >
                      {option}
                    </Text>
                  </View>
                  {showResult && isCorrect && (
                    <CheckCircle2 color={colors.success} size={24} />
                  )}
                  {showResult && isSelected && !isCorrect && (
                    <XCircle color={colors.danger} size={24} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {showExplanation && (
            <View style={styles.explanationCard}>
              <Text style={styles.explanationTitle}>Explanation</Text>
              <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          {!showExplanation ? (
            <TouchableOpacity
              style={[
                styles.submitButton,
                selectedAnswer === null && styles.buttonDisabled,
              ]}
              onPress={handleSubmitAnswer}
              disabled={selectedAnswer === null}
            >
              <Text style={styles.submitButtonText}>Submit Answer</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.nextButton} onPress={handleNextQuestion}>
              <Text style={styles.nextButtonText}>
                {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
              </Text>
              <ChevronRight color={colors.surface} size={20} />
            </TouchableOpacity>
          )}
        </View>
      </View>
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
  progressBarContainer: {
    padding: 20,
    paddingBottom: 12,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: colors.borderLight,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.primary,
    marginBottom: 12,
    textTransform: 'uppercase' as const,
  },
  questionText: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: colors.text,
    lineHeight: 32,
    marginBottom: 24,
  },
  optionsList: {
    gap: 12,
    marginBottom: 24,
  },
  optionCard: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  optionCorrect: {
    borderColor: colors.success,
    backgroundColor: colors.success + '10',
  },
  optionIncorrect: {
    borderColor: colors.danger,
    backgroundColor: colors.danger + '10',
  },
  optionContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.borderLight,
    textAlign: 'center',
    lineHeight: 32,
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.text,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
  },
  optionTextCorrect: {
    fontWeight: '600' as const,
  },
  explanationCard: {
    backgroundColor: colors.accent.blue + '10',
    borderLeftWidth: 4,
    borderLeftColor: colors.accent.blue,
    borderRadius: 12,
    padding: 16,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
  },
  submitButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  nextButton: {
    backgroundColor: colors.success,
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextButtonText: {
    color: colors.surface,
    fontSize: 16,
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
  emptyText: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  resultsGradient: {
    flex: 1,
  },
  resultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  resultsIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  resultsTitle: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: colors.surface,
    marginBottom: 16,
  },
  resultsScore: {
    fontSize: 72,
    fontWeight: '700' as const,
    color: colors.surface,
    marginBottom: 8,
  },
  resultsSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 32,
  },
  resultsStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  resultsStat: {
    flex: 1,
    alignItems: 'center',
  },
  resultsStatValue: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.surface,
    marginBottom: 4,
  },
  resultsStatLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  resultsStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 20,
  },
  resultsMessage: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  doneButton: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  doneButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
