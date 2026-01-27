import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, Alert, Platform, ScrollView, Animated, BackHandler, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Audio } from 'expo-av';
import { currentSession } from '../../store/SessionStore';
import { useTheme } from '../../context/ThemeContext';
import { useSettings } from '../../context/SettingsContext';
import { getColors, getShadows } from '../../theme/colors';
import { fonts } from '../../theme/fonts';
import { Protocol } from '../../data/testProtocols';

// Get supported web audio format
const getWebMimeType = (): string => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return 'audio/webm;codecs=opus';
  }
  
  const formats = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4',
  ];
  
  for (const format of formats) {
    if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(format)) {
      return format;
    }
  }
  
  return 'audio/webm;codecs=opus';
};

// Recording options factory based on quality setting
const getRecordingOptions = (highQuality: boolean): Audio.RecordingOptions => ({
  isMeteringEnabled: true,
  android: {
    extension: '.m4a',
    outputFormat: Audio.AndroidOutputFormat.MPEG_4,
    audioEncoder: Audio.AndroidAudioEncoder.AAC,
    sampleRate: highQuality ? 48000 : 44100,
    numberOfChannels: highQuality ? 2 : 1,
    bitRate: highQuality ? 256000 : 128000,
  },
  ios: {
    extension: '.wav',
    outputFormat: Audio.IOSOutputFormat.LINEARPCM,
    audioQuality: highQuality ? Audio.IOSAudioQuality.MAX : Audio.IOSAudioQuality.HIGH,
    sampleRate: highQuality ? 48000 : 44100,
    numberOfChannels: highQuality ? 2 : 1,
    bitRate: highQuality ? 256000 : 128000,
    linearPCMBitDepth: highQuality ? 24 : 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: getWebMimeType(),
    bitsPerSecond: highQuality ? 256000 : 128000,
  },
});

