import { Stack } from 'expo-router';
import '../global.css';
import { AuthProvider } from '../context/AuthContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler'; // 1. Import this

export default function RootLayout() {
  return (
    // 2. Wrap the entire app structure
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="home" options={{ headerShown: false }} />
          <Stack.Screen name="session-setup" options={{ headerShown: false }} />
          <Stack.Screen name="recording" options={{ headerShown: false }} />
          <Stack.Screen name="review-upload" options={{ headerShown: false }} />
          <Stack.Screen name="patient-profile" options={{ headerShown: false }} />
          <Stack.Screen name="add-new-patient" options={{ headerShown: false }} />
        </Stack>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}