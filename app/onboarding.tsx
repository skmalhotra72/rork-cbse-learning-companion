import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { trpc } from '@/lib/trpc';
import {
  CBSEClass,
  Subject,
  SUBJECTS_BY_CLASS,
  DifficultyLevel,
} from '@/constants/cbse';
import colors from '@/constants/colors';
import { ChevronRight, CheckCircle2, Circle } from 'lucide-react-native';

const ONBOARDING_STEPS = ['welcome', 'class', 'subjects', 'rating', 'painPoints', 'complete'] as const;
type OnboardingStep = typeof ONBOARDING_STEPS[number];

export default function OnboardingScreen() {
  const router = useRouter();
  const { refreshProfile } = useAuth();
  
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [name, setName] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<CBSEClass | null>(null);
  const [selectedSubjects, setSelectedSubjects] = useState<Subject[]>([]);
  const [subjectRatings, setSubjectRatings] = useState<Record<Subject, DifficultyLevel>>({} as Record<Subject, DifficultyLevel>);
  const [painPoints, setPainPoints] = useState<Record<Subject, string>>({} as Record<Subject, string>);

  const completeOnboardingMutation = trpc.onboarding.complete.useMutation({
    onSuccess: () => {
      console.log('[Onboarding] Successfully completed onboarding');
      refreshProfile();
      router.replace('/(student)' as any);
    },
    onError: (error) => {
      console.error('[Onboarding] Error completing onboarding:', error);
      Alert.alert(
        'Error',
        'Failed to complete onboarding. Please try again.',
        [{ text: 'OK' }]
      );
    },
  });

  const nextStep = () => {
    const currentIndex = ONBOARDING_STEPS.indexOf(currentStep);
    if (currentIndex < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(ONBOARDING_STEPS[currentIndex + 1]);
    }
  };

  const finishOnboarding = () => {
    if (!selectedClass || selectedSubjects.length === 0 || !name) {
      Alert.alert('Missing Information', 'Please complete all required fields.');
      return;
    }

    const painPointsArray: Record<string, string[]> = {};
    selectedSubjects.forEach((subject) => {
      const points: string[] = [];
      if (painPoints[subject] && painPoints[subject].trim().length > 0) {
        points.push(painPoints[subject]);
      }
      painPointsArray[subject] = points;
    });

    const ratingsRecord: Record<string, DifficultyLevel> = {};
    selectedSubjects.forEach((subject) => {
      if (subjectRatings[subject]) {
        ratingsRecord[subject] = subjectRatings[subject];
      }
    });

    console.log('[Onboarding] Submitting onboarding data');
    completeOnboardingMutation.mutate({
      fullName: name,
      grade: parseInt(selectedClass),
      subjects: selectedSubjects,
      subjectRatings: ratingsRecord,
      painPoints: painPointsArray,
    });
  };

  const toggleSubject = (subject: Subject) => {
    if (selectedSubjects.includes(subject)) {
      setSelectedSubjects(selectedSubjects.filter((s) => s !== subject));
    } else {
      setSelectedSubjects([...selectedSubjects, subject]);
    }
  };

  const setRating = (subject: Subject, rating: DifficultyLevel) => {
    setSubjectRatings({ ...subjectRatings, [subject]: rating });
  };

  const setPainPoint = (subject: Subject, text: string) => {
    setPainPoints({ ...painPoints, [subject]: text });
  };

  const RATING_OPTIONS: { value: DifficultyLevel; label: string; emoji: string }[] = [
    { value: 'struggling', label: 'Struggling', emoji: '😰' },
    { value: 'okay', label: 'Okay', emoji: '😐' },
    { value: 'confident', label: 'Confident', emoji: '😊' },
    { value: 'expert', label: 'Expert', emoji: '🚀' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.progressBar}>
          {ONBOARDING_STEPS.map((step, index) => {
            const isActive = ONBOARDING_STEPS.indexOf(currentStep) >= index;
            return (
              <View
                key={step}
                style={[styles.progressDot, isActive && styles.progressDotActive]}
              />
            );
          })}
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {currentStep === 'welcome' && (
            <View style={styles.stepContainer}>
              <Text style={styles.emoji}>👋</Text>
              <Text style={styles.title}>Welcome to LearnBridge</Text>
              <Text style={styles.description}>
                Your AI-powered CBSE learning companion that helps you identify gaps, master
                concepts, and excel in your studies.
              </Text>
              <TextInput
                style={styles.input}
                placeholder="What is your name?"
                value={name}
                onChangeText={setName}
                autoFocus
              />
              <TouchableOpacity
                style={[styles.primaryButton, !name && styles.buttonDisabled]}
                onPress={nextStep}
                disabled={!name}
              >
                <Text style={styles.primaryButtonText}>Get Started</Text>
                <ChevronRight color={colors.surface} size={20} />
              </TouchableOpacity>
            </View>
          )}

          {currentStep === 'class' && (
            <View style={styles.stepContainer}>
              <Text style={styles.title}>Which class are you in?</Text>
              <Text style={styles.description}>
                We will customize your learning journey based on your CBSE class.
              </Text>
              <View style={styles.optionsGrid}>
                {(['9', '10', '11', '12'] as CBSEClass[]).map((cls) => (
                  <TouchableOpacity
                    key={cls}
                    style={[
                      styles.classOption,
                      selectedClass === cls && styles.optionSelected,
                    ]}
                    onPress={() => {
                      setSelectedClass(cls);
                      setSelectedSubjects([]);
                    }}
                  >
                    <Text style={[
                      styles.classOptionText,
                      selectedClass === cls && styles.optionSelectedText,
                    ]}>
                      Class {cls}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                style={[styles.primaryButton, !selectedClass && styles.buttonDisabled]}
                onPress={nextStep}
                disabled={!selectedClass}
              >
                <Text style={styles.primaryButtonText}>Continue</Text>
                <ChevronRight color={colors.surface} size={20} />
              </TouchableOpacity>
            </View>
          )}

          {currentStep === 'subjects' && selectedClass && (
            <View style={styles.stepContainer}>
              <Text style={styles.title}>Select your subjects</Text>
              <Text style={styles.description}>
                Choose the subjects you want help with.
              </Text>
              <View style={styles.subjectsList}>
                {SUBJECTS_BY_CLASS[selectedClass].map((subject) => (
                  <TouchableOpacity
                    key={subject}
                    style={[
                      styles.subjectOption,
                      selectedSubjects.includes(subject) && styles.subjectSelected,
                    ]}
                    onPress={() => toggleSubject(subject)}
                  >
                    {selectedSubjects.includes(subject) ? (
                      <CheckCircle2 color={colors.primary} size={24} />
                    ) : (
                      <Circle color={colors.textLight} size={24} />
                    )}
                    <Text style={[
                      styles.subjectOptionText,
                      selectedSubjects.includes(subject) && styles.subjectSelectedText,
                    ]}>
                      {subject}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                style={[styles.primaryButton, selectedSubjects.length === 0 && styles.buttonDisabled]}
                onPress={nextStep}
                disabled={selectedSubjects.length === 0}
              >
                <Text style={styles.primaryButtonText}>Continue</Text>
                <ChevronRight color={colors.surface} size={20} />
              </TouchableOpacity>
            </View>
          )}

          {currentStep === 'rating' && (
            <View style={styles.stepContainer}>
              <Text style={styles.title}>How do you feel about each subject?</Text>
              <Text style={styles.description}>
                Be honest – this helps us personalize your learning path.
              </Text>
              {selectedSubjects.map((subject) => (
                <View key={subject} style={styles.ratingContainer}>
                  <Text style={styles.subjectLabel}>{subject}</Text>
                  <View style={styles.ratingOptions}>
                    {RATING_OPTIONS.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.ratingButton,
                          subjectRatings[subject] === option.value && styles.ratingButtonSelected,
                        ]}
                        onPress={() => setRating(subject, option.value)}
                      >
                        <Text style={styles.ratingEmoji}>{option.emoji}</Text>
                        <Text style={[
                          styles.ratingLabel,
                          subjectRatings[subject] === option.value && styles.ratingLabelSelected,
                        ]}>
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  Object.keys(subjectRatings).length !== selectedSubjects.length && styles.buttonDisabled,
                ]}
                onPress={nextStep}
                disabled={Object.keys(subjectRatings).length !== selectedSubjects.length}
              >
                <Text style={styles.primaryButtonText}>Continue</Text>
                <ChevronRight color={colors.surface} size={20} />
              </TouchableOpacity>
            </View>
          )}

          {currentStep === 'painPoints' && (
            <View style={styles.stepContainer}>
              <Text style={styles.title}>What topics give you trouble?</Text>
              <Text style={styles.description}>
                Tell us about specific chapters or concepts you find difficult (optional).
              </Text>
              {selectedSubjects.map((subject) => (
                <View key={subject} style={styles.painPointContainer}>
                  <Text style={styles.subjectLabel}>{subject}</Text>
                  <TextInput
                    style={styles.textArea}
                    placeholder={`e.g., "Quadratic equations", "Organic chemistry"...`}
                    value={painPoints[subject] || ''}
                    onChangeText={(text) => setPainPoint(subject, text)}
                    multiline
                    numberOfLines={3}
                  />
                </View>
              ))}
              <TouchableOpacity
                style={[styles.primaryButton, completeOnboardingMutation.isPending && styles.buttonDisabled]}
                onPress={finishOnboarding}
                disabled={completeOnboardingMutation.isPending}
              >
                {completeOnboardingMutation.isPending ? (
                  <ActivityIndicator color={colors.surface} />
                ) : (
                  <>
                    <Text style={styles.primaryButtonText}>Start Learning</Text>
                    <ChevronRight color={colors.surface} size={20} />
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {currentStep === 'complete' && (
            <View style={styles.stepContainer}>
              <Text style={styles.emoji}>🎉</Text>
              <Text style={styles.title}>You are all set, {name}!</Text>
              <Text style={styles.description}>
                We are analyzing your profile and will create a personalized learning plan to help
                you master your subjects.
              </Text>
              <View style={styles.summaryBox}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Class:</Text>
                  <Text style={styles.summaryValue}>Class {selectedClass}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subjects:</Text>
                  <Text style={styles.summaryValue}>{selectedSubjects.length} selected</Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.primaryButton, completeOnboardingMutation.isPending && styles.buttonDisabled]}
                onPress={finishOnboarding}
                disabled={completeOnboardingMutation.isPending}
              >
                {completeOnboardingMutation.isPending ? (
                  <ActivityIndicator color={colors.surface} />
                ) : (
                  <>
                    <Text style={styles.primaryButtonText}>Start Learning</Text>
                    <ChevronRight color={colors.surface} size={20} />
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
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
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.borderLight,
  },
  progressDotActive: {
    backgroundColor: colors.primary,
    width: 24,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  stepContainer: {
    gap: 20,
  },
  emoji: {
    fontSize: 60,
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.text,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
  },
  textArea: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
  },
  primaryButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  classOption: {
    flex: 1,
    minWidth: 140,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  classOptionText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '10',
  },
  optionSelectedText: {
    color: colors.primary,
  },
  subjectsList: {
    gap: 12,
  },
  subjectOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  subjectSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '10',
  },
  subjectOptionText: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: colors.textSecondary,
  },
  subjectSelectedText: {
    color: colors.primary,
  },
  ratingContainer: {
    gap: 12,
    marginBottom: 16,
  },
  subjectLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
  },
  ratingOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  ratingButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  ratingButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '10',
  },
  ratingEmoji: {
    fontSize: 24,
  },
  ratingLabel: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: colors.textSecondary,
  },
  ratingLabelSelected: {
    color: colors.primary,
  },
  painPointContainer: {
    gap: 8,
    marginBottom: 16,
  },
  summaryBox: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    gap: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
  },
});
