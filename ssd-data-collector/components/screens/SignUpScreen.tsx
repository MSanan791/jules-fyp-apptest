import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StyledInput } from '../UI/StyledInput';
import { AnimatedButton } from '../UI/AnimatedButton';

const SignUpScreen = () => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    let newErrors: { [key: string]: string } = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";
    if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert("Success", "Account created successfully!", [
        { text: "OK", onPress: () => router.replace('/') }
      ]);
    }, 1500);
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <ScrollView contentContainerClassName="p-6 pb-12 flex-grow justify-center">
        <View className="w-full max-w-md mx-auto">
          <View className="mb-8">
            <Text className="text-3xl font-display font-bold text-text-light dark:text-text-dark mb-2">
              Create Account
            </Text>
            <Text className="text-base text-text-muted-light dark:text-text-muted-dark">
              Sign up to start collecting data
            </Text>
          </View>

          <View className="space-y-1">
            <StyledInput
              label="Full Name"
              placeholder="Enter your full name"
              value={name}
              onChangeText={setName}
              error={errors.name}
            />
            <StyledInput
              label="Email Address"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />
            <StyledInput
              label="Password"
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              error={errors.password}
            />
            <StyledInput
              label="Confirm Password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              error={errors.confirmPassword}
            />
          </View>

          <View className="mt-8 gap-4">
            <AnimatedButton
              title="Sign Up"
              onPress={handleSignUp}
              isLoading={isSubmitting}
            />

            <View className="flex-row justify-center items-center mt-4">
              <Text className="text-text-muted-light dark:text-text-muted-dark mr-1">
                Already have an account?
              </Text>
              <TouchableOpacity onPress={() => router.replace('/')}>
                <Text className="text-primary font-semibold">Log In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUpScreen;
