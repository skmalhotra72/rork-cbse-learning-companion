import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { trpc } from '@/lib/trpc';
import colors from '@/constants/colors';
import { UserPlus, Mail, Lock, User, BookOpen } from 'lucide-react-native';
import type { CBSEClass } from '@/constants/cbse';

export default function SignupScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [grade, setGrade] = useState<CBSEClass | null>(null);
  const [error, setError] = useState<string>('');

  const signupMutation = trpc.auth.signupStudent.useMutation({
    onSuccess: (data) => {
      console.log('[Signup] Success:', data);
      router.replace('/onboarding' as any);
    },
    onError: (error: any) => {
      console.error('[Signup] Error:', error);
      console.error('[Signup] Error details:', {
        message: error?.message,
        data: error?.data,
        cause: error?.cause,
        stack: error?.stack,
      });
      
      let errorMessage = 'Signup failed. Please try again.';
      
      if (error?.message?.includes('fetch') || error?.message?.includes('Network')) {
        errorMessage = 'Cannot connect to server. Please check the backend is running. See "tunnel"';
      } else if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    },
  });

  const handleSignup = () => {
    setError('');
    
    if (!fullName.trim() || !email.trim() || !password.trim() || !grade) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    signupMutation.mutate({
      fullName,
      email,
      password,
      grade: parseInt(grade),
      board: 'CBSE',
    });
  };

  const GRADES: CBSEClass[] = ['9', '10', '11', '12'];

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.emoji}>🎓</Text>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Start your learning journey</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <View style={styles.inputIcon}>
                <User color={colors.textLight} size={20} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                editable={!signupMutation.isPending}
              />
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputIcon}>
                <Mail color={colors.textLight} size={20} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                editable={!signupMutation.isPending}
              />
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputIcon}>
                <Lock color={colors.textLight} size={20} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Password (min 6 characters)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password"
                editable={!signupMutation.isPending}
              />
            </View>

            <View style={styles.gradeSection}>
              <View style={styles.gradeLabelContainer}>
                <BookOpen color={colors.text} size={20} />
                <Text style={styles.gradeLabel}>Select Your Grade</Text>
              </View>
              <View style={styles.gradeGrid}>
                {GRADES.map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={[
                      styles.gradeButton,
                      grade === g && styles.gradeButtonSelected,
                    ]}
                    onPress={() => setGrade(g)}
                    disabled={signupMutation.isPending}
                  >
                    <Text
                      style={[
                        styles.gradeButtonText,
                        grade === g && styles.gradeButtonTextSelected,
                      ]}
                    >
                      Class {g}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.signupButton, signupMutation.isPending && styles.buttonDisabled]}
              onPress={handleSignup}
              disabled={signupMutation.isPending}
            >
              {signupMutation.isPending ? (
                <ActivityIndicator color={colors.surface} />
              ) : (
                <>
                  <UserPlus color={colors.surface} size={20} />
                  <Text style={styles.signupButtonText}>Create Account</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.textButton}
              onPress={() => router.back()}
              disabled={signupMutation.isPending}
            >
              <Text style={styles.textButtonText}>Already have an account? Sign in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
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
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: colors.text,
  },
  gradeSection: {
    gap: 12,
    marginTop: 8,
  },
  gradeLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gradeLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
  },
  gradeGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  gradeButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  gradeButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  gradeButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
  gradeButtonTextSelected: {
    color: colors.primary,
  },
  errorContainer: {
    backgroundColor: colors.accent.red + '10',
    padding: 12,
    borderRadius: 8,
  },
  errorText: {
    color: colors.accent.red,
    fontSize: 14,
    textAlign: 'center',
  },
  signupButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  signupButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  textButton: {
    padding: 12,
    alignItems: 'center',
  },
  textButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600' as const,
  },
});
