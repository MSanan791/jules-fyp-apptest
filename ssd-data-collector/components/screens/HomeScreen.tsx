import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator, StatusBar } from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { Link, useRouter, useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { getPatients, Patient } from '../../services/PatientService';
import { currentSession } from '../../store/SessionStore';
import { getToken } from '../../services/AuthService';
import { useAuth } from '../../context/AuthContext';

const HomeScreen = () => {
  const router = useRouter();
  const { signOut } = useAuth();
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctorName, setDoctorName] = useState('Doctor'); 
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const json = await SecureStore.getItemAsync('userData');
        if (json) {
          const user = JSON.parse(json);
          const name = user.name || user.firstName || 'Doctor'; 
          setDoctorName(name);
        }
      } catch (e) {
        console.log("Error loading user profile", e);
      }
    };
    loadUserProfile();
  }, []);

  const fetchPatients = async () => {
    try {
      const token = await getToken();
      if (!token) return;
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning,';
    if (hour < 18) return 'Good Afternoon,';
    return 'Good Evening,';
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <StatusBar barStyle="light-content" />
      
      {/* HEADER - Stays Blue */}
      <View className="bg-blue-600 pt-12 pb-8 px-6 rounded-b-[32px] shadow-lg">
        <View className="flex-row justify-between items-start">
          <View>
            <Text className="text-blue-100 font-medium text-base mb-1">{getGreeting()}</Text>
            <Text className="text-white text-3xl font-bold">Dr. {doctorName}</Text>
          </View>
          <TouchableOpacity onPress={signOut} className="bg-blue-500/50 p-2 rounded-xl backdrop-blur-sm">
            <MaterialIcons name="logout" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View className="flex-row gap-4 mt-8">
           <View className="flex-1 bg-blue-500/30 p-4 rounded-2xl flex-row items-center gap-3">
              <View className="bg-white/20 p-2 rounded-lg">
                 <FontAwesome5 name="users" size={20} color="white" />
              </View>
              <View>
                 <Text className="text-white text-2xl font-bold">{patients.length}</Text>
                 <Text className="text-blue-100 text-xs">Total Patients</Text>
              </View>
           </View>
           <View className="flex-1 bg-blue-500/30 p-4 rounded-2xl flex-row items-center gap-3">
              <View className="bg-white/20 p-2 rounded-lg">
                 <MaterialIcons name="pending-actions" size={24} color="white" />
              </View>
              <View>
                 <Text className="text-white text-2xl font-bold">0</Text>
                 <Text className="text-blue-100 text-xs">Pending Review</Text>
              </View>
           </View>
        </View>
      </View>

      <ScrollView 
        className="flex-1 -mt-4"
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchPatients(); }} tintColor="#2563eb" />}
      >
        {/* New Patient Button */}
        <View className="px-6 mb-8">
          <Link href="/add-new-patient" asChild>
            <TouchableOpacity className="flex-row items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
               <View className="flex-row items-center gap-4">
                  <View className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-full items-center justify-center">
                    <MaterialIcons name="person-add" size={24} color="#3b82f6" />
                  </View>
                  <View>
                    <Text className="text-slate-800 dark:text-white font-bold text-lg">New Patient</Text>
                    <Text className="text-slate-400 text-xs">Register a new profile</Text>
                  </View>
               </View>
               <MaterialIcons name="arrow-forward-ios" size={16} color="#94a3b8" />
            </TouchableOpacity>
          </Link>
        </View>

        {/* List */}
        <View className="px-6">
          <Text className="text-slate-800 dark:text-white font-bold text-xl mb-4">Recent Patients</Text>
          
          {loading ? (
            <ActivityIndicator size="large" color="#2563eb" className="mt-10" />
          ) : patients.length === 0 ? (
            <View className="items-center py-10 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
              <MaterialIcons name="people-outline" size={48} color="#cbd5e1" />
              <Text className="text-slate-400 mt-2">No patients found yet.</Text>
            </View>
          ) : (
            <View className="gap-3">
              {patients.map((patient) => (
                <TouchableOpacity 
                  key={patient.id}
                  onPress={() => handlePatientSelect(patient)}
                  activeOpacity={0.7}
                  className="flex-row items-center p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700"
                >
                  <View className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-700 items-center justify-center mr-4 border border-slate-200 dark:border-slate-600">
                    <Text className="text-xl font-bold text-slate-600 dark:text-slate-300">
                      {patient.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-slate-800 dark:text-white">{patient.name}</Text>
                    <View className="flex-row items-center gap-2 mt-1">
                      <View className="bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded text-xs">
                         <Text className="text-blue-600 dark:text-blue-400 font-bold text-[10px]">{patient.age} Yrs</Text>
                      </View>
                      <Text className="text-slate-400 text-xs capitalize">{patient.gender}</Text>
                    </View>
                  </View>
                  
                  <View className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-700 items-center justify-center">
                    <MaterialIcons name="chevron-right" size={20} color="#94a3b8" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};
export default HomeScreen;