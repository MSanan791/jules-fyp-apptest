import React, { createContext, useState, useEffect, useContext } from 'react';
import { login as apiLogin, logout as apiLogout, getToken } from '../services/AuthService';

interface AuthContextType {
  user: { token: string } | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>; // Changed to return boolean
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<{ token: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const token = await getToken();
        if (token) {
          setUser({ token });
        }
      } catch (error) {
        console.error("Session restoration failed:", error);
      } finally {
        setIsLoading(false);
      }
    };
    checkLogin();
  }, []);

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      const data = await apiLogin(email, password);
      if (data.user && data.token) {
        setUser({ token: data.token });
        return true; // Login Success
      }
      return false; // Login Failed (Backend rejected)
    } catch (error) {
      console.error("Login error:", error);
      return false; // Login Failed (Network/Crash)
    }
  };

  const signOut = async () => {
    await apiLogout();
    setUser(null);
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};