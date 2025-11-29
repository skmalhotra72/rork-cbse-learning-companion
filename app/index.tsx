import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, useRootNavigationState } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import colors from '@/constants/colors';

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, isLoading, role } = useAuth();
  const rootNavigationState = useRootNavigationState();
  const [hasNavigated, setHasNavigated] = useState(false);

  useEffect(() => {
    console.log('[Index] State changed:', { 
      isLoading, 
      isAuthenticated,
      role,
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
        if (!isAuthenticated) {
          console.log('[Index] Not authenticated, navigating to login');
          router.replace('/login');
        } else if (role === 'student') {
          console.log('[Index] Student authenticated, navigating to dashboard');
          router.replace('/(student)/dashboard');
        } else if (role === 'parent') {
          console.log('[Index] Parent authenticated, navigating to parent dashboard');
          router.replace('/(parent)/home');
        }
      }, 100);
    } else {
      console.log('[Index] Still loading...');
    }
  }, [isLoading, isAuthenticated, role, rootNavigationState?.key, hasNavigated, router]);

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

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { View, Text } from 'react-native';

export default function Home() {
  useEffect(() => {
    async function test() {
      const { data, error } = await supabase.from('profiles').select('*').limit(1);
      console.log("Supabase Test:", { data, error });
    }
    test();
  }, []);

  return (
    <View><Text>Home Screen</Text></View>
  );
}
