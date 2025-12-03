import * as FileSystem from 'expo-file-system';

// Define the shape of your recording data
export interface RecordingData {
  uri: string;        // The local file path on the phone (file://...)
  word: string;       // e.g., "Cat"
  transcription: string; // e.g., "Kat"
  errorType: string;  // e.g., "Substitution"
  isCorrect: boolean; // Ground truth
}

// ⚠️ REPLACE THIS with your PC's local IP address (e.g., 192.168.1.5)
// Do NOT use 'localhost' - the phone/emulator sees 'localhost' as itself!
const API_URL = 'http://192.168.18.32:3000/api/sessions/finalize';

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
  // Hardcoded for now, or pass it in if you have it from the UI
  formData.append('finalDiagnosis', 'Pending Analysis'); 

  // 2. Prepare Annotations Array
  // We strip out the file URI here to keep the JSON light, sending only metadata
  const annotations = recordings.map(rec => ({
    targetWord: rec.word,
    transcription: rec.transcription || '',
    errorType: rec.errorType || 'None',
    isCorrect: rec.isCorrect
  }));

  // Append annotations as a stringified JSON
  formData.append('annotations', JSON.stringify(annotations));

  // 3. Append Audio Files
  // CRITICAL: The order of appending must match the order of the annotations array
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

  console.log(`📤 Uploading ${recordings.length} files to ${API_URL}...`);

  // 4. Send Request
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data', // Let fetch generate the boundary
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Upload failed');
    }

    console.log('✅ Upload Success:', result);
    return result;
    
  } catch (error) {
    console.error('❌ Upload Service Error:', error);
    throw error;
  }
};