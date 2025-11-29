import { Stack } from 'expo-router';
import colors from '@/constants/colors';

export default function ParentLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="home" />
      <Stack.Screen name="rewards" />
      <Stack.Screen name="analytics" />
    </Stack>
  );
}
