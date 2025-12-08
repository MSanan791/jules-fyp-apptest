import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Link, useRouter, useFocusEffect } from 'expo-router';
import { currentSession } from '../../store/SessionStore';
import { getPatientById, getPatientSessions, Patient, SessionSummary } from '../../services/PatientService';
import { getToken } from '../../services/AuthService';

const PatientProfileScreen = () => {
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const id = currentSession.patientId;
      if (!id) return; // Should handle error/redirect

      const token = await getToken();
      if (!token) return; // Should handle error/redirect
      
      // Fetch both in parallel
      const [pData, sData] = await Promise.all([
        getPatientById(id as number, token),
        getPatientSessions(id as number, token)
      ]);

      setPatient(pData);
      setSessions(sData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center">
        <ActivityIndicator size="large" color="#007AFF" />
      </SafeAreaView>
    );
  }

  if (!patient) return null;

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      {/* Header */}
      <View className="flex-row h-16 items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
          <MaterialIcons name="arrow-back" size={24} className="text-gray-800 dark:text-white" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-800 dark:text-white">{patient.name}</Text>
        <TouchableOpacity className="w-10 h-10 items-center justify-center">
          <MaterialIcons name="edit" size={24} className="text-gray-800 dark:text-white" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-4 pb-24">
        
        {/* Patient Info Card */}
        <View className="bg-white dark:bg-[#192633] rounded-xl p-5 mb-6 shadow-sm">
          <Text className="text-lg font-bold text-gray-800 dark:text-white mb-2">Patient Details</Text>
          <InfoRow label="Age / Gender" value={`${patient.age} / ${patient.gender}`} />
          <InfoRow label="Primary Language" value={patient.primary_language} />
          <InfoRow label="Diagnosis" value={patient.initial_ssd_type} isLast />
        </View>

        {/* Session History */}
        <Text className="text-xl font-bold text-gray-800 dark:text-white mb-3">Session History</Text>
        
        {sessions.length === 0 ? (
          <View className="bg-white dark:bg-[#192633] rounded-xl p-8 items-center">
            <MaterialIcons name="history" size={48} className="text-gray-300 dark:text-gray-600 mb-2" />
            <Text className="text-gray-500">No sessions recorded yet.</Text>
          </View>
        ) : (
          <View className="bg-white dark:bg-[#192633] rounded-xl shadow-sm">
            {sessions.map((session, index) => (
              <SessionItem 
                key={session.id}
                date={new Date(session.createdAt).toLocaleDateString()}
                diagnosis={session.final_session_diagnosis || 'Standard Assessment'}
                status={session.upload_status}
                wordCount={session.recordings?.length || 0}
                isLast={index === sessions.length - 1}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* FAB: Start New Session */}
      <Link href="/session-setup" asChild>
        <TouchableOpacity className="absolute bottom-6 right-6 w-16 h-16 bg-primary rounded-full items-center justify-center shadow-lg">
          <MaterialIcons name="add" size={32} color="white" />
        </TouchableOpacity>
      </Link>
    </SafeAreaView>
  );
};

const InfoRow = ({ label, value, isLast = false }: { label: string; value: string; isLast?: boolean }) => (
  <View className={`flex-row justify-between py-3 ${!isLast ? 'border-b border-gray-100 dark:border-gray-700' : ''}`}>
    <Text className="text-gray-500 dark:text-gray-400">{label}</Text>
    <Text className="font-medium text-gray-900 dark:text-white">{value}</Text>
  </View>
);

const SessionItem = ({ date, diagnosis, status, wordCount, isLast }: { date: string; diagnosis: string; status: string; wordCount: number; isLast: boolean }) => (
  <View className={`flex-row items-center p-4 ${!isLast ? 'border-b border-gray-100 dark:border-gray-700' : ''}`}>
    <View className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center mr-3">
      <MaterialIcons name="check-circle" size={24} className="text-green-600 dark:text-green-400" />
    </View>
    <View className="flex-1">
      <Text className="font-bold text-gray-900 dark:text-white">{diagnosis}</Text>
      <Text className="text-xs text-gray-500">{date} • {wordCount} words</Text>
    </View>
    <Text className="text-xs font-bold text-green-600 dark:text-green-400">{status}</Text>
  </View>
);

export default PatientProfileScreen;