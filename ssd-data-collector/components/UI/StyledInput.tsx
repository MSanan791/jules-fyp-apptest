import React, { useState } from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
}

export const StyledInput = ({ label, error, ...props }: InputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const borderColor = useSharedValue('#E2E8F0'); // default border

  const animatedStyle = useAnimatedStyle(() => ({
    borderColor: borderColor.value,
    borderWidth: 2,
  }));

  const handleFocus = () => {
    setIsFocused(true);
    borderColor.value = withTiming('#3B82F6', { duration: 200 }); // Highlight Blue
  };

  const handleBlur = () => {
    setIsFocused(false);
    borderColor.value = withTiming('#E2E8F0', { duration: 200 });
  };

  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-text-muted-light dark:text-text-muted-dark mb-1.5 ml-1">
        {label}
      </Text>
      <Animated.View 
        className="w-full rounded-2xl bg-surface-light dark:bg-surface-dark overflow-hidden" 
        style={animatedStyle}
      >
        <TextInput
          {...props}
          className="p-4 text-base text-text-light dark:text-text-dark"
          placeholderTextColor="#94A3B8"
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </Animated.View>
      {error && <Text className="text-status-error text-xs ml-1 mt-1">{error}</Text>}
    </View>
  );
};