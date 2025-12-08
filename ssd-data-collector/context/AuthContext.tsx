import React, { createContext, useState, useEffect, useContext } from 'react';
import { login as apiLogin, logout as apiLogout, getToken } from '../services/AuthService';
import { useRouter, useSegments } from 'expo-router';

interface User {
  token: string;
}

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  // Check if user is already logged in on app start
  useEffect(() => {
    const checkLogin = async () => {
      const token = await getToken();
      if (token) {
        setUser({ token }); // In real app, validate token or fetch user profile here
      }
      setIsLoading(false);
    };
    checkLogin();
  }, []);

  // Protected Route Logic: Redirect if not logged in
  useEffect(() => {
    if (isLoading) return;

    // Simple check: If no user, stay on Login. If user, go Home.
    // Note: Since your current structure is flat, we'll handle redirect in LoginScreen manually for now.
  }, [user, isLoading]);

const signIn = async (email: string, password: string): Promise<void> => {
    const data = await apiLogin(email, password);
    if (data.user && data.token) {
      setUser({ token: data.token });
      router.replace('/home'); // Redirect to Home after login
    }
};

  const signOut = async () => {
    await apiLogout();
    setUser(null);
    router.replace('/'); // Redirect to Login
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);