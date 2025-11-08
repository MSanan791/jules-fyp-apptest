import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';

const SessionSetupScreen = () => {
  const router = useRouter();
  const [checklist, setChecklist] = useState({
    quietEnv: true,
    consent: true,
    ready: true,
  });

  const toggleCheckbox = (key) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const allChecked = Object.values(checklist).every(Boolean);

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <View className="flex-row items-center p-4 pb-2">
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back-ios" size={24} className="text-text-light dark:text-text-dark" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold text-text-light dark:text-text-dark">Session Setup</Text>
        <View className="w-10" />
      </View>
      <ScrollView className="flex-1" contentContainerClassName="pb-20">
        <View className="px-4 pt-4">
          <View className="flex-row items-center gap-4 bg-white dark:bg-zinc-800 p-4 rounded-lg shadow-sm">
            <View className="w-12 h-12 rounded-full bg-status-success items-center justify-center">
              <MaterialIcons name="mic" size={32} className="text-white" />
            </View>
            <View className="flex-1">
              <Text className="text-text-light dark:text-text-dark text-base font-bold">Microphone Status</Text>
              <Text className="text-status-success text-sm">Connected</Text>
            </View>
            <View>
              <MaterialIcons name="check-circle" size={32} className="text-status-success" />
            </View>
          </View>
        </View>

        <Text className="text-text-light dark:text-text-dark text-xl font-bold px-4 pb-2 pt-8">Pre-Session Checklist</Text>
        <View className="px-4 bg-white dark:bg-zinc-800 mx-4 rounded-lg">
          <CheckboxItem
            label="Environment is quiet and free of distractions."
            value={checklist.quietEnv}
            onValueChange={() => toggleCheckbox('quietEnv')}
          />
          <CheckboxItem
            label="Patient consent has been secured."
            value={checklist.consent}
            onValueChange={() => toggleCheckbox('consent')}
          />
          <CheckboxItem
            label="I am ready to begin the data collection protocol."
            value={checklist.ready}
            onValueChange={() => toggleCheckbox('ready')}
            isLast
          />
        </View>
      </ScrollView>
      <View className="absolute bottom-0 left-0 w-full bg-background-light/80 dark:bg-background-dark/80 p-4">
        <Link href="/recording" asChild disabled={!allChecked}>
          <TouchableOpacity className={`rounded-xl h-14 items-center justify-center ${allChecked ? 'bg-primary' : 'bg-disabled-bg'}`} disabled={!allChecked}>
            <Text className={`text-lg font-bold ${allChecked ? 'text-white' : 'text-disabled-text'}`}>Start Session</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
};

const CheckboxItem = ({ label, value, onValueChange, isLast = false }) => (
  <TouchableOpacity
    onPress={onValueChange}
    className={`flex-row items-center py-4 ${!isLast ? 'border-b border-gray-200 dark:border-zinc-700' : ''}`}
  >
    <MaterialIcons
      name={value ? 'check-box' : 'check-box-outline-blank'}
      size={24}
      className={`mr-4 ${value ? 'text-primary' : 'text-gray-400 dark:text-zinc-600'}`}
    />
    <Text className="text-text-light dark:text-text-dark flex-1">{label}</Text>
  </TouchableOpacity>
);

export default SessionSetupScreen;
