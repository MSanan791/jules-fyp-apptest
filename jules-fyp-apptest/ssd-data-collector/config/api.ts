import { Platform } from 'react-native';

// Configuration for API endpoints
// For local development on phone, use your computer's local IP address
// Find it with: hostname -I or ipconfig (Windows) / ifconfig (Mac/Linux)
// Make sure your phone and computer are on the same WiFi network

// Option 1: Use deployed backend (default for mobile)
const DEPLOYED_BACKEND = 'http://20.255.56.194:3000';

// Option 2: Use local backend (for development)
// Replace with your computer's local IP address (e.g., 'http://192.168.1.100:3000')
// Your current local IP appears to be: 10.77.107.12
const LOCAL_BACKEND = 'http://10.77.107.12:3000';

// Set to true to use local backend on mobile, false to use deployed backend
// IMPORTANT: When using local backend, make sure:
// 1. Your phone and computer are on the same WiFi network
// 2. Your backend server is running on port 3000
// 3. Your computer's firewall allows connections on port 3000
const USE_LOCAL_BACKEND_ON_MOBILE = true;

// Determine which backend to use
const getBaseURL = (): string => {
  if (Platform.OS === 'web') {
    // Web always uses localhost
    return 'http://localhost:3000';
  } else {
    // Mobile: use local backend if enabled, otherwise use deployed
    return USE_LOCAL_BACKEND_ON_MOBILE ? LOCAL_BACKEND : DEPLOYED_BACKEND;
  }
};

export const API_BASE_URL = getBaseURL();

// API endpoint paths
export const API_ENDPOINTS = {
  AUTH: `${API_BASE_URL}/api/auth`,
  PATIENTS: `${API_BASE_URL}/api`,
  SESSIONS: `${API_BASE_URL}/api/sessions`,
};

// Log the API URL being used (for debugging)
if (__DEV__) {
  console.log(`API Base URL: ${API_BASE_URL}`);
  console.log(`Platform: ${Platform.OS}`);
}
