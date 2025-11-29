import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useState } from 'react';
import colors from '@/constants/colors';
import { Camera, Upload, X, CheckCircle2, AlertCircle } from 'lucide-react-native';
import { Stack } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

type FlowStep = 'select' | 'camera' | 'question' | 'analyzing' | 'result';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  concept: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export default function StuckScreen() {
  const auth = useAuth();
  const { showToast } = useToast();
  const [step, setStep] = useState<FlowStep>('select');
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [studentQuestion, setStudentQuestion] = useState<string>('');
  const [subjectCode, setSubjectCode] = useState<string>('MATH');
  const [cameraRef, setCameraRef] = useState<any>(null);
  
  const [analysisResult, setAnalysisResult] = useState<{
    uploadId: string;
    explanation: string;
    relatedConcepts: string[];
    subjectName: string;
  } | null>(null);
  
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{
    questionId: string;
    selectedAnswer: number;
    correctAnswer: number;
    isCorrect: boolean;
  }[]>([]);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  const [quizResult, setQuizResult] = useState<any>(null);

  const analyzeTextbook = trpc.vision.analyzeTextbook.useMutation();
  const generateQuiz = trpc.vision.generateQuiz.useMutation();
  const submitQuiz = trpc.vision.submitQuiz.useMutation();

  const handleCameraCapture = async () => {
    if (!cameraRef) return;

    try {
      const photo = await cameraRef.takePictureAsync({ base64: true });
      setCapturedImage(`data:image/jpg;base64,${photo.base64}`);
      setStep('question');
    } catch (error) {
      console.error('[Camera] Error taking picture:', error);
      showToast({ type: 'error', title: 'Failed to capture image' });
    }
  };

  const handleGalleryPick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        setCapturedImage(`data:image/jpg;base64,${result.assets[0].base64}`);
        setStep('question');
      }
    } catch (error) {
      console.error('[Gallery] Error picking image:', error);
      showToast({ type: 'error', title: 'Failed to pick image' });
    }
  };

  const handleAnalyzeImage = async () => {
    if (!capturedImage || !studentQuestion.trim()) {
      showToast({ type: 'error', title: 'Please enter your question' });
      return;
    }

    setStep('analyzing');

    try {
      const base64Data = capturedImage.split(',')[1];
      const result = await analyzeTextbook.mutateAsync({
        imageBase64: base64Data,
        studentQuestion: studentQuestion.trim(),
        subjectCode,
      });

      setAnalysisResult(result);
      setStep('result');
    } catch (error) {
      console.error('[Analysis] Error:', error);
      showToast({ type: 'error', title: 'Failed to analyze image' });
      setStep('question');
    }
  };

  const handleGenerateQuiz = async () => {
    if (!analysisResult) return;

    try {
      const result = await generateQuiz.mutateAsync({
        uploadId: analysisResult.uploadId,
        concept: analysisResult.relatedConcepts[0] || 'concept',
        subjectCode,
      });

      setQuizQuestions(result.questions);
      setCurrentQuestionIndex(0);
      setSelectedAnswers([]);
      setQuizCompleted(false);
    } catch (error) {
      console.error('[Quiz] Error generating quiz:', error);
      showToast({ type: 'error', title: 'Failed to generate quiz' });
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const currentQuestion = quizQuestions[currentQuestionIndex];
    const isCorrect = answerIndex === currentQuestion.correctAnswer;

    const newAnswer = {
      questionId: currentQuestion.id,
      selectedAnswer: answerIndex,
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect,
    };

    const updatedAnswers = [...selectedAnswers, newAnswer];
    setSelectedAnswers(updatedAnswers);

    if (currentQuestionIndex < quizQuestions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }, 1500);
    } else {
      handleSubmitQuiz(updatedAnswers);
    }
  };

  const handleSubmitQuiz = async (answers: typeof selectedAnswers) => {
    if (!analysisResult) return;

    try {
      const result = await submitQuiz.mutateAsync({
        uploadId: analysisResult.uploadId,
        answers,
      });

      setQuizResult(result);
      setQuizCompleted(true);
      showToast({ type: 'success', title: 'Quiz completed!', message: `+${result.xpAwarded} XP earned` });
    } catch (error) {
      console.error('[Quiz] Error submitting quiz:', error);
      showToast({ type: 'error', title: 'Failed to submit quiz' });
    }
  };

  const handleReset = () => {
    setCapturedImage(null);
    setStudentQuestion('');
    setAnalysisResult(null);
    setQuizQuestions([]);
    setSelectedAnswers([]);
    setQuizCompleted(false);
    setQuizResult(null);
    setCurrentQuestionIndex(0);
    setStep('select');
  };

  if (step === 'camera') {
    if (!permission) {
      return (
        <View style={styles.container}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    if (!permission.granted) {
      return (
        <View style={styles.container}>
          <Text style={styles.permissionText}>Camera permission required</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={requestPermission}>
            <Text style={styles.primaryButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.fullScreen}>
        <Stack.Screen options={{ headerShown: false }} />
        <CameraView style={styles.camera} facing="back" ref={setCameraRef}>
          <View style={styles.cameraOverlay}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setStep('select')}
            >
              <X color="#fff" size={24} />
            </TouchableOpacity>
            <View style={styles.cameraControls}>
              <TouchableOpacity
                style={styles.captureButton}
                onPress={handleCameraCapture}
              >
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: 'Get Help' }} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {step === 'select' && (
          <View style={styles.container}>
            <Text style={styles.title}>Stuck on something?</Text>
            <Text style={styles.description}>
              Upload or capture a textbook page, and I&apos;ll help you understand it!
            </Text>

            <View style={styles.buttonContainer}>
              {Platform.OS !== 'web' && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => setStep('camera')}
                >
                  <Camera color={colors.primary} size={32} />
                  <Text style={styles.actionButtonText}>Take Photo</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.actionButton} onPress={handleGalleryPick}>
                <Upload color={colors.primary} size={32} />
                <Text style={styles.actionButtonText}>Upload Image</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {step === 'question' && capturedImage && (
          <View style={styles.container}>
            <Text style={styles.title}>What do you need help with?</Text>
            
            <Image source={{ uri: capturedImage }} style={styles.previewImage} />

            <TextInput
              style={styles.input}
              placeholder="E.g., I don&apos;t understand this equation..."
              placeholderTextColor={colors.textLight}
              value={studentQuestion}
              onChangeText={setStudentQuestion}
              multiline
              numberOfLines={4}
            />

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => {
                  setCapturedImage(null);
                  setStep('select');
                }}
              >
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  !studentQuestion.trim() && styles.disabledButton,
                ]}
                onPress={handleAnalyzeImage}
                disabled={!studentQuestion.trim()}
              >
                <Text style={styles.primaryButtonText}>Get Help</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {step === 'analyzing' && (
          <View style={styles.container}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Analyzing your textbook page...</Text>
          </View>
        )}

        {step === 'result' && analysisResult && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Here&apos;s what I found:</Text>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Explanation</Text>
              <Text style={styles.explanationText}>{analysisResult.explanation}</Text>
            </View>

            {analysisResult.relatedConcepts.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Related Concepts</Text>
                {analysisResult.relatedConcepts.map((concept, index) => (
                  <View key={index} style={styles.conceptItem}>
                    <Text style={styles.conceptBullet}>•</Text>
                    <Text style={styles.conceptText}>{concept}</Text>
                  </View>
                ))}
              </View>
            )}

            {quizQuestions.length === 0 && !quizCompleted && (
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleGenerateQuiz}
                disabled={generateQuiz.isPending}
              >
                {generateQuiz.isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Test Your Understanding</Text>
                )}
              </TouchableOpacity>
            )}

            {quizQuestions.length > 0 && !quizCompleted && (
              <View style={styles.quizContainer}>
                <Text style={styles.quizTitle}>
                  Question {currentQuestionIndex + 1} of {quizQuestions.length}
                </Text>
                <Text style={styles.questionText}>
                  {quizQuestions[currentQuestionIndex].question}
                </Text>

                <View style={styles.optionsContainer}>
                  {quizQuestions[currentQuestionIndex].options.map((option, index) => {
                    const isSelected =
                      selectedAnswers[selectedAnswers.length - 1]?.questionId ===
                        quizQuestions[currentQuestionIndex].id &&
                      selectedAnswers[selectedAnswers.length - 1]?.selectedAnswer === index;
                    const isCorrect =
                      isSelected &&
                      selectedAnswers[selectedAnswers.length - 1]?.isCorrect;
                    const isWrong = isSelected && !isCorrect;

                    return (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.optionButton,
                          isCorrect && styles.correctOption,
                          isWrong && styles.wrongOption,
                        ]}
                        onPress={() => handleAnswerSelect(index)}
                        disabled={isSelected}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            (isCorrect || isWrong) && styles.selectedOptionText,
                          ]}
                        >
                          {option}
                        </Text>
                        {isCorrect && <CheckCircle2 color="#fff" size={20} />}
                        {isWrong && <AlertCircle color="#fff" size={20} />}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {quizCompleted && quizResult && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Quiz Results</Text>
                <Text style={styles.scoreText}>
                  {quizResult.correctCount} / {quizResult.totalQuestions} Correct
                </Text>
                <Text style={styles.xpText}>+{quizResult.xpAwarded} XP Earned!</Text>
              </View>
            )}

            <TouchableOpacity style={styles.secondaryButton} onPress={handleReset}>
              <Text style={styles.secondaryButtonText}>Get Help with Another Topic</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  fullScreen: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    left: 24,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraControls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.primary,
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  actionButton: {
    backgroundColor: colors.surface,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: colors.border,
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 24,
    backgroundColor: colors.surface,
  },
  input: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 24,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
  },
  disabledButton: {
    opacity: 0.5,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
  },
  resultContainer: {
    padding: 24,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 24,
  },
  card: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 12,
  },
  explanationText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  conceptItem: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 8,
  },
  conceptBullet: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '700' as const,
  },
  conceptText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  quizContainer: {
    marginTop: 24,
  },
  quizTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textLight,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 24,
    lineHeight: 28,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  correctOption: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  wrongOption: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  optionText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  selectedOptionText: {
    color: '#fff',
    fontWeight: '600' as const,
  },
  scoreText: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  xpText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#10b981',
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
});
