import createContextHook from '@nkzw/create-context-hook';
import { useState } from 'react';
import Toast from '@/components/Toast';

type ToastType = 'badge' | 'level' | 'reward' | 'success' | 'error' | 'info';

interface ToastConfig {
  id: string;
  visible: boolean;
  type: ToastType;
  title: string;
  message?: string;
  icon?: string;
  duration?: number;
}

export const [ToastProvider, useToast] = createContextHook(() => {
  const [toasts, setToasts] = useState<ToastConfig[]>([]);

  const showToast = (config: Omit<ToastConfig, 'id' | 'visible'>) => {
    const id = Math.random().toString(36).substring(7);
    const newToast: ToastConfig = {
      ...config,
      id,
      visible: true,
    };
    
    setToasts((prev) => [...prev, newToast]);
  };

  const hideToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const showBadgeUnlocked = (badgeName: string, badgeIcon: string, message?: string) => {
    showToast({
      type: 'badge',
      title: `Badge Unlocked: ${badgeName}!`,
      message: message || 'Keep up the great work!',
      icon: badgeIcon,
      duration: 5000,
    });
  };

  const showLevelUp = (newLevel: number) => {
    showToast({
      type: 'level',
      title: `Level Up! You're now Level ${newLevel}!`,
      message: 'Your hard work is paying off!',
      duration: 4000,
    });
  };

  const showRewardUnlocked = (rewardName: string) => {
    showToast({
      type: 'reward',
      title: 'Reward Unlocked!',
      message: `You can now redeem: ${rewardName}`,
      duration: 4000,
    });
  };

  const showXPEarned = (xp: number, action: string) => {
    showToast({
      type: 'success',
      title: `+${xp} XP Earned!`,
      message: action,
      duration: 3000,
    });
  };

  return {
    toasts,
    showToast,
    hideToast,
    showBadgeUnlocked,
    showLevelUp,
    showRewardUnlocked,
    showXPEarned,
    ToastRenderer: () => (
      <>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            visible={toast.visible}
            type={toast.type}
            title={toast.title}
            message={toast.message}
            icon={toast.icon}
            duration={toast.duration}
            onDismiss={() => hideToast(toast.id)}
          />
        ))}
      </>
    ),
  };
});
