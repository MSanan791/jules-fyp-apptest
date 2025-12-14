import * as SecureStore from 'expo-secure-store'; // Securely store token
import { Platform } from 'react-native';

// ⚠️ REPLACE WITH YOUR PC IP
const API_URL = 'http://20.255.56.194:3000/api/auth'; 

interface LoginRequest {
    email: string;
    password: string;
}

interface User {
    [key: string]: any;
}

interface LoginResponse {
    token?: string;
    user?: User;
    message?: string;
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data: LoginResponse = await response.json();
        if (!response.ok) throw new Error(data.message || 'Login failed');

        // Securely save the token on the device
        if (Platform.OS !== 'web') {
            if (data.token) {
                await SecureStore.setItemAsync('userToken', data.token);
            }
            if (data.user) {
                await SecureStore.setItemAsync('userData', JSON.stringify(data.user));
            }
        }
        
        return data;
    } catch (error) {
        throw error;
    }
};

export const logout = async () => {
  if (Platform.OS !== 'web') {
    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('userData');
  }
};

export const getToken = async () => {
  if (Platform.OS !== 'web') {
    const token = await SecureStore.getItemAsync('userToken');
    
    // 👇 ADD THIS LOG
    console.log("🔑 Frontend Retrieving Token:", token ? token.substring(0, 15) + "..." : "NULL");
    
    return token;
  }
  return null;
};

export const getAuthHeaders = async () => {
  if (Platform.OS === 'web') return {}; // Handle web if needed

  const token = await SecureStore.getItemAsync('userToken');
  
  if (!token) {
    console.warn("⚠️ No token found in SecureStore");
    return {};
  }

  // 🛡️ SANITIZATION:
  // This ensures no whitespace issues on the Frontend side before sending
  const cleanToken = token.trim(); 

  // console.log(`🚀 Attaching Token: [${cleanToken.substring(0, 10)}...]`); // Optional debug

  return {
    'Authorization': `Bearer ${cleanToken}`,
    'Content-Type': 'application/json',
  };
};