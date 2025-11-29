import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import colors from '@/constants/colors';
import { Camera, Upload, Send, Check, X, Sparkles } from 'lucide-react-native';
import { useState } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { trpc } from '@/lib/trpc';
import { Stack } from 'expo-router';
import { QuizQuestion } from '@/constants/cbse';

type AnalysisResult = {
  uploadId: string;
  explanation: string;
  relatedConcepts: string[];
};

export default function StuckScreen() {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [question, setQuestion] = useState<string>('');
  const [subject, setSubject] = useState<string>('Mathematics');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState<boolean>(false);
  const [quizResults, setQuizResults] = useState<any>(null);

  const analyzeMutation = trpc.help.analyzeTextbook.useMutation();
  const generateQuizMutation = trpc.help.generateQuiz.useMutation();
  const submitQuizMutation = trpc.help.submitQuiz.useMutation();

  const handleCameraCapture = async (camera: any) => {
    if (!camera) return;
    try {
      const photo = await camera.takePictureAsync({ base64: true });
      setCapturedImage(`data:image/jpeg;base64,${photo.base64}`);
      setShowCamera(false);
    } catch (error) {
      console.error('[Camera] Capture error:', error);
      Alert.alert('Error', 'Failed to capture image');
    }
  };

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images' as ImagePicker.MediaTypeOptions,
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        setCapturedImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
      }
    } catch (error) {
      console.error('[ImagePicker] Error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleAnalyze = async () => {
    if (!capturedImage || !question.trim()) {
      Alert.alert('Missing Info', 'Please capture an image and enter your question');
      return;
    }

    try {
      const base64Data = capturedImage.split(',')[1];
      const result = await analyzeMutation.mutateAsync({
        imageBase64: base64Data,
        studentQuestion: question,
        subject,
      });
      setAnalysisResult(result);
    } catch (error) {
      console.error('[Analyze] Error:', error);
      Alert.alert('Error', 'Failed to analyze image. Please try again.');
    }
  };

  const handleGenerateQuiz = async () => {
    if (!analysisResult) return;

    try {
      const result = await generateQuizMutation.mutateAsync({
        uploadId: analysisResult.uploadId,
        concept: analysisResult.relatedConcepts[0] || 'General Concept',
        subject,
      });
      setQuizQuestions(result.questions);
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setShowResults(false);
    } catch (error) {
      console.error('[Quiz] Error:', error);
      Alert.alert('Error', 'Failed to generate quiz');
    }
  };

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: answerIndex }));
  };

  const handleSubmitQuiz = async () => {
    if (!analysisResult) return;

    const answers = quizQuestions.map((q) => ({
      questionId: q.id,
      selectedAnswer: userAnswers[q.id] ?? -1,
      isCorrect: userAnswers[q.id] === q.correctAnswer,
    }));

    try {
      const result = await submitQuizMutation.mutateAsync({
        uploadId: analysisResult.uploadId,
        answers,
        totalQuestions: quizQuestions.length,
      });
      setQuizResults(result);
      setShowResults(true);
    } catch (error) {
      console.error('[Submit Quiz] Error:', error);
      Alert.alert('Error', 'Failed to submit quiz');
    }
  };

  const handleReset = () => {
    setCapturedImage(null);
    setQuestion('');
    setAnalysisResult(null);
    setQuizQuestions([]);
    setUserAnswers({});
    setShowResults(false);
    setQuizResults(null);
  };

  if (showCamera) {
    if (!cameraPermission) {
      return (
        <View style={styles.container}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    if (!cameraPermission.granted) {
      return (
        <View style={styles.container}>
          <Text style={styles.permissionText}>Camera permission required</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={requestCameraPermission}>
            <Text style={styles.primaryButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.fullScreen}>
        <CameraView
          style={styles.camera}
          facing="back"
          ref={(ref) => {
            if (ref) {
              (globalThis as any)._cameraRef = ref;
            }
          }}
        >
          <View style={styles.cameraControls}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowCamera(false)}
            >
              <X color="#fff" size={32} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.captureButton}
              onPress={() => handleCameraCapture((globalThis as any)._cameraRef)}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    );
  }

  if (showResults && quizResults) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen options={{ title: 'Quiz Results' }} />
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.resultCard}>
            <View style={styles.resultIconContainer}>
              {quizResults.isPerfect ? (
                <Sparkles color={colors.success} size={64} />
              ) : (
                <Check color={colors.primary} size={64} />
              )}
            </View>
            <Text style={styles.resultTitle}>
              {quizResults.isPerfect ? 'Perfect! 🎉' : 'Great Work! 👏'}
            </Text>
            <Text style={styles.resultScore}>
              {quizResults.correctCount}/{quizResults.totalQuestions} Correct
            </Text>
            <Text style={styles.resultPercentage}>
              {Math.round(quizResults.scorePercentage)}%
            </Text>
            <View style={styles.xpBadge}>
              <Text style={styles.xpText}>+{quizResults.xpEarned} XP</Text>
            </View>
            <Text style={styles.levelText}>Level {quizResults.newLevel}</Text>
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={handleReset}>
            <Text style={styles.primaryButtonText}>Ask Another Question</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (quizQuestions.length > 0 && !showResults) {
    const currentQuestion = quizQuestions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === quizQuestions.length - 1;
    const allAnswered = quizQuestions.every((q) => userAnswers[q.id] !== undefined);

    return (
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen options={{ title: 'Mini Quiz' }} />
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.quizProgress}>
            <Text style={styles.quizProgressText}>
              Question {currentQuestionIndex + 1} of {quizQuestions.length}
            </Text>
          </View>

          <View style={styles.questionCard}>
            <Text style={styles.questionText}>{currentQuestion.question}</Text>
            {currentQuestion.options.map((option, index) => {
              const isSelected = userAnswers[currentQuestion.id] === index;
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    isSelected && styles.optionButtonSelected,
                  ]}
                  onPress={() => handleAnswerSelect(currentQuestion.id, index)}
                >
                  <View style={[
                    styles.optionCircle,
                    isSelected && styles.optionCircleSelected,
                  ]} />
                  <Text style={[
                    styles.optionText,
                    isSelected && styles.optionTextSelected,
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.quizNavigation}>
            {currentQuestionIndex > 0 && (
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => setCurrentQuestionIndex((prev) => prev - 1)}
              >
                <Text style={styles.secondaryButtonText}>Previous</Text>
              </TouchableOpacity>
            )}
            {!isLastQuestion && (
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => setCurrentQuestionIndex((prev) => prev + 1)}
                disabled={userAnswers[currentQuestion.id] === undefined}
              >
                <Text style={styles.primaryButtonText}>Next</Text>
              </TouchableOpacity>
            )}
            {isLastQuestion && allAnswered && (
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleSubmitQuiz}
                disabled={submitQuizMutation.isPending}
              >
                {submitQuizMutation.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Submit Quiz</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (analysisResult) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen options={{ title: 'Concept Explanation' }} />
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Sparkles color={colors.primary} size={24} />
              <Text style={styles.cardTitle}>AI Explanation</Text>
            </View>
            <Text style={styles.explanationText}>{analysisResult.explanation}</Text>
          </View>

          {analysisResult.relatedConcepts.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Related Concepts</Text>
              {analysisResult.relatedConcepts.map((concept, index) => (
                <View key={index} style={styles.conceptChip}>
                  <Text style={styles.conceptText}>{concept}</Text>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleGenerateQuiz}
            disabled={generateQuizMutation.isPending}
          >
            {generateQuizMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Take Mini Quiz</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={handleReset}>
            <Text style={styles.secondaryButtonText}>Ask Another Question</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: 'Get Help' }} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerSection}>
          <Text style={styles.title}>Stuck on Something?</Text>
          <Text style={styles.subtitle}>
            Upload a textbook page and I&apos;ll help you understand it!
          </Text>
        </View>

        {capturedImage ? (
          <View style={styles.imagePreview}>
            <Image source={{ uri: capturedImage }} style={styles.previewImage} />
            <TouchableOpacity style={styles.removeImageButton} onPress={() => setCapturedImage(null)}>
              <X color="#fff" size={20} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.uploadSection}>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => setShowCamera(true)}
            >
              <Camera color={colors.primary} size={32} />
              <Text style={styles.uploadButtonText}>Capture Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.uploadButton} onPress={handleImagePick}>
              <Upload color={colors.primary} size={32} />
              <Text style={styles.uploadButtonText}>Upload from Gallery</Text>
            </TouchableOpacity>
          </View>
        )}

        {capturedImage && (
          <View style={styles.formSection}>
            <Text style={styles.label}>Your Question</Text>
            <TextInput
              style={styles.textInput}
              placeholder="What don&apos;t you understand about this?"
              placeholderTextColor={colors.textLight}
              value={question}
              onChangeText={setQuestion}
              multiline
            />

            <Text style={styles.label}>Subject</Text>
            <View style={styles.subjectButtons}>
              {['Mathematics', 'Science', 'English', 'Social Science'].map((subj) => (
                <TouchableOpacity
                  key={subj}
                  style={[
                    styles.subjectButton,
                    subject === subj && styles.subjectButtonActive,
                  ]}
                  onPress={() => setSubject(subj)}
                >
                  <Text
                    style={[
                      styles.subjectButtonText,
                      subject === subj && styles.subjectButtonTextActive,
                    ]}
                  >
                    {subj}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.analyzeButton}
              onPress={handleAnalyze}
              disabled={analyzeMutation.isPending || !question.trim()}
            >
              {analyzeMutation.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Send color="#fff" size={20} />
                  <Text style={styles.analyzeButtonText}>Get Help</Text>
                </>
              )}
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
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.background,
  },
  fullScreen: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: 20,
  },
  closeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  captureButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  headerSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  uploadSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  uploadButton: {
    flex: 1,
    backgroundColor: colors.cardBg,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text,
    textAlign: 'center',
  },
  imagePreview: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formSection: {
    gap: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: colors.cardBg,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: colors.border,
  },
  subjectButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subjectButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  subjectButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  subjectButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text,
  },
  subjectButtonTextActive: {
    color: '#fff',
  },
  analyzeButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  analyzeButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
  },
  explanationText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
  },
  conceptChip: {
    backgroundColor: colors.primary + '20',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  conceptText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600' as const,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
  secondaryButton: {
    backgroundColor: colors.cardBg,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
  },
  quizProgress: {
    marginBottom: 20,
  },
  quizProgressText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  questionCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 20,
    lineHeight: 26,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.background,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.border,
  },
  optionButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  optionCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: 12,
  },
  optionCircleSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  optionTextSelected: {
    fontWeight: '600' as const,
    color: colors.text,
  },
  quizNavigation: {
    flexDirection: 'row',
    gap: 12,
  },
  resultCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
  },
  resultIconContainer: {
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 8,
  },
  resultScore: {
    fontSize: 20,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  resultPercentage: {
    fontSize: 48,
    fontWeight: '700' as const,
    color: colors.primary,
    marginBottom: 20,
  },
  xpBadge: {
    backgroundColor: colors.success + '20',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 12,
  },
  xpText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.success,
  },
  levelText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  permissionText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
});
