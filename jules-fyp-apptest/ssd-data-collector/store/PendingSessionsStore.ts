// store/PendingSessionsStore.ts
// Manages pending sessions that need to be synced to the backend

import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';

export interface PendingRecording {
  uri: string;
  word: string;
  transcription: string;
  errorType: string;
  isCorrect: boolean;
}

export interface PendingSession {
  id: string;
  patientId: number;
  patientName: string;
  recordings: PendingRecording[];
  notes: string;
  createdAt: string;
  syncStatus: 'pending' | 'syncing' | 'failed' | 'synced';
  lastSyncAttempt?: string;
  errorMessage?: string;
}

const STORAGE_KEY = 'pending_sessions';
const RECORDINGS_DIR = FileSystem.documentDirectory ? `${FileSystem.documentDirectory}recordings/` : '';

// Storage helper for cross-platform support
const storage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        return localStorage.getItem(key);
      }
      // For native, we could use AsyncStorage, but for now use a file
      const path = `${FileSystem.documentDirectory}${key}.json`;
      const exists = await FileSystem.getInfoAsync(path);
      if (exists.exists) {
        return await FileSystem.readAsStringAsync(path);
      }
      return null;
    } catch (error) {
      console.error('PendingSessionsStore getItem error:', error);
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        localStorage.setItem(key, value);
        return;
      }
      const path = `${FileSystem.documentDirectory}${key}.json`;
      await FileSystem.writeAsStringAsync(path, value);
    } catch (error) {
      console.error('PendingSessionsStore setItem error:', error);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        localStorage.removeItem(key);
        return;
      }
      const path = `${FileSystem.documentDirectory}${key}.json`;
      const exists = await FileSystem.getInfoAsync(path);
      if (exists.exists) {
        await FileSystem.deleteAsync(path);
      }
    } catch (error) {
      console.error('PendingSessionsStore removeItem error:', error);
    }
  },
};

class PendingSessionsStore {
  private sessions: PendingSession[] = [];
  private isLoaded: boolean = false;

  async load(): Promise<void> {
    if (this.isLoaded) return;
    
    try {
      const data = await storage.getItem(STORAGE_KEY);
      if (data) {
        this.sessions = JSON.parse(data);
      }
      this.isLoaded = true;
    } catch (error) {
      console.error('Error loading pending sessions:', error);
      this.sessions = [];
      this.isLoaded = true;
    }
  }

  async save(): Promise<void> {
    try {
      await storage.setItem(STORAGE_KEY, JSON.stringify(this.sessions));
    } catch (error) {
      console.error('Error saving pending sessions:', error);
    }
  }

  async addSession(session: Omit<PendingSession, 'id' | 'createdAt' | 'syncStatus'>): Promise<PendingSession> {
    await this.load();
    
    const newSession: PendingSession = {
      ...session,
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      syncStatus: 'pending',
    };
    
    this.sessions.push(newSession);
    await this.save();
    
    return newSession;
  }

  async updateSessionStatus(
    sessionId: string, 
    status: PendingSession['syncStatus'], 
    errorMessage?: string
  ): Promise<void> {
    await this.load();
    
    const index = this.sessions.findIndex(s => s.id === sessionId);
    if (index !== -1) {
      this.sessions[index].syncStatus = status;
      this.sessions[index].lastSyncAttempt = new Date().toISOString();
      if (errorMessage) {
        this.sessions[index].errorMessage = errorMessage;
      }
      await this.save();
    }
  }

  async removeSession(sessionId: string): Promise<void> {
    await this.load();
    
    const session = this.sessions.find(s => s.id === sessionId);
    if (session) {
      // Clean up recording files if on native
      if (Platform.OS !== 'web' && RECORDINGS_DIR) {
        for (const recording of session.recordings) {
          try {
            const exists = await FileSystem.getInfoAsync(recording.uri);
            if (exists.exists) {
              await FileSystem.deleteAsync(recording.uri);
            }
          } catch (e) {
            // Ignore file deletion errors
          }
        }
      }
    }
    
    this.sessions = this.sessions.filter(s => s.id !== sessionId);
    await this.save();
  }

  async getPendingSessions(): Promise<PendingSession[]> {
    await this.load();
    return this.sessions.filter(s => s.syncStatus === 'pending' || s.syncStatus === 'failed');
  }

  async getAllSessions(): Promise<PendingSession[]> {
    await this.load();
    return [...this.sessions];
  }

  async getSessionCount(): Promise<{ pending: number; failed: number; total: number }> {
    await this.load();
    return {
      pending: this.sessions.filter(s => s.syncStatus === 'pending').length,
      failed: this.sessions.filter(s => s.syncStatus === 'failed').length,
      total: this.sessions.length,
    };
  }

  async clearSyncedSessions(): Promise<number> {
    await this.load();
    
    const syncedSessions = this.sessions.filter(s => s.syncStatus === 'synced');
    const count = syncedSessions.length;
    
    // Clean up files for synced sessions
    for (const session of syncedSessions) {
      if (Platform.OS !== 'web' && RECORDINGS_DIR) {
        for (const recording of session.recordings) {
          try {
            const exists = await FileSystem.getInfoAsync(recording.uri);
            if (exists.exists) {
              await FileSystem.deleteAsync(recording.uri);
            }
          } catch (e) {
            // Ignore file deletion errors
          }
        }
      }
    }
    
    this.sessions = this.sessions.filter(s => s.syncStatus !== 'synced');
    await this.save();
    
    return count;
  }

  async clearAllSessions(): Promise<number> {
    await this.load();
    
    const count = this.sessions.length;
    
    // Clean up all recording files
    if (Platform.OS !== 'web' && RECORDINGS_DIR) {
      try {
        const dirInfo = await FileSystem.getInfoAsync(RECORDINGS_DIR);
        if (dirInfo.exists) {
          await FileSystem.deleteAsync(RECORDINGS_DIR, { idempotent: true });
        }
      } catch (e) {
        console.error('Error clearing recordings directory:', e);
      }
    }
    
    this.sessions = [];
    await this.save();
    
    return count;
  }

  // Get total storage used by recordings
  async getStorageUsed(): Promise<number> {
    await this.load();
    
    if (Platform.OS === 'web') {
      // Estimate based on session data size
      const dataSize = JSON.stringify(this.sessions).length;
      return dataSize;
    }
    
    let totalSize = 0;
    for (const session of this.sessions) {
      for (const recording of session.recordings) {
        try {
          const info = await FileSystem.getInfoAsync(recording.uri);
          if (info.exists && 'size' in info) {
            totalSize += info.size || 0;
          }
        } catch (e) {
          // Ignore errors
        }
      }
    }
    
    return totalSize;
  }
}

export const pendingSessionsStore = new PendingSessionsStore();
