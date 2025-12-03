import { RecordingData } from '../services/SessionService';

export const currentSession = {
  patientId: 1, // You would set this dynamically later
  recordings: [] as RecordingData[],
  
  addRecording(recording: RecordingData) {
    this.recordings.push(recording);
  },
  
  clear() {
    this.recordings = [];
  }
};