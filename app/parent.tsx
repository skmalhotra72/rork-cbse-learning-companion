import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Modal,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppState } from '@/contexts/AppStateContext';
import { ParentReward } from '@/constants/cbse';
import colors from '@/constants/colors';
import {
  Gift,
  Plus,
  CheckCircle2,
  TrendingUp,
  Award,
  Flame,
  X,
  Star,
} from 'lucide-react-native';

export default function ParentScreen() {
  const router = useRouter();
  const { profile, progress, rewards, addReward, completeReward } = useAppState();
  const [showAddReward, setShowAddReward] = useState<boolean>(false);
  const [rewardTitle, setRewardTitle] = useState<string>('');
  const [rewardDescription, setRewardDescription] = useState<string>('');
  const [rewardType, setRewardType] = useState<'xp_milestone' | 'streak_milestone' | 'badge_unlock' | 'custom'>('xp_milestone');
  const [targetValue, setTargetValue] = useState<string>('');

  if (!profile) {
    return null;
  }

  const handleAddReward = () => {
    if (!rewardTitle.trim() || !rewardDescription.trim()) {
      Alert.alert('Missing Information', 'Please enter reward title and description.');
      return;
    }

    const target = rewardType === 'custom' ? 0 : parseInt(targetValue, 10);
    if (rewardType !== 'custom' && (!targetValue || isNaN(target))) {
      Alert.alert('Invalid Target', 'Please enter a valid target value.');
      return;
    }

    const newReward: ParentReward = {
      id: `reward_${Date.now()}`,
      title: rewardTitle,
      description: rewardDescription,
      type: rewardType,
      targetValue: target,
      completed: false,
    };

    addReward(newReward);
    setShowAddReward(false);
    setRewardTitle('');
    setRewardDescription('');
    setTargetValue('');
    Alert.alert('Success', 'Reward added successfully!');
  };

  const handleCompleteReward = (rewardId: string) => {
    Alert.alert(
      'Complete Reward',
      'Has the student earned this reward?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Mark Complete',
          onPress: () => {
            completeReward(rewardId);
            Alert.alert('Congratulations!', 'Reward marked as complete!');
          },
        },
      ]
    );
  };

  const activeRewards = rewards.filter((r) => !r.completed);
  const completedRewards = rewards.filter((r) => r.completed);

  const getRewardProgress = (reward: ParentReward): { current: number; target: number; completed: boolean } => {
    switch (reward.type) {
      case 'xp_milestone':
        return {
          current: progress.xp,
          target: reward.targetValue,
          completed: progress.xp >= reward.targetValue,
        };
      case 'streak_milestone':
        return {
          current: progress.streakDays,
          target: reward.targetValue,
          completed: progress.streakDays >= reward.targetValue,
        };
      case 'badge_unlock':
        return {
          current: progress.badges.length,
          target: reward.targetValue,
          completed: progress.badges.length >= reward.targetValue,
        };
      case 'custom':
        return {
          current: 0,
          target: 0,
          completed: false,
        };
      default:
        return { current: 0, target: 0, completed: false };
    }
  };

  const REWARD_TYPES = [
    { value: 'xp_milestone' as const, label: 'XP Milestone', icon: '⭐', description: 'Reach X total XP' },
    { value: 'streak_milestone' as const, label: 'Streak Milestone', icon: '🔥', description: 'Maintain X day streak' },
    { value: 'badge_unlock' as const, label: 'Badge Collection', icon: '🏆', description: 'Unlock X badges' },
    { value: 'custom' as const, label: 'Custom Goal', icon: '🎯', description: 'Parent-approved reward' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <X color={colors.text} size={24} />
          </TouchableOpacity>
          <Text style={styles.title}>Parent Dashboard</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.studentCard}>
          <View style={styles.studentAvatar}>
            <Text style={styles.studentAvatarText}>{profile.name[0].toUpperCase()}</Text>
          </View>
          <View style={styles.studentInfo}>
            <Text style={styles.studentName}>{profile.name}</Text>
            <Text style={styles.studentClass}>Class {profile.class} • {profile.subjects.length} subjects</Text>
          </View>
        </View>

        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Learning Progress</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statMiniCard}>
              <Star color={colors.secondary} size={24} fill={colors.secondary} />
              <Text style={styles.statMiniValue}>Level {progress.level}</Text>
              <Text style={styles.statMiniLabel}>Current Level</Text>
            </View>
            <View style={styles.statMiniCard}>
              <TrendingUp color={colors.accent.blue} size={24} />
              <Text style={styles.statMiniValue}>{progress.xp}</Text>
              <Text style={styles.statMiniLabel}>Total XP</Text>
            </View>
            <View style={styles.statMiniCard}>
              <Flame color={colors.accent.orange} size={24} />
              <Text style={styles.statMiniValue}>{progress.streakDays}</Text>
              <Text style={styles.statMiniLabel}>Day Streak</Text>
            </View>
            <View style={styles.statMiniCard}>
              <Award color={colors.accent.purple} size={24} />
              <Text style={styles.statMiniValue}>{progress.badges.length}</Text>
              <Text style={styles.statMiniLabel}>Badges</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Rewards</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddReward(true)}
            >
              <Plus color={colors.surface} size={20} />
            </TouchableOpacity>
          </View>

          {activeRewards.length === 0 ? (
            <View style={styles.emptyState}>
              <Gift color={colors.textLight} size={48} />
              <Text style={styles.emptyStateText}>No active rewards</Text>
              <Text style={styles.emptyStateSubtext}>
                Tap + to create a reward for your child
              </Text>
            </View>
          ) : (
            <View style={styles.rewardsList}>
              {activeRewards.map((reward) => {
                const rewardProgress = getRewardProgress(reward);
                const progressPercentage = rewardProgress.target > 0
                  ? Math.min((rewardProgress.current / rewardProgress.target) * 100, 100)
                  : 0;

                return (
                  <View key={reward.id} style={styles.rewardCard}>
                    <View style={styles.rewardHeader}>
                      <View style={styles.rewardIcon}>
                        <Gift color={colors.primary} size={24} />
                      </View>
                      <View style={styles.rewardInfo}>
                        <Text style={styles.rewardTitle}>{reward.title}</Text>
                        <Text style={styles.rewardDescription}>{reward.description}</Text>
                      </View>
                    </View>

                    {reward.type !== 'custom' && (
                      <View style={styles.progressSection}>
                        <View style={styles.progressBar}>
                          <View
                            style={[
                              styles.progressFill,
                              { width: `${progressPercentage}%` },
                              rewardProgress.completed && styles.progressComplete,
                            ]}
                          />
                        </View>
                        <Text style={styles.progressText}>
                          {rewardProgress.current} / {rewardProgress.target}
                        </Text>
                      </View>
                    )}

                    {(reward.type === 'custom' || rewardProgress.completed) && (
                      <TouchableOpacity
                        style={styles.completeButton}
                        onPress={() => handleCompleteReward(reward.id)}
                      >
                        <CheckCircle2 color={colors.success} size={20} />
                        <Text style={styles.completeButtonText}>Mark as Complete</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {completedRewards.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Completed Rewards</Text>
            <View style={styles.rewardsList}>
              {completedRewards.map((reward) => (
                <View key={reward.id} style={[styles.rewardCard, styles.rewardCardCompleted]}>
                  <View style={styles.rewardHeader}>
                    <View style={[styles.rewardIcon, { backgroundColor: colors.success + '20' }]}>
                      <CheckCircle2 color={colors.success} size={24} />
                    </View>
                    <View style={styles.rewardInfo}>
                      <Text style={styles.rewardTitle}>{reward.title}</Text>
                      <Text style={styles.rewardDescription}>{reward.description}</Text>
                      {reward.completedAt && (
                        <Text style={styles.completedDate}>
                          Completed {new Date(reward.completedAt).toLocaleDateString()}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showAddReward}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddReward(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Reward</Text>
              <TouchableOpacity onPress={() => setShowAddReward(false)}>
                <X color={colors.text} size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Reward Title</Text>
                <TextInput
                  style={styles.input}
                  placeholder="E.g., Extra screen time"
                  value={rewardTitle}
                  onChangeText={setRewardTitle}
                />
              </View>

              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="What will the student get?"
                  value={rewardDescription}
                  onChangeText={setRewardDescription}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Reward Type</Text>
                <View style={styles.rewardTypesGrid}>
                  {REWARD_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type.value}
                      style={[
                        styles.rewardTypeCard,
                        rewardType === type.value && styles.rewardTypeCardSelected,
                      ]}
                      onPress={() => setRewardType(type.value)}
                    >
                      <Text style={styles.rewardTypeIcon}>{type.icon}</Text>
                      <Text
                        style={[
                          styles.rewardTypeLabel,
                          rewardType === type.value && styles.rewardTypeLabelSelected,
                        ]}
                      >
                        {type.label}
                      </Text>
                      <Text style={styles.rewardTypeDescription}>{type.description}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {rewardType !== 'custom' && (
                <View style={styles.inputSection}>
                  <Text style={styles.inputLabel}>
                    Target {rewardType === 'xp_milestone' ? 'XP' : rewardType === 'streak_milestone' ? 'Days' : 'Badges'}
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter target value"
                    value={targetValue}
                    onChangeText={setTargetValue}
                    keyboardType="number-pad"
                  />
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.saveButton,
                  (!rewardTitle.trim() || !rewardDescription.trim()) && styles.buttonDisabled,
                ]}
                onPress={handleAddReward}
                disabled={!rewardTitle.trim() || !rewardDescription.trim()}
              >
                <Text style={styles.saveButtonText}>Add Reward</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.text,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    gap: 16,
  },
  studentAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  studentAvatarText: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.surface,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 4,
  },
  studentClass: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statMiniCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  statMiniValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text,
  },
  statMiniLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  rewardsList: {
    gap: 12,
  },
  rewardCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  rewardCardCompleted: {
    opacity: 0.7,
  },
  rewardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  rewardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rewardInfo: {
    flex: 1,
  },
  rewardTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 4,
  },
  rewardDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  completedDate: {
    fontSize: 12,
    color: colors.success,
    marginTop: 4,
  },
  progressSection: {
    gap: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.borderLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  progressComplete: {
    backgroundColor: colors.success,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success + '20',
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  completeButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.success,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.text,
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  rewardTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  rewardTypeCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  rewardTypeCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  rewardTypeIcon: {
    fontSize: 32,
  },
  rewardTypeLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text,
    textAlign: 'center',
  },
  rewardTypeLabelSelected: {
    color: colors.primary,
  },
  rewardTypeDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
