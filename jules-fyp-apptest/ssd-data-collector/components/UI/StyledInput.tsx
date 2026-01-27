import React, { useState } from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
}

export const StyledInput = ({ label, error, ...props }: InputProps) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const isDark = theme === 'dark';
  const borderColor = useSharedValue(isDark ? '#374151' : '#E2E8F0');

  const animatedStyle = useAnimatedStyle(() => ({
    borderColor: borderColor.value,
    borderWidth: 2,
  }));

  const handleFocus = () => {
    setIsFocused(true);
    borderColor.value = withTiming('#3B82F6', { duration: 200 });
  };

  const handleBlur = () => {
    setIsFocused(false);
    borderColor.value = withTiming(isDark ? '#374151' : '#E2E8F0', { duration: 200 });
  };

  return (
    <View className="mb-4">
      <Text className={`text-sm font-semibold mb-2 ml-1 ${
        isDark ? 'text-gray-300' : 'text-gray-700'
      }`} style={{ fontFamily: 'System' }}>
        {label}
      </Text>
      <Animated.View 
        className={`w-full rounded-xl overflow-hidden ${
          isDark ? 'bg-[#192633]' : 'bg-white'
        }`}
        style={animatedStyle}
      >
        <TextInput
          {...props}
          className={`p-4 text-base ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}
          placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={{ fontFamily: 'System' }}
        />
      </Animated.View>
      {error && (
        <Text className="text-red-500 text-xs ml-1 mt-1" style={{ fontFamily: 'System' }}>
          {error}
        </Text>
      )}
    </View>
  );
};
