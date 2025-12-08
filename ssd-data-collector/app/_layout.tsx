import { Stack } from 'expo-router';
import '../global.css';
import { AuthProvider } from '../context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="sign-up" options={{ headerShown: false }} />
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="session-setup" options={{ headerShown: false }} />
      <Stack.Screen name="recording" options={{ headerShown: false }} />
      <Stack.Screen name="review-upload" options={{ headerShown: false }} />
      <Stack.Screen name="patient-profile" options={{ headerShown: false }} />
    </Stack>

    </AuthProvider>
  );
}
