import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Link, useRouter, useFocusEffect } from 'expo-router';
import { getPatients, Patient } from '../../services/PatientService';
import { currentSession } from '../../store/SessionStore';
import { getToken } from '../../services/AuthService';
import { useAuth } from '../../context/AuthContext';

const HomeScreen = () => {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { signOut } = useAuth();

  const fetchPatients = async () => {
    try {
      const token = await getToken();
      if (!token) {
        console.error('No token available');
        return;
      }
      const data = await getPatients(token);
      setPatients(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPatients();
    }, [])
  );

  const handlePatientSelect = (patient: Patient) => {
    currentSession.setPatient(patient.id);
    router.push('/patient-profile');
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchPatients(); }} />}
      >
        <View className="p-6">
          <View className="flex-row justify-between items-center mt-2">
            <View>
              <Text className="text-text-muted-light dark:text-text-muted-dark text-sm font-medium">Good Morning,</Text>
              <Text className="text-text-light dark:text-text-dark text-3xl font-bold">Dr. Smith</Text>
            </View>
            <TouchableOpacity onPress={signOut} className="bg-white dark:bg-surface-dark p-2 rounded-full shadow-sm">
              <MaterialIcons name="logout" size={24} className="text-text-light dark:text-text-dark" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="px-6 mb-6">
          <Link href="/add-new-patient" asChild>
            <TouchableOpacity className="flex-row items-center justify-center rounded-2xl h-16 bg-primary shadow-lg shadow-blue-500/30 gap-3">
              <MaterialIcons name="person-add" size={24} color="white" />
              <Text className="text-white text-base font-bold">Add New Patient</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Patient List */}
        <View className="px-6">
          <Text className="text-lg font-bold text-text-light dark:text-text-dark mb-4">Your Patients</Text>
          
          {loading ? (
            <ActivityIndicator size="large" color="#3B82F6" />
          ) : patients.length === 0 ? (
            <View className="items-center py-10">
              <MaterialIcons name="people-outline" size={48} className="text-gray-300 dark:text-gray-600 mb-2" />
              <Text className="text-text-muted-light text-center">No patients found. Add one above!</Text>
            </View>
          ) : (
            <View>
              {patients.map((patient) => (
                <TouchableOpacity 
                  key={patient.id}
                  onPress={() => handlePatientSelect(patient)}
                  activeOpacity={0.7}
                  className="flex-row items-center p-5 mb-3 rounded-2xl bg-surface-light dark:bg-surface-dark shadow-sm border border-gray-100 dark:border-gray-800"
                >
                  <View className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 items-center justify-center mr-4">
                    <Text className="text-xl font-bold text-primary dark:text-blue-300">
                      {patient.name.charAt(0)}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-text-light dark:text-text-dark">{patient.name}</Text>
                    <View className="flex-row items-center mt-1">
                      <View className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-md mr-2">
                        <Text className="text-xs font-medium text-text-muted-light dark:text-gray-300">
                          {patient.age} Yrs
                        </Text>
                      </View>
                      <Text className="text-sm text-text-muted-light dark:text-text-muted-dark">
                        {patient.gender}
                      </Text>
                    </View>
                  </View>
                  <MaterialIcons name="chevron-right" size={24} className="text-gray-300 dark:text-gray-600" />
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