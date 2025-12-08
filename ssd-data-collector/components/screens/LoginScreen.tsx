import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext'; // Import hook
import * as SecureStore from 'expo-secure-store'; // Make sure this is imported
import { Platform } from 'react-native';

const LoginScreen = () => {
  const { signIn } = useAuth(); // Get signIn function
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  React.useEffect(() => {
    const clearStorage = async () => {
      if (Platform.OS !== 'web') {
        await SecureStore.deleteItemAsync('userToken');
        await SecureStore.deleteItemAsync('userData');
        console.log("🧹 Storage Cleared! You can now login fresh.");
      }
    };
    clearStorage();
  }, []);
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    setIsSubmitting(true);
    try {
      await signIn(email, password);
      // AuthContext handles the redirect to /home
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Invalid credentials";
      Alert.alert("Login Failed", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-background-light dark:bg-background-dark p-4">
      <ScrollView contentContainerClassName="w-full max-w-sm space-y-8">
        {/* ... Header ... */}
        
        <View className="w-full gap-4">
          <View>
            <Text className="text-sm font-medium pb-2 text-text-light dark:text-text-dark/90">Email Address</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              className="w-full rounded-lg border border-border-light bg-white dark:border-border-dark dark:bg-background-dark h-12 p-3 text-text-light dark:text-text-dark"
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <View>
            <Text className="text-sm font-medium pb-2 text-text-light dark:text-text-dark/90">Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              className="w-full rounded-lg border border-border-light bg-white dark:border-border-dark dark:bg-background-dark h-12 p-3 text-text-light dark:text-text-dark"
              placeholder="Enter your password"
              secureTextEntry
            />
          </View>
        </View>

        <View className="gap-4">
          <TouchableOpacity 
            onPress={handleLogin}
            disabled={isSubmitting}
            className={`h-12 w-full items-center justify-center rounded-lg ${isSubmitting ? 'bg-gray-500' : 'bg-primary'}`}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-base font-semibold text-white">Log In</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LoginScreen;