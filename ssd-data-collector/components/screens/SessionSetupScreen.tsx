import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';

const SessionSetupScreen = () => {
  const router = useRouter();
  const [checklist, setChecklist] = useState({ quietEnv: false, consent: false, ready: false });
  const toggleCheckbox = (key: keyof typeof checklist) => setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  const allChecked = Object.values(checklist).every(Boolean);

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View className="bg-blue-600 pt-12 pb-8 px-6 rounded-b-[32px] shadow-xl z-10">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-blue-500/50 rounded-full items-center justify-center backdrop-blur-md">
            <MaterialIcons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        </View>
        <Text className="text-blue-100 font-bold text-sm uppercase tracking-widest mb-1">Protocol Initialization</Text>
        <Text className="text-white text-3xl font-bold">Session Setup</Text>
      </View>

      <ScrollView className="flex-1 -mt-6 pt-8 px-6" contentContainerStyle={{ paddingBottom: 120 }}>
        
        {/* System Check */}
        <View className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 mb-8">
          <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">System Check</Text>
          <View className="flex-row items-center gap-4">
            <View className="w-14 h-14 rounded-full bg-green-50 dark:bg-green-900/20 items-center justify-center border border-green-100 dark:border-green-800">
              <MaterialIcons name="mic" size={28} color="#16a34a" />
            </View>
            <View className="flex-1">
              <Text className="text-slate-800 dark:text-white text-lg font-bold">Microphone Active</Text>
              <Text className="text-slate-500 dark:text-slate-400 text-xs">Audio input source detected</Text>
            </View>
            <View className="bg-green-100 dark:bg-green-900/40 px-3 py-1 rounded-full">
               <Text className="text-green-700 dark:text-green-400 font-bold text-xs">READY</Text>
            </View>
          </View>
        </View>

        {/* Checklist */}
        <Text className="text-slate-800 dark:text-white font-bold text-xl mb-4">Pre-Flight Checks</Text>
        <View className="gap-3">
          <CheckboxCard label="Environment is quiet & distraction-free" icon="volume-off" checked={checklist.quietEnv} onToggle={() => toggleCheckbox('quietEnv')} />
          <CheckboxCard label="Patient consent secured" icon="file-signature" checked={checklist.consent} onToggle={() => toggleCheckbox('consent')} />
          <CheckboxCard label="Ready to begin TAAPU protocol" icon="clipboard-check" checked={checklist.ready} onToggle={() => toggleCheckbox('ready')} />
        </View>
      </ScrollView>

      {/* Footer */}
      <View className="absolute bottom-0 left-0 right-0 p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shadow-lg">
        <Link href="/recording" asChild disabled={!allChecked}>
          <TouchableOpacity className={`w-full py-4 rounded-xl items-center flex-row justify-center gap-2 shadow-md ${allChecked ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-800'}`} disabled={!allChecked}>
            <Text className={`font-bold text-lg ${allChecked ? 'text-white' : 'text-slate-500 dark:text-slate-600'}`}>Start Session</Text>
            {allChecked && <MaterialIcons name="arrow-forward" size={20} color="white" />}
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
};

const CheckboxCard = ({ label, icon, checked, onToggle }: any) => (
  <TouchableOpacity onPress={onToggle} activeOpacity={0.7} className={`flex-row items-center p-4 rounded-2xl border transition-all ${checked ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'}`}>
    <View className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${checked ? 'bg-blue-500' : 'bg-slate-100 dark:bg-slate-700'}`}>
        <FontAwesome5 name={icon} size={16} color={checked ? 'white' : '#94a3b8'} />
    </View>
    <Text className={`flex-1 font-medium ${checked ? 'text-blue-900 dark:text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>{label}</Text>
    <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${checked ? 'border-blue-500 bg-blue-500' : 'border-slate-300 dark:border-slate-600'}`}>
        {checked && <MaterialIcons name="check" size={16} color="white" />}
    </View>
  </TouchableOpacity>
);

export default SessionSetupScreen;