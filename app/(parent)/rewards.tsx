import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TextInput, Alert } from 'react-native';
import colors from '@/constants/colors';
import { Gift, Plus, Edit2, Trash2, X } from 'lucide-react-native';
import { trpc } from '@/lib/trpc';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

type RewardType = 'privilege' | 'gift' | 'activity';

export default function RewardsScreen() {
  const { profile } = useAuth();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editingReward, setEditingReward] = useState<any>(null);
  const [formData, setFormData] = useState<{
    rewardName: string;
    description: string;
    pointsRequired: string;
    rewardType: RewardType;
  }>({
    rewardName: '',
    description: '',
    pointsRequired: '',
    rewardType: 'privilege',
  });

  const parentProfile = profile as any;
  const linkedStudents = parentProfile?.linkedStudents || [];
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    linkedStudents[0]?.id || null
  );

  const rewardsQuery = trpc.rewards.getAll.useQuery(
    selectedStudentId ? { studentId: selectedStudentId } : undefined
  );

  const createMutation = trpc.rewards.create.useMutation({
    onSuccess: () => {
      rewardsQuery.refetch();
      setModalVisible(false);
      resetForm();
      Alert.alert('Success', 'Reward created successfully');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Failed to create reward');
    },
  });

  const updateMutation = trpc.rewards.update.useMutation({
    onSuccess: () => {
      rewardsQuery.refetch();
      setModalVisible(false);
      resetForm();
      Alert.alert('Success', 'Reward updated successfully');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Failed to update reward');
    },
  });

  const deleteMutation = trpc.rewards.delete.useMutation({
    onSuccess: () => {
      rewardsQuery.refetch();
      Alert.alert('Success', 'Reward deleted successfully');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Failed to delete reward');
    },
  });

  const resetForm = () => {
    setFormData({
      rewardName: '',
      description: '',
      pointsRequired: '',
      rewardType: 'privilege',
    });
    setEditingReward(null);
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const handleOpenEditModal = (reward: any) => {
    setEditingReward(reward);
    setFormData({
      rewardName: reward.reward_name,
      description: reward.description || '',
      pointsRequired: reward.points_required.toString(),
      rewardType: reward.reward_type,
    });
    setModalVisible(true);
  };

  const handleSubmit = () => {
    if (!formData.rewardName || !formData.pointsRequired || !selectedStudentId) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    if (editingReward) {
      updateMutation.mutate({
        rewardId: editingReward.id,
        rewardName: formData.rewardName,
        description: formData.description,
        pointsRequired: parseInt(formData.pointsRequired),
        rewardType: formData.rewardType,
      });
    } else {
      createMutation.mutate({
        studentId: selectedStudentId,
        rewardName: formData.rewardName,
        description: formData.description,
        pointsRequired: parseInt(formData.pointsRequired),
        rewardType: formData.rewardType,
      });
    }
  };

  const handleDelete = (rewardId: string) => {
    Alert.alert(
      'Delete Reward',
      'Are you sure you want to delete this reward?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteMutation.mutate({ rewardId }),
        },
      ]
    );
  };

  if (!selectedStudentId) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <Gift color={colors.textLight} size={64} />
          <Text style={styles.emptyTitle}>No Students Linked</Text>
          <Text style={styles.emptyText}>
            Link a student account to manage rewards
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Rewards & Goals</Text>
            <Text style={styles.headerSubtitle}>
              Set goals and rewards for your child
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleOpenCreateModal}
          >
            <Plus color={colors.surface} size={24} />
          </TouchableOpacity>
        </View>

        {linkedStudents.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.studentsScroll}
            contentContainerStyle={styles.studentsContainer}
          >
            {linkedStudents.map((student: any) => (
              <TouchableOpacity
                key={student.id}
                style={[
                  styles.studentChip,
                  selectedStudentId === student.id && styles.studentChipActive,
                ]}
                onPress={() => setSelectedStudentId(student.id)}
              >
                <Text
                  style={[
                    styles.studentChipText,
                    selectedStudentId === student.id && styles.studentChipTextActive,
                  ]}
                >
                  {student.fullName}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {rewardsQuery.isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : rewardsQuery.data?.rewards.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Gift color={colors.textLight} size={48} />
            <Text style={styles.emptyTitle}>No Rewards Yet</Text>
            <Text style={styles.emptyText}>
              Create your first reward to motivate your child
            </Text>
          </View>
        ) : (
          <View style={styles.rewardsList}>
            {rewardsQuery.data?.rewards.map((reward: any) => (
              <View key={reward.id} style={styles.rewardCard}>
                <View style={styles.rewardIconContainer}>
                  <Gift color={getRewardColor(reward.reward_type)} size={24} />
                </View>
                <View style={styles.rewardContent}>
                  <Text style={styles.rewardName}>{reward.reward_name}</Text>
                  {reward.description && (
                    <Text style={styles.rewardDescription} numberOfLines={2}>
                      {reward.description}
                    </Text>
                  )}
                  <View style={styles.rewardMeta}>
                    <Text style={styles.rewardPoints}>
                      {reward.points_required} XP
                    </Text>
                    <Text style={styles.rewardType}>
                      {reward.reward_type}
                    </Text>
                    {reward.is_redeemed && (
                      <Text style={styles.redeemedBadge}>Redeemed</Text>
                    )}
                  </View>
                </View>
                {!reward.is_redeemed && (
                  <View style={styles.rewardActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleOpenEditModal(reward)}
                    >
                      <Edit2 color={colors.primary} size={18} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleDelete(reward.id)}
                    >
                      <Trash2 color={colors.danger} size={18} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingReward ? 'Edit Reward' : 'Create Reward'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X color={colors.textSecondary} size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <Text style={styles.inputLabel}>Reward Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.rewardName}
                onChangeText={(text) =>
                  setFormData({ ...formData, rewardName: text })
                }
                placeholder="e.g., Extra screen time"
                placeholderTextColor={colors.textLight}
              />

              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) =>
                  setFormData({ ...formData, description: text })
                }
                placeholder="Optional description"
                placeholderTextColor={colors.textLight}
                multiline
                numberOfLines={3}
              />

              <Text style={styles.inputLabel}>Points Required *</Text>
              <TextInput
                style={styles.input}
                value={formData.pointsRequired}
                onChangeText={(text) =>
                  setFormData({ ...formData, pointsRequired: text })
                }
                placeholder="e.g., 100"
                placeholderTextColor={colors.textLight}
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>Reward Type *</Text>
              <View style={styles.typeButtons}>
                {(['privilege', 'gift', 'activity'] as RewardType[]).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeButton,
                      formData.rewardType === type && styles.typeButtonActive,
                    ]}
                    onPress={() => setFormData({ ...formData, rewardType: type })}
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        formData.rewardType === type && styles.typeButtonTextActive,
                      ]}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonTextSecondary}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <ActivityIndicator color={colors.surface} size="small" />
                ) : (
                  <Text style={styles.modalButtonTextPrimary}>
                    {editingReward ? 'Update' : 'Create'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function getRewardColor(type: string): string {
  switch (type) {
    case 'privilege':
      return colors.accent.purple;
    case 'gift':
      return colors.accent.blue;
    case 'activity':
      return colors.accent.green;
    default:
      return colors.primary;
  }
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  studentsScroll: {
    marginBottom: 20,
    flexGrow: 0,
  },
  studentsContainer: {
    gap: 8,
  },
  studentChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
  },
  studentChipActive: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  studentChipText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
  studentChipTextActive: {
    color: colors.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
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
    alignItems: 'flex-start',
    gap: 12,
  },
  rewardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rewardContent: {
    flex: 1,
  },
  rewardName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 4,
  },
  rewardDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    lineHeight: 18,
  },
  rewardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rewardPoints: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  rewardType: {
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  redeemedBadge: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.accent.green,
    backgroundColor: colors.accent.green + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rewardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
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
    maxHeight: '80%',
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
  modalForm: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 8,
    marginTop: 12,
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
    minHeight: 80,
    textAlignVertical: 'top',
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
  typeButtonTextActive: {
    color: colors.primary,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonSecondary: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalButtonPrimary: {
    backgroundColor: colors.primary,
  },
  modalButtonTextSecondary: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
  },
  modalButtonTextPrimary: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.surface,
  },
});
