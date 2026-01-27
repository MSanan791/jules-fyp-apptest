import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { createPatient } from '../../services/PatientService';
import { getToken } from '../../services/AuthService';
import { useTheme } from '../../context/ThemeContext';
import { getColors, getShadows } from '../../theme/colors';
import { fonts } from '../../theme/fonts';

// Moved InputField outside to prevent re-creation on every render
const InputField = React.memo(({ 
  label, 
  value, 
  onChangeText, 
  placeholder, 
  required = false,
  keyboardType = 'default' as any,
  multiline = false,
  numberOfLines = 1,
  colors,
  shadowStyles,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  required?: boolean;
  keyboardType?: any;
  multiline?: boolean;
  numberOfLines?: number;
  colors: any;
  shadowStyles: any;
}) => (
  <View style={{ marginBottom: 20 }}>
    <Text style={{
      fontSize: 14,
      fontFamily: fonts.semiBold,
      color: colors.text,
      marginBottom: 10,
    }}>
      {label} {required && <Text style={{ color: colors.error }}>*</Text>}
    </Text>
    <View style={{
      backgroundColor: colors.surface,
      borderRadius: 14,
      borderWidth: 2,
      borderColor: value ? colors.primary : colors.border,
      overflow: 'hidden',
      ...shadowStyles.sm,
    }}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={numberOfLines}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
        style={{
          paddingHorizontal: 18,
          paddingVertical: multiline ? 16 : 18,
          fontSize: 16,
          fontFamily: fonts.regular,
          color: colors.text,
          minHeight: multiline ? 110 : 58,
          textAlignVertical: multiline ? 'top' : 'center',
        }}
      />
    </View>
  </View>
));

