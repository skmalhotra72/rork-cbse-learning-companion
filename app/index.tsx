import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppState } from '@/contexts/AppStateContext';
import colors from '@/constants/colors';

export default function Index() {
  const router = useRouter();
  const { profile, isLoading } = useAppState();

  useEffect(() => {
    console.log('[Index] State changed:', { isLoading, hasProfile: !!profile, onboardingComplete: profile?.onboardingComplete });
    
    if (!isLoading) {
      console.log('[Index] Not loading, navigating...');
      if (!profile || !profile.onboardingComplete) {
        console.log('[Index] Navigating to onboarding');
        router.replace('/onboarding');
      } else {
        console.log('[Index] Navigating to dashboard');
        router.replace('/dashboard');
      }
    } else {
      console.log('[Index] Still loading...');
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
