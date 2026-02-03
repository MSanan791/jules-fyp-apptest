// Create this file at: ssd-data-collector/components/UI/Waveform.tsx
import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

interface WaveformProps {
  metering: number; // Value from -160 to 0
  isRecording: boolean;
}

const Bar = ({ metering, index }: { metering: number, index: number }) => {
  const height = useSharedValue(5);

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
    backgroundColor: '#4F46E5', // Indigo-600
    width: 6,
    borderRadius: 3,
    marginHorizontal: 2
  }));

  useEffect(() => {
    // Convert metering (dB) to a height value (0-50)
    // Metering is usually -160 (silent) to 0 (loud)
    const normalized = Math.max(0, (160 + metering) / 160);
    // Add some random variation based on index so bars don't move identically
    const randomFactor = Math.random() * 0.5 + 0.5; 
    
    height.value = withTiming(normalized * 50 * randomFactor, { duration: 100 });
  }, [metering]);

  return <Animated.View style={animatedStyle} />;
};

export const Waveform = ({ metering, isRecording }: WaveformProps) => {
  if (!isRecording) return <View className="h-12 justify-center"><View className="w-full h-1 bg-gray-200 rounded" /></View>;

  return (
    <View className="flex-row h-12 items-center justify-center">
      {[...Array(10)].map((_, i) => (
        <Bar key={i} metering={metering} index={i} />
      ))}
    </View>
  );
};