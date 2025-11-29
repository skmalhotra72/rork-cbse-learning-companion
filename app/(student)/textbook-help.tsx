import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, Upload, Send, CheckCircle, XCircle, Trophy } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, useCameraPermissions } from 'expo-camera';
import colors from '@/constants/colors';
import { trpc } from '@/lib/trpc';
import { useToast } from '@/contexts/ToastContext';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  concept: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export default function TextbookHelpScreen() {
  const [mode, setMode] = useState<'select' | 'camera' | 'preview' | 'processing' | 'results'>('select');
  const [imageUri, setImageUri] = useState<string>('');
  const [imageBase64, setImageBase64] = useState<string>('');
  const [question, setQuestion] = useState<string>('');
  const [subject, setSubject] = useState<string>('Mathematics');
  const [uploadId, setUploadId] = useState<string>('');
  const [explanation, setExplanation] = useState<string>('');
  const [relatedConcepts, setRelatedConcepts] = useState<string[]>([]);
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Map<string, number>>(new Map());
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  const [quizResult, setQuizResult] = useState<any>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());

  const [permission, requestPermission] = useCameraPermissions();
  const { showToast, showXPEarned } = useToast();

  const uploadMutation = trpc.vision.uploadTextbook.useMutation();
  const processMutation = trpc.vision.processTextbook.useMutation();
  const submitQuizMutation = trpc.vision.submitQuiz.useMutation();

  const handleTakePhoto = async () => {
    if (!permission) {
      return;
    }

    if (!permission.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        showToast({ type: 'error', title: 'Camera permission required' });
        return;
      }
    }

    setMode('camera');
  };

  const handleCapture = async (camera: any) => {
    try {
      const photo = await camera.takePictureAsync({ base64: true });
      setImageUri(photo.uri);
      setImageBase64(photo.base64 || '');
      setMode('preview');
    } catch (error) {
      console.error('Error capturing photo:', error);
      showToast({ type: 'error', title: 'Failed to capture photo' });
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images' as any,
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
        setImageBase64(result.assets[0].base64 || '');
        setMode('preview');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      showToast({ type: 'error', title: 'Failed to pick image' });
    }
  };

  const handleUploadAndProcess = async () => {
    if (!imageBase64 || !question.trim()) {
      showToast({ type: 'error', title: 'Please add a question' });
      return;
    }

    setMode('processing');
    setStartTime(Date.now());

    try {
      const uploadResult = await uploadMutation.mutateAsync({
        imageBase64: `data:image/jpeg;base64,${imageBase64}`,
        fileName: 'textbook-image.jpg',
        fileSize: imageBase64.length,
        mimeType: 'image/jpeg',
      });

      setUploadId(uploadResult.uploadId);

      const processResult = await processMutation.mutateAsync({
        uploadId: uploadResult.uploadId,
        studentQuestion: question,
        subject,
      });

      setExplanation(processResult.explanation);
      setRelatedConcepts(processResult.relatedConcepts);
      setQuiz(processResult.quiz as QuizQuestion[]);
      setMode('results');
    } catch (error: any) {
      console.error('Error processing:', error);
      showToast({ type: 'error', title: error.message || 'Failed to process image' });
      setMode('preview');
    }
  };

  const handleSelectAnswer = (questionId: string, answerIndex: number) => {
    const newAnswers = new Map(selectedAnswers);
    newAnswers.set(questionId, answerIndex);
    setSelectedAnswers(newAnswers);
  };

  const handleSubmitQuiz = async () => {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const answers = quiz.map((q) => {
      const selectedAnswer = selectedAnswers.get(q.id) ?? -1;
      return {
        questionId: q.id,
        selectedAnswer,
        isCorrect: selectedAnswer === q.correctAnswer,
      };
    });

    const correctCount = answers.filter((a) => a.isCorrect).length;
    const score = (correctCount / quiz.length) * 100;

    try {
      const result = await submitQuizMutation.mutateAsync({
        uploadId,
        answers,
        score,
        timeTaken,
      });

      setQuizResult(result);
      setQuizCompleted(true);
      showXPEarned(result.xpAwarded, 'Quiz completed!');
    } catch (error: any) {
      console.error('Error submitting quiz:', error);
      showToast({ type: 'error', title: error.message || 'Failed to submit quiz' });
    }
  };

  const handleReset = () => {
    setMode('select');
    setImageUri('');
    setImageBase64('');
    setQuestion('');
    setUploadId('');
    setExplanation('');
    setRelatedConcepts([]);
    setQuiz([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswers(new Map());
    setQuizCompleted(false);
    setQuizResult(null);
  };

  if (mode === 'select') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Textbook Help</Text>
          <Text style={styles.headerSubtitle}>Get AI help with any textbook page</Text>
        </View>

        <View style={styles.selectContent}>
          <View style={styles.iconContainer}>
            <Camera size={64} color={colors.primary} />
          </View>

          <Text style={styles.selectTitle}>How can I help you?</Text>
          <Text style={styles.selectDescription}>
            Take a photo or upload an image of your textbook page, and I&apos;ll explain the concept with
            examples and a quick quiz.
          </Text>

          <View style={styles.buttonGroup}>
            <TouchableOpacity style={styles.primaryButton} onPress={handleTakePhoto}>
              <Camera size={24} color="#fff" />
              <Text style={styles.primaryButtonText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={handlePickImage}>
              <Upload size={24} color={colors.primary} />
              <Text style={styles.secondaryButtonText}>Upload Image</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (mode === 'camera') {
    let cameraRef: any = null;

    return (
      <SafeAreaView style={styles.fullScreen} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <CameraView
          ref={(ref: any) => (cameraRef = ref)}
          style={styles.camera}
          facing="back"
        >
          <View style={styles.cameraOverlay}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setMode('select')}
            >
              <Text style={styles.backButtonText}>Cancel</Text>
            </TouchableOpacity>

            <View style={styles.cameraControls}>
              <TouchableOpacity
                style={styles.captureButton}
                onPress={() => handleCapture(cameraRef)}
              >
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>
            </View>
          </View>
        </CameraView>
      </SafeAreaView>
    );
  }

  if (mode === 'preview') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <ScrollView style={styles.scrollView}>
          <View style={styles.previewHeader}>
            <TouchableOpacity onPress={handleReset}>
              <Text style={styles.backLink}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.previewTitle}>Review & Ask</Text>
          </View>

          <Image source={{ uri: imageUri }} style={styles.previewImage} />

          <View style={styles.form}>
            <Text style={styles.label}>Your Question *</Text>
            <TextInput
              style={styles.input}
              placeholder="What do you want to know about this page?"
              placeholderTextColor={colors.textLight}
              value={question}
              onChangeText={setQuestion}
              multiline
              numberOfLines={3}
            />

            <Text style={styles.label}>Subject</Text>
            <View style={styles.subjectPicker}>
              {['Mathematics', 'Science', 'English', 'Social Studies'].map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.subjectChip, subject === s && styles.subjectChipActive]}
                  onPress={() => setSubject(s)}
                >
                  <Text
                    style={[styles.subjectChipText, subject === s && styles.subjectChipTextActive]}
                  >
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, styles.submitButton]}
              onPress={handleUploadAndProcess}
              disabled={uploadMutation.isPending || processMutation.isPending}
            >
              {uploadMutation.isPending || processMutation.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Send size={20} color="#fff" />
                  <Text style={styles.primaryButtonText}>Get Help</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (mode === 'processing') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.processingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.processingText}>Analyzing your textbook...</Text>
          <Text style={styles.processingSubtext}>This may take a few moments</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (mode === 'results') {
    const currentQuestion = quiz[currentQuestionIndex];
    const selectedAnswer = selectedAnswers.get(currentQuestion?.id);
    const allAnswered = quiz.every((q) => selectedAnswers.has(q.id));

    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <ScrollView style={styles.scrollView}>
          <View style={styles.resultsHeader}>
            <TouchableOpacity onPress={handleReset}>
              <Text style={styles.backLink}>← New Question</Text>
            </TouchableOpacity>
          </View>

          {!quizCompleted ? (
            <>
              <View style={styles.explanationCard}>
                <Text style={styles.sectionTitle}>Explanation</Text>
                <Text style={styles.explanationText}>{explanation}</Text>

                {relatedConcepts.length > 0 && (
                  <View style={styles.conceptsContainer}>
                    <Text style={styles.conceptsTitle}>Related Concepts:</Text>
                    {relatedConcepts.map((concept, idx) => (
                      <Text key={idx} style={styles.conceptItem}>
                        • {concept}
                      </Text>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.quizCard}>
                <Text style={styles.sectionTitle}>Quick Quiz</Text>
                <Text style={styles.quizSubtitle}>
                  Question {currentQuestionIndex + 1} of {quiz.length}
                </Text>

                {currentQuestion && (
                  <View style={styles.questionContainer}>
                    <Text style={styles.questionText}>{currentQuestion.question}</Text>

                    <View style={styles.optionsContainer}>
                      {currentQuestion.options.map((option, idx) => (
                        <TouchableOpacity
                          key={idx}
                          style={[
                            styles.optionButton,
                            selectedAnswer === idx && styles.optionButtonSelected,
                          ]}
                          onPress={() => handleSelectAnswer(currentQuestion.id, idx)}
                        >
                          <View
                            style={[
                              styles.optionRadio,
                              selectedAnswer === idx && styles.optionRadioSelected,
                            ]}
                          />
                          <Text
                            style={[
                              styles.optionText,
                              selectedAnswer === idx && styles.optionTextSelected,
                            ]}
                          >
                            {option}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <View style={styles.navigationButtons}>
                      {currentQuestionIndex > 0 && (
                        <TouchableOpacity
                          style={styles.navButton}
                          onPress={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                        >
                          <Text style={styles.navButtonText}>← Previous</Text>
                        </TouchableOpacity>
                      )}
                      {currentQuestionIndex < quiz.length - 1 && (
                        <TouchableOpacity
                          style={styles.navButton}
                          onPress={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                        >
                          <Text style={styles.navButtonText}>Next →</Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    {allAnswered && (
                      <TouchableOpacity
                        style={[styles.primaryButton, styles.submitQuizButton]}
                        onPress={handleSubmitQuiz}
                        disabled={submitQuizMutation.isPending}
                      >
                        {submitQuizMutation.isPending ? (
                          <ActivityIndicator color="#fff" />
                        ) : (
                          <>
                            <CheckCircle size={20} color="#fff" />
                            <Text style={styles.primaryButtonText}>Submit Quiz</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            </>
          ) : (
            <View style={styles.completionCard}>
              <View style={styles.completionIconContainer}>
                <Trophy size={64} color={colors.success} />
              </View>
              <Text style={styles.completionTitle}>Quiz Completed!</Text>
              <Text style={styles.completionScore}>
                Score: {quizResult?.scorePercentage.toFixed(0)}%
              </Text>
              <Text style={styles.completionXP}>+{quizResult?.xpAwarded} XP Earned</Text>

              <View style={styles.resultsBreakdown}>
                <View style={styles.resultRow}>
                  <CheckCircle size={20} color={colors.success} />
                  <Text style={styles.resultText}>{quizResult?.correctCount} Correct</Text>
                </View>
                <View style={styles.resultRow}>
                  <XCircle size={20} color={colors.danger} />
                  <Text style={styles.resultText}>
                    {quizResult?.totalQuestions - quizResult?.correctCount} Incorrect
                  </Text>
                </View>
              </View>

              <View style={styles.reviewSection}>
                <Text style={styles.reviewTitle}>Review Answers</Text>
                {quiz.map((q, idx) => {
                  const userAnswer = selectedAnswers.get(q.id) ?? -1;
                  const isCorrect = userAnswer === q.correctAnswer;

                  return (
                    <View key={q.id} style={styles.reviewCard}>
                      <View style={styles.reviewHeader}>
                        <Text style={styles.reviewQuestionNumber}>Question {idx + 1}</Text>
                        {isCorrect ? (
                          <CheckCircle size={20} color={colors.success} />
                        ) : (
                          <XCircle size={20} color={colors.danger} />
                        )}
                      </View>
                      <Text style={styles.reviewQuestion}>{q.question}</Text>
                      <Text style={styles.reviewAnswer}>
                        Correct Answer: {q.options[q.correctAnswer]}
                      </Text>
                      <Text style={styles.reviewExplanation}>{q.explanation}</Text>
                    </View>
                  );
                })}
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, styles.doneButton]}
                onPress={() => router.back()}
              >
                <Text style={styles.primaryButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    padding: 20,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textLight,
  },
  selectContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  selectTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  selectDescription: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  buttonGroup: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    gap: 8,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
  },
  backButton: {
    margin: 20,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  cameraControls: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  backLink: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600' as const,
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text,
  },
  previewImage: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
    backgroundColor: colors.surface,
  },
  form: {
    padding: 20,
    gap: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  subjectPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subjectChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
  },
  subjectChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  subjectChipText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textLight,
  },
  subjectChipTextActive: {
    color: colors.primary,
  },
  submitButton: {
    marginTop: 8,
  },
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  processingText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text,
  },
  processingSubtext: {
    fontSize: 14,
    color: colors.textLight,
  },
  resultsHeader: {
    padding: 20,
  },
  explanationCard: {
    backgroundColor: colors.surface,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 12,
  },
  explanationText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  conceptsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  conceptsTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textLight,
    marginBottom: 8,
  },
  conceptItem: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  quizCard: {
    backgroundColor: colors.surface,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
  },
  quizSubtitle: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 16,
  },
  questionContainer: {
    gap: 16,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text,
    lineHeight: 26,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    gap: 12,
  },
  optionButtonSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
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
    fontSize: 16,
    color: colors.text,
  },
  optionTextSelected: {
    color: colors.primary,
    fontWeight: '600' as const,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  navButton: {
    flex: 1,
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  submitQuizButton: {
    marginTop: 8,
  },
  completionCard: {
    backgroundColor: colors.surface,
    padding: 24,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  completionIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  completionTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 8,
  },
  completionScore: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: colors.primary,
    marginBottom: 8,
  },
  completionXP: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.success,
    marginBottom: 24,
  },
  resultsBreakdown: {
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resultText: {
    fontSize: 16,
    color: colors.text,
  },
  reviewSection: {
    width: '100%',
    gap: 16,
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 8,
  },
  reviewCard: {
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewQuestionNumber: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textLight,
  },
  reviewQuestion: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
  },
  reviewAnswer: {
    fontSize: 14,
    color: colors.text,
  },
  reviewExplanation: {
    fontSize: 14,
    color: colors.textLight,
  },
  doneButton: {
    width: '100%',
    marginTop: 24,
  },
});
