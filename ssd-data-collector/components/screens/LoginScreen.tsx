import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';

const LoginScreen = () => {
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-background-light dark:bg-background-dark p-4">
      <ScrollView contentContainerClassName="w-full max-w-sm space-y-8">
        <View className="items-center space-y-2">
          <View className="w-12 h-12 items-center justify-center rounded-xl bg-primary/20">
            <MaterialIcons name="biotech" size={32} className="text-primary" />
          </View>
          <Text className="text-3xl font-bold text-text-light dark:text-text-dark">Welcome Back</Text>
          <Text className="text-text-light/70 dark:text-text-dark/70">Log in to SSD Data Collector</Text>
        </View>

        <View className="w-full gap-4">
          <View>
            <Text className="text-sm font-medium pb-2 text-text-light dark:text-text-dark/90">Email Address</Text>
            <TextInput
              className="w-full rounded-lg border border-border-light bg-white dark:border-border-dark dark:bg-background-dark h-12 p-3 text-text-light dark:text-text-dark"
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <View>
            <View className="flex-row justify-between items-baseline pb-2">
              <Text className="text-sm font-medium text-text-light dark:text-text-dark/90">Password</Text>
              <TouchableOpacity>
                <Text className="text-sm font-medium text-primary">Forgot Password?</Text>
              </TouchableOpacity>
            </View>
            <View className="flex-row items-center rounded-lg border border-border-light bg-white dark:border-border-dark dark:bg-background-dark">
              <TextInput
                className="flex-1 h-12 p-3 text-text-light dark:text-text-dark"
                placeholder="Enter your password"
                secureTextEntry
              />
              <TouchableOpacity className="px-3">
                <MaterialIcons name="visibility" size={24} className="text-text-light/60 dark:text-text-dark/60" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View className="gap-4">
          <Link href="/home" asChild>
            <TouchableOpacity className="h-12 w-full items-center justify-center rounded-lg bg-primary">
              <Text className="text-base font-semibold text-white">Log In</Text>
            </TouchableOpacity>
          </Link>
          <TouchableOpacity className="h-12 w-full flex-row items-center justify-center gap-3 rounded-lg border border-border-light bg-white dark:border-border-dark dark:bg-background-dark">
            <MaterialIcons name="fingerprint" size={24} className="text-text-light dark:text-text-dark" />
            <Text className="text-base font-semibold text-text-light dark:text-text-dark">Log in with Biometrics</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-center text-sm text-text-light/70 dark:text-text-dark/70">
          Don't have an account? <TouchableOpacity><Text className="font-semibold text-primary">Sign Up</Text></TouchableOpacity>
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LoginScreen;
