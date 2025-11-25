import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styled } from 'nativewind';
import { MaterialIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledScrollView = styled(ScrollView);

const AddNewPatientScreen = () => {
  const [gender, setGender] = useState('Male');

  return (
    <SafeAreaView className="flex-1 bg-background-dark">
      <StyledView className="flex-row items-center justify-between h-16 px-4 border-b border-white/10">
        <Link href="/home" asChild>
          <StyledTouchableOpacity className="w-10 h-10 items-center justify-center rounded-full">
            <MaterialIcons name="arrow-back" size={24} color="white" />
          </StyledTouchableOpacity>
        </Link>
        <StyledText className="text-xl font-bold text-white">Add New Patient</StyledText>
        <StyledView className="w-10 h-10" />
      </StyledView>

      <StyledScrollView className="flex-1 px-4 py-6">
        <StyledView className="max-w-lg mx-auto space-y-6">
          <StyledView className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <StyledView className="flex flex-col">
              <StyledText className="pb-2 text-sm font-medium text-white/60">Patient ID</StyledText>
              <StyledView className="flex h-14 w-full min-w-0 flex-1 items-center overflow-hidden rounded-lg bg-white/5 p-4">
                <StyledText className="text-base font-normal leading-normal text-white/40">Will be generated on save</StyledText>
              </StyledView>
            </StyledView>
            <StyledView className="flex flex-col">
              <StyledText className="pb-2 text-sm font-medium text-white/60">Therapist ID</StyledText>
              <StyledView className="flex h-14 w-full min-w-0 flex-1 items-center overflow-hidden rounded-lg bg-white/5 p-4">
                <StyledText className="text-base font-normal leading-normal text-white/40">TH-12345</StyledText>
              </StyledView>
            </StyledView>
          </StyledView>

          <StyledView className="flex flex-col">
            <StyledText className="pb-2 text-base font-medium text-white">Patient Name</StyledText>
            <StyledTextInput
              className="h-14 w-full rounded-lg border-none bg-white/10 p-4 text-base text-white placeholder:text-white/40"
              placeholder="Enter patient's full name"
              placeholderTextColor={'#FFFFFF66'}
            />
          </StyledView>

          <StyledView className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <StyledView className="flex flex-col">
              <StyledText className="pb-2 text-base font-medium text-white">Age</StyledText>
              <StyledTextInput
                className="h-14 w-full rounded-lg border-none bg-white/10 p-4 text-base text-white placeholder:text-white/40"
                placeholder="Enter patient's age"
                placeholderTextColor={'#FFFFFF66'}
                keyboardType="numeric"
              />
            </StyledView>
            <StyledView className="flex flex-col">
              <StyledText className="pb-2 text-base font-medium text-white">Gender</StyledText>
              <StyledView className="flex-row h-14 rounded-lg bg-white/10 p-1">
                <StyledTouchableOpacity
                  className={`flex-1 items-center justify-center rounded-md ${gender === 'Male' ? 'bg-primary' : ''}`}
                  onPress={() => setGender('Male')}
                >
                  <StyledText className={`text-sm font-semibold ${gender === 'Male' ? 'text-white' : 'text-white/60'}`}>Male</StyledText>
                </StyledTouchableOpacity>
                <StyledTouchableOpacity
                  className={`flex-1 items-center justify-center rounded-md ${gender === 'Female' ? 'bg-primary' : ''}`}
                  onPress={() => setGender('Female')}
                >
                  <StyledText className={`text-sm font-medium ${gender === 'Female' ? 'text-white' : 'text-white/60'}`}>Female</StyledText>
                </StyledTouchableOpacity>
                <StyledTouchableOpacity
                  className={`flex-1 items-center justify-center rounded-md ${gender === 'Other' ? 'bg-primary' : ''}`}
                  onPress={() => setGender('Other')}
                >
                  <StyledText className={`text-sm font-medium ${gender === 'Other' ? 'text-white' : 'text-white/60'}`}>Other</StyledText>
                </StyledTouchableOpacity>
              </StyledView>
            </StyledView>
          </StyledView>

          <StyledView className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <StyledView className="flex flex-col">
              <StyledText className="pb-2 text-base font-medium text-white">Primary Language</StyledText>
              <StyledView className="relative flex h-14 w-full flex-row items-center">
                <StyledText className="w-full rounded-lg bg-white/10 p-4 text-base text-white">English</StyledText>
                <MaterialIcons name="expand-more" size={24} color="#FFFFFF99" className="absolute right-4" />
              </StyledView>
            </StyledView>
            <StyledView className="flex flex-col">
              <StyledText className="pb-2 text-base font-medium text-white">Initial SSD Type/Severity</StyledText>
              <StyledView className="relative flex h-14 w-full flex-row items-center">
                <StyledText className="w-full rounded-lg bg-white/10 p-4 text-base text-white">Mild Phonological Disorder</StyledText>
                <MaterialIcons name="expand-more" size={24} color="#FFFFFF99" className="absolute right-4" />
              </StyledView>
            </StyledView>
          </StyledView>

          <StyledView className="flex flex-col">
            <StyledText className="pb-2 text-base font-medium text-white">Initial Notes</StyledText>
            <StyledTextInput
              className="w-full rounded-lg border-none bg-white/10 p-4 text-base text-white placeholder:text-white/40"
              placeholder="Add relevant initial observations..."
              placeholderTextColor={'#FFFFFF66'}
              multiline
              numberOfLines={4}
              style={{ height: 128, textAlignVertical: 'top' }}
            />
          </StyledView>
          <StyledView className="pb-24" />
        </StyledView>
      </StyledScrollView>

      <StyledView className="absolute bottom-0 left-0 w-full bg-background-dark/80 p-4">
        <StyledView className="max-w-lg mx-auto">
          <StyledTouchableOpacity className="flex h-14 w-full items-center justify-center rounded-xl bg-primary transition-colors hover:bg-primary/90">
            <StyledText className="text-lg font-bold text-white">Save Patient</StyledText>
          </StyledTouchableOpacity>
        </StyledView>
      </StyledView>
    </SafeAreaView>
  );
};

export default AddNewPatientScreen;
