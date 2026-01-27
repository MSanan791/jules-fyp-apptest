import { Stack } from 'expo-router';
import '../global.css';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { SettingsProvider } from '../context/SettingsContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts, Raleway_400Regular, Raleway_500Medium, Raleway_600SemiBold, Raleway_700Bold } from '@expo-google-fonts/raleway';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Raleway_400Regular,
    Raleway_500Medium,
    Raleway_600SemiBold,
    Raleway_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <SettingsProvider>
          <AuthProvider>
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="home" options={{ headerShown: false }} />
              <Stack.Screen name="test-selection" options={{ headerShown: false }} />
              <Stack.Screen name="protocol-selection" options={{ headerShown: false }} />
              <Stack.Screen 
                name="session-setup" 
                options={{ 
                  headerShown: false,
                  gestureEnabled: false, // Prevent swipe back
                }} 
              />
              <Stack.Screen 
                name="recording" 
                options={{ 
                  headerShown: false,
                  gestureEnabled: false, // Prevent swipe back during recording
                }} 
              />
              <Stack.Screen 
                name="review-upload" 
                options={{ 
                  headerShown: false,
                  gestureEnabled: false, // Prevent swipe back during review
                }} 
              />
              <Stack.Screen name="patient-profile" options={{ headerShown: false }} />
              <Stack.Screen name="add-new-patient" options={{ headerShown: false }} />
              <Stack.Screen name="settings" options={{ headerShown: false }} />
              <Stack.Screen name="sign-up" options={{ headerShown: false }} />
              <Stack.Screen name="help" options={{ headerShown: false }} />
              <Stack.Screen name="about" options={{ headerShown: false }} />
            </Stack>
          </AuthProvider>
        </SettingsProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
