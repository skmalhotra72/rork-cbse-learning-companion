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
import { useAppState } from '@/contexts/AppStateContext';
import { diagnoseGaps } from '@/services/aiService';
import { Subject } from '@/constants/cbse';
import colors from '@/constants/colors';
import { Target, AlertCircle, ArrowRight, Sparkles } from 'lucide-react-native';

export default function DiagnoseScreen() {
  const router = useRouter();
  const { profile, addConceptGap, addXP } = useAppState();
  const [diagnosing, setDiagnosing] = useState<boolean>(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [error, setError] = useState<string>('');

  if (!profile) {
    return null;
  }

  const handleDiagnose = async () => {
    if (!selectedSubject) return;

    setDiagnosing(true);
    setError('');

    try {
      const painPoints = profile.painPoints[selectedSubject] || [];
      const rating = profile.subjectRatings[selectedSubject];

      const gaps = await diagnoseGaps(
        profile.class,
        selectedSubject,
        painPoints,
        rating
      );

      gaps.forEach((gap) => {
        addConceptGap(gap);
      });

      addXP(20);

      router.push('/gaps' as any);
    } catch (err) {
      console.error('Error diagnosing gaps:', err);
      setError(err instanceof Error ? err.message : 'Failed to diagnose gaps');
    } finally {
      setDiagnosing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Target color={colors.primary} size={48} />
          </View>
          <Text style={styles.title}>Diagnose My Gaps</Text>
          <Text style={styles.description}>
            {`Let's identify where you're struggling and create a personalized learning path.`}
          </Text>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <AlertCircle color={colors.danger} size={20} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select a subject to analyze</Text>
          <View style={styles.subjectsList}>
            {profile.subjects.map((subject) => {
              const rating = profile.subjectRatings[subject];
              const isSelected = selectedSubject === subject;
              
              let emoji = '📚';
              if (rating === 'struggling') emoji = '😰';
              else if (rating === 'okay') emoji = '😐';
              else if (rating === 'confident') emoji = '😊';
              else if (rating === 'expert') emoji = '🚀';

              return (
                <TouchableOpacity
                  key={subject}
                  style={[styles.subjectCard, isSelected && styles.subjectCardSelected]}
                  onPress={() => setSelectedSubject(subject)}
                  disabled={diagnosing}
                >
                  <Text style={styles.subjectEmoji}>{emoji}</Text>
                  <View style={styles.subjectInfo}>
                    <Text style={styles.subjectName}>{subject}</Text>
                    <Text style={styles.subjectRating}>
                      Self-rating: {rating}
                    </Text>
                  </View>
                  {isSelected && (
                    <View style={styles.selectedBadge}>
                      <Sparkles color={colors.secondary} size={20} fill={colors.secondary} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {selectedSubject && (
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>What will happen?</Text>
            <Text style={styles.infoText}>
              • AI will analyze your self-rating and pain points{'\n'}
              • Identify 2-3 key concept gaps{'\n'}
              • Suggest prerequisite topics to review{'\n'}
              • Create a step-by-step learning path
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.diagnoseButton,
            (!selectedSubject || diagnosing) && styles.buttonDisabled,
          ]}
          onPress={handleDiagnose}
          disabled={!selectedSubject || diagnosing}
        >
          {diagnosing ? (
            <ActivityIndicator color={colors.surface} size="small" />
          ) : (
            <>
              <Text style={styles.buttonText}>Start Diagnosis</Text>
              <ArrowRight color={colors.surface} size={20} />
            </>
          )}
        </TouchableOpacity>

        {diagnosing && (
          <View style={styles.loadingBox}>
            <Text style={styles.loadingText}>
              Analyzing your knowledge gaps...
            </Text>
            <Text style={styles.loadingSubtext}>
              This may take a few seconds
            </Text>
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
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.danger + '10',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginBottom: 24,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: colors.danger,
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 16,
  },
  subjectsList: {
    gap: 12,
  },
  subjectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  subjectCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  subjectEmoji: {
    fontSize: 40,
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
  subjectRating: {
    fontSize: 14,
    color: colors.textSecondary,
    textTransform: 'capitalize' as const,
  },
  selectedBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoBox: {
    backgroundColor: colors.accent.blue + '10',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  diagnoseButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  loadingBox: {
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
