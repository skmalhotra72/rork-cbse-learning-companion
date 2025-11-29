import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AppStateProvider } from "@/contexts/AppStateContext";
import { AuthProvider } from "@/contexts/AuthContext";
import colors from '@/constants/colors';
import { trpc, trpcClient } from "@/lib/trpc";
import { supabase } from "@/lib/supabase";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="parent-auth" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(student)" />
      <Stack.Screen name="(parent)" />
      <Stack.Screen name="diagnose" />
      <Stack.Screen name="gaps" />
      <Stack.Screen name="stuck" />
      <Stack.Screen name="parent" />
      <Stack.Screen name="badges" />
      <Stack.Screen name="progress" />
      <Stack.Screen name="quiz" />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
    
    const testSupabaseConnection = async () => {
      try {
        const { error } = await supabase.from('users').select('count').limit(1);
        if (error) {
          console.log('Supabase connection test:', error.message);
        } else {
          console.log('✅ Supabase connected successfully');
        }
      } catch (err) {
        console.log('Supabase connection test failed:', err);
      }
    };
    
    testSupabaseConnection();
  }, []);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppStateProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <RootLayoutNav />
            </GestureHandlerRootView>
          </AppStateProvider>
        </AuthProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
