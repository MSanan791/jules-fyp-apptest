import * as SecureStore from 'expo-secure-store'; // Securely store token
import { Platform } from 'react-native';
import { API_ENDPOINTS } from '../config/api';

const API_URL = API_ENDPOINTS.AUTH; 

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
        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();
        
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: trimmedEmail, password: trimmedPassword }),
        });

        // Check if response is ok before parsing JSON
        if (!response.ok) {
            let errorMessage = `Login failed with status ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
                console.error('Login failed:', response.status, errorData);
            } catch (e) {
                console.error('Login failed - could not parse error response:', response.status);
            }
            throw new Error(errorMessage);
        }

        const data: LoginResponse = await response.json();

        // Save the token on the device
        if (Platform.OS === 'web') {
            // For web, use localStorage
            if (typeof window !== 'undefined') {
                if (data.token) {
                    localStorage.setItem('userToken', data.token);
                }
                if (data.user) {
                    localStorage.setItem('userData', JSON.stringify(data.user));
                }
            }
        } else {
            // For mobile, use SecureStore
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
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userToken');
      localStorage.removeItem('userData');
    }
  } else {
    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('userData');
  }
};

export const getToken = async () => {
  if (Platform.OS === 'web') {
    // For web, use localStorage
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userToken');
    }
    return null;
  }
  
  const token = await SecureStore.getItemAsync('userToken');
  return token;
};

export const getAuthHeaders = async () => {
  let token: string | null = null;
  
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('userToken');
    }
  } else {
    token = await SecureStore.getItemAsync('userToken');
  }
  
  if (!token) {
    console.warn("No auth token found");
    return {};
  }

  // Sanitize token to ensure no whitespace issues
  const cleanToken = token.trim();

  return {
    'Authorization': `Bearer ${cleanToken}`,
    'Content-Type': 'application/json',
  };
};