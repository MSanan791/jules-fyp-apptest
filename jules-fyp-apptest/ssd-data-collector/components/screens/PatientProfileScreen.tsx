import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { getPatientById, Patient, deletePatient, getPatientSessions, SessionSummary } from '../../services/PatientService';
import { getToken } from '../../services/AuthService';
import { currentSession } from '../../store/SessionStore';
import { useTheme } from '../../context/ThemeContext';
import { getColors, getShadows } from '../../theme/colors';
import { fonts } from '../../theme/fonts';

const PatientProfileScreen = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colors = getColors(isDark);
  const shadowStyles = getShadows(isDark);

  const [patient, setPatient] = useState<Patient | null>(null);
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const patientId = currentSession.patientId;

  const fetchPatientData = async () => {
    if (!patientId) {
      router.replace('/home');
      return;
    }

    try {
      const token = await getToken();
      if (!token) {
        router.replace('/');
        return;
      }
      
      const patientData = await getPatientById(patientId, token);
      setPatient(patientData);
    } catch (error) {
      console.error('Error fetching patient:', error);
      Alert.alert('Error', 'Failed to load patient data');
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    if (!patientId) return;
    
    setSessionsLoading(true);
    try {
      const token = await getToken();
      if (!token) return;
      
      const data = await getPatientSessions(patientId, token);
      setSessions(data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setSessionsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPatientData();
      fetchSessions();
    }, [patientId])
  );

  const handleStartSession = () => {
    router.push('/test-selection');
  };

  const [shouldNavigateHome, setShouldNavigateHome] = useState(false);

  // Handle navigation after delete
  useEffect(() => {
    if (shouldNavigateHome) {
      setShouldNavigateHome(false);
      router.replace('/home');
    }
  }, [shouldNavigateHome]);

  const performDelete = async () => {
    setIsDeleting(true);
    try {
      const token = await getToken();
      if (!token) {
        if (Platform.OS === 'web') {
          window.alert('Authentication required. Please login again.');
        } else {
          Alert.alert('Error', 'Authentication required. Please login again.');
        }
        router.replace('/');
        return;
      }
      if (!patientId) {
        if (Platform.OS === 'web') {
          window.alert('No patient selected.');
        } else {
          Alert.alert('Error', 'No patient selected.');
        }
        return;
      }
      
      console.log('Attempting to delete patient:', patientId);
      await deletePatient(patientId, token);
      console.log('Patient deleted successfully');
      
      // Clear the current session patient
      currentSession.reset();
      
      if (Platform.OS === 'web') {
        window.alert('Patient deleted successfully');
        router.replace('/home');
      } else {
        Alert.alert('Success', 'Patient deleted successfully', [
          { text: 'OK', onPress: () => setShouldNavigateHome(true) }
        ]);
      }
    } catch (error) {
      console.error('Error deleting patient:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete patient. Please try again.';
      if (Platform.OS === 'web') {
        window.alert('Delete Failed: ' + errorMessage);
      } else {
        Alert.alert('Delete Failed', errorMessage);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeletePatient = () => {
    if (isDeleting) return;
    
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Are you sure you want to delete ${patient?.name}? This action cannot be undone and will remove all associated session data.`);
      if (confirmed) {
        performDelete();
      }
    } else {
      Alert.alert(
        'Delete Patient',
        `Are you sure you want to delete ${patient?.name}? This action cannot be undone and will remove all associated session data.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: performDelete
          }
        ]
      );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.textSecondary, marginTop: 12, fontFamily: fonts.medium }}>
          Loading patient data...
        </Text>
      </SafeAreaView>
    );
  }

  if (!patient) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <MaterialIcons name="person-off" size={64} color={colors.textTertiary} />
        <Text style={{ color: colors.text, fontSize: 18, fontFamily: fonts.semiBold, marginTop: 16 }}>
          Patient Not Found
        </Text>
        <TouchableOpacity 
          onPress={() => router.replace('/home')}
          style={[{
            marginTop: 20,
            backgroundColor: colors.primary,
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 12,
          }, shadowStyles.glow]}
        >
          <Text style={{ color: '#fff', fontFamily: fonts.semiBold }}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const InfoCard = ({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) => (
    <View style={{
      flex: 1,
      alignItems: 'center',
      padding: 14,
    }}>
      <View style={{
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: `${color}20`,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
      }}>
        <MaterialIcons name={icon as any} size={24} color={color} />
      </View>
      <Text style={{
        fontSize: 17,
        fontFamily: fonts.bold,
        color: colors.text,
      }}>
        {value}
      </Text>
      <Text style={{
        fontSize: 12,
        fontFamily: fonts.regular,
        color: colors.textSecondary,
        marginTop: 3,
      }}>
        {label}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={[{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.surface,
      }, shadowStyles.sm]}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{
          fontSize: 18,
          fontFamily: fonts.bold,
          color: colors.text,
        }}>
          Patient Profile
        </Text>
        <TouchableOpacity 
          onPress={handleDeletePatient}
          disabled={isDeleting}
          style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center', opacity: isDeleting ? 0.5 : 1 }}
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color={colors.error} />
          ) : (
            <MaterialIcons name="delete-outline" size={24} color={colors.error} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={[{
          backgroundColor: colors.surface,
          borderRadius: 24,
          padding: 28,
          alignItems: 'center',
          marginBottom: 24,
          borderWidth: 1,
          borderColor: colors.border,
        }, shadowStyles.xl]}>
          {/* Avatar */}
          <View style={[{
            width: 96,
            height: 96,
            borderRadius: 32,
            backgroundColor: colors.primaryBg,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 18,
          }, shadowStyles.md]}>
            <Text style={{
              fontSize: 44,
              fontFamily: fonts.bold,
              color: colors.primary,
            }}>
              {patient.name.charAt(0).toUpperCase()}
            </Text>
          </View>

          {/* Name */}
          <Text style={{
            fontSize: 26,
            fontFamily: fonts.bold,
            color: colors.text,
            marginBottom: 6,
            textAlign: 'center',
          }}>
            {patient.name}
          </Text>

          {/* Badges */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 12 }}>
            <View style={{
              backgroundColor: colors.primaryBg,
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderRadius: 20,
            }}>
              <Text style={{ fontSize: 13, fontFamily: fonts.semiBold, color: colors.primary }}>
                {patient.age} years old
              </Text>
            </View>
            <View style={{
              backgroundColor: colors.secondaryBg,
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderRadius: 20,
            }}>
              <Text style={{ fontSize: 13, fontFamily: fonts.medium, color: colors.secondary }}>
                {patient.gender}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={[{
          backgroundColor: colors.surface,
          borderRadius: 20,
          marginBottom: 24,
          flexDirection: 'row',
          borderWidth: 1,
          borderColor: colors.border,
        }, shadowStyles.md]}>
          <InfoCard 
            icon="translate" 
            label="Primary Language" 
            value={patient.primary_language}
            color={colors.primary}
          />
          <View style={{ width: 1, backgroundColor: colors.border }} />
          <InfoCard 
            icon="history" 
            label="Total Sessions" 
            value={sessions.length.toString()}
            color={colors.success}
          />
        </View>

        {/* Diagnosis Section */}
        {patient.initial_ssd_type && (
          <View style={[{
            backgroundColor: colors.surface,
            borderRadius: 20,
            padding: 22,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: colors.border,
          }, shadowStyles.md]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: colors.warningBg,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 14,
              }}>
                <MaterialIcons name="medical-services" size={22} color={colors.warning} />
              </View>
              <Text style={{
                fontSize: 12,
                fontFamily: fonts.bold,
                color: colors.textSecondary,
                textTransform: 'uppercase',
                letterSpacing: 1.2,
              }}>
                Initial Diagnosis
              </Text>
            </View>
            <Text style={{
              fontSize: 16,
              fontFamily: fonts.medium,
              color: colors.text,
              lineHeight: 24,
            }}>
              {patient.initial_ssd_type}
            </Text>
          </View>
        )}

        {/* Additional Info */}
        {patient.additional_info && (
          <View style={[{
            backgroundColor: colors.surface,
            borderRadius: 20,
            padding: 22,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: colors.border,
          }, shadowStyles.md]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: colors.infoBg,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 14,
              }}>
                <MaterialIcons name="notes" size={22} color={colors.info} />
              </View>
              <Text style={{
                fontSize: 12,
                fontFamily: fonts.bold,
                color: colors.textSecondary,
                textTransform: 'uppercase',
                letterSpacing: 1.2,
              }}>
                Additional Notes
              </Text>
            </View>
            <Text style={{
              fontSize: 15,
              fontFamily: fonts.regular,
              color: colors.textSecondary,
              lineHeight: 24,
            }}>
              {patient.additional_info}
            </Text>
          </View>
        )}

        {/* Session History */}
        <View style={[{
          backgroundColor: colors.surface,
          borderRadius: 20,
          padding: 22,
          marginBottom: 24,
          borderWidth: 1,
          borderColor: colors.border,
        }, shadowStyles.md]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: colors.successBg,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 14,
              }}>
                <MaterialIcons name="history" size={22} color={colors.success} />
              </View>
              <Text style={{
                fontSize: 12,
                fontFamily: fonts.bold,
                color: colors.textSecondary,
                textTransform: 'uppercase',
                letterSpacing: 1.2,
              }}>
                Session History
              </Text>
            </View>
            <View style={{
              backgroundColor: colors.successBg,
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 12,
            }}>
              <Text style={{ fontSize: 12, fontFamily: fonts.semiBold, color: colors.success }}>
                {sessions.length}
              </Text>
            </View>
          </View>

          {sessionsLoading ? (
            <View style={{ padding: 30, alignItems: 'center' }}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : sessions.length === 0 ? (
            <View style={{
              padding: 30,
              alignItems: 'center',
              backgroundColor: colors.surfaceSecondary,
              borderRadius: 14,
            }}>
              <MaterialIcons name="event-busy" size={40} color={colors.textTertiary} />
              <Text style={{
                fontSize: 14,
                fontFamily: fonts.medium,
                color: colors.textSecondary,
                marginTop: 12,
                textAlign: 'center',
              }}>
                No sessions recorded yet
              </Text>
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              {sessions.slice(0, 5).map((session, index) => (
                <View
                  key={session.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 16,
                    backgroundColor: colors.surfaceSecondary,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    backgroundColor: colors.primaryBg,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 14,
                  }}>
                    <Text style={{
                      fontSize: 14,
                      fontFamily: fonts.bold,
                      color: colors.primary,
                    }}>
                      {index + 1}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      fontSize: 15,
                      fontFamily: fonts.semiBold,
                      color: colors.text,
                      marginBottom: 4,
                    }}>
                      {session.test_protocol_name || session.final_session_diagnosis || 'Assessment Session'}
                    </Text>
                    <Text style={{
                      fontSize: 12,
                      fontFamily: fonts.regular,
                      color: colors.textSecondary,
                    }}>
                      {formatDate(session.created_at || session.createdAt)}
                    </Text>
                  </View>
                  <View style={{
                    backgroundColor: (session.status || session.upload_status) === 'completed' ? colors.successBg : colors.warningBg,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 8,
                  }}>
                    <Text style={{
                      fontSize: 11,
                      fontFamily: fonts.semiBold,
                      color: (session.status || session.upload_status) === 'completed' ? colors.success : colors.warning,
                      textTransform: 'capitalize',
                    }}>
                      {session.status || session.upload_status || 'pending'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Start Session Button */}
        <TouchableOpacity
          onPress={handleStartSession}
          style={[{
            backgroundColor: colors.primary,
            borderRadius: 16,
            paddingVertical: 20,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
          }, shadowStyles.glow]}
        >
          <MaterialIcons name="mic" size={26} color="#fff" />
          <Text style={{
            color: '#fff',
            fontSize: 18,
            fontFamily: fonts.bold,
          }}>
            Start New Session
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PatientProfileScreen;
