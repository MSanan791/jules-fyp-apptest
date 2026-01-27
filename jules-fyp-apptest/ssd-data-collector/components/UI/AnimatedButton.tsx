import React from 'react';
import { Text, ActivityIndicator } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { useTheme } from '../../context/ThemeContext';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export const AnimatedButton = ({ 
  onPress, 
  title, 
  variant = 'primary', 
  isLoading, 
  disabled, 
  icon 
}: ButtonProps) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => { 
    if (!disabled && !isLoading) {
      scale.value = withSpring(0.95);
    }
  };
  
  const handlePressOut = () => { 
    scale.value = withSpring(1); 
  };

  const getBgColor = () => {
    if (disabled) return isDark ? 'bg-gray-700' : 'bg-gray-300';
    switch(variant) {
      case 'secondary': 
        return isDark 
          ? 'bg-[#192633] border border-gray-700' 
          : 'bg-white border border-gray-200';
      case 'danger': 
        return isDark ? 'bg-red-600' : 'bg-red-500';
      default: 
        return isDark ? 'bg-blue-600' : 'bg-blue-500';
    }
  };

  const getTextColor = () => {
    if (disabled) return 'text-gray-500';
    if (variant === 'secondary') return isDark ? 'text-white' : 'text-gray-900';
    return 'text-white';
  };

  return (
    <TouchableWithoutFeedback 
      onPressIn={handlePressIn} 
      onPressOut={handlePressOut} 
      onPress={disabled || isLoading ? undefined : onPress}
    >
      <Animated.View 
        className={`h-14 w-full flex-row items-center justify-center rounded-xl shadow-sm ${getBgColor()}`} 
        style={animatedStyle}
      >
        {isLoading ? (
          <ActivityIndicator color={variant === 'secondary' ? (isDark ? '#fff' : '#3B82F6') : '#fff'} />
        ) : (
          <>
            {icon && <Animated.View className="mr-2">{icon}</Animated.View>}
            <Text className={`text-base font-semibold ${getTextColor()}`} style={{ fontFamily: 'System' }}>
              {title}
            </Text>
          </>
        )}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};
