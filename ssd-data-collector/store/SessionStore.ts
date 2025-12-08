import { RecordingData } from '../services/SessionService';

export const currentSession = {
  patientId: 0, // Initialize as 0 or null
  recordings: [] as RecordingData[],
  
  // New method to set the patient
  setPatient(id: number) {
    this.patientId = id;
  },

  addRecording(recording: RecordingData) {
    this.recordings.push(recording);
  },
  
  clear() {
    this.recordings = [];
    // We do NOT clear patientId here, so they can record multiple sessions for the same person
  }
};