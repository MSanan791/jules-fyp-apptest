import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { currentSession } from '../../store/SessionStore';
import { TARGET_WORDS, PHONOLOGICAL_PROCESSES } from '../../constants/Phonology';
import { Waveform } from '../UI/Waveform';

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
  
  // Audio State
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [metering, setMetering] = useState(-160);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Data State
  const [currentUri, setCurrentUri] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  const [permissionResponse, requestPermission] = Audio.usePermissions();

  // 1. Load Data on Index Change
  useEffect(() => {
    loadWordData(index);
    // Cleanup sound when changing words
    return () => {
      if (sound) {
        sound.stopAsync().catch(() => {});
        sound.unloadAsync().catch(() => {});
        setSound(null);
        setIsPlaying(false);
      }
    };
  }, [index]);

  // 2. CRITICAL FIX: Safe Cleanup
  useEffect(() => {
    return () => {
      if (recording) {
        // We catch the error here. If it's already unloaded, this will fail silently (which is what we want).
        recording.stopAndUnloadAsync().catch((err) => {
           // Ignore "already unloaded" errors
        });
      }
    };
  }, [recording]);

  const loadWordData = (idx: number) => {
    const word = TARGET_WORDS[idx];
    const existingData = currentSession.getRecording(word);

    if (existingData) {
      setCurrentUri(existingData.uri);
      if (existingData.errorType && existingData.errorType !== "None") {
        setSelectedTags(existingData.errorType.split(', '));
      } else {
        setSelectedTags([]);
      }
    } else {
      setCurrentUri(null);
      setSelectedTags([]);
    }
  };

  useEffect(() => {
    (async () => {
      if (permissionResponse?.status !== 'granted') {
        await requestPermission();
      }
    })();
  }, []);

  const toggleTag = (tagId: string) => {
    const newTags = selectedTags.includes(tagId) 
      ? selectedTags.filter(t => t !== tagId) 
      : [...selectedTags, tagId];
    
    setSelectedTags(newTags);
    Haptics.selectionAsync();

    if (currentUri) {
      saveToStore(currentUri, newTags);
    }
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
      if (sound) {
        await sound.stopAsync();
        setIsPlaying(false);
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(RECORDING_OPTIONS);

      newRecording.setOnRecordingStatusUpdate((status) => {
        if (status.metering !== undefined) {
          setMetering(status.metering);
        }
      });

      await newRecording.startAsync();
      
      setRecording(newRecording);
      setIsRecording(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    } catch (err) {
      console.error("Failed to start recording", err);
      Alert.alert('Error', 'Could not start recording.');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      
      // Stop the recording
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI(); 
      
      // IMPORTANT: Set state AFTER unloading
      // The cleanup effect will run, but our .catch() block there will handle the "already unloaded" error
      setRecording(null);
      setIsRecording(false);
      setMetering(-160);

      if (uri) {
        setCurrentUri(uri);
        saveToStore(uri, selectedTags);
      }
    } catch (error) {
      console.log("Stop recording cleanup caught:", error);
      // Even if it failed to unload (rare), we reset UI
      setRecording(null);
      setIsRecording(false);
    }
  };

  const playRecording = async () => {
    if (!currentUri) return;

    try {
      if (sound && isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
        return;
      }

      if (sound) {
        await sound.playAsync();
        setIsPlaying(true);
        return;
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: currentUri },
        { shouldPlay: true }
      );
      
      setSound(newSound);
      setIsPlaying(true);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
          newSound.setPositionAsync(0); 
        }
      });

    } catch (error) {
      console.error("Playback failed", error);
      Alert.alert("Playback Error", "Could not play audio.");
    }
  };

  const handlePrevious = () => {
    if (index > 0) setIndex(index - 1);
  };

  const handleNext = () => {
    if (index < TARGET_WORDS.length - 1) {
      setIndex(index + 1);
    } else {
      router.push('/review-upload');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Top: Target Word */}
      <View className="flex-[0.25] justify-center items-center bg-indigo-50 border-b border-indigo-100 relative">
        <Text className="text-gray-500 text-sm mb-2">Word {index + 1} of {TARGET_WORDS.length}</Text>
        <Text className="text-5xl font-bold text-indigo-900">{TARGET_WORDS[index]}</Text>
        
        {currentUri && (
           <View className="absolute bottom-2 right-4 flex-row items-center">
             <MaterialIcons name="check-circle" size={16} color="green" />
             <Text className="text-green-600 text-xs ml-1">Recorded</Text>
           </View>
        )}
      </View>

      {/* Middle: Visualization & Controls */}
      <View className="flex-[0.25] justify-center items-center px-6">
        <Waveform metering={metering} isRecording={isRecording} />
        
        <View className="flex-row items-center justify-between w-full mt-6 px-8">
          <TouchableOpacity 
            onPress={playRecording}
            disabled={!currentUri || isRecording}
            className={`p-4 rounded-full ${currentUri && !isRecording ? 'bg-indigo-100' : 'bg-gray-100 opacity-50'}`}
          >
            <Ionicons name={isPlaying ? "pause" : "play"} size={28} color={currentUri && !isRecording ? "#4F46E5" : "#9CA3AF"} />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={isRecording ? stopRecording : startRecording}
            className={`w-24 h-24 rounded-full items-center justify-center shadow-xl ${isRecording ? 'bg-red-500' : 'bg-indigo-600'}`}
          >
             <MaterialIcons name={isRecording ? "stop" : "mic"} size={48} color="white" />
          </TouchableOpacity>

          <TouchableOpacity 
             disabled={!currentUri || isRecording}
             onPress={() => {
                 setCurrentUri(null);
                 setSound(null);
             }}
             className={`p-4 rounded-full ${currentUri && !isRecording ? 'bg-red-50' : 'bg-gray-100 opacity-50'}`}
          >
            <Ionicons name="trash-outline" size={28} color={currentUri && !isRecording ? "#EF4444" : "#9CA3AF"} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tags Section */}
      <View className="flex-[0.35] bg-gray-50 px-2 py-4 border-t border-gray-200">
        <Text className="text-gray-600 font-bold mb-2 ml-2 text-xs uppercase tracking-wider">Phonological Processes</Text>
        <ScrollView contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 4 }}>
            {PHONOLOGICAL_PROCESSES.map((tag) => {
              const isSelected = selectedTags.includes(tag.id);
              return (
                <TouchableOpacity
                  key={tag.id}
                  onPress={() => toggleTag(tag.id)}
                  className={`w-[48%] py-3 px-2 mb-2 rounded-lg border shadow-sm ${
                    isSelected ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-200'
                  }`}
                >
                  <Text className={`text-center font-semibold text-sm ${isSelected ? 'text-white' : 'text-gray-700'}`}>
                    {tag.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
        </ScrollView>
      </View>

      {/* Bottom Nav */}
      <View className="h-[80px] flex-row bg-white border-t border-gray-200 pb-5">
        <TouchableOpacity 
          onPress={handlePrevious}
          disabled={index === 0}
          className="flex-1 flex-row items-center justify-center border-r border-gray-100 active:bg-gray-50"
        >
          <Ionicons name="arrow-back" size={24} color={index === 0 ? "#D1D5DB" : "#374151"} />
          <Text className={`ml-2 font-bold ${index === 0 ? "text-gray-300" : "text-gray-700"}`}>Prev</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handleNext}
          className="flex-1 flex-row items-center justify-center bg-indigo-50 active:bg-indigo-100"
        >
          <Text className="mr-2 font-bold text-indigo-700">
            {index === TARGET_WORDS.length - 1 ? "Finish" : "Next"}
          </Text>
          <Ionicons 
            name={index === TARGET_WORDS.length - 1 ? "checkmark-circle" : "arrow-forward"} 
            size={24} 
            color="#4338ca" 
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}