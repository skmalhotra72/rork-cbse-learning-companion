import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import colors from '@/constants/colors';
import { Gift } from 'lucide-react-native';

export default function RewardsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Gift color={colors.textLight} size={64} />
        <Text style={styles.title}>Rewards & Goals</Text>
        <Text style={styles.description}>
          Set goals and rewards for your child
        </Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.text,
    marginTop: 24,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
