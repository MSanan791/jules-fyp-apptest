import { RecordingData } from '../services/SessionService';
import { TestProtocol, Protocol, Word } from '../data/testProtocols';

// NOTE: We now store protocolId on each recording so that
// status for one protocol type (e.g. FRONTING) is never
// overwritten or lost when recording another type.
export interface RecordingItem extends RecordingData {
  protocolId: string; // Protocol this recording belongs to
  status: 'pending' | 'recording' | 'recorded' | 'skipped';
  playbackUri?: string;
}

export const currentSession = {
  patientId: 0,
  testProtocol: null as TestProtocol | null,
  selectedProtocol: null as Protocol | null,
  recordings: [] as RecordingItem[],
  currentWordIndex: 0,
  completedProtocols: [] as string[], // Track completed protocol IDs
  
  // Set the patient
  setPatient(id: number) {
    this.patientId = id;
  },

  // Set the test protocol (TAAPU or GFTA/KLPA)
  setTestProtocol(protocol: TestProtocol) {
    this.testProtocol = protocol;
    this.selectedProtocol = null;
    this.recordings = [];
    this.currentWordIndex = 0;
    this.completedProtocols = [];
  },

  // Set a specific protocol within the test (e.g., FRONTING, STOPPING)
  setSelectedProtocol(protocol: Protocol) {
    // Don't mark previous protocol as completed here - only when actually finishing all words
    // This allows going back to incomplete protocols
    
    // Get all words for this protocol
    const protocolWords = new Set(protocol.words.map(w => w.word));

    // Create a map of existing recordings by composite key protocolId:word
    const recordingsMap = new Map<string, RecordingItem>();
    this.recordings.forEach(r => {
      const key = `${r.protocolId}:${r.word}`;
      // If key already exists, keep the one with better status (recorded > skipped > pending)
      if (!recordingsMap.has(key)) {
        recordingsMap.set(key, r);
      } else {
        const existing = recordingsMap.get(key)!;
        const statusPriority = { 'recorded': 3, 'skipped': 2, 'recording': 1, 'pending': 0 };
        if (statusPriority[r.status] > statusPriority[existing.status]) {
          recordingsMap.set(key, r);
        }
      }
    });
    
    // Check which words from this protocol already have recordings
    const existingWords = new Set<string>();
    recordingsMap.forEach((rec) => {
      if (rec.protocolId === protocol.id && protocolWords.has(rec.word)) {
        existingWords.add(rec.word);
      }
    });
    
    // Rebuild recordings array preserving all recordings (no duplicates per protocol+word)
    // IMPORTANT: This preserves recordings from ALL protocols, not just the current one
    this.recordings = Array.from(recordingsMap.values());
    
    // Debug: Log recordings before adding new ones
    if (__DEV__) {
      console.log(`Setting protocol ${protocol.name}:`, {
        existingRecordings: this.recordings.length,
        protocolWords: protocol.words.length,
        existingWords: existingWords.size
      });
    }
    
    // Add missing words for this protocol (only if they don't exist for this protocolId)
    protocol.words.forEach(word => {
      if (!existingWords.has(word.word)) {
        this.recordings.push({
          protocolId: protocol.id,
          uri: '',
          word: word.word,
          transcription: '',
          errorType: 'None',
          isCorrect: true,
          status: 'pending' as const,
        });
      }
    });
    
    // Debug: Log recordings after adding new ones
    if (__DEV__) {
      console.log(`Protocol ${protocol.name} set:`, {
        totalRecordings: this.recordings.length,
        protocolRecordings: this.recordings.filter(r => protocolWords.has(r.word)).length
      });
    }
    
    // Now set the protocol (after adding words)
    this.selectedProtocol = protocol;
    
    // Find first incomplete word in this protocol, or start at 0
    // We need to call getCurrentProtocolRecordings after setting selectedProtocol
    const protocolRecordings = this.getCurrentProtocolRecordings();
    const firstIncompleteIndex = protocolRecordings.findIndex(r => 
      r.status === 'pending' || r.status === 'recording'
    );
    this.currentWordIndex = firstIncompleteIndex >= 0 ? firstIncompleteIndex : 0;
  },
  
  // Mark current protocol as completed
  markProtocolComplete() {
    if (this.selectedProtocol && !this.completedProtocols.includes(this.selectedProtocol.id)) {
      this.completedProtocols.push(this.selectedProtocol.id);
    }
  },
  
  // Get status information for a specific protocol
  getProtocolStatus(protocol: Protocol, recordingsOverride?: RecordingItem[]): {
    hasStarted: boolean;
    isIncomplete: boolean;
    isCompleted: boolean;
    recordedCount: number;
    totalWords: number;
  } {
    // Use override recordings if provided (for snapshot), otherwise use current recordings
    const recordingsToUse = recordingsOverride || this.recordings;
    
    const protocolWords = new Set(protocol.words.map(w => w.word));
    
    // Get all recordings for this protocol (preserve all statuses)
    // Use a Map to ensure we only count each word once (in case of duplicates)
    // Keyed by word but only within the same protocolId
    const protocolRecordingsMap = new Map<string, RecordingItem>();
    recordingsToUse.forEach(r => {
      if (r.protocolId === protocol.id && protocolWords.has(r.word)) {
        // If word already exists, keep the one with better status
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
    
    // Count RECORDED items only (must have a real recording URI)
    // Skipped words do NOT count as recorded for completion
    const recordedCount = protocolRecordings.filter(r => 
      r.status === 'recorded' && r.uri && r.uri.length > 0
    ).length;
    
    // Check if protocol has been started (has any recordings with any status)
    const hasStarted = protocolRecordings.length > 0;
    
    // Check if all words are COMPLETE:
    // Every protocol word must have a recording with status 'recorded' AND a valid URI.
    const allComplete = protocol.words.every(word => {
      const rec = protocolRecordingsMap.get(word.word);
      return !!rec && rec.status === 'recorded' && !!rec.uri && rec.uri.length > 0;
    });
    
    // Protocol is incomplete if:
    // - It has been started (has any recordings, even skipped)
    // - AND not all words are fully recorded
    // Simple logic: started but not finished = INCOMPLETE
    const isIncomplete = hasStarted && !allComplete;
    // A protocol is COMPLETED only when all words are fully recorded (no skips counting as done)
    const isCompleted = allComplete;
    
    // Debug logging
    if (__DEV__) {
      console.log(`📊 Protocol ${protocol.name} status:`, {
        hasStarted,
        isIncomplete,
        recordedCount,
        totalWords: protocol.words.length,
        protocolRecordingsCount: protocolRecordings.length,
        allComplete,
        hasSomeCompleted: recordedCount > 0,
        hasSomeButNotAll: hasStarted && !allComplete,
      });
    }
    
    return {
      hasStarted,
      isIncomplete,
      isCompleted,
      recordedCount,
      totalWords: protocol.words.length,
    };
  },
  
  // Get remaining protocol types that haven't been completed (including incomplete ones)
  getRemainingProtocols(): Protocol[] {
    if (!this.testProtocol) return [];
    return this.testProtocol.protocols.filter(p => 
      p.id !== this.selectedProtocol?.id // Exclude current protocol
    );
  },
  
  // Get incomplete protocols (started but not finished)
  getIncompleteProtocols(): Protocol[] {
    if (!this.testProtocol) return [];
    return this.testProtocol.protocols.filter(p => {
      // Not the current protocol
      if (p.id === this.selectedProtocol?.id) return false;

      // Build recordings map for this protocol (respect protocolId)
      const protocolWords = new Set(p.words.map(w => w.word));
      const protocolRecordingsMap = new Map<string, RecordingItem>();
      this.recordings.forEach(r => {
        if (r.protocolId === p.id && protocolWords.has(r.word)) {
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
      const hasStarted = protocolRecordings.length > 0;

      // All words fully recorded?
      const allComplete = p.words.every(word => {
        const rec = protocolRecordingsMap.get(word.word);
        return !!rec && rec.status === 'recorded' && !!rec.uri && rec.uri.length > 0;
      });

      // Incomplete if started but not fully recorded
      return hasStarted && !allComplete;
    });
  },
  
  // Check if current protocol is complete
  isCurrentProtocolComplete(): boolean {
    if (!this.selectedProtocol) return false;
    const protocolRecordings = this.getCurrentProtocolRecordings();
    // All words must exist and be RECORDED with a real URI
    return this.selectedProtocol.words.every(word => {
      const rec = protocolRecordings.find(r => r.word === word.word);
      return !!rec && rec.status === 'recorded' && !!rec.uri && rec.uri.length > 0;
    });
  },

  // Get current word
  getCurrentWord(): Word | null {
    if (!this.selectedProtocol) return null;
    return this.selectedProtocol.words[this.currentWordIndex] || null;
  },

  // Get all words in current protocol
  getAllWords(): Word[] {
    if (!this.selectedProtocol) return [];
    return this.selectedProtocol.words;
  },
  
  // Get recordings for current protocol only, in the same order as protocol words
  getCurrentProtocolRecordings(): RecordingItem[] {
    if (!this.selectedProtocol) return [];
    const selectedProtocol = this.selectedProtocol as Protocol; // non-null after guard
    
    // Create a map of word -> recording for quick lookup,
    // but only for the currently selected protocol
    const recordingMap = new Map<string, RecordingItem>();
    this.recordings.forEach(r => {
      if (r.protocolId === selectedProtocol.id) {
        recordingMap.set(r.word, r);
      }
    });
    
    // Return recordings in the same order as protocol words
    return selectedProtocol.words.map(word => {
      const existing = recordingMap.get(word.word);
      if (existing) {
        return existing;
      }
      // Return a pending recording if not found
      return {
        protocolId: selectedProtocol.id,
        uri: '',
        word: word.word,
        transcription: '',
        errorType: 'None',
        isCorrect: true,
        status: 'pending' as const,
      };
    });
  },

  // Add or update recording for current word
  addRecording(recording: Partial<RecordingData>) {
    if (!recording.word) return;
    if (!this.selectedProtocol) return;
    
    // Find the recording by word AND protocol (no cross-protocol overwrite)
    const existingIndex = this.recordings.findIndex(
      r => r.word === recording.word && r.protocolId === this.selectedProtocol?.id
    );
    
    if (existingIndex >= 0) {
      // Update existing recording - preserve all existing data
      const existing = this.recordings[existingIndex];
      this.recordings[existingIndex] = {
        ...existing,
        ...recording,
        status: 'recorded',
        playbackUri: recording.uri || existing.playbackUri,
        // Preserve existing values if new ones aren't provided
        transcription: recording.transcription !== undefined ? recording.transcription : existing.transcription,
        errorType: recording.errorType !== undefined ? recording.errorType : existing.errorType,
        isCorrect: recording.isCorrect !== undefined ? recording.isCorrect : existing.isCorrect,
      };
    } else {
      // Add new recording (shouldn't happen normally, but fallback)
      this.recordings.push({
        protocolId: this.selectedProtocol.id,
        uri: recording.uri || '',
        word: recording.word,
        transcription: recording.transcription || '',
        errorType: recording.errorType || 'None',
        isCorrect: recording.isCorrect !== undefined ? recording.isCorrect : true,
        status: 'recorded',
        playbackUri: recording.uri,
      });
    }
    
    // Debug: Log to verify recording is added
    if (__DEV__) {
      console.log(`Recording added/updated for word: ${recording.word}, Total recordings: ${this.recordings.length}`);
    }
  },

  // Update recording status by word
  updateRecordingStatus(word: string, status: 'pending' | 'recording' | 'recorded' | 'skipped') {
    const recording = this.recordings.find(r => 
      r.word === word && 
      (!this.selectedProtocol || r.protocolId === this.selectedProtocol.id)
    );
    if (recording) {
      recording.status = status;
    }
  },

  // Update recording data by word
  updateRecording(word: string, data: Partial<RecordingData>) {
    const recording = this.recordings.find(r => 
      r.word === word && 
      (!this.selectedProtocol || r.protocolId === this.selectedProtocol.id)
    );
    if (recording) {
      Object.assign(recording, data);
    }
  },

  // Skip current word
  skipCurrentWord() {
    if (!this.selectedProtocol) return;
    const currentWord = this.selectedProtocol.words[this.currentWordIndex];
    if (currentWord) {
      this.updateRecordingStatus(currentWord.word, 'skipped');
    }
  },

  // Re-record a specific word by word string
  reRecordWord(word: string) {
    const recording = this.recordings.find(r => 
      r.word === word && 
      (!this.selectedProtocol || r.protocolId === this.selectedProtocol.id)
    );
    if (recording) {
      recording.uri = '';
      recording.status = 'pending';
      recording.playbackUri = undefined;
    }
  },

  // Navigate to next word
  nextWord(): boolean {
    if (!this.selectedProtocol) return false;
    if (this.currentWordIndex < this.selectedProtocol.words.length - 1) {
      this.currentWordIndex++;
      return true;
    }
    return false;
  },

  // Navigate to previous word
  previousWord(): boolean {
    if (this.currentWordIndex > 0) {
      this.currentWordIndex--;
      return true;
    }
    return false;
  },

  // Go to specific word
  goToWord(index: number): boolean {
    if (!this.selectedProtocol) return false;
    if (index >= 0 && index < this.selectedProtocol.words.length) {
      this.currentWordIndex = index;
      return true;
    }
    return false;
  },

  // Get completion stats for current protocol only
  getCompletionStats() {
    const protocolRecordings = this.getCurrentProtocolRecordings();
    const total = protocolRecordings.length;
    const recorded = protocolRecordings.filter(r => r.status === 'recorded').length;
    const skipped = protocolRecordings.filter(r => r.status === 'skipped').length;
    const pending = protocolRecordings.filter(r => r.status === 'pending').length;
    
    return {
      total,
      recorded,
      skipped,
      pending,
      completionPercentage: total > 0 ? Math.round((recorded / total) * 100) : 0,
      isComplete: pending === 0 && total > 0,
    };
  },
  
  // Get overall session stats (all protocols)
  getOverallStats() {
    // Count only recordings that have actual URI (were actually recorded)
    // This ensures we don't count pending entries as recorded
    const recorded = this.recordings.filter(r => 
      r.status === 'recorded' && r.uri && r.uri.length > 0
    ).length;
    const skipped = this.recordings.filter(r => r.status === 'skipped').length;
    const pending = this.recordings.filter(r => 
      r.status === 'pending' || (r.status === 'recorded' && (!r.uri || r.uri.length === 0))
    ).length;
    
    // Total is all words across all protocols
    const total = this.testProtocol 
      ? this.testProtocol.protocols.reduce((sum, p) => sum + p.words.length, 0)
      : this.recordings.length;
    
    return {
      total,
      recorded,
      skipped,
      pending,
      completionPercentage: total > 0 ? Math.round((recorded / total) * 100) : 0,
      isComplete: pending === 0 && total > 0,
    };
  },

  // Get recordings ready for upload (only recorded ones)
  getRecordingsForUpload(): RecordingData[] {
    return this.recordings
      .filter(r => r.status === 'recorded' && r.uri)
      .map(({ status, playbackUri, ...rest }) => rest);
  },
  
  // Clear session
  clear() {
    this.recordings = [];
    this.selectedProtocol = null;
    this.currentWordIndex = 0;
    this.completedProtocols = [];
    // Keep testProtocol and patientId for continuity
  },

  // Full reset
  reset() {
    this.patientId = 0;
    this.testProtocol = null;
    this.selectedProtocol = null;
    this.recordings = [];
    this.currentWordIndex = 0;
    this.completedProtocols = [];
  }
};
