import React, { createContext, useState, useEffect, useContext } from 'react';
import { Platform } from 'react-native';
import { login as apiLogin, logout as apiLogout, getToken } from '../services/AuthService';

interface User {
  id: number;
  name: string;
  email: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in on app start
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const token = await getToken();
        if (token) {
          // Try to get user data from storage
          let userData = null;
          if (Platform.OS === 'web' && typeof window !== 'undefined') {
            const stored = localStorage.getItem('userData');
            if (stored) {
              try {
                userData = JSON.parse(stored);
              } catch (e) {
                console.error('Error parsing user data:', e);
              }
            }
          }
          
          if (userData) {
            setUser({ ...userData, token });
          } else {
            // Just set token if user data not available
            setUser({ id: 0, name: 'User', email: '', token });
          }
        }
      } catch (error) {
        console.error('Error checking login:', error);
      } finally {
        setIsLoading(false);
      }
    };
    checkLogin();
  }, []);

  const signIn = async (email: string, password: string): Promise<User> => {
    const data = await apiLogin(email, password);
    if (data.user && data.token) {
      const userData: User = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        token: data.token
      };
      setUser(userData);
      return userData;
    } else {
      throw new Error('Invalid response from server');
    }
  };

  const signOut = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      // Always clear user state
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
