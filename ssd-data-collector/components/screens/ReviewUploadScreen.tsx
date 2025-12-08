import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { uploadSession } from '../../services/SessionService';
import { currentSession } from '../../store/SessionStore'; // Correct lowercase import
import { getToken } from '../../services/AuthService';

const ReviewUploadScreen = () => {
  const router = useRouter();
  const [isBiometricEnabled, setIsBiometricEnabled] = React.useState(true);
  const [isUploading, setIsUploading] = React.useState(false); // State for loading

  const handleUpload = async () => {
    setIsUploading(true);
    try {
      // In a real app, get this from your Auth Context
      const token = await getToken();
      
      if (!token) {
        Alert.alert("Error", "Authentication failed. Please login again.");
        setIsUploading(false);
        return;
      }
      
      const { patientId, recordings } = currentSession;

      if (recordings.length === 0) {
        Alert.alert("Empty Session", "No recordings found. Please record at least one word.");
        setIsUploading(false);
        return;
      }

      await uploadSession(
        patientId, 
        recordings, 
        "Final session notes from app", 
        token
      );

      Alert.alert("Success", "Session uploaded to cloud!");
      
      // Clear store so next session is fresh
      currentSession.clear(); 
      
      router.push("/home"); 

    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Upload failed. Please check your connection.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-gray-200 dark:border-gray-800">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <MaterialIcons name="arrow-back" size={24} className="text-gray-900 dark:text-white" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900 dark:text-white">Review & Upload</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Summary Card */}
        <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6 shadow-sm">
          <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">Session Summary</Text>
          
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-500 dark:text-gray-400">Patient ID</Text>
            <Text className="font-medium text-gray-900 dark:text-white">P-042</Text>
          </View>
          
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-500 dark:text-gray-400">Words Recorded</Text>
            <Text className="font-medium text-gray-900 dark:text-white">
               {currentSession.recordings.length} / 52
            </Text>
          </View>
        </View>

        {/* Notes Input */}
        <View className="mb-6">
          <Text className="text-base font-medium text-gray-900 dark:text-white mb-2">Session Notes</Text>
          <TextInput 
            className="bg-white dark:bg-gray-800 rounded-xl p-4 h-32 text-gray-900 dark:text-white"
            placeholder="Add clinical observations..."
            placeholderTextColor="#9CA3AF"
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Biometric Toggle */}
        <View className="flex-row justify-between items-center bg-white dark:bg-gray-800 rounded-xl p-4 mb-8">
          <Text className="text-base font-medium text-gray-900 dark:text-white">Require Biometric Auth</Text>
          <Switch 
            value={isBiometricEnabled} 
            onValueChange={setIsBiometricEnabled}
            trackColor={{ false: '#767577', true: '#007AFF' }}
          />
        </View>
      </ScrollView>

      {/* Upload Button Footer */}
      <View className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <TouchableOpacity 
          onPress={handleUpload}
          disabled={isUploading}
          className={`h-14 rounded-xl flex-row items-center justify-center gap-2 ${isUploading ? 'bg-gray-400' : 'bg-primary'}`}
        >
          <MaterialIcons name="cloud-upload" size={24} color="white" />
          <Text className="text-white text-lg font-bold">
            {isUploading ? "Uploading..." : "Upload Session"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ReviewUploadScreen;