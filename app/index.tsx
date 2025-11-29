import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, useRootNavigationState } from 'expo-router';
import { useAppState } from '@/contexts/AppStateContext';
import colors from '@/constants/colors';

export default function Index() {
  const router = useRouter();
  const { profile, isLoading } = useAppState();
  const rootNavigationState = useRootNavigationState();
  const [hasNavigated, setHasNavigated] = useState(false);

  useEffect(() => {
    console.log('[Index] State changed:', { 
      isLoading, 
      hasProfile: !!profile, 
      onboardingComplete: profile?.onboardingComplete,
      navigationReady: rootNavigationState?.key,
      hasNavigated
    });
    
    if (!rootNavigationState?.key || hasNavigated) {
      console.log('[Index] Navigation not ready or already navigated');
      return;
    }
    
    if (!isLoading) {
      console.log('[Index] Not loading, navigating...');
      setHasNavigated(true);
      
      setTimeout(() => {
        if (!profile || !profile.onboardingComplete) {
          console.log('[Index] Navigating to onboarding');
          router.replace('/onboarding');
        } else {
          console.log('[Index] Navigating to dashboard');
          router.replace('/dashboard');
        }
      }, 100);
    } else {
      console.log('[Index] Still loading...');
    }
  }, [isLoading, profile, rootNavigationState?.key, hasNavigated, router]);

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
