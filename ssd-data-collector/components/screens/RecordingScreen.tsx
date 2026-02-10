import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { currentSession } from '../../store/SessionStore';
import { TARGET_WORDS, PHONOLOGICAL_PROCESSES } from '../../constants/Phonology';

const RECORDING_OPTIONS: Audio.RecordingOptions = {
  isMeteringEnabled: true,
  android: {
    extension: '.m4a',
    outputFormat: Audio.AndroidOutputFormat.MPEG_4,
    audioEncoder: Audio.AndroidAudioEncoder.AAC,
    sampleRate: 44100,
    numberOfChannels: 1,
    bitRate: 128000,
  },
  ios: {
    extension: '.wav',
    outputFormat: Audio.IOSOutputFormat.LINEARPCM,
    audioQuality: Audio.IOSAudioQuality.MAX,
    sampleRate: 44100,
    numberOfChannels: 1,
    bitRate: 128000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: { mimeType: 'audio/wav', bitsPerSecond: 128000 },
};

export default function RecordingScreen() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [metering, setMetering] = useState(-160);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentUri, setCurrentUri] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [permissionResponse, requestPermission] = Audio.usePermissions();

  useEffect(() => {
    loadWordData(index);
    return () => { if (sound) { sound.unloadAsync().catch(() => {}); setSound(null); setIsPlaying(false); } };
  }, [index]);

  useEffect(() => { return () => { if (recording) recording.stopAndUnloadAsync().catch(() => {}); }; }, [recording]);
  useEffect(() => { (async () => { if (permissionResponse?.status !== 'granted') await requestPermission(); })(); }, []);

  const loadWordData = (idx: number) => {
    const word = TARGET_WORDS[idx];
    const existingData = currentSession.getRecording(word);
    if (existingData) {
      setCurrentUri(existingData.uri);
      setSelectedTags(existingData.errorType && existingData.errorType !== "None" ? existingData.errorType.split(', ') : []);
    } else {
      setCurrentUri(null);
      setSelectedTags([]);
    }
  };

  const toggleTag = (tagId: string) => {
    const newTags = selectedTags.includes(tagId) ? selectedTags.filter(t => t !== tagId) : [...selectedTags, tagId];
    setSelectedTags(newTags);
    Haptics.selectionAsync();
    if (currentUri) saveToStore(currentUri, newTags);
  };

  const saveToStore = (uri: string, tags: string[]) => {
    currentSession.addRecording({
      uri: uri,
      word: TARGET_WORDS[index],
      transcription: "", 
      errorType: tags.length > 0 ? tags.join(', ') : "None",
      isCorrect: tags.length === 0
    });
  };

  const startRecording = async () => {
    try {
      if (sound) { await sound.stopAsync(); setIsPlaying(false); }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true, staysActiveInBackground: false, shouldDuckAndroid: true });
      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(RECORDING_OPTIONS);
      newRecording.setOnRecordingStatusUpdate((status) => { if (status.metering !== undefined) setMetering(status.metering); });
      await newRecording.startAsync();
      setRecording(newRecording);
      setIsRecording(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (err) { Alert.alert('Error', 'Could not start recording.'); }
  };

  const stopRecording = async () => {
    if (!recording) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI(); 
      setRecording(null);
      setIsRecording(false);
      setMetering(-160);
      if (uri) { setCurrentUri(uri); saveToStore(uri, selectedTags); }
    } catch (error) { setRecording(null); setIsRecording(false); }
  };

  const playRecording = async () => {
    if (!currentUri) return;
    try {
      if (sound && isPlaying) { await sound.pauseAsync(); setIsPlaying(false); return; }
      if (sound) { await sound.playAsync(); setIsPlaying(true); return; }
      const { sound: newSound } = await Audio.Sound.createAsync({ uri: currentUri }, { shouldPlay: true });
      setSound(newSound);
      setIsPlaying(true);
      newSound.setOnPlaybackStatusUpdate((status) => { if (status.isLoaded && status.didJustFinish) { setIsPlaying(false); newSound.setPositionAsync(0); } });
    } catch (error) { Alert.alert("Playback Error", "Could not play audio."); }
  };

  const handlePrevious = () => { if (index > 0) setIndex(index - 1); };
  const handleNext = () => { if (index < TARGET_WORDS.length - 1) setIndex(index + 1); else router.push('/review-upload'); };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View className="bg-blue-600 pt-12 pb-20 px-6 rounded-b-[40px] shadow-xl z-0 relative">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-blue-100 font-bold uppercase tracking-widest text-xs">Test Progress</Text>
          <View className="bg-blue-500/50 px-3 py-1 rounded-full"><Text className="text-white font-bold text-xs">{index + 1} / {TARGET_WORDS.length}</Text></View>
        </View>
        <View className="items-center mt-2">
            <Text className="text-white text-5xl font-bold tracking-tight text-center">{TARGET_WORDS[index]}</Text>
        </View>
      </View>

      {/* Control Pod */}
      <View className="-mt-12 mx-6 bg-white dark:bg-slate-800 rounded-3xl shadow-lg shadow-blue-900/10 p-6 z-10">
         <View className="h-12 flex-row items-center justify-center gap-1 mb-6">
            {[...Array(25)].map((_, i) => (
                <View key={i} className={`w-1.5 rounded-full ${isRecording ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-600'}`} style={{ height: isRecording ? Math.random() * 40 + 5 : 4 }} />
            ))}
         </View>

         <View className="flex-row items-center justify-between px-2">
            <TouchableOpacity onPress={playRecording} disabled={!currentUri || isRecording} className={`p-4 rounded-full border ${currentUri && !isRecording ? 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700' : 'border-transparent bg-slate-50 dark:bg-slate-900 opacity-50'}`}>
                <Ionicons name={isPlaying ? "pause" : "play"} size={24} color="#3b82f6" />
            </TouchableOpacity>

            <TouchableOpacity onPress={isRecording ? stopRecording : startRecording} className={`w-20 h-20 rounded-full items-center justify-center shadow-xl border-4 border-white dark:border-slate-700 ${isRecording ? 'bg-red-500' : 'bg-blue-600'}`}>
                 {isRecording ? <View className="w-8 h-8 bg-white rounded-md" /> : <MaterialIcons name="mic" size={36} color="white" />}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => { setCurrentUri(null); setSound(null); setSelectedTags([]); }} disabled={!currentUri || isRecording} className={`p-4 rounded-full border ${currentUri && !isRecording ? 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700' : 'border-transparent bg-slate-50 dark:bg-slate-900 opacity-50'}`}>
                <Ionicons name="trash-outline" size={24} color="#ef4444" />
            </TouchableOpacity>
         </View>

         <View className="items-center mt-4">
            <Text className={`text-xs font-bold uppercase tracking-widest ${isRecording ? 'text-red-500' : currentUri ? 'text-green-600 dark:text-green-400' : 'text-slate-400'}`}>
                {isRecording ? "Recording..." : currentUri ? "Audio Captured" : "Ready to Record"}
            </Text>
         </View>
      </View>

      {/* Tagging */}
      <View className="flex-1 mt-6 px-6">
        <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3 ml-1">Diagnosis (Tap to Select)</Text>
        <ScrollView contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {PHONOLOGICAL_PROCESSES.map((tag) => {
                const isSelected = selectedTags.includes(tag.id);
                return (
                    <TouchableOpacity key={tag.id} onPress={() => toggleTag(tag.id)} className={`px-4 py-2.5 rounded-xl border shadow-sm ${isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                        <Text className={`font-semibold text-sm ${isSelected ? 'text-white' : 'text-slate-600 dark:text-slate-300'}`}>{tag.label}</Text>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
      </View>

      {/* Footer */}
      <View className="px-6 pb-6 pt-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
         <View className="flex-row gap-4">
            <TouchableOpacity onPress={handlePrevious} disabled={index === 0} className={`flex-1 py-4 rounded-xl items-center justify-center border ${index === 0 ? 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'}`}>
                <Text className={`font-bold ${index === 0 ? 'text-slate-300 dark:text-slate-600' : 'text-slate-600 dark:text-slate-300'}`}>Previous</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleNext} className="flex-1 py-4 rounded-xl items-center justify-center bg-slate-900 dark:bg-blue-600 shadow-lg flex-row gap-2">
                <Text className="text-white font-bold">{index === TARGET_WORDS.length - 1 ? "Finish Session" : "Next Word"}</Text>
                <MaterialIcons name="arrow-forward" size={18} color="white" />
            </TouchableOpacity>
         </View>
      </View>
    </View>
  );
}