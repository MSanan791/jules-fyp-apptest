import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator, TextInput, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Link, useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { getPatients, Patient } from '../../services/PatientService';
import { currentSession } from '../../store/SessionStore';
import { getToken } from '../../services/AuthService';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getColors, getShadows } from '../../theme/colors';
import { fonts } from '../../theme/fonts';

const HomeScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successPatientName, setSuccessPatientName] = useState('');
  const { signOut, user } = useAuth();
  const { theme } = useTheme();

  const isDark = theme === 'dark';
  const colors = getColors(isDark);
  const shadowStyles = getShadows(isDark);

  const fetchPatients = async () => {
    try {
      const token = await getToken();
      if (!token) {
        console.error('No token available');
        return;
      }
      const data = await getPatients(token);
      setPatients(data);
      setFilteredPatients(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Check for patient saved message from navigation params
  React.useEffect(() => {
    if (params.patientSaved === 'true' && params.patientName) {
      setShowSuccessMessage(true);
      setSuccessPatientName(params.patientName as string);
      // Clear params after showing message
      router.setParams({ patientSaved: undefined, patientName: undefined });
      // Auto-hide after 5 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
    }
  }, [params.patientSaved, params.patientName]);

  useFocusEffect(
    useCallback(() => {
      fetchPatients();
    }, [])
  );

  // Filter patients based on search
  React.useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.primary_language.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.initial_ssd_type?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPatients(filtered);
    }
  }, [searchQuery, patients]);

  const handlePatientSelect = (patient: Patient) => {
    currentSession.setPatient(patient.id);
    router.push('/patient-profile');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Calculate statistics
  const totalPatients = patients.length;
  const recentPatients = patients.filter(p => {
    const created = new Date(p.createdAt || '');
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return created > weekAgo;
  }).length;

  const StatCard = ({ icon, label, value, color, bgColor }: { icon: string; label: string; value: number | string; color: string; bgColor: string }) => (
    <View style={[{
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.border,
    }, shadowStyles.md]}>
      <View style={{
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: bgColor,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
      }}>
        <MaterialIcons name={icon as any} size={26} color={color} />
      </View>
      <Text style={{
        fontSize: 32,
        fontFamily: fonts.bold,
        color: colors.text,
      }}>
        {value}
      </Text>
      <Text style={{
        fontSize: 13,
        fontFamily: fonts.medium,
        color: colors.textSecondary,
        marginTop: 4,
      }}>
        {label}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={() => { setRefreshing(true); fetchPatients(); }} 
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Success Message */}
        {showSuccessMessage && (
          <View style={{
            marginHorizontal: 20,
            marginTop: 16,
            backgroundColor: colors.successBg,
            borderRadius: 16,
            padding: 18,
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: `${colors.success}30`,
            ...shadowStyles.md,
          }}>
            <MaterialIcons name="check-circle" size={26} color={colors.success} />
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={{
                color: colors.success,
                fontFamily: fonts.bold,
                fontSize: 16,
                marginBottom: 2,
              }}>
                Patient Saved Successfully!
              </Text>
              <Text style={{
                color: colors.success,
                fontFamily: fonts.regular,
                fontSize: 14,
                opacity: 0.9,
              }}>
                {successPatientName} has been added to your patient list.
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowSuccessMessage(false)}
              style={{ marginLeft: 10 }}
            >
              <MaterialIcons name="close" size={24} color={colors.success} />
            </TouchableOpacity>
          </View>
        )}

        {/* Header */}
        <View style={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 24,
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 14,
                fontFamily: fonts.medium,
                color: colors.textSecondary,
                marginBottom: 6,
              }}>
                {getGreeting()}
              </Text>
              <Text style={{
                fontSize: 30,
                fontFamily: fonts.bold,
                color: colors.text,
                letterSpacing: -0.5,
              }}>
                Dr. {user?.name?.split(' ')[0] || 'Therapist'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity 
                onPress={() => router.push('/settings')} 
                style={[{
                  width: 48,
                  height: 48,
                  borderRadius: 16,
                  backgroundColor: colors.surface,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: colors.border,
                }, shadowStyles.sm]}
              >
                <MaterialIcons name="settings" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={async () => {
                  await signOut();
                  router.replace('/');
                }} 
                style={[{
                  width: 48,
                  height: 48,
                  borderRadius: 16,
                  backgroundColor: colors.surface,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: colors.border,
                }, shadowStyles.sm]}
              >
                <MaterialIcons name="logout" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          {/* Statistics Cards */}
          <View style={{ flexDirection: 'row', gap: 14, marginBottom: 24 }}>
            <StatCard 
              icon="people" 
              label="Total Patients" 
              value={totalPatients}
              color={colors.primary}
              bgColor={colors.primaryBg}
            />
            <StatCard 
              icon="person-add" 
              label="This Week" 
              value={recentPatients}
              color={colors.success}
              bgColor={colors.successBg}
            />
          </View>

          {/* Quick Actions */}
          <View style={[{
            backgroundColor: colors.surface,
            borderRadius: 20,
            padding: 20,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: colors.border,
          }, shadowStyles.lg]}>
            <Text style={{
              fontSize: 12,
              fontFamily: fonts.bold,
              color: colors.textSecondary,
              marginBottom: 16,
              textTransform: 'uppercase',
              letterSpacing: 1.2,
            }}>
              Quick Actions
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Link href="/add-new-patient" asChild>
                <TouchableOpacity style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: colors.primary,
                  paddingVertical: 16,
                  borderRadius: 14,
                  gap: 10,
                  ...shadowStyles.glow,
                }}>
                  <MaterialIcons name="person-add" size={22} color="#fff" />
                  <Text style={{ color: '#fff', fontFamily: fonts.semiBold, fontSize: 15 }}>
                    Add Patient
                  </Text>
                </TouchableOpacity>
              </Link>
              <Link href="/test-selection" asChild>
                <TouchableOpacity style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: colors.accent,
                  paddingVertical: 16,
                  borderRadius: 14,
                  gap: 10,
                  ...shadowStyles.md,
                }}>
                  <MaterialIcons name="mic" size={22} color="#fff" />
                  <Text style={{ color: '#fff', fontFamily: fonts.semiBold, fontSize: 15 }}>
                    Start Test
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>

          {/* Search Bar */}
          <View style={[{
            backgroundColor: colors.surface,
            borderRadius: 16,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 18,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: searchQuery ? colors.borderFocus : colors.border,
          }, shadowStyles.sm]}>
            <MaterialIcons name="search" size={22} color={colors.textTertiary} />
            <TextInput
              placeholder="Search patients..."
              placeholderTextColor={colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{
                flex: 1,
                paddingVertical: 16,
                paddingHorizontal: 14,
                fontSize: 15,
                fontFamily: fonts.regular,
                color: colors.text,
              }}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <MaterialIcons name="clear" size={20} color={colors.textTertiary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Patient List Header */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 14,
          }}>
            <Text style={{
              fontSize: 18,
              fontFamily: fonts.bold,
              color: colors.text,
            }}>
              Patient Directory
            </Text>
            <View style={{
              backgroundColor: colors.primaryBg,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
            }}>
              <Text style={{
                fontSize: 12,
                fontFamily: fonts.semiBold,
                color: colors.primary,
              }}>
                {filteredPatients.length} {filteredPatients.length === 1 ? 'patient' : 'patients'}
              </Text>
            </View>
          </View>
          
          {/* Patient List */}
          {loading ? (
            <View style={{
              paddingVertical: 60,
              alignItems: 'center',
            }}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={{ color: colors.textSecondary, marginTop: 12, fontFamily: fonts.medium }}>
                Loading patients...
              </Text>
            </View>
          ) : filteredPatients.length === 0 ? (
            <View style={[{
              backgroundColor: colors.surface,
              borderRadius: 24,
              padding: 40,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: colors.border,
            }, shadowStyles.md]}>
              <View style={{
                width: 88,
                height: 88,
                borderRadius: 44,
                backgroundColor: colors.primaryBg,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
              }}>
                <MaterialIcons 
                  name={searchQuery ? "search-off" : "people"} 
                  size={44} 
                  color={colors.primary} 
                />
              </View>
              <Text style={{
                fontSize: 20,
                fontFamily: fonts.bold,
                color: colors.text,
                marginBottom: 8,
                textAlign: 'center',
              }}>
                {searchQuery ? 'No Results Found' : 'No Patients Yet'}
              </Text>
              <Text style={{
                fontSize: 14,
                fontFamily: fonts.regular,
                color: colors.textSecondary,
                textAlign: 'center',
                lineHeight: 22,
              }}>
                {searchQuery 
                  ? 'Try a different search term' 
                  : 'Add your first patient to get started'}
              </Text>
              {!searchQuery && (
                <Link href="/add-new-patient" asChild>
                  <TouchableOpacity style={{
                    marginTop: 24,
                    backgroundColor: colors.primary,
                    paddingHorizontal: 28,
                    paddingVertical: 14,
                    borderRadius: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    ...shadowStyles.glow,
                  }}>
                    <MaterialIcons name="person-add" size={20} color="#fff" />
                    <Text style={{ color: '#fff', fontFamily: fonts.semiBold, fontSize: 15 }}>
                      Add First Patient
                    </Text>
                  </TouchableOpacity>
                </Link>
              )}
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              {filteredPatients.map((patient) => (
                <TouchableOpacity 
                  key={patient.id}
                  onPress={() => handlePatientSelect(patient)}
                  activeOpacity={0.7}
                  style={[{
                    backgroundColor: colors.surface,
                    borderRadius: 20,
                    padding: 18,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }, shadowStyles.md]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {/* Avatar */}
                    <View style={{
                      width: 56,
                      height: 56,
                      borderRadius: 16,
                      backgroundColor: colors.primaryBg,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 16,
                    }}>
                      <Text style={{
                        fontSize: 24,
                        fontFamily: fonts.bold,
                        color: colors.primary,
                      }}>
                        {patient.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>

                    {/* Info */}
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontSize: 17,
                        fontFamily: fonts.semiBold,
                        color: colors.text,
                        marginBottom: 8,
                      }}>
                        {patient.name}
                      </Text>
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        <View style={{
                          backgroundColor: colors.primaryBg,
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          borderRadius: 8,
                        }}>
                          <Text style={{
                            fontSize: 12,
                            fontFamily: fonts.semiBold,
                            color: colors.primary,
                          }}>
                            {patient.age} yrs
                          </Text>
                        </View>
                        <View style={{
                          backgroundColor: colors.secondaryBg,
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          borderRadius: 8,
                        }}>
                          <Text style={{
                            fontSize: 12,
                            fontFamily: fonts.medium,
                            color: colors.secondary,
                          }}>
                            {patient.gender}
                          </Text>
                        </View>
                        {patient.primary_language && (
                          <View style={{
                            backgroundColor: colors.successBg,
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                            borderRadius: 8,
                          }}>
                            <Text style={{
                              fontSize: 12,
                              fontFamily: fonts.medium,
                              color: colors.success,
                            }}>
                              {patient.primary_language}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>

                    {/* Arrow */}
                    <View style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      backgroundColor: colors.primaryBg,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <MaterialIcons name="chevron-right" size={24} color={colors.primary} />
                    </View>
                  </View>

                  {/* Diagnosis Badge */}
                  {patient.initial_ssd_type && (
                    <View style={{
                      marginTop: 14,
                      paddingTop: 14,
                      borderTopWidth: 1,
                      borderTopColor: colors.border,
                    }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <MaterialIcons name="medical-services" size={14} color={colors.textTertiary} />
                        <Text style={{
                          fontSize: 13,
                          fontFamily: fonts.regular,
                          color: colors.textSecondary,
                          marginLeft: 8,
                        }}>
                          {patient.initial_ssd_type}
                        </Text>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
