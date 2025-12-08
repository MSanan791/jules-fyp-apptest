import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { createPatient } from '../../services/PatientService';
import { getToken } from '../../services/AuthService';

const StyledView = View;
const StyledText = Text;
const StyledTextInput = TextInput;
const StyledTouchableOpacity = TouchableOpacity;
const StyledScrollView = ScrollView;

const AddNewPatientScreen = () => {
  const router = useRouter();
  
  // Form State
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [language, setLanguage] = useState('English');
  const [diagnosis, setDiagnosis] = useState('Phonological Disorder');
  const [notes, setNotes] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || !age.trim()) {
      Alert.alert("Required", "Please enter Patient Name and Age.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Mock token for now (until Auth is built)
      const token = await getToken();
      
      await createPatient({
        name,
        age: parseInt(age),
        gender,
        primary_language: language,
        initial_ssd_type: diagnosis,
        // @ts-ignore: Your backend model has this field
        initial_notes: notes 
      }, token);

      Alert.alert("Success", "Patient created successfully!", [
        { text: "OK", onPress: () => router.push("/home") }
      ]);
      
    } catch (error) {
      Alert.alert("Error", "Could not save patient. Check connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-dark">
      <StyledView className="flex-row items-center justify-between h-16 px-4 border-b border-white/10">
        <StyledTouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center rounded-full">
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </StyledTouchableOpacity>
        <StyledText className="text-xl font-bold text-white">Add New Patient</StyledText>
        <StyledView className="w-10 h-10" />
      </StyledView>

      <StyledScrollView className="flex-1 px-4 py-6">
        <StyledView className="max-w-lg mx-auto space-y-6">
          
          {/* Name Input */}
          <StyledView className="flex flex-col">
            <StyledText className="pb-2 text-base font-medium text-white">Patient Name</StyledText>
            <StyledTextInput
              value={name}
              onChangeText={setName}
              className="h-14 w-full rounded-lg bg-white/10 p-4 text-base text-white placeholder:text-white/40"
              placeholder="Enter patient's full name"
              placeholderTextColor={'#FFFFFF66'}
            />
          </StyledView>

          {/* Age & Gender Row */}
          <StyledView className="flex-row gap-4">
            <StyledView className="flex-1 flex-col">
              <StyledText className="pb-2 text-base font-medium text-white">Age</StyledText>
              <StyledTextInput
                value={age}
                onChangeText={setAge}
                className="h-14 w-full rounded-lg bg-white/10 p-4 text-base text-white placeholder:text-white/40"
                placeholder="Age"
                placeholderTextColor={'#FFFFFF66'}
                keyboardType="numeric"
              />
            </StyledView>
            
            <StyledView className="flex-1 flex-col">
              <StyledText className="pb-2 text-base font-medium text-white">Gender</StyledText>
              <StyledView className="flex-row h-14 rounded-lg bg-white/10 p-1">
                {['Male', 'Female'].map((g) => (
                  <StyledTouchableOpacity
                    key={g}
                    className={`flex-1 items-center justify-center rounded-md ${gender === g ? 'bg-primary' : ''}`}
                    onPress={() => setGender(g)}
                  >
                    <StyledText className={`text-sm font-semibold ${gender === g ? 'text-white' : 'text-white/60'}`}>{g}</StyledText>
                  </StyledTouchableOpacity>
                ))}
              </StyledView>
            </StyledView>
          </StyledView>

          {/* Notes Input */}
          <StyledView className="flex flex-col">
            <StyledText className="pb-2 text-base font-medium text-white">Initial Notes</StyledText>
            <StyledTextInput
              value={notes}
              onChangeText={setNotes}
              className="w-full rounded-lg bg-white/10 p-4 text-base text-white placeholder:text-white/40"
              placeholder="Add observations..."
              placeholderTextColor={'#FFFFFF66'}
              multiline
              numberOfLines={4}
              style={{ height: 100, textAlignVertical: 'top' }}
            />
          </StyledView>
          <StyledView className="pb-24" />
        </StyledView>
      </StyledScrollView>

      <StyledView className="absolute bottom-0 left-0 w-full bg-background-dark/80 p-4">
        <StyledTouchableOpacity 
          onPress={handleSave}
          disabled={isSubmitting}
          className={`flex h-14 w-full items-center justify-center rounded-xl ${isSubmitting ? 'bg-gray-600' : 'bg-primary'}`}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <StyledText className="text-lg font-bold text-white">Save Patient</StyledText>
          )}
        </StyledTouchableOpacity>
      </StyledView>
    </SafeAreaView>
  );
};

export default AddNewPatientScreen;