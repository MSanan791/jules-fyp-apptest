import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, Platform } from 'react-native'; // Added Platform
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Audio } from 'expo-av';
import { currentSession } from '../../store/SessionStore';

const WORDS = ["Cat", "Dog", "Sun", "Fish"];

// 👇 1. Define Custom Recording Options (WAV for iOS, HQ for Android)
const RECORDING_OPTIONS: Audio.RecordingOptions = {
  isMeteringEnabled: true,
  android: {
    // Android doesn't support WAV directly in Expo AV. 
    // We use the highest quality AAC (m4a) which is standard.
    extension: '.m4a',
    outputFormat: Audio.AndroidOutputFormat.MPEG_4,
    audioEncoder: Audio.AndroidAudioEncoder.AAC,
    sampleRate: 44100,
    numberOfChannels: 1,
    bitRate: 128000,
  },
  ios: {
    // iOS supports Linear PCM (True WAV)
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
  web: {
    mimeType: 'audio/wav',
    bitsPerSecond: 128000,
  },
};

const RecordingScreen = () => {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    (async () => {
      if (permissionResponse?.status !== 'granted') {
        await requestPermission();
      }
    })();
  }, []);

  const startRecording = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // 👇 2. Use the custom options here instead of the Preset
      const { recording } = await Audio.Recording.createAsync(
        RECORDING_OPTIONS
      );
      
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error("Recording Error:", err); // Helpful for debugging
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      Alert.alert('Failed to start recording', errorMessage);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    
    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI(); 
    setRecording(null);

    if (uri) {
      console.log('Recording stored at:', uri);
      
      currentSession.addRecording({
        uri: uri,
        word: WORDS[index],
        transcription: "", 
        errorType: "None",
        isCorrect: true 
      });

      handleNext();
    }
  };

  const handleNext = () => {
    if (index < WORDS.length - 1) {
      setIndex(index + 1);
    } else {
      router.push('/review-upload');
    }
  };

  const currentWord = WORDS[index];

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark items-center justify-between py-10">
      <View>
        <Text className="text-slate-500 text-center text-lg">Word {index + 1} of {WORDS.length}</Text>
        <Text className="text-5xl font-bold text-slate-900 dark:text-white mt-10 text-center">{currentWord}</Text>
        {/* Optional: Show file format indicator */}
        <Text className="text-slate-400 text-center mt-2 text-sm">
          Format: {Platform.OS === 'ios' ? 'WAV (PCM)' : 'M4A (HQ)'}
        </Text>
      </View>

      <View className="items-center gap-4">
        <TouchableOpacity 
          onPress={isRecording ? stopRecording : startRecording}
          className={`w-24 h-24 rounded-full items-center justify-center ${isRecording ? 'bg-red-500' : 'bg-primary'}`}
        >
          <MaterialIcons name={isRecording ? "stop" : "mic"} size={48} color="white" />
        </TouchableOpacity>
        <Text className="text-slate-600 dark:text-slate-400 font-medium text-lg">
          {isRecording ? "Tap to Stop" : "Tap to Record"}
        </Text>
      </View>

      <TouchableOpacity onPress={handleNext}>
        <Text className="text-primary font-bold text-xl">Skip Word</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default RecordingScreen;