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
import { Mail, Lock, User, Users } from 'lucide-react-native';

type Mode = 'login' | 'signup';

export default function ParentAuthScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      console.log('[Parent Login] Success:', data);
      if (data.user.role === 'parent') {
        router.replace('/(parent)/home' as any);
      } else {
        setError('This account is not registered as a parent');
      }
    },
    onError: (error: any) => {
      console.error('[Parent Login] Error details:', {
        message: error?.message,
        data: error?.data,
        cause: error?.cause,
      });
      
      let errorMessage = 'Login failed. Please try again.';
      
      if (error?.message?.includes('fetch')) {
        errorMessage = 'Cannot connect to server. Please ensure the backend is running (bun dev --tunnel)';
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.data?.message) {
        errorMessage = error.data.message;
      }
      
      setError(errorMessage);
    },
  });

  const signupMutation = trpc.auth.signupParent.useMutation({
    onSuccess: (data) => {
      console.log('[Parent Signup] Success:', data);
      router.replace('/(parent)/home' as any);
    },
    onError: (error: any) => {
      console.error('[Parent Signup] Error details:', {
        message: error?.message,
        data: error?.data,
        cause: error?.cause,
      });
      
      let errorMessage = 'Signup failed. Please try again.';
      
      if (error?.message?.includes('fetch')) {
        errorMessage = 'Cannot connect to server. Please ensure the backend is running (bun dev --tunnel)';
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.data?.message) {
        errorMessage = error.data.message;
      }
      
      setError(errorMessage);
    },
  });

  const handleSubmit = () => {
    setError('');
    
    if (mode === 'login') {
      if (!email.trim() || !password.trim()) {
        setError('Please enter both email and password');
        return;
      }
      loginMutation.mutate({ email, password });
    } else {
      if (!fullName.trim() || !email.trim() || !password.trim()) {
        setError('Please fill in all fields');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      signupMutation.mutate({ fullName, email, password });
    }
  };

  const isPending = loginMutation.isPending || signupMutation.isPending;

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
            <Text style={styles.emoji}>👨‍👩‍👧‍👦</Text>
            <Text style={styles.title}>Parent Portal</Text>
            <Text style={styles.subtitle}>
              {mode === 'login' ? 'Monitor your child&apos;s progress' : 'Create a parent account'}
            </Text>
          </View>

          <View style={styles.modeToggle}>
            <TouchableOpacity
              style={[styles.modeButton, mode === 'login' && styles.modeButtonActive]}
              onPress={() => setMode('login')}
              disabled={isPending}
            >
              <Text style={[styles.modeButtonText, mode === 'login' && styles.modeButtonTextActive]}>
                Sign In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeButton, mode === 'signup' && styles.modeButtonActive]}
              onPress={() => setMode('signup')}
              disabled={isPending}
            >
              <Text style={[styles.modeButtonText, mode === 'signup' && styles.modeButtonTextActive]}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            {mode === 'signup' && (
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
                  editable={!isPending}
                />
              </View>
            )}

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
                editable={!isPending}
              />
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputIcon}>
                <Lock color={colors.textLight} size={20} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password"
                editable={!isPending}
              />
            </View>

            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.submitButton, isPending && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={isPending}
            >
              {isPending ? (
                <ActivityIndicator color={colors.surface} />
              ) : (
                <>
                  <Users color={colors.surface} size={20} />
                  <Text style={styles.submitButtonText}>
                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.textButton}
              onPress={() => router.back()}
              disabled={isPending}
            >
              <Text style={styles.textButtonText}>Back to Student Login</Text>
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
    textAlign: 'center',
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  modeButtonActive: {
    backgroundColor: colors.primary,
  },
  modeButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
  modeButtonTextActive: {
    color: colors.surface,
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
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  submitButtonText: {
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
