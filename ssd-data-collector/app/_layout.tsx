import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from '../context/AuthContext';
import '../global.css';

function InitialLayout() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (isLoading) return;
    
    // CRITICAL FIX: Do not navigate until the navigation root is mounted
    if (!navigationState?.key) return;

    // Define route groups
    // segments[0] is undefined for index, or string name for others
    const currentRoute = segments[0] || 'index';
    
    const publicRoutes = ['index', 'sign-up'];
    const inPublicRoute = publicRoutes.includes(currentRoute);

    if (!user && !inPublicRoute) {
      // 1. Redirect to Login if not authenticated and trying to access protected route
      router.replace('/');
    } else if (user && inPublicRoute) {
      // 2. Redirect to Home if authenticated and trying to access login/signup
      router.replace('/home');
    }
  }, [user, isLoading, segments, navigationState?.key]);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="sign-up" options={{ headerShown: false }} />
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="session-setup" options={{ headerShown: false }} />
      <Stack.Screen name="recording" options={{ headerShown: false }} />
      <Stack.Screen name="review-upload" options={{ headerShown: false }} />
      <Stack.Screen name="patient-profile" options={{ headerShown: false }} />
      <Stack.Screen name="add-new-patient" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <InitialLayout />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}