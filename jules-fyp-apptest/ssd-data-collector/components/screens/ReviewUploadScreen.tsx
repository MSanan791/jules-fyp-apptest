import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator, TextInput, BackHandler, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Audio } from 'expo-av';
import { currentSession } from '../../store/SessionStore';
import { uploadSession } from '../../services/SessionService';
import { getToken } from '../../services/AuthService';
import { useTheme } from '../../context/ThemeContext';
import { getColors, getShadows } from '../../theme/colors';
import { fonts } from '../../theme/fonts';
import { useEffect } from 'react';

const ReviewUploadScreen = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colors = getColors(isDark);
  const shadowStyles = getShadows(isDark);

  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editTranscription, setEditTranscription] = useState('');

  const recordings = currentSession.recordings;
  // Use overall stats (all protocols) instead of just current protocol
  const stats = currentSession.getOverallStats();

  // Prevent back navigation during upload
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (uploading) {
        Alert.alert('Upload in Progress', 'Please wait for the upload to complete.');
        return true;
      }
      handleCancel();
      return true;
    });

    return () => backHandler.remove();
  }, [uploading]);

  // Cleanup sound on unmount
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const handlePlayRecording = async (index: number) => {
    const recording = recordings[index];
    if (!recording?.playbackUri) return;

    try {
      // Stop current playing
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
        
        if (playingIndex === index) {
          setPlayingIndex(null);
          return;
        }
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: recording.playbackUri },
        { shouldPlay: true },
        (status) => {
          if (status.isLoaded && status.didJustFinish) {
            setPlayingIndex(null);
          }
        }
      );

      setSound(newSound);
      setPlayingIndex(index);
    } catch (err) {
      console.error('Playback Error:', err);
      Alert.alert('Error', 'Could not play recording');
    }
  };

  const handleReRecord = (index: number) => {
    if (uploading) return;
    
    const recording = recordings[index];
    if (!recording) return;

    Alert.alert(
      'Re-record',
      'Go back to the correct protocol and word to re-record this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Re-record',
          onPress: () => {
            // Find the protocol this recording belongs to using protocolId
            const protocol = currentSession.testProtocol?.protocols.find(
              p => p.id === (recording as any).protocolId
            );

            if (protocol) {
              // Ensure the session is set to the correct protocol
              currentSession.setSelectedProtocol(protocol);

              // Find the correct word index within that protocol
              const wordIndex = protocol.words.findIndex(w => w.word === recording.word);
              if (wordIndex >= 0) {
                currentSession.goToWord(wordIndex);
              }
            }

            router.push('/recording');
          }
        }
      ]
    );
  };

  const handleEditTranscription = (index: number) => {
    const recording = recordings[index];
    setEditingIndex(index);
    setEditTranscription(recording?.transcription || recording?.word || '');
  };

  const handleSaveTranscription = () => {
    if (editingIndex !== null && recordings[editingIndex]) {
      currentSession.updateRecording(recordings[editingIndex].word, {
        transcription: editTranscription,
      });
      setEditingIndex(null);
      setEditTranscription('');
    }
  };

  const handleUpload = async () => {
    if (stats.recorded === 0) {
      if (Platform.OS === 'web') {
        window.alert('No Recordings: Please record at least one word before uploading.');
      } else {
        Alert.alert('No Recordings', 'Please record at least one word before uploading.');
      }
      return;
    }

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Upload ${stats.recorded} recording(s)?\nSkipped: ${stats.skipped}`);
      if (confirmed) {
        performUpload();
      }
    } else {
      Alert.alert(
        'Upload Session',
        `Upload ${stats.recorded} recordings?\nSkipped: ${stats.skipped}`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Upload',
            onPress: performUpload
          }
        ]
      );
    }
  };

  const performUpload = async () => {
    setUploading(true);
    setUploadProgress(0);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      // Get only the recorded items with proper RecordingData format
      const recordingsToUpload = recordings
        .filter(r => r.status === 'recorded' && r.uri)
        .map(r => ({
          uri: r.uri,
          word: r.word,
          transcription: r.transcription || '',
          errorType: r.errorType || 'None',
          isCorrect: r.isCorrect ?? true,
        }));
      
      await uploadSession(
        currentSession.patientId!,
        recordingsToUpload,
        `Protocol: ${currentSession.selectedProtocol?.name || 'Assessment'}`,
        token
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      setTimeout(() => {
        currentSession.reset();
        if (Platform.OS === 'web') {
          window.alert('Success! Session uploaded successfully!');
          router.replace('/home');
        } else {
          Alert.alert(
            'Success',
            'Session uploaded successfully!',
            [{ text: 'OK', onPress: () => router.replace('/home') }]
          );
        }
      }, 500);
    } catch (error: any) {
      console.error('Upload error:', error);
      const errorMessage = error?.message || 'Please try again. Your recordings are saved locally.';
      if (Platform.OS === 'web') {
        window.alert(`Upload Failed: ${errorMessage}`);
      } else {
        Alert.alert('Upload Failed', errorMessage);
      }
    } finally {
      setUploading(false);
    }
  };

  const cleanupAndGoHome = () => {
    if (sound) {
      sound.unloadAsync();
      setSound(null);
    }
    currentSession.reset();
    router.replace('/home');
  };

  const cleanupAndContinueRecording = () => {
    if (sound) {
      sound.unloadAsync();
      setSound(null);
    }
    router.replace('/recording');
  };

  const handleCancel = () => {
    if (uploading) {
      if (Platform.OS === 'web') {
        window.alert('Upload in progress. Please wait for it to complete.');
      } else {
        Alert.alert('Upload in Progress', 'Please wait for the upload to complete.');
      }
      return;
    }

    const hasRecordings = stats.recorded > 0;

    if (Platform.OS === 'web') {
      if (hasRecordings) {
        const continueRec = window.confirm(`You have ${stats.recorded} recording(s). Continue recording?`);
        if (continueRec) {
          cleanupAndContinueRecording();
        } else {
          const discard = window.confirm('Discard all recordings and exit to home?');
          if (discard) {
            cleanupAndGoHome();
          }
        }
      } else {
        const leave = window.confirm('No recordings to save. Return to home?');
        if (leave) {
          cleanupAndGoHome();
        }
      }
    } else {
      Alert.alert(
        hasRecordings ? 'Discard Session?' : 'Leave Session?',
        hasRecordings 
          ? `Are you sure you want to discard this session? ${stats.recorded} recording(s) will be lost.`
          : 'No recordings to save. Return to home?',
        hasRecordings ? [
          { text: 'Keep Session', style: 'cancel' },
          {
            text: 'Continue Recording',
            onPress: cleanupAndContinueRecording
          },
          {
            text: 'Discard All',
            style: 'destructive',
            onPress: cleanupAndGoHome
          }
        ] : [
          { text: 'Stay', style: 'cancel' },
          {
            text: 'Leave',
            onPress: cleanupAndGoHome
          }
        ]
      );
    }
  };

  const recordedRecordings = recordings.filter(r => r.status === 'recorded');
  const skippedRecordings = recordings.filter(r => r.status === 'skipped');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={[{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.surface,
      }, shadowStyles.sm]}>
        <TouchableOpacity 
          onPress={handleCancel}
          disabled={uploading}
          style={{ 
            width: 44, 
            height: 44, 
            alignItems: 'center', 
            justifyContent: 'center',
            opacity: uploading ? 0.5 : 1,
          }}
        >
          <MaterialIcons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{
          fontSize: 18,
          fontFamily: fonts.bold,
          color: colors.text,
          flex: 1,
          textAlign: 'center',
        }} numberOfLines={1}>
          Review Session
        </Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Card */}
        <View style={[{
          backgroundColor: colors.surface,
          borderRadius: 24,
          padding: 28,
          marginBottom: 24,
          borderWidth: 1,
          borderColor: colors.border,
        }, shadowStyles.xl]}>
          <Text style={{
            fontSize: 12,
            fontFamily: fonts.bold,
            color: colors.textSecondary,
            marginBottom: 18,
            textTransform: 'uppercase',
            letterSpacing: 1.2,
          }}>
            Session Summary
          </Text>

          {/* Stats Grid */}
          <View style={{ flexDirection: 'row', marginBottom: 24 }}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <View style={{
                width: 56,
                height: 56,
                borderRadius: 18,
                backgroundColor: colors.successBg,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 10,
              }}>
                <MaterialIcons name="mic" size={28} color={colors.success} />
              </View>
              <Text style={{ fontSize: 28, fontFamily: fonts.bold, color: colors.text }}>
                {stats.recorded}
              </Text>
              <Text style={{ fontSize: 12, fontFamily: fonts.medium, color: colors.textSecondary }}>
                Recorded
              </Text>
            </View>

            <View style={{ width: 1, backgroundColor: colors.border }} />

            <View style={{ flex: 1, alignItems: 'center' }}>
              <View style={{
                width: 56,
                height: 56,
                borderRadius: 18,
                backgroundColor: colors.warningBg,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 10,
              }}>
                <MaterialIcons name="skip-next" size={28} color={colors.warning} />
              </View>
              <Text style={{ fontSize: 28, fontFamily: fonts.bold, color: colors.text }}>
                {stats.skipped}
              </Text>
              <Text style={{ fontSize: 12, fontFamily: fonts.medium, color: colors.textSecondary }}>
                Skipped
              </Text>
            </View>

            <View style={{ width: 1, backgroundColor: colors.border }} />

            <View style={{ flex: 1, alignItems: 'center' }}>
              <View style={{
                width: 56,
                height: 56,
                borderRadius: 18,
                backgroundColor: colors.primaryBg,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 10,
              }}>
                <MaterialIcons name="format-list-numbered" size={28} color={colors.primary} />
              </View>
              <Text style={{ fontSize: 28, fontFamily: fonts.bold, color: colors.text }}>
                {stats.total}
              </Text>
              <Text style={{ fontSize: 12, fontFamily: fonts.medium, color: colors.textSecondary }}>
                Total
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={{ marginBottom: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontSize: 13, fontFamily: fonts.medium, color: colors.textSecondary }}>
                Overall Completion
              </Text>
              <Text style={{ fontSize: 13, fontFamily: fonts.semiBold, color: colors.primary }}>
                {stats.total > 0 ? Math.round((stats.recorded / stats.total) * 100) : 0}%
              </Text>
            </View>
            <View style={{
              height: 8,
              backgroundColor: colors.surfaceSecondary,
              borderRadius: 4,
            }}>
              <View style={{
                height: '100%',
                width: `${stats.total > 0 ? (stats.recorded / stats.total) * 100 : 0}%`,
                backgroundColor: colors.success,
                borderRadius: 4,
              }} />
            </View>
          </View>

          {/* Protocol Breakdown */}
          {currentSession.testProtocol && currentSession.testProtocol.protocols.length > 1 && (
            <View style={{ marginTop: 20, marginBottom: 10 }}>
              <Text style={{
                fontSize: 12,
                fontFamily: fonts.semiBold,
                color: colors.textSecondary,
                marginBottom: 12,
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}>
                By Protocol Type
              </Text>
              {currentSession.testProtocol.protocols.map((protocol) => {
                const protocolWords = new Set(protocol.words.map(w => w.word));
                
                // Get unique recordings for this protocol (handle duplicates)
                // IMPORTANT: Only include recordings that belong to this protocolId
                const protocolRecordingsMap = new Map<string, typeof currentSession.recordings[0]>();
                currentSession.recordings.forEach(r => {
                  if (r.protocolId === protocol.id && protocolWords.has(r.word)) {
                    // Keep only the best status for each word (recorded > skipped > pending)
                    if (!protocolRecordingsMap.has(r.word)) {
                      protocolRecordingsMap.set(r.word, r);
                    } else {
                      const existing = protocolRecordingsMap.get(r.word)!;
                      const statusPriority = { 'recorded': 3, 'skipped': 2, 'recording': 1, 'pending': 0 };
                      if (statusPriority[r.status] > statusPriority[existing.status]) {
                        protocolRecordingsMap.set(r.word, r);
                      }
                    }
                  }
                });
                
                const protocolRecordings = Array.from(protocolRecordingsMap.values());
                
                // Count only RECORDED items (not skipped, not pending) for the protocol
                // Must have status='recorded' AND have a URI (actual recording file)
                // This must match the overall "Recorded" count
                const protocolRecorded = protocolRecordings.filter(r => 
                  r.status === 'recorded' && r.uri && r.uri.length > 0
                ).length;
                const protocolSkipped = protocolRecordings.filter(r => r.status === 'skipped').length;
                const protocolTotal = protocol.words.length;
                
                // Show recorded count only (matches overall stats)
                const protocolRecordedCount = protocolRecorded;
                
                if (protocolTotal === 0) return null;
                
                // Calculate completion percentage based on recorded items only
                const completionPercent = protocolTotal > 0 ? (protocolRecordedCount / protocolTotal) * 100 : 0;
                const isFullyRecorded = protocolRecordedCount === protocolTotal;
                
                return (
                  <View
                    key={protocol.id}
                    style={{
                      backgroundColor: colors.surfaceSecondary,
                      borderRadius: 12,
                      padding: 14,
                      marginBottom: 10,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <Text 
                        style={{
                          fontSize: 14,
                          fontFamily: fonts.semiBold,
                          color: colors.text,
                          flex: 1,
                          marginRight: 8,
                        }}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {protocol.name}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        <Text style={{
                          fontSize: 13,
                          fontFamily: fonts.medium,
                          color: colors.textSecondary,
                        }}>
                          {protocolRecordedCount} recorded
                        </Text>
                        {protocolSkipped > 0 && (
                          <Text style={{
                            fontSize: 12,
                            fontFamily: fonts.regular,
                            color: colors.textTertiary,
                          }}>
                            ({protocolSkipped} skipped)
                          </Text>
                        )}
                        <Text style={{
                          fontSize: 13,
                          fontFamily: fonts.medium,
                          color: colors.textSecondary,
                        }}>
                          / {protocolTotal}
                        </Text>
                      </View>
                    </View>
                    <View style={{
                      height: 6,
                      backgroundColor: colors.surface,
                      borderRadius: 3,
                      overflow: 'hidden',
                    }}>
                      <View style={{
                        height: '100%',
                        width: `${completionPercent}%`,
                        backgroundColor: isFullyRecorded ? colors.success : colors.warning,
                        borderRadius: 3,
                      }} />
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Upload Progress */}
        {uploading && (
          <View style={[{
            backgroundColor: colors.surface,
            borderRadius: 20,
            padding: 24,
            marginBottom: 24,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.border,
          }, shadowStyles.md]}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{
              fontSize: 18,
              fontFamily: fonts.semiBold,
              color: colors.text,
              marginTop: 16,
            }}>
              Uploading Session...
            </Text>
            <View style={{
              width: '100%',
              height: 8,
              backgroundColor: colors.surfaceSecondary,
              borderRadius: 4,
              marginTop: 16,
            }}>
              <View style={{
                height: '100%',
                width: `${uploadProgress}%`,
                backgroundColor: colors.primary,
                borderRadius: 4,
              }} />
            </View>
            <Text style={{
              fontSize: 14,
              fontFamily: fonts.medium,
              color: colors.textSecondary,
              marginTop: 10,
            }}>
              {uploadProgress}% complete
            </Text>
          </View>
        )}

      </ScrollView>

      {/* Bottom Actions */}
      <SafeAreaView edges={['bottom']} style={{ backgroundColor: colors.surface }}>
        <View style={[{
          padding: 20,
          paddingTop: 16,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          backgroundColor: colors.surface,
          gap: 12,
        }, shadowStyles.lg]}>
        <TouchableOpacity
          onPress={handleUpload}
          disabled={uploading || stats.recorded === 0}
          style={[{
            backgroundColor: uploading || stats.recorded === 0 ? colors.textTertiary : colors.primary,
            borderRadius: 16,
            paddingVertical: 18,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
          }, !(uploading || stats.recorded === 0) && shadowStyles.glow]}
        >
          {uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <MaterialIcons name="cloud-upload" size={24} color="#fff" />
              <Text style={{
                color: '#fff',
                fontSize: 17,
                fontFamily: fonts.bold,
              }}>
                Upload {stats.recorded} Recording{stats.recorded !== 1 ? 's' : ''}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity
            onPress={() => {
              if (!uploading) {
                currentSession.goToWord(0);
                router.push('/recording');
              }
            }}
            disabled={uploading}
            style={{
              flex: 1,
              backgroundColor: colors.surfaceSecondary,
              borderRadius: 14,
              paddingVertical: 14,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              borderWidth: 1,
              borderColor: colors.border,
              opacity: uploading ? 0.5 : 1,
              minWidth: 0,
            }}
          >
            <MaterialIcons name="arrow-back" size={20} color={colors.text} />
            <Text 
              style={{
                color: colors.text,
                fontSize: 15,
                fontFamily: fonts.semiBold,
              }}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              Continue Recording
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleCancel}
            disabled={uploading}
            style={{
              paddingHorizontal: 20,
              paddingVertical: 14,
              borderRadius: 14,
              backgroundColor: colors.errorBg,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: `${colors.error}30`,
              opacity: uploading ? 0.5 : 1,
            }}
          >
            <MaterialIcons name="delete-outline" size={22} color={colors.error} />
          </TouchableOpacity>
        </View>
        </View>
      </SafeAreaView>
    </SafeAreaView>
  );
};

export default ReviewUploadScreen;
