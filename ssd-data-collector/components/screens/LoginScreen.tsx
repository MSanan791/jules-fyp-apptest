import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, StatusBar, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Information', 'Please fill in both email and password.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const success = await signIn(email, password);
      if (success) {
        router.replace('/home');
      } else {
        Alert.alert('Login Failed', 'Invalid email or password.');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-900">
      <StatusBar barStyle="default" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingBottom: 40 }} 
          className="px-6"
          showsVerticalScrollIndicator={false}
        >
          <View className="w-full max-w-md mx-auto">
            
            {/* Header */}
            <View className="mb-10">
               <View className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-2xl items-center justify-center mb-4">
                  <MaterialIcons name="lock" size={32} color="#3b82f6" />
               </View>
               <Text className="text-3xl font-bold text-slate-900 dark:text-white">Welcome Back</Text>
               <Text className="text-slate-500 dark:text-slate-400 mt-2 text-base">
                 Sign in to access your patient data.
               </Text>
            </View>

            {/* Form */}
            <View className="space-y-4">
              <View>
                <Text className="text-slate-700 dark:text-slate-300 font-medium mb-1.5 ml-1">Email Address</Text>
                <TextInput
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-base focus:border-blue-500"
                  placeholder="therapist@clinic.com"
                  placeholderTextColor="#94a3b8"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <View>
                <Text className="text-slate-700 dark:text-slate-300 font-medium mb-1.5 ml-1">Password</Text>
                <TextInput
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-base focus:border-blue-500"
                  placeholder="••••••••"
                  placeholderTextColor="#94a3b8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity className="items-end">
                <Text className="text-blue-600 dark:text-blue-400 font-medium text-sm">Forgot Password?</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={handleLogin}
                disabled={isSubmitting}
                className={`w-full py-4 rounded-xl items-center flex-row justify-center shadow-lg shadow-blue-200 dark:shadow-none mt-2 ${isSubmitting ? 'bg-blue-400' : 'bg-blue-600'}`}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-center font-bold text-lg">Sign In</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View className="mt-8 flex-row justify-center items-center">
              <Text className="text-slate-500 dark:text-slate-400 mr-1">Don't have an account?</Text>
              <TouchableOpacity onPress={() => router.push('/sign-up')}>
                <Text className="text-blue-600 dark:text-blue-400 font-bold">Sign Up</Text>
              </TouchableOpacity>
            </View>
            
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}