const AddNewPatientScreen = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colors = getColors(isDark);
  const shadowStyles = getShadows(isDark);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('Male');
  const [language, setLanguage] = useState('English');
  const [secondaryLanguage, setSecondaryLanguage] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Memoized callbacks to prevent re-renders
  const handleFirstNameChange = useCallback((text: string) => setFirstName(text), []);
  const handleLastNameChange = useCallback((text: string) => setLastName(text), []);
  const handleAgeChange = useCallback((text: string) => setAge(text), []);
  const handleDateOfBirthChange = useCallback((text: string) => setDateOfBirth(text), []);
  const handleSecondaryLanguageChange = useCallback((text: string) => setSecondaryLanguage(text), []);
  const handleNotesChange = useCallback((text: string) => setNotes(text), []);
  const handleGuardianNameChange = useCallback((text: string) => setGuardianName(text), []);
  const handleGuardianPhoneChange = useCallback((text: string) => setGuardianPhone(text), []);

  const handleSave = async () => {
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    
    if (!firstName.trim() || !age.trim()) {
      Alert.alert("Required Fields", "Please enter Patient's First Name and Age.");
      return;
    }

    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      Alert.alert("Invalid Age", "Please enter a valid age between 1 and 120.");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await getToken();
      
      if (!token) {
        Alert.alert("Authentication Error", "Please login again.");
        router.push('/');
        setIsSubmitting(false);
        return;
      }
      
      const patientPayload = {
        name: fullName,
        age: ageNum,
        gender,
        primary_language: language,
        initial_ssd_type: diagnosis || undefined,
        initial_notes: notes.trim() || undefined
      };
      
      const result = await createPatient(patientPayload, token);

      if (!result || (!result.patient && !result.message)) {
        throw new Error('Unexpected response format from server');
      }

      setSuccessMessage(`Patient "${fullName}" created successfully!`);
      
      // Navigate to home with success message
      router.replace({
        pathname: "/home",
        params: { patientSaved: "true", patientName: fullName }
      });
      
    } catch (error) {
      console.error('Create patient error:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Could not save patient. Please check your connection.";
      Alert.alert("Error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const genderOptions = [
    { value: 'Male', icon: 'male' },
    { value: 'Female', icon: 'female' },
    { value: 'Other', icon: 'person' }
  ];

  const languageOptions = ['English', 'Urdu', 'Other'];
  
  const diagnosisOptions = [
    { value: '', label: 'Select diagnosis (optional)' },
    { value: 'Phonological Disorder', label: 'Phonological Disorder' },
    { value: 'Articulation Disorder', label: 'Articulation Disorder' },
    { value: 'Apraxia of Speech', label: 'Childhood Apraxia of Speech (CAS)' },
    { value: 'Dysarthria', label: 'Dysarthria' },
    { value: 'Fluency Disorder', label: 'Fluency Disorder (Stuttering)' },
    { value: 'Voice Disorder', label: 'Voice Disorder' },
    { value: 'Language Delay', label: 'Language Delay' },
    { value: 'Other', label: 'Other / Unspecified' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.surface,
        ...shadowStyles.sm,
      }}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
        >
          <MaterialIcons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{
          fontSize: 18,
          fontFamily: fonts.bold,
          color: colors.text,
        }}>
          New Patient
        </Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 140 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Success Message */}
        {successMessage && (
          <View style={{
            backgroundColor: colors.successBg,
            borderRadius: 16,
            padding: 18,
            marginBottom: 24,
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: `${colors.success}30`,
            ...shadowStyles.sm,
          }}>
            <MaterialIcons name="check-circle" size={26} color={colors.success} />
            <Text style={{ color: colors.success, marginLeft: 14, flex: 1, fontFamily: fonts.medium, fontSize: 15 }}>
              {successMessage}
            </Text>
          </View>
        )}

        {/* Basic Information Section */}
        <View style={{ marginBottom: 28 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 18 }}>
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: colors.primaryBg,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 14,
              ...shadowStyles.sm,
            }}>
              <MaterialIcons name="person" size={22} color={colors.primary} />
            </View>
            <Text style={{
              fontSize: 17,
              fontFamily: fonts.bold,
              color: colors.text,
            }}>
              Basic Information
            </Text>
          </View>

          {/* Name Fields */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <InputField
                label="First Name"
                value={firstName}
                onChangeText={handleFirstNameChange}
                placeholder="Enter first name"
                required
                colors={colors}
                shadowStyles={shadowStyles}
              />
            </View>
            <View style={{ flex: 1 }}>
              <InputField
                label="Last Name"
                value={lastName}
                onChangeText={handleLastNameChange}
                placeholder="Enter last name"
                colors={colors}
                shadowStyles={shadowStyles}
              />
            </View>
          </View>

          {/* Age and DOB */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <InputField
                label="Age"
                value={age}
                onChangeText={handleAgeChange}
                placeholder="Years"
                required
                keyboardType="numeric"
                colors={colors}
                shadowStyles={shadowStyles}
              />
            </View>
            <View style={{ flex: 1 }}>
              <InputField
                label="Date of Birth"
                value={dateOfBirth}
                onChangeText={handleDateOfBirthChange}
                placeholder="MM/DD/YYYY"
                colors={colors}
                shadowStyles={shadowStyles}
              />
            </View>
          </View>

          {/* Gender Selection */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{
              fontSize: 14,
              fontFamily: fonts.semiBold,
              color: colors.text,
              marginBottom: 10,
            }}>
              Gender
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {genderOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => setGender(option.value)}
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 16,
                    borderRadius: 14,
                    backgroundColor: gender === option.value ? colors.primary : colors.surface,
                    borderWidth: 2,
                    borderColor: gender === option.value ? colors.primary : colors.border,
                    gap: 8,
                    ...shadowStyles.sm,
                  }}
                >
                  <MaterialIcons 
                    name={option.icon as any} 
                    size={22} 
                    color={gender === option.value ? '#fff' : colors.textSecondary} 
                  />
                  <Text style={{
                    fontSize: 14,
                    fontFamily: fonts.semiBold,
                    color: gender === option.value ? '#fff' : colors.textSecondary,
                  }}>
                    {option.value}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Language Section */}
        <View style={{ marginBottom: 28 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 18 }}>
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: colors.secondaryBg,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 14,
              ...shadowStyles.sm,
            }}>
              <MaterialIcons name="language" size={22} color={colors.secondary} />
            </View>
            <Text style={{
              fontSize: 17,
              fontFamily: fonts.bold,
              color: colors.text,
            }}>
              Language
            </Text>
          </View>

          <Text style={{
            fontSize: 14,
            fontFamily: fonts.semiBold,
            color: colors.text,
            marginBottom: 10,
          }}>
            Primary Language
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 18 }}>
            {languageOptions.map((lang) => (
              <TouchableOpacity
                key={lang}
                onPress={() => setLanguage(lang)}
                style={{
                  paddingHorizontal: 18,
                  paddingVertical: 12,
                  borderRadius: 24,
                  backgroundColor: language === lang ? colors.primary : colors.surface,
                  borderWidth: 1,
                  borderColor: language === lang ? colors.primary : colors.border,
                  ...shadowStyles.sm,
                }}
              >
                <Text style={{
                  fontSize: 14,
                  fontFamily: fonts.medium,
                  color: language === lang ? '#fff' : colors.textSecondary,
                }}>
                  {lang}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <InputField
            label="Secondary Language (if any)"
            value={secondaryLanguage}
            onChangeText={handleSecondaryLanguageChange}
            placeholder="Enter secondary language"
            colors={colors}
            shadowStyles={shadowStyles}
          />
        </View>

        {/* Clinical Information Section */}
        <View style={{ marginBottom: 28 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 18 }}>
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: colors.accentBg,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 14,
              ...shadowStyles.sm,
            }}>
              <MaterialIcons name="medical-services" size={22} color={colors.accent} />
            </View>
            <Text style={{
              fontSize: 17,
              fontFamily: fonts.bold,
              color: colors.text,
            }}>
              Clinical Information
            </Text>
          </View>

          {/* Diagnosis Selection */}
          <Text style={{
            fontSize: 14,
            fontFamily: fonts.semiBold,
            color: colors.text,
            marginBottom: 10,
          }}>
            Initial Diagnosis
          </Text>
          <View style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            borderWidth: 2,
            borderColor: diagnosis ? colors.accent : colors.border,
            overflow: 'hidden',
            marginBottom: 18,
            ...shadowStyles.sm,
          }}>
            {diagnosisOptions.map((option, index) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => setDiagnosis(option.value)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 16,
                  paddingHorizontal: 18,
                  borderBottomWidth: index === diagnosisOptions.length - 1 ? 0 : 1,
                  borderBottomColor: colors.border,
                  backgroundColor: diagnosis === option.value ? colors.accentBg : 'transparent',
                }}
              >
                <MaterialIcons
                  name={diagnosis === option.value ? 'radio-button-checked' : 'radio-button-unchecked'}
                  size={24}
                  color={diagnosis === option.value ? colors.accent : colors.textTertiary}
                />
                <Text style={{
                  flex: 1,
                  marginLeft: 14,
                  fontSize: 15,
                  fontFamily: fonts.regular,
                  color: option.value ? colors.text : colors.textTertiary,
                  fontStyle: option.value ? 'normal' : 'italic',
                }}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <InputField
            label="Clinical Notes"
            value={notes}
            onChangeText={handleNotesChange}
            placeholder="Add initial observations, concerns, medical history, or relevant information..."
            multiline
            numberOfLines={4}
            colors={colors}
            shadowStyles={shadowStyles}
          />
        </View>

        {/* Guardian Information Section */}
        <View style={{ marginBottom: 28 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 18 }}>
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: colors.infoBg,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 14,
              ...shadowStyles.sm,
            }}>
              <MaterialIcons name="family-restroom" size={22} color={colors.info} />
            </View>
            <Text style={{
              fontSize: 17,
              fontFamily: fonts.bold,
              color: colors.text,
            }}>
              Guardian/Parent Information
            </Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <InputField
                label="Guardian Name"
                value={guardianName}
                onChangeText={handleGuardianNameChange}
                placeholder="Full name"
                colors={colors}
                shadowStyles={shadowStyles}
              />
            </View>
            <View style={{ flex: 1 }}>
              <InputField
                label="Phone Number"
                value={guardianPhone}
                onChangeText={handleGuardianPhoneChange}
                placeholder="Contact number"
                keyboardType="phone-pad"
                colors={colors}
                shadowStyles={shadowStyles}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        ...shadowStyles.lg,
      }}>
        <TouchableOpacity 
          onPress={handleSave}
          disabled={isSubmitting || !firstName.trim() || !age.trim()}
          style={{
            backgroundColor: isSubmitting || !firstName.trim() || !age.trim() 
              ? colors.textTertiary 
              : colors.primary,
            borderRadius: 16,
            paddingVertical: 18,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            ...shadowStyles.glow,
          }}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <MaterialIcons name="person-add" size={24} color="#fff" />
              <Text style={{
                color: '#fff',
                fontSize: 17,
                fontFamily: fonts.bold,
              }}>
                Create Patient
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default AddNewPatientScreen;
