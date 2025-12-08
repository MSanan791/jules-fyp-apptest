import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { StyledInput } from '../UI/StyledInput';
import { AnimatedButton } from '../UI/AnimatedButton';

const LoginScreen = () => {
  const router = useRouter();
  const { signIn } = useAuth();
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
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <ScrollView contentContainerClassName="p-6 pb-12 flex-grow justify-center">
        <View className="w-full max-w-md mx-auto">
          <View className="mb-8">
            <Text className="text-3xl font-display font-bold text-text-light dark:text-text-dark mb-2">
              Welcome Back
            </Text>
            <Text className="text-base text-text-muted-light dark:text-text-muted-dark">
              Log in to access your data collection tools
            </Text>
          </View>
        
          <View className="space-y-1">
            <StyledInput
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <StyledInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry
            />
          </View>

          <View className="mt-8 gap-4">
            <AnimatedButton
              onPress={handleLogin}
              title="Log In"
              isLoading={isSubmitting}
            />

            <View className="flex-row justify-center items-center mt-4">
              <Text className="text-text-muted-light dark:text-text-muted-dark mr-1">
                Don't have an account?
              </Text>
              <TouchableOpacity onPress={() => router.push('/sign-up')}>
                <Text className="text-primary font-semibold">Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LoginScreen;
