import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Link, useRouter, useFocusEffect } from 'expo-router';
import { getPatients, Patient } from '../../services/PatientService';
import { currentSession } from '../../store/SessionStore';
import { getToken } from '../../services/AuthService';
import { useAuth } from '../../context/AuthContext'; // Import Auth Hook
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

  // Refresh data whenever screen comes into focus (e.g., after adding a new patient)
  useFocusEffect(
    useCallback(() => {
      fetchPatients();
    }, [])
  );

  const handlePatientSelect = (patient: Patient) => {
    // 1. Set the global patient ID
    currentSession.setPatient(patient.id);
    
    // 2. Navigate to their profile
    router.push('/patient-profile');
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <ScrollView 
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchPatients(); }} />}
      >
        <View className="p-4">
          <Text className="text-gray-900 dark:text-white text-3xl font-bold mt-4">Welcome, Dr. Smith</Text>
          <TouchableOpacity onPress={signOut}>
            <MaterialIcons name="logout" size={24} className="text-gray-900 dark:text-white" />
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View className="px-4 py-3">
          <Link href="/add-new-patient" asChild>
            <TouchableOpacity className="flex-row items-center justify-center rounded-lg h-14 bg-primary gap-3">
              <MaterialIcons name="person-add" size={24} className="text-white" />
              <Text className="text-white text-base font-bold">Add New Patient</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Patient List */}
        <View className="px-4 pt-4 pb-8">
          <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">Your Patients</Text>
          
          {loading ? (
            <ActivityIndicator size="large" color="#007AFF" />
          ) : patients.length === 0 ? (
            <Text className="text-gray-500 text-center mt-4">No patients found. Add one above!</Text>
          ) : (
            <View className="gap-3">
              {patients.map((patient) => (
                <TouchableOpacity 
                  key={patient.id}
                  onPress={() => handlePatientSelect(patient)}
                  className="flex-row items-center p-4 rounded-lg bg-white dark:bg-[#192633] border border-gray-200 dark:border-gray-700"
                >
                  <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center mr-4">
                    <MaterialIcons name="person" size={24} className="text-primary" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-bold text-gray-900 dark:text-white">{patient.name}</Text>
                    <Text className="text-sm text-gray-500 dark:text-gray-400">
                      {patient.age} yrs • {patient.gender}
                    </Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={24} className="text-gray-400 dark:text-gray-500" />
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