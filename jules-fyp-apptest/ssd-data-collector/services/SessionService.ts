import * as FileSystem from 'expo-file-system';

// Define the shape of your recording data
export interface RecordingData {
  uri: string;        // The local file path on the phone (file://...)
  word: string;       // e.g., "Cat"
  transcription: string; // e.g., "Kat"
  errorType: string;  // e.g., "Substitution"
  isCorrect: boolean; // Ground truth
}

import { Platform } from 'react-native';
import { API_ENDPOINTS } from '../config/api';

const API_URL = `${API_ENDPOINTS.SESSIONS}/finalize`;

// Helper function to convert blob URL to actual Blob (for web)
const blobUrlToBlob = async (blobUrl: string): Promise<Blob> => {
  const response = await fetch(blobUrl);
  return response.blob();
};

export const uploadSession = async (
  patientId: number,
  recordings: RecordingData[],
  notes: string,
  token: string
) => {
  const formData = new FormData();

  // 1. Append Text Data
  formData.append('patientId', patientId.toString());
  formData.append('notes', notes || '');
  formData.append('sessionDate', new Date().toISOString());
  formData.append('finalDiagnosis', 'Pending Analysis'); 

  // 2. Prepare Annotations Array
  const annotations = recordings.map(rec => ({
    targetWord: rec.word,
    transcription: rec.transcription || '',
    errorType: rec.errorType || 'None',
    isCorrect: rec.isCorrect
  }));

  formData.append('annotations', JSON.stringify(annotations));

  // 3. Append Audio Files
  // Handle differently for web vs native
  if (Platform.OS === 'web') {
    // Web: Convert blob URLs to actual Blobs
    for (let index = 0; index < recordings.length; index++) {
      const rec = recordings[index];
      try {
        const blob = await blobUrlToBlob(rec.uri);
        const fileType = rec.uri.includes('webm') ? 'webm' : 
                         rec.uri.includes('ogg') ? 'ogg' : 
                         rec.uri.includes('mp4') ? 'mp4' : 'webm';
        const fileName = `recording_${index}.${fileType}`;
        formData.append('audio_files', blob, fileName);
      } catch (err) {
        console.error(`Failed to process recording ${index}:`, err);
        throw new Error(`Failed to process recording for word: ${rec.word}`);
      }
    }
  } else {
    // Native: Use React Native's file object format
    recordings.forEach((rec, index) => {
      const fileType = rec.uri.split('.').pop() || 'wav'; 
      const fileName = `recording_${index}.${fileType}`;

      // @ts-ignore: React Native FormData expects this specific object shape for files
      formData.append('audio_files', {
        uri: rec.uri,
        name: fileName,
        type: `audio/${fileType}`
      });
    });
  }

  // 4. Send Request - DO NOT set Content-Type header for multipart/form-data
  // The browser will automatically set it with the correct boundary
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
        // Note: Do NOT set Content-Type for multipart/form-data
        // The browser needs to set it automatically with the boundary
      },
      body: formData
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Upload failed');
    }

    return result;
    
  } catch (error) {
    console.error('Upload service error:', error);
    throw error;
  }
};