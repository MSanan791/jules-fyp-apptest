import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';

const HomeScreen = () => {
  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <ScrollView>
        <View className="p-4">
          <View className="flex-row items-center justify-between h-12">
            <View className="flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-full w-10 h-10">
              <Text className="text-xl font-bold text-gray-800 dark:text-white">DS</Text>
            </View>
            <TouchableOpacity className="flex items-center justify-center">
              <MaterialIcons name="fingerprint" size={28} className="text-gray-800 dark:text-white" />
            </TouchableOpacity>
          </View>
          <Text className="text-gray-900 dark:text-white text-3xl font-bold mt-4">Welcome, Dr. Smith</Text>
        </View>

        <View className="flex-row gap-3 p-4">
          <View className="flex-1 flex-row items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#192633] p-4">
            <MaterialIcons name="mic" size={24} className="text-[#34C759]" />
            <Text className="text-gray-900 dark:text-white text-base font-bold">Mic Connected</Text>
          </View>
          <View className="flex-1 flex-row items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#192633] p-4">
            <MaterialIcons name="cloud-upload" size={24} className="text-[#FF9500]" />
            <Text className="text-gray-900 dark:text-white text-base font-bold">3 items unsynced</Text>
          </View>
        </View>

        <View className="px-4 py-3">
          <View className="flex-row items-center rounded-lg bg-white dark:bg-[#233648]">
            <MaterialIcons name="search" size={24} className="text-gray-500 dark:text-gray-400 pl-4" />
            <TextInput
              className="flex-1 p-4 text-gray-900 dark:text-white"
              placeholder="Search for a patient..."
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        <View className="px-4 py-3">
          <TouchableOpacity className="flex-row items-center justify-center rounded-lg h-14 bg-primary gap-3">
            <MaterialIcons name="person-add" size={24} className="text-white" />
            <Text className="text-white text-base font-bold">Add New Patient</Text>
          </TouchableOpacity>
          <Link href="/session-setup" asChild>
            <TouchableOpacity className="mt-4 flex-row items-center justify-center rounded-lg h-14 bg-primary gap-3">
              <MaterialIcons name="play-circle-outline" size={24} className="text-white" />
              <Text className="text-white text-base font-bold">Start New Session</Text>
            </TouchableOpacity>
          </Link>
        </View>

        <View className="px-4 pt-4 pb-8">
          <Text className="text-lg font-bold text-gray-900 dark:text-white">Recent Patients</Text>
          <View className="mt-4">
            <Link href="/patient-profile" asChild>
              <TouchableOpacity className="flex-row items-center p-4 rounded-lg bg-white dark:bg-[#192633] border border-gray-200 dark:border-gray-700">
                <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center mr-4">
                  <MaterialIcons name="person" size={24} className="text-primary" />
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-gray-900 dark:text-white">John Appleseed</Text>
                  <Text className="text-sm text-gray-500 dark:text-gray-400">Last session: 2 days ago</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} className="text-gray-400 dark:text-gray-500" />
              </TouchableOpacity>
            </Link>
            <Link href="/patient-profile" asChild>
              <TouchableOpacity className="mt-4 flex-row items-center p-4 rounded-lg bg-white dark:bg-[#192633] border border-gray-200 dark:border-gray-700">
                <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center mr-4">
                  <MaterialIcons name="person" size={24} className="text-primary" />
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-gray-900 dark:text-white">Emily Carter</Text>
                  <Text className="text-sm text-gray-500 dark:text-gray-400">Last session: 5 days ago</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} className="text-gray-400 dark:text-gray-500" />
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
