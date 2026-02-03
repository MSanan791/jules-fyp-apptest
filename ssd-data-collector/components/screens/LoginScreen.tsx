import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    
    // 1. Attempt Sign In
    const success = await signIn(email, password);

    // 2. Handle Failure (Success is handled by _layout.tsx automatically redirecting)
    if (!success) {
      Alert.alert('Login Failed', 'Invalid email or password.');
      setIsSubmitting(false); // Only stop loading if we failed. If success, we unmount anyway.
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 justify-center px-6">
      <View className="bg-white p-8 rounded-2xl shadow-sm">
        <Text className="text-3xl font-bold text-gray-800 mb-2 text-center">TAAPU Protocol</Text>
        <Text className="text-gray-500 text-center mb-8">Clinician Login</Text>

        <View className="space-y-4">
          <View>
            <Text className="text-gray-700 mb-1 ml-1">Email</Text>
            <TextInput
              className="w-full bg-gray-100 p-4 rounded-xl border border-gray-200"
              placeholder="therapist@clinic.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View>
            <Text className="text-gray-700 mb-1 ml-1">Password</Text>
            <TextInput
              className="w-full bg-gray-100 p-4 rounded-xl border border-gray-200"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity 
            onPress={handleLogin}
            disabled={isSubmitting}
            className={`w-full p-4 rounded-xl mt-4 ${isSubmitting ? 'bg-indigo-400' : 'bg-indigo-600'}`}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-center font-bold text-lg">Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        <View className="mt-6 flex-row justify-center space-x-1">
          <Text className="text-gray-500">Don't have an account?</Text>
          <Link href="/sign-up" asChild>
            <TouchableOpacity>
              <Text className="text-indigo-600 font-bold">Sign Up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}