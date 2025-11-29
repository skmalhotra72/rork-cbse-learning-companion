import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppState } from '@/contexts/AppStateContext';
import colors from '@/constants/colors';

export default function Index() {
  const router = useRouter();
  const { profile, isLoading } = useAppState();

  useEffect(() => {
    if (!isLoading) {
      if (!profile || !profile.onboardingComplete) {
        router.replace('/onboarding');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [isLoading, profile, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
