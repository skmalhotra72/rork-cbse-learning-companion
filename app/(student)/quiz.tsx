import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import colors from '@/constants/colors';
import { CheckSquare } from 'lucide-react-native';

export default function QuizScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <CheckSquare color={colors.textLight} size={64} />
        <Text style={styles.title}>Quiz</Text>
        <Text style={styles.description}>
          Test your knowledge
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
