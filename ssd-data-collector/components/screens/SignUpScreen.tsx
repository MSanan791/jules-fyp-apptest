import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { signup } from '../../services/AuthService';

const SignUpScreen = () => {
  const router = useRouter();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    let newErrors: { [key: string]: string } = {};
    if (!firstName.trim()) newErrors.firstName = "First Name is required";
    if (!lastName.trim()) newErrors.lastName = "Last Name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    if (!licenseNumber.trim()) newErrors.licenseNumber = "License Number is required";
    if (!password) newErrors.password = "Password is required";
    if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    setErrors({}); 

    try {
      await signup({ firstName, lastName, email, password, licenseNumber });
      Alert.alert("Account Created", "Registration successful! Please sign in.", [
        { text: "Go to Login", onPress: () => router.replace('/') }
      ]);
    } catch (error: any) {
      Alert.alert("Registration Failed", error.message || "An unknown error occurred");
      if (error.message?.toLowerCase().includes('email')) {
        setErrors({ email: error.message });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const InputField = ({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType, error, autoCapitalize = "none" }: any) => (
    <View className="mb-4">
      <Text className="text-slate-700 dark:text-slate-300 font-medium mb-1.5 ml-1">{label}</Text>
      <TextInput
        className={`w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-4 py-3 text-slate-900 dark:text-white text-base ${error ? 'border-red-400 bg-red-50 dark:bg-red-900/20' : 'border-slate-200 dark:border-slate-700'}`}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
      {error && <Text className="text-red-500 text-xs ml-1 mt-1">{error}</Text>}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-900">
      <StatusBar barStyle="default" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingBottom: 40 }} className="px-6" showsVerticalScrollIndicator={false}>
          <View className="w-full max-w-md mx-auto pt-8">
            
            <View className="mb-8">
               <View className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-2xl items-center justify-center mb-4">
                  <MaterialIcons name="person-add" size={32} color="#2563eb" />
               </View>
               <Text className="text-3xl font-bold text-slate-900 dark:text-white">Create Account</Text>
               <Text className="text-slate-500 dark:text-slate-400 mt-2 text-base">Join to start collecting clinical data.</Text>
            </View>

            <View>
              <View className="flex-row gap-3">
                  <View className="flex-1">
                      <InputField label="First Name" placeholder="John" value={firstName} onChangeText={setFirstName} error={errors.firstName} autoCapitalize="words" />
                  </View>
                  <View className="flex-1">
                      <InputField label="Last Name" placeholder="Doe" value={lastName} onChangeText={setLastName} error={errors.lastName} autoCapitalize="words" />
                  </View>
              </View>
              <InputField label="Email Address" placeholder="doctor@clinic.com" value={email} onChangeText={setEmail} keyboardType="email-address" error={errors.email} />
              <InputField label="License Number" placeholder="SLP-XXXXX" value={licenseNumber} onChangeText={setLicenseNumber} autoCapitalize="characters" error={errors.licenseNumber} />
              <InputField label="Password" placeholder="••••••••" value={password} onChangeText={setPassword} secureTextEntry error={errors.password} />
              <InputField label="Confirm Password" placeholder="••••••••" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry error={errors.confirmPassword} />
            </View>

            <View className="mt-6 gap-4">
              <TouchableOpacity onPress={handleSignUp} disabled={isSubmitting} className={`w-full py-4 rounded-xl items-center flex-row justify-center shadow-lg shadow-blue-200 dark:shadow-none ${isSubmitting ? 'bg-blue-400' : 'bg-blue-600'}`}>
                {isSubmitting ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Sign Up</Text>}
              </TouchableOpacity>
              <View className="flex-row justify-center items-center mt-2">
                <Text className="text-slate-500 dark:text-slate-400 mr-1">Already have an account?</Text>
                <TouchableOpacity onPress={() => router.replace('/')} className="py-2">
                  <Text className="text-blue-600 dark:text-blue-400 font-bold">Log In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
export default SignUpScreen;