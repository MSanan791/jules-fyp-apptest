import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';

const PatientProfileScreen = () => {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <View className="sticky top-0 z-10 flex-row h-16 items-center justify-between border-b border-white/10 bg-background-light dark:bg-background-dark px-4">
        <TouchableOpacity onPress={() => router.back()} className="w-12 h-12 items-center justify-center">
          <MaterialIcons name="arrow-back" size={24} className="text-gray-800 dark:text-white" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold text-gray-800 dark:text-white">Jane Doe</Text>
        <TouchableOpacity className="w-12 h-12 items-center justify-center">
          <MaterialIcons name="edit" size={24} className="text-gray-800 dark:text-white" />
        </TouchableOpacity>
      </View>
      <ScrollView className="flex-1 p-4 pb-24 space-y-6">
        <View className="w-full">
          <View className="rounded-xl bg-white dark:bg-gray-800/20 shadow-sm">
            <View className="p-5">
              <Text className="text-lg font-bold text-gray-800 dark:text-white">Patient Information</Text>
              <Text className="text-base text-gray-500 dark:text-gray-400">All data is read-only. Tap the edit icon to make changes.</Text>
            </View>
            <View className="px-5 pb-2">
              <InfoRow label="Patient ID" value="SSD-1138" />
              <InfoRow label="Date of Birth (Age)" value="10/22/2018 (6 years)" />
              <InfoRow label="Primary Diagnosis" value="Childhood Apraxia of Speech" />
              <InfoRow label="Guardian/Contact Info" value="John Doe (Father) - 555-0102" isLast />
            </View>
          </View>
        </View>

        <View>
          <Text className="px-1 pb-3 pt-4 text-2xl font-bold text-gray-800 dark:text-white">Session History</Text>
          <View className="rounded-xl bg-white dark:bg-gray-800/20 shadow-sm">
            <SessionItem status="Uploaded" date="05/15/2024" diagnosis="Childhood Apraxia of Speech" />
            <SessionItem status="Pending" date="05/10/2024" diagnosis="Articulation Disorder" />
            <SessionItem status="Failed" date="05/02/2024" diagnosis="Phonological Process Disorder" isLast />
          </View>
        </View>

        <View>
          <Text className="px-1 pb-3 pt-4 text-2xl font-bold text-gray-800 dark:text-white">Session History (Empty)</Text>
          <View className="rounded-xl bg-white dark:bg-gray-800/20 p-8 items-center text-center shadow-sm">
            <View className="w-16 h-16 items-center justify-center rounded-full bg-primary/10">
              <MaterialIcons name="note-add" size={32} className="text-primary" />
            </View>
            <Text className="mt-4 text-lg font-bold text-gray-800 dark:text-white">No Sessions Recorded</Text>
            <Text className="mt-1 text-base text-gray-500 dark:text-gray-400">Tap the button below to start a new recording session.</Text>
          </View>
        </View>
      </ScrollView>
      <Link href="/session-setup" asChild>
        <TouchableOpacity className="absolute bottom-6 right-6 z-20 w-16 h-16 items-center justify-center rounded-full bg-primary shadow-lg">
          <MaterialIcons name="add" size={32} className="text-white" />
        </TouchableOpacity>
      </Link>
    </SafeAreaView>
  );
};

const InfoRow = ({ label, value, isLast = false }) => (
  <View className={`flex-row justify-between py-4 ${!isLast ? 'border-b border-gray-200 dark:border-white/10' : ''}`}>
    <Text className="text-sm text-gray-500 dark:text-gray-400">{label}</Text>
    <Text className="text-sm text-gray-800 dark:text-white">{value}</Text>
  </View>
);

const SessionItem = ({ status, date, diagnosis, isLast = false }) => {
  const statusStyles = {
    Uploaded: { icon: 'check-circle', color: 'text-green-500', bg: 'bg-green-500/10' },
    Pending: { icon: 'hourglass-empty', color: 'text-orange-500', bg: 'bg-orange-500/10' },
    Failed: { icon: 'error', color: 'text-red-500', bg: 'bg-red-500/10' },
  };
  const currentStatus = statusStyles[status];

  return (
    <View className={`flex-row items-center gap-4 px-4 py-3 ${!isLast ? 'border-b border-gray-200 dark:border-white/10' : ''}`}>
      <View className="flex-1 flex-row items-center gap-4">
        <View className={`w-10 h-10 shrink-0 items-center justify-center rounded-full ${currentStatus.bg}`}>
          <MaterialIcons name={currentStatus.icon} size={24} className={currentStatus.color} />
        </View>
        <View>
          <Text className="text-base font-medium text-gray-800 dark:text-white">{date}</Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400">{diagnosis}</Text>
        </View>
      </View>
      <Text className={`text-sm font-medium ${currentStatus.color}`}>{status}</Text>
    </View>
  );
};

export default PatientProfileScreen;
