import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform,
  StatusBar,
  KeyboardTypeOptions
} from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons'; 
import { useRouter } from 'expo-router';
import { createPatient } from '../../services/PatientService';
import { getToken } from '../../services/AuthService';

// --- Types ---
interface FormInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
}

// --- Helper Component (Defined OUTSIDE to prevent focus loss bugs) ---
const FormInput = ({ label, value, onChangeText, placeholder, keyboardType = 'default', multiline = false }: FormInputProps) => (
  <View className="mb-4">
    <Text className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-2 ml-1">{label}</Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      className={`bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-base text-slate-900 dark:text-white ${multiline ? 'h-24 text-top' : 'h-14'}`}
      placeholder={placeholder}
      placeholderTextColor="#94a3b8"
      keyboardType={keyboardType}
      multiline={multiline}
      textAlignVertical={multiline ? 'top' : 'center'}
    />
  </View>
);

const AddNewPatientScreen = () => {
  const router = useRouter();
  
  // --- Form State ---
  const [name, setName] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<string>('Male');
  const [language, setLanguage] = useState<string>('Urdu'); 
  const [diagnosis, setDiagnosis] = useState<string>('Phonological Disorder');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Diagnosis Preset Options
  const diagnosisOptions = ['Phonological Disorder', 'Articulation Disorder', 'Apraxia', 'Other'];

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Required", "Please enter Patient Name.");
      return;
    }
    if (!age.trim() || isNaN(Number(age))) {
      Alert.alert("Required", "Please enter a valid numeric Age.");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await getToken();
      
      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
      }
      
      const payload = {
        name: name.trim(),
        age: parseInt(age, 10),
        gender: gender,
        primary_language: language.trim(),
        initial_ssd_type: diagnosis.trim(),
        initial_notes: notes.trim()
      };

      await createPatient(payload, token);

      Alert.alert("Success", "Patient created successfully!", [
        { text: "View Profile", onPress: () => router.replace("/home") }
      ]);
      
    } catch (error) {
      console.log("Save Error:", error);
      const errorMessage = error instanceof Error ? error.message : "Could not save patient. Check connection.";
      Alert.alert("Error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <StatusBar barStyle="light-content" />
      
      {/* 1. The "Curved Header" */}
      <View className="bg-blue-600 pt-14 pb-10 px-6 rounded-b-[32px] shadow-xl z-10">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="w-10 h-10 bg-blue-500/30 rounded-full items-center justify-center backdrop-blur-md"
          >
            <MaterialIcons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-white tracking-wide">Add New Patient</Text>
          <View className="w-10" /> 
        </View>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={{ flex: 1 }}
      >
        <ScrollView 
          className="flex-1 -mt-6 px-4" 
          contentContainerStyle={{ paddingBottom: 120, paddingTop: 24 }}
          showsVerticalScrollIndicator={false}
        >
          
          {/* 2. Basic Info Card */}
          <View className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 mb-6">
            <View className="flex-row items-center mb-4">
              <View className="w-8 h-8 bg-blue-50 dark:bg-slate-700 rounded-full items-center justify-center mr-3">
                <FontAwesome5 name="user" size={14} color="#2563eb" />
              </View>
              <Text className="text-lg font-bold text-slate-900 dark:text-white">Basic Information</Text>
            </View>

            <FormInput 
              label="Full Name" 
              placeholder="e.g. Ali Khan" 
              value={name} 
              onChangeText={setName} 
            />

            <View className="flex-row gap-4">
              <View className="flex-1">
                <FormInput 
                  label="Age" 
                  placeholder="Yrs" 
                  value={age} 
                  onChangeText={setAge} 
                  keyboardType="numeric"
                />
              </View>
              
              {/* Gender Segmented Control */}
              <View className="flex-1">
                <Text className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-2 ml-1">Gender</Text>
                <View className="flex-row h-14 bg-slate-100 dark:bg-slate-900 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
                  {['Male', 'Female'].map((g) => (
                    <TouchableOpacity
                      key={g}
                      className={`flex-1 items-center justify-center rounded-lg ${
                        gender === g ? 'bg-white dark:bg-slate-700 shadow-sm' : 'bg-transparent'
                      }`}
                      onPress={() => setGender(g)}
                    >
                      <Text className={`text-sm font-bold ${
                        gender === g ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'
                      }`}>
                        {g}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <FormInput 
              label="Primary Language" 
              placeholder="e.g. Urdu, Punjabi" 
              value={language} 
              onChangeText={setLanguage} 
            />
          </View>

          {/* 3. Clinical Details Card */}
          <View className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 mb-6">
            <View className="flex-row items-center mb-4">
              <View className="w-8 h-8 bg-blue-50 dark:bg-slate-700 rounded-full items-center justify-center mr-3">
                <MaterialIcons name="medical-services" size={18} color="#2563eb" />
              </View>
              <Text className="text-lg font-bold text-slate-900 dark:text-white">Clinical Details</Text>
            </View>

            <Text className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-3 ml-1">Diagnosis</Text>
            
            {/* Diagnosis Chips */}
            <View className="flex-row flex-wrap gap-2 mb-4">
              {diagnosisOptions.map((option) => {
                const isSelected = diagnosis === option;
                return (
                  <TouchableOpacity
                    key={option}
                    onPress={() => setDiagnosis(option)}
                    className={`px-4 py-2 rounded-full border ${
                      isSelected 
                        ? 'bg-blue-600 border-blue-600' 
                        : 'bg-slate-50 border-slate-200 dark:bg-slate-900 dark:border-slate-700'
                    }`}
                  >
                    <Text className={`text-sm font-medium ${
                      isSelected ? 'text-white' : 'text-slate-600 dark:text-slate-300'
                    }`}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Custom Diagnosis Input (Only show if needed or always visible for detail) */}
            <TextInput 
               value={diagnosis}
               onChangeText={setDiagnosis}
               className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-base text-slate-900 dark:text-white mb-4"
               placeholder="Or type custom diagnosis..."
               placeholderTextColor="#94a3b8"
            />

            <FormInput 
              label="Initial Notes" 
              placeholder="Clinical observations, behavioral notes..." 
              value={notes} 
              onChangeText={setNotes} 
              multiline 
            />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* 4. Footer Action Button */}
      <View className="absolute bottom-0 w-full bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 p-6 pb-8 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <TouchableOpacity 
          onPress={handleSave}
          disabled={isSubmitting}
          className={`w-full py-4 rounded-xl shadow-lg flex-row justify-center items-center gap-2 ${
            isSubmitting ? 'bg-slate-400' : 'bg-blue-600'
          }`}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
                <MaterialIcons name="save" size={22} color="white" />
                <Text className="text-white text-lg font-bold tracking-wide">Create Patient Record</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

    </View>
  );
};

export default AddNewPatientScreen;