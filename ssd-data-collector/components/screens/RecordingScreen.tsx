import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';

const RecordingScreen = () => {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <View className="flex-row items-center p-4 pb-2">
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} className="text-slate-800 dark:text-white" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold text-slate-800 dark:text-white">Patient ID: P-042</Text>
        <View className="w-12" />
      </View>
      <View className="flex-1 justify-between items-center px-4 pt-2 pb-8">
        <Text className="text-slate-500 dark:text-slate-400">Word 5 of 52</Text>
        <View className="items-center w-full">
          <Text className="text-slate-900 dark:text-white text-5xl md:text-6xl font-bold">Sunshine</Text>
          <View className="w-full max-w-sm h-24 mt-12 bg-slate-200/50 dark:bg-slate-800/50 rounded-lg overflow-hidden">
            <Image
              className="h-full w-full object-cover opacity-70"
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAAwt9XynT5_ilcKhFN6P_qcsjAqUPEU1bQHpvWoKGGBwRju5k36TBrJrRBt0FDQECXB2l9jjflAzawcvfqfup7rzhUfgB5UaxDEPZf8EdupxkIlJnTHkUQNhRN5lKZAQRb73rulVFDvppamkOtY9vGiesRQ16s7zCoaxWDI-DLMB60Ybw2t_Uff7nXBZPf7XBv9bs2dDFAcjXnqRglyRSslDK5diQPxi0ZN0GZWYsbpXy16Mz6_-7JuCMSIdK2TxF4NzwIo9aCmLM' }}
            />
          </View>
        </View>
        <View className="items-center gap-8 w-full">
          <View className="flex-row items-center justify-center gap-10">
            <View className="items-center gap-2">
              <TouchableOpacity className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 items-center justify-center">
                <MaterialIcons name="play-arrow" size={32} className="text-slate-800 dark:text-white" />
              </TouchableOpacity>
              <Text className="text-sm font-medium text-slate-600 dark:text-slate-300">Playback</Text>
            </View>
            <View className="items-center gap-2">
              <TouchableOpacity className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 items-center justify-center">
                <MaterialIcons name="replay" size={32} className="text-slate-800 dark:text-white" />
              </TouchableOpacity>
              <Text className="text-sm font-medium text-slate-600 dark:text-slate-300">Retake</Text>
            </View>
          </View>
          <View className="items-center gap-3">
            <TouchableOpacity className="w-20 h-20 rounded-full bg-primary items-center justify-center">
              <MaterialIcons name="mic" size={40} className="text-white" />
            </TouchableOpacity>
            <Text className="font-medium text-slate-600 dark:text-slate-400">Tap to Record</Text>
          </View>
          <Link href="/review-upload" asChild>
            <TouchableOpacity>
              <Text className="text-primary font-bold">Skip Word</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default RecordingScreen;
