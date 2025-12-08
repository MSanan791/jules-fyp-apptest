import React from 'react';
import { Text, ActivityIndicator } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export const AnimatedButton = ({ onPress, title, variant = 'primary', isLoading, disabled, icon }: ButtonProps) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => { scale.value = withSpring(0.95); };
  const handlePressOut = () => { scale.value = withSpring(1); };

  // Color logic
  const getBgColor = () => {
    if (disabled) return 'bg-gray-300 dark:bg-gray-700';
    switch(variant) {
      case 'secondary': return 'bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700';
      case 'danger': return 'bg-status-error';
      default: return 'bg-primary';
    }
  };

  const getTextColor = () => {
    if (disabled) return 'text-gray-500';
    if (variant === 'secondary') return 'text-text-light dark:text-text-dark';
    return 'text-white';
  };

  return (
    <TouchableWithoutFeedback 
      onPressIn={handlePressIn} 
      onPressOut={handlePressOut} 
      onPress={disabled || isLoading ? undefined : onPress}
    >
      <Animated.View className={`h-14 w-full flex-row items-center justify-center rounded-2xl shadow-sm ${getBgColor()}`} style={animatedStyle}>
        {isLoading ? (
          <ActivityIndicator color={variant === 'secondary' ? '#3B82F6' : '#fff'} />
        ) : (
          <>
            {icon && <Animated.View className="mr-2">{icon}</Animated.View>}
            <Text className={`text-base font-bold ${getTextColor()}`}>{title}</Text>
          </>
        )}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};