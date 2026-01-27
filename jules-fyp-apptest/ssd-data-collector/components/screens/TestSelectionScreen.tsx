import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { getAllTests, TestProtocol, getTotalWordCount } from '../../data/testProtocols';
import { currentSession } from '../../store/SessionStore';
import { getPatients, Patient } from '../../services/PatientService';
import { getToken } from '../../services/AuthService';
import { getColors, getShadows } from '../../theme/colors';
import { fonts } from '../../theme/fonts';

const TestSelectionScreen = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colors = getColors(isDark);
  const shadowStyles = getShadows(isDark);
  const tests = getAllTests();

  // Patient selection state
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Check if patient is already selected
  useFocusEffect(
    useCallback(() => {
      const checkPatient = async () => {
        if (!currentSession.patientId) {
          // No patient selected, show patient picker
          setShowPatientModal(true);
          fetchPatients();
        } else {
          // Patient already selected, fetch their details
          try {
            const token = await getToken();
            if (token) {
              const allPatients = await getPatients(token);
              const patient = allPatients.find(p => p.id === currentSession.patientId);
              if (patient) {
                setSelectedPatient(patient);
              }
            }
          } catch (error) {
            console.error('Error fetching patient:', error);
          }
        }
      };
      checkPatient();
    }, [])
  );

  const fetchPatients = async () => {
    setLoadingPatients(true);
    try {
      const token = await getToken();
      if (token) {
        const data = await getPatients(token);
        setPatients(data);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoadingPatients(false);
    }
  };

  const handlePatientSelect = (patient: Patient) => {
    currentSession.setPatient(patient.id);
    setSelectedPatient(patient);
    setShowPatientModal(false);
  };

  const handleTestSelect = (test: TestProtocol) => {
    if (!currentSession.patientId) {
      setShowPatientModal(true);
      fetchPatients();
      return;
    }
    currentSession.setTestProtocol(test);
    router.push('/protocol-selection');
  };

  const handleChangePatient = () => {
    fetchPatients();
    setShowPatientModal(true);
  };

  const handleBack = () => {
    if (showPatientModal) {
      setShowPatientModal(false);
      if (!currentSession.patientId) {
        // Go back to home if no patient selected
        if (Platform.OS === 'web') {
          router.replace('/home');
        } else {
          router.back();
        }
      }
    } else {
      // Go back to previous screen (usually home or patient profile)
      if (Platform.OS === 'web') {
        router.replace('/home');
      } else {
        router.back();
      }
    }
  };

  const TestCard = ({ test }: { test: TestProtocol }) => {
    const wordCount = getTotalWordCount(test);
    const isUrdu = test.language === 'Urdu';
    
    return (
      <TouchableOpacity
        onPress={() => handleTestSelect(test)}
        activeOpacity={0.7}
        style={{
          backgroundColor: colors.surface,
          borderRadius: 24,
          marginBottom: 18,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: colors.border,
          ...shadowStyles.lg,
        }}
      >
        {/* Header Banner */}
        <View style={{
          backgroundColor: isUrdu ? colors.secondaryBg : colors.primaryBg,
          padding: 18,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{
              backgroundColor: isUrdu ? colors.secondary : colors.primary,
              paddingHorizontal: 14,
              paddingVertical: 7,
              borderRadius: 20,
              ...shadowStyles.sm,
            }}>
              <Text style={{ color: '#fff', fontFamily: fonts.bold, fontSize: 12 }}>
                {test.language.toUpperCase()}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialIcons name="schedule" size={16} color={colors.textSecondary} />
              <Text style={{ color: colors.textSecondary, marginLeft: 6, fontSize: 13, fontFamily: fonts.medium }}>
                ~{test.administrationTimeMinutes} min
              </Text>
            </View>
          </View>
        </View>

        {/* Content */}
        <View style={{ padding: 22 }}>
          <Text style={{
            fontSize: 26,
            fontFamily: fonts.bold,
            color: colors.text,
            marginBottom: 6,
            letterSpacing: -0.5,
          }}>
            {test.name}
          </Text>
          <Text style={{
            fontSize: 14,
            fontFamily: fonts.medium,
            color: colors.textSecondary,
            marginBottom: 16,
          }}>
            {test.fullName}
          </Text>

          <Text style={{
            fontSize: 14,
            fontFamily: fonts.regular,
            color: colors.textSecondary,
            marginBottom: 18,
            lineHeight: 22,
          }}>
            {test.description}
          </Text>

          {/* Stats Row */}
          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 10,
            marginBottom: 18,
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.surfaceSecondary,
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              ...shadowStyles.sm,
            }}>
              <MaterialIcons name="format-list-numbered" size={18} color={colors.primary} />
              <Text style={{ color: colors.text, marginLeft: 8, fontFamily: fonts.semiBold, fontSize: 13 }}>
                {test.protocols.length} Protocols
              </Text>
            </View>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.surfaceSecondary,
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              ...shadowStyles.sm,
            }}>
              <MaterialIcons name="record-voice-over" size={18} color={colors.accent} />
              <Text style={{ color: colors.text, marginLeft: 8, fontFamily: fonts.semiBold, fontSize: 13 }}>
                {wordCount} Words
              </Text>
            </View>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.surfaceSecondary,
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              ...shadowStyles.sm,
            }}>
              <MaterialIcons name="child-care" size={18} color={colors.success} />
              <Text style={{ color: colors.text, marginLeft: 8, fontFamily: fonts.semiBold, fontSize: 13 }}>
                Ages {test.targetAgeYears}
              </Text>
            </View>
          </View>

          {/* Protocol List Preview */}
          <View style={{
            backgroundColor: colors.surfaceSecondary,
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border,
            ...shadowStyles.sm,
          }}>
            <Text style={{
              fontSize: 11,
              fontFamily: fonts.bold,
              color: colors.textSecondary,
              marginBottom: 12,
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}>
              Assessment Areas
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {test.protocols.slice(0, 4).map((protocol) => (
                <View key={protocol.id} style={{
                  backgroundColor: colors.surface,
                  paddingHorizontal: 12,
                  paddingVertical: 7,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}>
                  <Text style={{ fontSize: 12, fontFamily: fonts.medium, color: colors.text }}>
                    {protocol.name}
                  </Text>
                </View>
              ))}
              {test.protocols.length > 4 && (
                <View style={{
                  backgroundColor: colors.primaryBg,
                  paddingHorizontal: 12,
                  paddingVertical: 7,
                  borderRadius: 10,
                }}>
                  <Text style={{ fontSize: 12, fontFamily: fonts.semiBold, color: colors.primary }}>
                    +{test.protocols.length - 4} more
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 18,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          backgroundColor: colors.surfaceSecondary,
        }}>
          <Text style={{
            color: colors.primary,
            fontFamily: fonts.semiBold,
            fontSize: 15,
          }}>
            Select this test
          </Text>
          <View style={{
            backgroundColor: colors.primary,
            width: 40,
            height: 40,
            borderRadius: 14,
            alignItems: 'center',
            justifyContent: 'center',
            ...shadowStyles.glow,
          }}>
            <MaterialIcons name="arrow-forward" size={20} color="#fff" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

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
          onPress={handleBack} 
          style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{
          fontSize: 18,
          fontFamily: fonts.bold,
          color: colors.text,
        }}>
          Select Assessment
        </Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Selected Patient Banner */}
        {selectedPatient && (
          <TouchableOpacity
            onPress={handleChangePatient}
            activeOpacity={0.7}
            style={{
              backgroundColor: colors.successBg,
              borderRadius: 16,
              padding: 16,
              marginBottom: 20,
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: `${colors.success}30`,
              ...shadowStyles.sm,
            }}
          >
            <View style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              backgroundColor: colors.success,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 14,
            }}>
              <Text style={{ color: '#fff', fontSize: 20, fontFamily: fonts.bold }}>
                {selectedPatient.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, fontFamily: fonts.medium, color: colors.success, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Session for
              </Text>
              <Text style={{ fontSize: 17, fontFamily: fonts.semiBold, color: colors.text }}>
                {selectedPatient.name}
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <MaterialIcons name="swap-horiz" size={20} color={colors.success} />
              <Text style={{ fontSize: 10, fontFamily: fonts.medium, color: colors.success, marginTop: 2 }}>
                Change
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Info Banner */}
        <View style={{
          backgroundColor: colors.infoBg,
          borderRadius: 18,
          padding: 18,
          marginBottom: 24,
          flexDirection: 'row',
          alignItems: 'flex-start',
          borderWidth: 1,
          borderColor: `${colors.info}30`,
          ...shadowStyles.sm,
        }}>
          <MaterialIcons name="info-outline" size={22} color={colors.info} style={{ marginTop: 2 }} />
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={{
              fontSize: 15,
              fontFamily: fonts.semiBold,
              color: colors.info,
              marginBottom: 6,
            }}>
              Choose Assessment Type
            </Text>
            <Text style={{
              fontSize: 13,
              fontFamily: fonts.regular,
              color: isDark ? colors.textSecondary : '#0C4A6E',
              lineHeight: 20,
            }}>
              Select the appropriate speech assessment based on the patient's primary language and clinical needs.
            </Text>
          </View>
        </View>

        {/* Test Cards */}
        {tests.map((test) => (
          <TestCard key={test.id} test={test} />
        ))}
      </ScrollView>

      {/* Patient Selection Modal */}
      <Modal
        visible={showPatientModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          if (currentSession.patientId) {
            setShowPatientModal(false);
          } else {
            router.back();
          }
        }}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'flex-end',
        }}>
          <View style={{
            backgroundColor: colors.background,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            maxHeight: '80%',
            ...shadowStyles.xl,
          }}>
            {/* Modal Header */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 20,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}>
              <Text style={{
                fontSize: 20,
                fontFamily: fonts.bold,
                color: colors.text,
              }}>
                Select Patient
              </Text>
              <TouchableOpacity 
                onPress={() => {
                  if (currentSession.patientId) {
                    setShowPatientModal(false);
                  } else {
                    router.back();
                  }
                }}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: colors.surfaceSecondary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MaterialIcons name="close" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Info Text */}
            <View style={{
              paddingHorizontal: 20,
              paddingVertical: 14,
              backgroundColor: colors.warningBg,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialIcons name="warning" size={18} color={colors.warning} />
                <Text style={{
                  fontSize: 13,
                  fontFamily: fonts.medium,
                  color: colors.warning,
                  marginLeft: 10,
                }}>
                  A patient must be selected to start a session
                </Text>
              </View>
            </View>

            {/* Patient List */}
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
              {loadingPatients ? (
                <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={{ color: colors.textSecondary, marginTop: 12, fontFamily: fonts.medium }}>
                    Loading patients...
                  </Text>
                </View>
              ) : patients.length === 0 ? (
                <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                  <MaterialIcons name="people" size={64} color={colors.textTertiary} />
                  <Text style={{
                    fontSize: 18,
                    fontFamily: fonts.semiBold,
                    color: colors.text,
                    marginTop: 16,
                    marginBottom: 8,
                  }}>
                    No Patients Yet
                  </Text>
                  <Text style={{
                    fontSize: 14,
                    fontFamily: fonts.regular,
                    color: colors.textSecondary,
                    textAlign: 'center',
                    marginBottom: 20,
                  }}>
                    Add a patient first to start a session
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setShowPatientModal(false);
                      router.push('/add-new-patient');
                    }}
                    style={{
                      backgroundColor: colors.primary,
                      paddingHorizontal: 24,
                      paddingVertical: 14,
                      borderRadius: 12,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                      ...shadowStyles.glow,
                    }}
                  >
                    <MaterialIcons name="person-add" size={20} color="#fff" />
                    <Text style={{ color: '#fff', fontFamily: fonts.semiBold }}>
                      Add Patient
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={{ gap: 12 }}>
                  {patients.map((patient) => (
                    <TouchableOpacity
                      key={patient.id}
                      onPress={() => handlePatientSelect(patient)}
                      activeOpacity={0.7}
                      style={{
                        backgroundColor: colors.surface,
                        borderRadius: 16,
                        padding: 16,
                        flexDirection: 'row',
                        alignItems: 'center',
                        borderWidth: 2,
                        borderColor: selectedPatient?.id === patient.id ? colors.primary : colors.border,
                        ...shadowStyles.sm,
                      }}
                    >
                      <View style={{
                        width: 50,
                        height: 50,
                        borderRadius: 14,
                        backgroundColor: colors.primaryBg,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 14,
                      }}>
                        <Text style={{
                          fontSize: 22,
                          fontFamily: fonts.bold,
                          color: colors.primary,
                        }}>
                          {patient.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{
                          fontSize: 16,
                          fontFamily: fonts.semiBold,
                          color: colors.text,
                          marginBottom: 4,
                        }}>
                          {patient.name}
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                          <Text style={{
                            fontSize: 12,
                            fontFamily: fonts.medium,
                            color: colors.textSecondary,
                          }}>
                            {patient.age} yrs • {patient.gender}
                          </Text>
                          {patient.primary_language && (
                            <Text style={{
                              fontSize: 12,
                              fontFamily: fonts.medium,
                              color: colors.primary,
                            }}>
                              • {patient.primary_language}
                            </Text>
                          )}
                        </View>
                      </View>
                      <View style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        backgroundColor: selectedPatient?.id === patient.id ? colors.primary : colors.primaryBg,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <MaterialIcons 
                          name={selectedPatient?.id === patient.id ? "check" : "chevron-right"} 
                          size={20} 
                          color={selectedPatient?.id === patient.id ? '#fff' : colors.primary} 
                        />
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default TestSelectionScreen;
