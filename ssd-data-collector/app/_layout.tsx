import { Stack } from 'expo-router';
import '../global.css';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="session-setup" options={{ headerShown: false }} />
      <Stack.Screen name="recording" options={{ headerShown: false }} />
      <Stack.Screen name="review-upload" options={{ headerShown: false }} />
      <Stack.Screen name="patient-profile" options={{ headerShown: false }} />
    </Stack>
  );
}
