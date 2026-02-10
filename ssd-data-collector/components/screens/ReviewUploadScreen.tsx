import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Switch, Alert, ActivityIndicator, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { currentSession } from '../../store/SessionStore';
import { getToken } from '../../services/AuthService';
import { uploadSession } from '../../services/SessionService';

const ReviewUploadScreen = () => {
  const router = useRouter();
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [notes, setNotes] = useState("");

  const totalWords = 52; 
  const recordedCount = currentSession.recordings.length;
  const errorCount = currentSession.recordings.filter(r => !r.isCorrect).length;
  const accuracy = recordedCount > 0 ? Math.round(((recordedCount - errorCount) / recordedCount) * 100) : 0;

  const handleUpload = async () => {
    setIsUploading(true);
    try {
      const token = await getToken();
      if (!token) { Alert.alert("Error", "Please login again."); setIsUploading(false); return; }
      const { patientId, recordings } = currentSession;
      if (recordings.length === 0) { Alert.alert("Error", "No recordings found."); setIsUploading(false); return; }
      await uploadSession(patientId, recordings, notes || "No clinical notes added.", token);
      Alert.alert("Success", "Session uploaded securely!", [{ text: "Done", onPress: () => { currentSession.clear(); router.replace("/home"); }}]);
    } catch (error) { Alert.alert("Upload Failed", "Check your connection."); } finally { setIsUploading(false); }
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View className="bg-blue-600 pt-12 pb-8 px-6 rounded-b-[32px] shadow-xl z-10">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-blue-500/50 rounded-full items-center justify-center backdrop-blur-md">
            <MaterialIcons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        </View>
        <Text className="text-blue-100 font-bold text-sm uppercase tracking-widest mb-1">Finalize</Text>
        <Text className="text-white text-3xl font-bold">Review Session</Text>
      </View>

      <ScrollView className="flex-1 -mt-6 pt-8 px-6" contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Analytics */}
        <View className="flex-row gap-4 mb-6">
            <View className="flex-1 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 items-center">
                <View className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 items-center justify-center mb-2">
                    <MaterialIcons name="mic" size={20} color="#2563eb" />
                </View>
                <Text className="text-3xl font-bold text-slate-800 dark:text-white">{recordedCount}<Text className="text-base text-slate-400">/{totalWords}</Text></Text>
                <Text className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">Words</Text>
            </View>
            <View className="flex-1 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 items-center">
                <View className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/30 items-center justify-center mb-2">
                    <MaterialIcons name="analytics" size={20} color="#16a34a" />
                </View>
                <Text className="text-3xl font-bold text-slate-800 dark:text-white">{accuracy}%</Text>
                <Text className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">Accuracy</Text>
            </View>
        </View>

        {/* Notes */}
        <View className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 mb-6">
            <Text className="text-slate-800 dark:text-white font-bold text-sm mb-3 flex-row items-center"><MaterialIcons name="edit-note" size={18} color="#475569" /> Clinical Observations</Text>
            <TextInput 
                className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 min-h-[120px] text-slate-700 dark:text-slate-200 text-base"
                placeholder="Enter observations..."
                placeholderTextColor="#94a3b8"
                multiline
                textAlignVertical="top"
                value={notes}
                onChangeText={setNotes}
            />
        </View>

        {/* Toggle */}
        <View className="bg-white dark:bg-slate-800 rounded-2xl p-4 flex-row items-center justify-between shadow-sm border border-slate-100 dark:border-slate-700">
            <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 items-center justify-center">
                    <MaterialIcons name="fingerprint" size={24} color="#475569" />
                </View>
                <View>
                    <Text className="text-slate-800 dark:text-white font-bold">Biometric Lock</Text>
                    <Text className="text-slate-400 text-xs">Require FaceID</Text>
                </View>
            </View>
            <Switch value={isBiometricEnabled} onValueChange={setIsBiometricEnabled} trackColor={{ false: '#cbd5e1', true: '#2563eb' }} thumbColor={'#ffffff'} />
        </View>
      </ScrollView>

      {/* Upload Btn */}
      <View className="absolute bottom-0 left-0 right-0 p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shadow-lg">
        <TouchableOpacity onPress={handleUpload} disabled={isUploading} className={`w-full py-4 rounded-xl items-center flex-row justify-center gap-3 shadow-md ${isUploading ? 'bg-slate-400' : 'bg-blue-600'}`}>
          {isUploading ? <ActivityIndicator color="white" /> : <><MaterialIcons name="cloud-upload" size={24} color="white" /><Text className="text-white font-bold text-lg">Upload Session</Text></>}
        </TouchableOpacity>
      </View>
    </View>
  );
};
export default ReviewUploadScreen;