const RecordingScreen = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const { settings } = useSettings();
  const isDark = theme === 'dark';
  const colors = getColors(isDark);
  const shadowStyles = getShadows(isDark);

  // Get recording options based on quality setting
  const recordingOptions = useMemo(() => 
    getRecordingOptions(settings.highQualityAudio), 
    [settings.highQualityAudio]
  );

  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  
  // State to force re-render when session changes
  const [wordIndex, setWordIndex] = useState(currentSession.currentWordIndex);
  const [, forceUpdate] = useState({});
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Get current word from session - using state to track index
  const allWords = currentSession.getAllWords();
  const currentWord = allWords[wordIndex] || null;
  // Get recording for current word from current protocol's recordings
  const currentProtocolRecordings = currentSession.getCurrentProtocolRecordings();
  // Find recording by word string to ensure correct match when switching protocols
  const currentRecording = currentWord 
    ? currentProtocolRecordings.find(r => r.word === currentWord.word) 
    : currentProtocolRecordings[wordIndex];
  const stats = currentSession.getCompletionStats();

  // Sync wordIndex with currentSession and protocol changes
  useEffect(() => {
    const protocolId = currentSession.selectedProtocol?.id;
    if (protocolId) {
      setWordIndex(currentSession.currentWordIndex);
      // Force update when protocol changes to refresh status displays
      forceUpdate({});
    }
  }, [currentSession.selectedProtocol?.id]);
  
  // Also sync when wordIndex changes in session
  useEffect(() => {
    const checkInterval = setInterval(() => {
      if (currentSession.currentWordIndex !== wordIndex) {
        setWordIndex(currentSession.currentWordIndex);
        forceUpdate({});
      }
    }, 100);
    return () => clearInterval(checkInterval);
  }, [wordIndex]);
  
  // Force update when recordings change to refresh status displays
  useEffect(() => {
    forceUpdate({});
  }, [currentSession.recordings.length]);

  // Prevent hardware back button during recording
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isRecording) {
        Alert.alert(
          'Recording in Progress',
          'Please stop the recording before leaving.',
          [{ text: 'OK' }]
        );
        return true;
      }
      handleExitSession();
      return true;
    });

    return () => backHandler.remove();
  }, [isRecording]);

  useEffect(() => {
    (async () => {
      if (permissionResponse?.status !== 'granted') {
        await requestPermission();
      }
    })();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
      if (sound) {
        sound.unloadAsync();
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

  // Pulse animation for recording
  useEffect(() => {
    if (isRecording && !isPaused) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording, isPaused]);

  // Recording timer
  useEffect(() => {
    if (isRecording && !isPaused) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [isRecording, isPaused]);

  const [showExitModal, setShowExitModal] = useState(false);
  const [exitAction, setExitAction] = useState<'review' | 'discard' | null>(null);
  const [showProtocolCompleteModal, setShowProtocolCompleteModal] = useState(false);
  // Store a snapshot of recordings when modal opens to prevent status from changing
  const [modalRecordingsSnapshot, setModalRecordingsSnapshot] = useState<typeof currentSession.recordings>([]);

  // Handle exit action after modal closes
  useEffect(() => {
    if (exitAction === 'review') {
      setExitAction(null);
      router.replace('/review-upload');
    } else if (exitAction === 'discard') {
      setExitAction(null);
      currentSession.reset();
      router.replace('/home');
    }
  }, [exitAction]);

  const handleExitSession = async () => {
    // Clean up audio first
    await cleanupAudio();
    
    const stats = currentSession.getCompletionStats();
    const hasRecordings = stats.recorded > 0;
    
    if (Platform.OS === 'web') {
      // For web, use confirm dialogs which work better
      if (hasRecordings) {
        const saveFirst = window.confirm(`You have ${stats.recorded} recording(s). Save and review before leaving?`);
        if (saveFirst) {
          router.replace('/review-upload');
        } else {
          const discard = window.confirm('Discard all recordings and exit?');
          if (discard) {
            currentSession.reset();
            router.replace('/home');
          }
        }
      } else {
        const exit = window.confirm('Are you sure you want to leave? No recordings have been made yet.');
        if (exit) {
          currentSession.reset();
          router.replace('/home');
        }
      }
    } else {
      Alert.alert(
        'Leave Session?',
        hasRecordings 
          ? `You have ${stats.recorded} recording(s). What would you like to do?`
          : 'Are you sure you want to leave? No recordings have been made yet.',
        hasRecordings ? [
          { text: 'Continue Recording', style: 'cancel' },
          { 
            text: 'Save & Review', 
            onPress: () => setExitAction('review')
          },
          {
            text: 'Discard All',
            style: 'destructive',
            onPress: () => setExitAction('discard')
          }
        ] : [
          { text: 'Continue', style: 'cancel' },
          {
            text: 'Exit',
            style: 'destructive',
            onPress: () => setExitAction('discard')
          }
        ]
      );
    }
  };

  const cleanupAudio = async () => {
    if (recording) {
      try {
        await recording.stopAndUnloadAsync();
      } catch (e) {
        console.log('Recording cleanup error:', e);
      }
      setRecording(null);
    }
    if (sound) {
      try {
        await sound.stopAsync();
        await sound.unloadAsync();
      } catch (e) {
        console.log('Sound cleanup error:', e);
      }
      setSound(null);
    }
    setIsRecording(false);
    setIsPaused(false);
    setIsPlaying(false);
    setRecordingDuration(0);
  };

  const startRecording = async () => {
    try {
      await cleanupAudio();

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Media recording is not supported in this browser.');
        }
      }

      setRecordingDuration(0);
      const { recording: newRecording } = await Audio.Recording.createAsync(recordingOptions);
      
      setRecording(newRecording);
      setIsRecording(true);
      setIsPaused(false);
      if (currentWord) {
        currentSession.updateRecordingStatus(currentWord.word, 'recording');
      }
      forceUpdate({});
    } catch (err) {
      console.error("Recording Error:", err);
      let errorMessage = 'Failed to start recording';
      
      if (err instanceof Error) {
        errorMessage = err.message;
        if (errorMessage.includes('NotSupportedError') || errorMessage.includes('MediaRecorder')) {
          errorMessage = 'Audio format not supported. Please use Chrome, Firefox, or Safari.';
        } else if (errorMessage.includes('Permission')) {
          errorMessage = 'Microphone permission denied.';
        }
      }
      
      Alert.alert('Recording Error', errorMessage);
    }
  };

  const pauseRecording = async () => {
    if (!recording || !isRecording) return;
    
    try {
      await recording.pauseAsync();
      setIsPaused(true);
    } catch (err) {
      console.error("Pause Error:", err);
    }
  };

  const resumeRecording = async () => {
    if (!recording || !isPaused) return;
    
    try {
      await recording.startAsync();
      setIsPaused(false);
    } catch (err) {
      console.error("Resume Error:", err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    
    try {
      setIsRecording(false);
      setIsPaused(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      if (uri && currentWord) {
        currentSession.addRecording({
          uri: uri,
          word: currentWord.word,
          transcription: '',
          errorType: 'None',
          isCorrect: true,
        });
        forceUpdate({});
      }
    } catch (err) {
      console.error("Stop Recording Error:", err);
    }
  };

  const playRecording = async () => {
    if (!currentRecording?.playbackUri) return;
    
    try {
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      const { sound: newSound, status } = await Audio.Sound.createAsync(
        { uri: currentRecording.playbackUri },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );
      
      setSound(newSound);
      setIsPlaying(true);
      
      if (status.isLoaded && status.durationMillis) {
        setPlaybackDuration(status.durationMillis);
      }
    } catch (err) {
      console.error("Playback Error:", err);
      Alert.alert('Playback Error', 'Could not play recording');
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setPlaybackPosition(status.positionMillis || 0);
      if (status.didJustFinish) {
        setIsPlaying(false);
        setPlaybackPosition(0);
      }
    }
  };

  const stopPlayback = async () => {
    if (sound) {
      await sound.stopAsync();
      setIsPlaying(false);
      setPlaybackPosition(0);
    }
  };

  const reRecordWord = async () => {
    await cleanupAudio();
    if (currentWord) {
      currentSession.reRecordWord(currentWord.word);
    }
    forceUpdate({});
    setTimeout(() => startRecording(), 100);
  };

  const handleSkip = () => {
    currentSession.skipCurrentWord();
    forceUpdate({});
    handleNext();
  };

  const handleNext = useCallback(async () => {
    await cleanupAudio();

    const hasNext = currentSession.nextWord();
    if (hasNext) {
      setWordIndex(currentSession.currentWordIndex);
      forceUpdate({});
    } else {
      // We've reached the end of this protocol.
      // Determine if it's actually complete (all words fully recorded).
      const currentProtocol = currentSession.selectedProtocol;
      if (currentProtocol) {
        const protocolStatus = currentSession.getProtocolStatus(
          currentProtocol,
          currentSession.recordings
        );

        if (protocolStatus.isCompleted) {
          // Mark protocol as completed if fully recorded
          currentSession.markProtocolComplete();
        }
      }

      // Check if there are more protocol types available
      const remainingProtocols = currentSession.getRemainingProtocols();

      if (remainingProtocols.length > 0) {
        // Save a deep snapshot of current recordings to preserve status when modal is shown
        // This ensures status doesn't change while modal is open
        const snapshot = currentSession.recordings.map(r => ({ ...r }));
        setModalRecordingsSnapshot(snapshot);
        // Show modal to continue with another type or finish
        setShowProtocolCompleteModal(true);

        // Debug: Log snapshot
        if (__DEV__) {
          console.log(`📸 Modal snapshot taken: ${snapshot.length} recordings`);
        }
      } else {
        // No more protocol types, go to review
        router.push('/review-upload');
      }
    }
  }, [router]);
  
  const handleContinueWithProtocol = (protocol: Protocol) => {
    setShowProtocolCompleteModal(false);
    // Set the new protocol (this will set currentWordIndex to first incomplete word)
    currentSession.setSelectedProtocol(protocol);
    // Sync wordIndex with the session's currentWordIndex
    setWordIndex(currentSession.currentWordIndex);
    // Force re-render to show new protocol's words
    forceUpdate({});
    // Small delay to ensure state updates
    setTimeout(() => {
      setWordIndex(currentSession.currentWordIndex);
      forceUpdate({});
    }, 100);
  };
  
  const handleFinishSession = () => {
    setShowProtocolCompleteModal(false);
    router.push('/review-upload');
  };

  const handlePrevious = useCallback(async () => {
    await cleanupAudio();

    const hasPrev = currentSession.previousWord();
    if (hasPrev) {
      setWordIndex(currentSession.currentWordIndex);
      forceUpdate({});
    }
  }, []);

  const handleWordSelect = useCallback(async (index: number) => {
    if (isRecording) {
      Alert.alert('Recording in Progress', 'Please stop the recording first.');
      return;
    }
    
    await cleanupAudio();
    currentSession.goToWord(index);
    setWordIndex(index);
    forceUpdate({});
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatMs = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    return formatTime(seconds);
  };

  const progress = allWords.length > 0 ? ((wordIndex + 1) / allWords.length) * 100 : 0;
  const isUrdu = currentSession.testProtocol?.language === 'Urdu';
  const hasRecording = currentRecording?.status === 'recorded';

  if (!currentWord || allWords.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <MaterialIcons name="error-outline" size={48} color={colors.error} />
        <Text style={{ color: colors.text, marginTop: 16, fontSize: 16, fontFamily: fonts.medium }}>No words to record</Text>
        <TouchableOpacity 
          onPress={() => router.replace('/test-selection')}
          style={{
            marginTop: 16,
            backgroundColor: colors.primary,
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 12,
            ...shadowStyles.glow,
          }}
        >
          <Text style={{ color: '#fff', fontFamily: fonts.semiBold }}>Select Test</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.surface,
        ...shadowStyles.sm,
      }}>
        <TouchableOpacity 
          onPress={handleExitSession}
          disabled={isRecording}
          style={{ 
            width: 40, 
            height: 40, 
            alignItems: 'center', 
            justifyContent: 'center',
            opacity: isRecording ? 0.5 : 1,
          }}
        >
          <MaterialIcons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <View style={{ flex: 1, marginHorizontal: 16 }}>
          <Text style={{ textAlign: 'center', fontSize: 12, fontFamily: fonts.medium, color: colors.textSecondary, marginBottom: 6 }}>
            {currentSession.selectedProtocol?.name || 'Recording'}
          </Text>
          <View style={{
            height: 6,
            backgroundColor: colors.surfaceSecondary,
            borderRadius: 3,
          }}>
            <View style={{
              height: '100%',
              width: `${progress}%`,
              backgroundColor: colors.primary,
              borderRadius: 3,
            }} />
          </View>
          <Text style={{ textAlign: 'center', fontSize: 11, fontFamily: fonts.regular, color: colors.textSecondary, marginTop: 6 }}>
            {wordIndex + 1} of {allWords.length} • {stats.recorded} recorded
          </Text>
        </View>

        <TouchableOpacity 
          onPress={() => router.push('/review-upload')}
          disabled={isRecording}
          style={{
            backgroundColor: isRecording ? colors.textTertiary : colors.primary,
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 20,
            opacity: isRecording ? 0.5 : 1,
            ...shadowStyles.sm,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 13, fontFamily: fonts.semiBold }}>Finish</Text>
        </TouchableOpacity>
      </View>

      {/* Word Display */}
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
        {/* Word Card */}
        <View style={{
          backgroundColor: colors.surface,
          borderRadius: 28,
          padding: 36,
          alignItems: 'center',
          width: '100%',
          maxWidth: 420,
          borderWidth: 2,
          borderColor: isRecording ? colors.recording : colors.border,
          ...shadowStyles.xl,
        }}>
          {/* Urdu Text (if applicable) */}
          {isUrdu && currentWord.urdu && (
            <Text style={{
              fontSize: 52,
              fontFamily: fonts.bold,
              color: colors.text,
              marginBottom: 12,
              textAlign: 'center',
            }}>
              {currentWord.urdu}
            </Text>
          )}

          {/* Main Word */}
          <Text style={{
            fontSize: isUrdu ? 30 : 60,
            fontFamily: fonts.bold,
            color: isUrdu ? colors.textSecondary : colors.text,
            marginBottom: 16,
            textAlign: 'center',
            letterSpacing: -1,
          }}>
            {currentWord.word}
          </Text>

          {/* Pronunciation Guide */}
          <View style={{
            backgroundColor: colors.surfaceSecondary,
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 14,
            marginBottom: 10,
            ...shadowStyles.sm,
          }}>
            <Text style={{ fontSize: 17, fontFamily: fonts.medium, color: colors.textSecondary, fontStyle: 'italic' }}>
              /{currentWord.pronunciation}/
            </Text>
          </View>

          {/* Phoneme Target */}
          {currentWord.phoneme && (
            <Text style={{ fontSize: 13, fontFamily: fonts.regular, color: colors.textTertiary }}>
              Target: {currentWord.phoneme}
            </Text>
          )}

          {/* Recording Status Badge */}
          <View style={{
            marginTop: 20,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            backgroundColor: hasRecording ? colors.successBg : 
                           currentRecording?.status === 'skipped' ? colors.warningBg :
                           isRecording ? colors.recordingBg : colors.surfaceSecondary,
            ...shadowStyles.sm,
          }}>
            <Text style={{
              fontSize: 13,
              fontFamily: fonts.semiBold,
              color: hasRecording ? colors.success :
                     currentRecording?.status === 'skipped' ? colors.warning :
                     isRecording ? colors.recording : colors.textSecondary,
            }}>
              {isRecording ? (isPaused ? 'Paused' : 'Recording...') :
               hasRecording ? 'Recorded' :
               currentRecording?.status === 'skipped' ? 'Skipped' : 'Ready'}
            </Text>
          </View>
        </View>

        {/* Recording Timer */}
        {isRecording && (
          <View style={{ marginTop: 28, alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Animated.View style={{
                width: 14,
                height: 14,
                borderRadius: 7,
                backgroundColor: isPaused ? colors.warning : colors.recording,
                marginRight: 10,
                transform: [{ scale: isPaused ? 1 : pulseAnim }],
              }} />
              <Text style={{ fontSize: 36, fontFamily: fonts.bold, color: colors.text }}>
                {formatTime(recordingDuration)}
              </Text>
            </View>
          </View>
        )}

        {/* Playback Info */}
        {hasRecording && !isRecording && (
          <View style={{ marginTop: 28, alignItems: 'center' }}>
            {isPlaying && (
              <Text style={{ fontSize: 14, fontFamily: fonts.medium, color: colors.textSecondary }}>
                {formatMs(playbackPosition)} / {formatMs(playbackDuration)}
              </Text>
            )}
          </View>
        )}

        {/* Control Buttons */}
        <View style={{ marginTop: 36, alignItems: 'center' }}>
          {/* Main Recording Button */}
          {!hasRecording && !isRecording && (
            <TouchableOpacity
              onPress={startRecording}
              style={{
                width: 110,
                height: 110,
                borderRadius: 55,
                backgroundColor: colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
                ...shadowStyles.glow,
              }}
            >
              <MaterialIcons name="mic" size={52} color="#fff" />
            </TouchableOpacity>
          )}

          {/* Recording Controls */}
          {isRecording && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 24 }}>
              {/* Pause/Resume */}
              <TouchableOpacity
                onPress={isPaused ? resumeRecording : pauseRecording}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: colors.warning,
                  alignItems: 'center',
                  justifyContent: 'center',
                  ...shadowStyles.md,
                }}
              >
                <MaterialIcons name={isPaused ? "play-arrow" : "pause"} size={34} color="#fff" />
              </TouchableOpacity>

              {/* Stop */}
              <TouchableOpacity
                onPress={stopRecording}
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: 44,
                  backgroundColor: colors.recording,
                  alignItems: 'center',
                  justifyContent: 'center',
                  ...shadowStyles.lg,
                }}
              >
                <MaterialIcons name="stop" size={44} color="#fff" />
              </TouchableOpacity>
            </View>
          )}

          {/* Playback & Re-record Controls */}
          {hasRecording && !isRecording && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
              {/* Play/Stop */}
              <TouchableOpacity
                onPress={isPlaying ? stopPlayback : playRecording}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: colors.success,
                  alignItems: 'center',
                  justifyContent: 'center',
                  ...shadowStyles.md,
                }}
              >
                <MaterialIcons name={isPlaying ? "stop" : "play-arrow"} size={34} color="#fff" />
              </TouchableOpacity>

              {/* Re-record */}
              <TouchableOpacity
                onPress={reRecordWord}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: colors.accent,
                  alignItems: 'center',
                  justifyContent: 'center',
                  ...shadowStyles.md,
                }}
              >
                <MaterialIcons name="refresh" size={34} color="#fff" />
              </TouchableOpacity>

              {/* Next */}
              <TouchableOpacity
                onPress={handleNext}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: colors.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  ...shadowStyles.glow,
                }}
              >
                <MaterialIcons name="arrow-forward" size={34} color="#fff" />
              </TouchableOpacity>
            </View>
          )}

          {/* Instructions */}
          <Text style={{
            marginTop: 20,
            fontSize: 14,
            fontFamily: fonts.regular,
            color: colors.textSecondary,
            textAlign: 'center',
          }}>
            {isRecording ? (isPaused ? 'Tap play to resume' : 'Tap stop when done') :
             hasRecording ? 'Play to review, or record again' :
             'Tap to start recording'}
          </Text>
        </View>
      </View>

      {/* Bottom Navigation */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.surface,
        ...shadowStyles.md,
      }}>
        {/* Previous */}
        <TouchableOpacity
          onPress={handlePrevious}
          disabled={wordIndex === 0 || isRecording}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 18,
            paddingVertical: 12,
            borderRadius: 12,
            backgroundColor: wordIndex === 0 || isRecording ? colors.surfaceSecondary : colors.primaryBg,
            opacity: wordIndex === 0 || isRecording ? 0.5 : 1,
            ...shadowStyles.sm,
          }}
        >
          <MaterialIcons name="chevron-left" size={24} color={wordIndex === 0 || isRecording ? colors.textTertiary : colors.primary} />
          <Text style={{
            color: wordIndex === 0 || isRecording ? colors.textTertiary : colors.primary,
            fontFamily: fonts.semiBold,
          }}>
            Previous
          </Text>
        </TouchableOpacity>

        {/* Skip */}
        <TouchableOpacity
          onPress={handleSkip}
          disabled={isRecording}
          style={{
            paddingHorizontal: 22,
            paddingVertical: 12,
            borderRadius: 12,
            backgroundColor: colors.warningBg,
            opacity: isRecording ? 0.5 : 1,
            ...shadowStyles.sm,
          }}
        >
          <Text style={{ color: colors.warning, fontFamily: fonts.semiBold }}>
            Skip
          </Text>
        </TouchableOpacity>

        {/* Next */}
        <TouchableOpacity
          onPress={handleNext}
          disabled={isRecording}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 18,
            paddingVertical: 12,
            borderRadius: 12,
            backgroundColor: isRecording ? colors.surfaceSecondary : colors.primary,
            opacity: isRecording ? 0.5 : 1,
            ...shadowStyles.glow,
          }}
        >
          <Text style={{
            color: isRecording ? colors.textTertiary : '#fff',
            fontFamily: fonts.semiBold,
          }}>
            {wordIndex === allWords.length - 1 ? 'Finish' : 'Next'}
          </Text>
          <MaterialIcons 
            name={wordIndex === allWords.length - 1 ? "check" : "chevron-right"} 
            size={24} 
            color={isRecording ? colors.textTertiary : '#fff'} 
          />
        </TouchableOpacity>
      </View>

      {/* Word List Drawer (Horizontal Scroll) */}
      <View style={{
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.surface,
        paddingVertical: 10,
      }}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 14 }}
        >
          {allWords.map((word, index) => {
            // Find recording by word string to ensure correct match across protocols
            // This ensures status shows correctly when switching between protocol types
            const rec = currentProtocolRecordings.find(r => r.word === word.word);
            const isActive = index === wordIndex;
            const isRecorded = rec?.status === 'recorded';
            const isSkipped = rec?.status === 'skipped';

            return (
              <TouchableOpacity
                key={index}
                onPress={() => handleWordSelect(index)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  marginHorizontal: 4,
                  borderRadius: 10,
                  backgroundColor: isActive ? colors.primary :
                                   isRecorded ? colors.successBg :
                                   isSkipped ? colors.warningBg : colors.surfaceSecondary,
                  borderWidth: isActive ? 0 : 1,
                  borderColor: colors.border,
                  minWidth: 68,
                  alignItems: 'center',
                  ...shadowStyles.sm,
                }}
              >
                <Text style={{
                  fontSize: 12,
                  fontFamily: fonts.semiBold,
                  color: isActive ? '#fff' :
                         isRecorded ? colors.success :
                         isSkipped ? colors.warning : colors.textSecondary,
                }}>
                  {index + 1}
                </Text>
                <Text style={{
                  fontSize: 10,
                  fontFamily: fonts.regular,
                  color: isActive ? '#fff' :
                         isRecorded ? colors.success :
                         isSkipped ? colors.warning : colors.textTertiary,
                  marginTop: 3,
                }} numberOfLines={1}>
                  {word.urdu || word.word.substring(0, 6)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Protocol Complete Modal */}
      <Modal
        visible={showProtocolCompleteModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowProtocolCompleteModal(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}>
          <View style={{
            backgroundColor: colors.surface,
            borderRadius: 24,
            padding: 24,
            width: '100%',
            maxWidth: 400,
            ...shadowStyles.xl,
          }}>
            {/*
              Determine current protocol status (completed vs incomplete)
              to drive the header text. Use the same snapshot logic as for
              the list so we don't recalc on live-changing data.
            */}
            {(() => {
              const currentProtocol = currentSession.selectedProtocol;
              if (!currentProtocol) return null;
              const recordingsToUse =
                showProtocolCompleteModal && modalRecordingsSnapshot.length > 0
                  ? modalRecordingsSnapshot
                  : currentSession.recordings;
              const status = currentSession.getProtocolStatus(
                currentProtocol,
                recordingsToUse as any
              );
              const headerTitle = status.isCompleted ? 'Protocol Complete!' : 'End of Protocol';
              const subtitle = status.isCompleted
                ? `${currentProtocol.name} completed successfully`
                : `${currentProtocol.name}: ${status.recordedCount} of ${status.totalWords} words recorded`;

              return (
                <View style={{ alignItems: 'center', marginBottom: 20 }}>
                  <View
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 32,
                      backgroundColor: status.isCompleted ? colors.successBg : colors.warningBg,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 16,
                    }}
                  >
                    <MaterialIcons
                      name={status.isCompleted ? 'check-circle' : 'info-outline'}
                      size={40}
                      color={status.isCompleted ? colors.success : colors.warning}
                    />
                  </View>
                  <Text
                    style={{
                      fontSize: 22,
                      fontFamily: fonts.bold,
                      color: colors.text,
                      marginBottom: 8,
                    }}
                  >
                    {headerTitle}
                  </Text>
                  <Text
                    style={{
                      fontSize: 15,
                      fontFamily: fonts.medium,
                      color: colors.textSecondary,
                      textAlign: 'center',
                    }}
                  >
                    {subtitle}
                  </Text>
                </View>
              );
            })()}

            {currentSession.getRemainingProtocols().length > 0 && (
              <>
                <Text style={{
                  fontSize: 16,
                  fontFamily: fonts.semiBold,
                  color: colors.text,
                  marginBottom: 16,
                }}>
                  Continue with another protocol type?
                </Text>
                
                <ScrollView 
                  style={{ maxHeight: 200, marginBottom: 16 }}
                  showsVerticalScrollIndicator={false}
                >
                  {currentSession.getRemainingProtocols().map((protocol) => {
                    // ALWAYS use snapshot when modal is open to preserve status
                    // This ensures status doesn't change while modal is visible
                    const recordingsToUse = showProtocolCompleteModal && modalRecordingsSnapshot.length > 0
                      ? modalRecordingsSnapshot 
                      : currentSession.recordings;
                    
                    // Debug: Log which recordings we're using
                    if (__DEV__) {
                      const protocolWords = new Set(protocol.words.map(w => w.word));
                      const protocolRecs = recordingsToUse.filter(r => protocolWords.has(r.word));
                      const completedRecs = protocolRecs.filter(r => r.status === 'recorded' || r.status === 'skipped');
                      console.log(`🔍 Calculating status for ${protocol.name}:`, {
                        usingSnapshot: modalRecordingsSnapshot.length > 0,
                        snapshotCount: modalRecordingsSnapshot.length,
                        currentCount: currentSession.recordings.length,
                        recordingsToUseCount: recordingsToUse.length,
                        protocolRecordings: protocolRecs.length,
                        completedRecordings: completedRecs.length,
                        protocolWords: protocol.words.length
                      });
                    }
                    
                    // Get protocol status (using snapshot if available)
                    const protocolStatus = currentSession.getProtocolStatus(protocol, recordingsToUse);
                    const { isIncomplete, isCompleted, recordedCount, totalWords, hasStarted } = protocolStatus;
                    const isNotStarted = !hasStarted;
                    
                    return (
                      <TouchableOpacity
                        key={protocol.id}
                        onPress={() => handleContinueWithProtocol(protocol)}
                        style={{
                          backgroundColor: isCompleted
                            ? colors.successBg
                            : isIncomplete
                              ? colors.warningBg
                              : colors.surfaceSecondary,
                          borderRadius: 12,
                          padding: 16,
                          marginBottom: 10,
                          borderWidth: 1,
                          borderColor: isCompleted
                            ? colors.success
                            : isIncomplete
                              ? colors.warning
                              : colors.border,
                          ...shadowStyles.sm,
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                          <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                              <Text style={{
                                fontSize: 16,
                                fontFamily: fonts.semiBold,
                                color: colors.text,
                              }}>
                                {protocol.name}
                              </Text>
                              {/* Status pill: show exactly one of COMPLETED / INCOMPLETE / NOT STARTED */}
                              {isCompleted && (
                                <View
                                  style={{
                                    marginLeft: 8,
                                    backgroundColor: colors.success,
                                    paddingHorizontal: 8,
                                    paddingVertical: 2,
                                    borderRadius: 8,
                                  }}
                                >
                                  <Text
                                    style={{
                                      fontSize: 10,
                                      fontFamily: fonts.semiBold,
                                      color: '#fff',
                                    }}
                                  >
                                    COMPLETED
                                  </Text>
                                </View>
                              )}
                              {!isCompleted && isIncomplete && (
                                <View
                                  style={{
                                    marginLeft: 8,
                                    backgroundColor: colors.warning,
                                    paddingHorizontal: 8,
                                    paddingVertical: 2,
                                    borderRadius: 8,
                                  }}
                                >
                                  <Text
                                    style={{
                                      fontSize: 10,
                                      fontFamily: fonts.semiBold,
                                      color: '#fff',
                                    }}
                                  >
                                    INCOMPLETE
                                  </Text>
                                </View>
                              )}
                              {!isCompleted && isNotStarted && (
                                <View
                                  style={{
                                    marginLeft: 8,
                                    backgroundColor: colors.textTertiary,
                                    paddingHorizontal: 8,
                                    paddingVertical: 2,
                                    borderRadius: 8,
                                  }}
                                >
                                  <Text
                                    style={{
                                      fontSize: 10,
                                      fontFamily: fonts.semiBold,
                                      color: '#fff',
                                    }}
                                  >
                                    NOT STARTED
                                  </Text>
                                </View>
                              )}
                            </View>
                            <Text
                              style={{
                                fontSize: 13,
                                fontFamily: fonts.regular,
                                color: colors.textSecondary,
                              }}
                            >
                              {isCompleted || isIncomplete
                                ? `${recordedCount} of ${totalWords} words recorded`
                                : `${totalWords} words`}
                            </Text>
                          </View>
                          <MaterialIcons 
                            name="chevron-right" 
                            size={24} 
                            color={colors.textSecondary} 
                          />
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </>
            )}

            <View style={{ flexDirection: 'row', gap: 12 }}>
              {currentSession.getRemainingProtocols().length > 0 && (
                <TouchableOpacity
                  onPress={() => setShowProtocolCompleteModal(false)}
                  style={{
                    flex: 1,
                    backgroundColor: colors.surfaceSecondary,
                    borderRadius: 14,
                    paddingVertical: 14,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Text style={{
                    fontSize: 15,
                    fontFamily: fonts.semiBold,
                    color: colors.text,
                  }}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={handleFinishSession}
                style={{
                  flex: 1,
                  backgroundColor: colors.primary,
                  borderRadius: 14,
                  paddingVertical: 14,
                  alignItems: 'center',
                  ...shadowStyles.glow,
                }}
              >
                <Text style={{
                  fontSize: 15,
                  fontFamily: fonts.semiBold,
                  color: '#fff',
                }}>
                  Finish Session
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default RecordingScreen;
