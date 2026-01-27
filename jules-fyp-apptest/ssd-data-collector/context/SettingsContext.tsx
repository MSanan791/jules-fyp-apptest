import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import { Platform, AppState, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import NetInfo from '@react-native-community/netinfo';
import { pendingSessionsStore, PendingSession } from '../store/PendingSessionsStore';
import { uploadSession, RecordingData } from '../services/SessionService';
import { getToken } from '../services/AuthService';

// Settings types
export interface AppSettings {
  // Recording settings
  highQualityAudio: boolean;
  
  // Notification settings
  notificationsEnabled: boolean;
  sessionReminders: boolean;
  
  // Data settings
  autoSyncEnabled: boolean;
  lastSyncDate: string | null;
}

export interface SyncStatus {
  isSyncing: boolean;
  pendingCount: number;
  failedCount: number;
  lastError: string | null;
}

interface SettingsContextType {
  settings: AppSettings;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => Promise<void>;
  resetSettings: () => Promise<void>;
  syncData: () => Promise<{ success: boolean; synced: number; failed: number }>;
  clearCache: () => Promise<{ success: boolean; clearedBytes: number; clearedSessions: number }>;
  isLoading: boolean;
  syncStatus: SyncStatus;
  getStorageInfo: () => Promise<{ usedBytes: number; pendingSessions: number }>;
}

const defaultSettings: AppSettings = {
  highQualityAudio: true,
  notificationsEnabled: true,
  sessionReminders: true,
  autoSyncEnabled: false,
  lastSyncDate: null,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const SETTINGS_STORAGE_KEY = 'app_settings';

// Storage helper for cross-platform support
const storage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        return localStorage.getItem(key);
      }
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('Storage getItem error:', error);
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        localStorage.setItem(key, value);
        return;
      }
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('Storage setItem error:', error);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        localStorage.removeItem(key);
        return;
      }
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('Storage removeItem error:', error);
    }
  },
};

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isSyncing: false,
    pendingCount: 0,
    failedCount: 0,
    lastError: null,
  });
  
  const autoSyncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const appStateRef = useRef(AppState.currentState);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await storage.getItem(SETTINGS_STORAGE_KEY);
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          setSettings({ ...defaultSettings, ...parsed });
        }
        
        // Load pending session counts
        const counts = await pendingSessionsStore.getSessionCount();
        setSyncStatus(prev => ({
          ...prev,
          pendingCount: counts.pending,
          failedCount: counts.failed,
        }));
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, []);

  // Auto-sync when enabled and on WiFi
  useEffect(() => {
    const checkAndAutoSync = async () => {
      if (!settings.autoSyncEnabled) return;
      
      try {
        const netState = await NetInfo.fetch();
        const isWifi = netState.type === 'wifi' && netState.isConnected;
        
        if (isWifi) {
          const counts = await pendingSessionsStore.getSessionCount();
          if (counts.pending > 0 || counts.failed > 0) {
            // Don't await - let it run in background
            syncDataInternal();
          }
        }
      } catch (error) {
        console.error('Auto-sync check error:', error);
      }
    };

    // Check on app state change (coming to foreground)
    const handleAppStateChange = (nextAppState: string) => {
      if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
        checkAndAutoSync();
      }
      appStateRef.current = nextAppState as any;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Set up periodic auto-sync check (every 5 minutes)
    if (settings.autoSyncEnabled) {
      autoSyncIntervalRef.current = setInterval(checkAndAutoSync, 5 * 60 * 1000);
      // Initial check
      checkAndAutoSync();
    }

    return () => {
      subscription.remove();
      if (autoSyncIntervalRef.current) {
        clearInterval(autoSyncIntervalRef.current);
      }
    };
  }, [settings.autoSyncEnabled]);

  // Save settings whenever they change
  const saveSettings = useCallback(async (newSettings: AppSettings) => {
    try {
      await storage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }, []);

  const updateSetting = useCallback(async <K extends keyof AppSettings>(
    key: K, 
    value: AppSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await saveSettings(newSettings);
  }, [settings, saveSettings]);

  const resetSettings = useCallback(async () => {
    setSettings(defaultSettings);
    await saveSettings(defaultSettings);
  }, [saveSettings]);

  // Internal sync function (reusable)
  const syncDataInternal = async (): Promise<{ success: boolean; synced: number; failed: number }> => {
    if (syncStatus.isSyncing) {
      return { success: false, synced: 0, failed: 0 };
    }

    setSyncStatus(prev => ({ ...prev, isSyncing: true, lastError: null }));
    
    let syncedCount = 0;
    let failedCount = 0;

    try {
      // Get auth token using AuthService
      const token = await getToken();

      if (!token) {
        throw new Error('Not authenticated. Please login again.');
      }

      // Get pending sessions
      const pendingSessions = await pendingSessionsStore.getPendingSessions();
      console.log(`Starting sync: ${pendingSessions.length} sessions to upload`);

      for (const session of pendingSessions) {
        try {
          await pendingSessionsStore.updateSessionStatus(session.id, 'syncing');
          
          // Convert to RecordingData format
          const recordings: RecordingData[] = session.recordings.map(rec => ({
            uri: rec.uri,
            word: rec.word,
            transcription: rec.transcription,
            errorType: rec.errorType,
            isCorrect: rec.isCorrect,
          }));

          // Upload to backend
          await uploadSession(session.patientId, recordings, session.notes, token);
          
          // Mark as synced
          await pendingSessionsStore.updateSessionStatus(session.id, 'synced');
          syncedCount++;
          console.log(`Synced session ${session.id}`);
        } catch (error: any) {
          // Mark as failed
          await pendingSessionsStore.updateSessionStatus(session.id, 'failed', error.message);
          failedCount++;
          console.error(`Failed to sync session ${session.id}:`, error.message);
        }
      }

      // Update last sync date
      const now = new Date().toISOString();
      const newSettings = { ...settings, lastSyncDate: now };
      setSettings(newSettings);
      await saveSettings(newSettings);

      // Update sync status
      const counts = await pendingSessionsStore.getSessionCount();
      setSyncStatus({
        isSyncing: false,
        pendingCount: counts.pending,
        failedCount: counts.failed,
        lastError: failedCount > 0 ? `${failedCount} session(s) failed to sync` : null,
      });

      // Clear synced sessions to free up space
      await pendingSessionsStore.clearSyncedSessions();

      return { success: failedCount === 0, synced: syncedCount, failed: failedCount };
    } catch (error: any) {
      console.error('Sync error:', error);
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        lastError: error.message,
      }));
      return { success: false, synced: syncedCount, failed: failedCount };
    }
  };

  const syncData = useCallback(syncDataInternal, [settings, saveSettings, syncStatus.isSyncing]);

  const clearCache = useCallback(async (): Promise<{ success: boolean; clearedBytes: number; clearedSessions: number }> => {
    try {
      // Get storage info before clearing
      const usedBytes = await pendingSessionsStore.getStorageUsed();
      
      // Clear synced sessions (keep pending ones)
      const clearedSessions = await pendingSessionsStore.clearSyncedSessions();
      
      let webCacheCleared = false;
      
      // Clear web session storage and caches
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        if (typeof sessionStorage !== 'undefined') {
          const sessionStorageLength = sessionStorage.length;
          sessionStorage.clear();
          if (sessionStorageLength > 0) webCacheCleared = true;
        }
        
        // Clear any cached API responses
        if ('caches' in window) {
          try {
            const cacheNames = await caches.keys();
            for (const name of cacheNames) {
              await caches.delete(name);
              webCacheCleared = true;
            }
          } catch (e) {
            console.log('Cache API not available');
          }
        }
        
        // Clear any temp data from localStorage (but not auth)
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('temp_') || key.startsWith('cache_'))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        if (keysToRemove.length > 0) webCacheCleared = true;
      }
      
      // Update sync status counts
      const counts = await pendingSessionsStore.getSessionCount();
      setSyncStatus(prev => ({
        ...prev,
        pendingCount: counts.pending,
        failedCount: counts.failed,
      }));
      
      const totalCleared = clearedSessions + (webCacheCleared ? 1 : 0);
      console.log(`Cache cleared: ${clearedSessions} sessions, ${usedBytes} bytes, web cache: ${webCacheCleared}`);
      return { success: true, clearedBytes: usedBytes, clearedSessions: totalCleared > 0 ? totalCleared : clearedSessions };
    } catch (error) {
      console.error('Clear cache error:', error);
      return { success: false, clearedBytes: 0, clearedSessions: 0 };
    }
  }, []);

  const getStorageInfo = useCallback(async (): Promise<{ usedBytes: number; pendingSessions: number }> => {
    try {
      const usedBytes = await pendingSessionsStore.getStorageUsed();
      const counts = await pendingSessionsStore.getSessionCount();
      return { usedBytes, pendingSessions: counts.total };
    } catch (error) {
      console.error('Get storage info error:', error);
      return { usedBytes: 0, pendingSessions: 0 };
    }
  }, []);

  return (
    <SettingsContext.Provider value={{
      settings,
      updateSetting,
      resetSettings,
      syncData,
      clearCache,
      isLoading,
      syncStatus,
      getStorageInfo,
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};
