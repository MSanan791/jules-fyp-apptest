import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, StatusBar } from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
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
      if (!id) return;
      const token = await getToken();
      if (!token) return;
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
      <View className="flex-1 bg-slate-50 dark:bg-slate-950 items-center justify-center">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!patient) return null;

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <View className="bg-blue-600 pt-12 pb-8 px-6 rounded-b-[32px] shadow-xl z-10">
        <View className="flex-row justify-between items-center mb-6">
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-blue-500/50 rounded-full items-center justify-center backdrop-blur-md">
            <MaterialIcons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity className="w-10 h-10 bg-blue-500/50 rounded-full items-center justify-center backdrop-blur-md">
            <MaterialIcons name="edit" size={20} color="white" />
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center gap-4 mb-6">
            <View className="w-16 h-16 bg-white rounded-full items-center justify-center shadow-lg">
                <Text className="text-2xl font-bold text-blue-600">{patient.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View>
                <Text className="text-white text-3xl font-bold">{patient.name}</Text>
                <Text className="text-blue-100 text-sm opacity-80">ID: #{patient.id}</Text>
            </View>
        </View>

        <View className="flex-row gap-3">
            <InfoBadge icon="calendar" label={`${patient.age} Yrs`} />
            <InfoBadge icon="venus-mars" label={patient.gender} />
            <InfoBadge icon="language" label={patient.primary_language} />
        </View>
      </View>

      <ScrollView className="flex-1 -mt-4 pt-6" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <View className="px-6">
            
            {/* Diagnosis */}
            <View className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 mb-6">
                <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Primary Diagnosis</Text>
                <View className="flex-row items-start gap-3">
                    <MaterialIcons name="medical-services" size={24} color="#3b82f6" />
                    <Text className="text-slate-800 dark:text-white text-lg font-medium leading-6">{patient.initial_ssd_type || "Assessment Pending"}</Text>
                </View>
            </View>

            {/* Sessions */}
            <View className="flex-row justify-between items-end mb-4">
                <Text className="text-slate-800 dark:text-white font-bold text-xl">Session History</Text>
                <Text className="text-slate-400 text-sm">{sessions.length} Sessions</Text>
            </View>
            
            {sessions.length === 0 ? (
                <View className="bg-white dark:bg-slate-800 rounded-2xl p-8 items-center border border-dashed border-slate-300 dark:border-slate-700">
                    <View className="w-16 h-16 bg-slate-50 dark:bg-slate-700 rounded-full items-center justify-center mb-4">
                        <MaterialIcons name="history" size={32} color="#cbd5e1" />
                    </View>
                    <Text className="text-slate-500 dark:text-slate-400 font-medium">No sessions recorded yet.</Text>
                </View>
            ) : (
                <View className="gap-3">
                    {sessions.map((session) => (
                        <SessionCard key={session.id} session={session} />
                    ))}
                </View>
            )}
        </View>
      </ScrollView>

      {/* FAB */}
      <Link href="/session-setup" asChild>
        <TouchableOpacity className="absolute bottom-8 right-6 w-16 h-16 bg-blue-600 rounded-full items-center justify-center shadow-lg shadow-blue-500/40 z-50" activeOpacity={0.8}>
            <MaterialIcons name="add" size={32} color="white" />
        </TouchableOpacity>
      </Link>
    </View>
  );
};

const InfoBadge = ({ icon, label }: { icon: string; label: string }) => (
    <View className="flex-row items-center bg-blue-500/30 px-3 py-2 rounded-lg gap-2 backdrop-blur-sm">
        <FontAwesome5 name={icon} size={12} color="white" />
        <Text className="text-white font-medium text-xs capitalize">{label}</Text>
    </View>
);

const SessionCard = ({ session }: { session: SessionSummary }) => {
    const date = new Date(session.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    return (
        <TouchableOpacity className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex-row items-center">
            <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${session.upload_status === 'uploaded' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
                <MaterialIcons name={session.upload_status === 'uploaded' ? "cloud-done" : "cloud-upload"} size={24} color={session.upload_status === 'uploaded' ? "#16a34a" : "#d97706"} />
            </View>
            <View className="flex-1">
                <Text className="text-slate-800 dark:text-white font-bold text-base">{session.final_session_diagnosis || 'Standard Assessment'}</Text>
                <View className="flex-row items-center gap-2 mt-1">
                    <Text className="text-slate-500 dark:text-slate-400 text-xs">{date}</Text>
                    <View className="w-1 h-1 bg-slate-300 rounded-full" />
                    <Text className="text-slate-500 dark:text-slate-400 text-xs">{session.recordings?.length || 0} Words</Text>
                </View>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#cbd5e1" />
        </TouchableOpacity>
    );
};

export default PatientProfileScreen;