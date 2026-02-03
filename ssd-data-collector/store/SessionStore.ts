// File: store/SessionStore.ts
import { RecordingData } from '../services/SessionService';

export const currentSession = {
  patientId: 0, 
  recordings: [] as RecordingData[],
  
  setPatient(id: number) {
    this.patientId = id;
  },

  // UPDATED: Check if word exists. If yes, update it. If no, push it.
  addRecording(recording: RecordingData) {
    const existingIndex = this.recordings.findIndex(r => r.word === recording.word);
    
    if (existingIndex !== -1) {
      this.recordings[existingIndex] = recording;
    } else {
      this.recordings.push(recording);
    }
  },
  
  // NEW: Helper to retrieve data when user clicks "Previous"
  getRecording(word: string) {
    return this.recordings.find(r => r.word === word);
  },

  clear() {
    this.recordings = [];
  }
};