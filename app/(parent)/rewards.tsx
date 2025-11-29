import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { trpc } from '@/lib/trpc';
import colors from '@/constants/colors';
import { Gift, Plus, X, Trophy, Star, Sparkles } from 'lucide-react-native';

type RewardType = 'privilege' | 'gift' | 'activity';

export default function RewardsScreen() {
  const { profile, role } = useAuth();
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [rewardName, setRewardName] = useState('');
  const [rewardDescription, setRewardDescription] = useState('');
  const [pointsRequired, setPointsRequired] = useState('');
  const [rewardType, setRewardType] = useState<RewardType>('privilege');

  const createRewardMutation = trpc.rewards.create.useMutation();

  if (!profile || role !== 'parent') {
    return null;
  }

  const parentProfile = profile as any;
  const linkedStudents = parentProfile.linkedStudents || [];
  const currentStudent = selectedStudentId || linkedStudents[0]?.id;

  const rewardsQuery = trpc.rewards.get.useQuery(
    { studentId: currentStudent },
    { enabled: !!currentStudent }
  );

  const handleCreateReward = async () => {
    if (!rewardName.trim() || !pointsRequired || !currentStudent) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const points = parseInt(pointsRequired);
    if (isNaN(points) || points <= 0) {
      Alert.alert('Error', 'Please enter a valid number of points');
      return;
    }

    try {
      await createRewardMutation.mutateAsync({
        studentId: currentStudent,
        rewardName: rewardName.trim(),
        description: rewardDescription.trim() || undefined,
        pointsRequired: points,
        rewardType,
      });

      setShowCreateModal(false);
      setRewardName('');
      setRewardDescription('');
      setPointsRequired('');
      setRewardType('privilege');
      rewardsQuery.refetch();
      Alert.alert('Success', 'Reward created successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create reward');
    }
  };

  const getRewardIcon = (type: RewardType) => {
    switch (type) {
      case 'privilege':
        return <Star color={colors.accent.purple} size={20} />;
      case 'gift':
        return <Gift color={colors.accent.pink} size={20} />;
      case 'activity':
        return <Sparkles color={colors.accent.blue} size={20} />;
    }
  };

  const getTypeColor = (type: RewardType) => {
    switch (type) {
      case 'privilege':
        return colors.accent.purple;
      case 'gift':
        return colors.accent.pink;
      case 'activity':
        return colors.accent.blue;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Trophy color={colors.primary} size={32} />
          <Text style={styles.title}>Rewards & Incentives</Text>
          <Text style={styles.subtitle}>Motivate your child with rewards</Text>
        </View>

        {linkedStudents.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No students linked</Text>
          </View>
        ) : (
          <>
            {linkedStudents.length > 1 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.studentTabs}>
                {linkedStudents.map((student: any) => (
                  <TouchableOpacity
                    key={student.id}
                    style={[
                      styles.studentTab,
                      currentStudent === student.id && styles.studentTabActive,
                    ]}
                    onPress={() => setSelectedStudentId(student.id)}
                  >
                    <Text
                      style={[
                        styles.studentTabText,
                        currentStudent === student.id && styles.studentTabTextActive,
                      ]}
                    >
                      {student.fullName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {rewardsQuery.data && (
              <View style={styles.pointsCard}>
                <Text style={styles.pointsLabel}>Current Points</Text>
                <Text style={styles.pointsValue}>{rewardsQuery.data.currentPoints}</Text>
              </View>
            )}

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Active Rewards</Text>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => setShowCreateModal(true)}
                >
                  <Plus color={colors.surface} size={20} />
                </TouchableOpacity>
              </View>

              {rewardsQuery.isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color={colors.primary} />
                </View>
              ) : !rewardsQuery.data || rewardsQuery.data.rewards.length === 0 ? (
                <View style={styles.emptyRewards}>
                  <Gift color={colors.textLight} size={48} />
                  <Text style={styles.emptyRewardsText}>No rewards yet</Text>
                  <Text style={styles.emptyRewardsSubtext}>
                    Create rewards to motivate your child
                  </Text>
                </View>
              ) : (
                <View style={styles.rewardsList}>
                  {rewardsQuery.data.rewards.map((reward: any) => (
                    <View key={reward.id} style={styles.rewardCard}>
                      <View
                        style={[
                          styles.rewardIconContainer,
                          { backgroundColor: getTypeColor(reward.reward_type) + '20' },
                        ]}
                      >
                        {getRewardIcon(reward.reward_type)}
                      </View>
                      <View style={styles.rewardInfo}>
                        <Text style={styles.rewardName}>{reward.reward_name}</Text>
                        {reward.description && (
                          <Text style={styles.rewardDescription}>{reward.description}</Text>
                        )}
                        <View style={styles.rewardMeta}>
                          <Text style={styles.rewardPoints}>{reward.points_required} points</Text>
                          {reward.is_redeemed && (
                            <View style={styles.redeemedBadge}>
                              <Text style={styles.redeemedText}>Redeemed</Text>
                            </View>
                          )}
                          {!reward.is_redeemed && reward.canRedeem && (
                            <View style={styles.availableBadge}>
                              <Text style={styles.availableText}>Available!</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>

      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Reward</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <X color={colors.textSecondary} size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.inputLabel}>Reward Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Movie Night"
                value={rewardName}
                onChangeText={setRewardName}
                placeholderTextColor={colors.textLight}
              />

              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Optional description"
                value={rewardDescription}
                onChangeText={setRewardDescription}
                multiline
                numberOfLines={3}
                placeholderTextColor={colors.textLight}
              />

              <Text style={styles.inputLabel}>Points Required *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 500"
                value={pointsRequired}
                onChangeText={setPointsRequired}
                keyboardType="number-pad"
                placeholderTextColor={colors.textLight}
              />

              <Text style={styles.inputLabel}>Reward Type</Text>
              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    rewardType === 'privilege' && styles.typeButtonActive,
                  ]}
                  onPress={() => setRewardType('privilege')}
                >
                  <Star
                    color={rewardType === 'privilege' ? colors.surface : colors.accent.purple}
                    size={20}
                  />
                  <Text
                    style={[
                      styles.typeButtonText,
                      rewardType === 'privilege' && styles.typeButtonTextActive,
                    ]}
                  >
                    Privilege
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    rewardType === 'gift' && styles.typeButtonActive,
                  ]}
                  onPress={() => setRewardType('gift')}
                >
                  <Gift
                    color={rewardType === 'gift' ? colors.surface : colors.accent.pink}
                    size={20}
                  />
                  <Text
                    style={[
                      styles.typeButtonText,
                      rewardType === 'gift' && styles.typeButtonTextActive,
                    ]}
                  >
                    Gift
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    rewardType === 'activity' && styles.typeButtonActive,
                  ]}
                  onPress={() => setRewardType('activity')}
                >
                  <Sparkles
                    color={rewardType === 'activity' ? colors.surface : colors.accent.blue}
                    size={20}
                  />
                  <Text
                    style={[
                      styles.typeButtonText,
                      rewardType === 'activity' && styles.typeButtonTextActive,
                    ]}
                  >
                    Activity
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.modalButtonSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleCreateReward}
                disabled={createRewardMutation.isPending}
              >
                {createRewardMutation.isPending ? (
                  <ActivityIndicator color={colors.surface} size="small" />
                ) : (
                  <Text style={styles.modalButtonPrimaryText}>Create</Text>
                )}
              </TouchableOpacity>
            </View>
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
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.text,
    marginTop: 12,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  studentTabs: {
    marginBottom: 20,
    maxHeight: 50,
  },
  studentTab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: colors.surface,
    marginRight: 8,
    borderWidth: 2,
    borderColor: colors.border,
  },
  studentTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  studentTabText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text,
  },
  studentTabTextActive: {
    color: colors.surface,
  },
  pointsCard: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  pointsLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  pointsValue: {
    fontSize: 36,
    fontWeight: '700' as const,
    color: colors.surface,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  emptyRewards: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
  },
  emptyRewardsText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyRewardsSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  rewardsList: {
    gap: 12,
  },
  rewardCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rewardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rewardInfo: {
    flex: 1,
  },
  rewardName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 4,
  },
  rewardDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  rewardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rewardPoints: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  redeemedBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: colors.textLight + '20',
  },
  redeemedText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
  availableBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: colors.success + '20',
  },
  availableText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: colors.success,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text,
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
  },
  typeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text,
  },
  typeButtonTextActive: {
    color: colors.surface,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonSecondary: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
  },
  modalButtonSecondaryText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
  },
  modalButtonPrimary: {
    backgroundColor: colors.primary,
  },
  modalButtonPrimaryText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.surface,
  },
});
