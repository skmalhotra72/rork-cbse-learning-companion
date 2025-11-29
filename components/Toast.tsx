import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Award, TrendingUp, Gift, X } from 'lucide-react-native';
import colors from '@/constants/colors';

type ToastType = 'badge' | 'level' | 'reward' | 'success' | 'error' | 'info';

interface ToastProps {
  visible: boolean;
  type: ToastType;
  title: string;
  message?: string;
  icon?: string;
  onDismiss: () => void;
  duration?: number;
}

export default function Toast({
  visible,
  type,
  title,
  message,
  icon,
  onDismiss,
  duration = 4000,
}: ToastProps) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, duration]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  if (!visible) return null;

  const getIcon = () => {
    if (icon) return <Text style={styles.emoji}>{icon}</Text>;
    
    switch (type) {
      case 'badge':
        return <Award color={colors.accent.purple} size={24} />;
      case 'level':
        return <TrendingUp color={colors.accent.green} size={24} />;
      case 'reward':
        return <Gift color={colors.accent.orange} size={24} />;
      default:
        return <Award color={colors.primary} size={24} />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'badge':
        return colors.accent.purple + '15';
      case 'level':
        return colors.accent.green + '15';
      case 'reward':
        return colors.accent.orange + '15';
      case 'success':
        return colors.accent.green + '15';
      case 'error':
        return colors.danger + '15';
      default:
        return colors.primary + '15';
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
          backgroundColor: getBackgroundColor(),
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>{getIcon()}</View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          {message && <Text style={styles.message}>{message}</Text>}
        </View>
        <TouchableOpacity onPress={handleDismiss} style={styles.closeButton}>
          <X color={colors.textSecondary} size={20} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 2,
  },
  message: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  closeButton: {
    padding: 4,
  },
});
