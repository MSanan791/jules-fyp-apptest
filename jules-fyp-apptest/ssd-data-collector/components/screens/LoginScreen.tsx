import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getColors, getShadows } from '../../theme/colors';
import { fonts } from '../../theme/fonts';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signIn, user, isLoading } = useAuth();
  const { theme } = useTheme();
  
  const isDark = theme === 'dark';
  const colors = getColors(isDark);
  const shadowStyles = getShadows(isDark);

  // Redirect if already logged in (after initial loading completes)
  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/home');
    }
  }, [user, isLoading]);

  const handleLogin = async () => {
    setError('');
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    try {
      await signIn(email.trim(), password.trim());
      // Navigation will happen via the useEffect when user state updates
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking auth state
  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={{ 
            flexGrow: 1, 
            justifyContent: 'center',
            padding: 24,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo Section */}
          <View style={{ alignItems: 'center', marginBottom: 48 }}>
            <View style={[{
              width: 88,
              height: 88,
              borderRadius: 28,
              backgroundColor: colors.primaryBg,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
            }, shadowStyles.lg]}>
              <MaterialIcons name="record-voice-over" size={44} color={colors.primary} />
            </View>
            <Text style={{
              fontSize: 32,
              fontFamily: fonts.bold,
              color: colors.text,
              marginBottom: 8,
              letterSpacing: -0.5,
            }}>
              SSD Collector
            </Text>
            <Text style={{
              fontSize: 15,
              fontFamily: fonts.regular,
              color: colors.textSecondary,
              textAlign: 'center',
              lineHeight: 22,
            }}>
              Speech Sound Disorder Assessment
            </Text>
          </View>

          {/* Login Form */}
          <View style={[{
            backgroundColor: colors.surface,
            borderRadius: 24,
            padding: 28,
            borderWidth: 1,
            borderColor: colors.border,
          }, shadowStyles.xl]}>
            <Text style={{
              fontSize: 24,
              fontFamily: fonts.bold,
              color: colors.text,
              marginBottom: 28,
            }}>
              Welcome Back
            </Text>

            {/* Error Message */}
            {error ? (
              <View style={[{
                backgroundColor: colors.errorBg,
                borderRadius: 14,
                padding: 16,
                marginBottom: 24,
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.error + '30',
              }, shadowStyles.sm]}>
                <MaterialIcons name="error-outline" size={22} color={colors.error} />
                <Text style={{
                  color: colors.error,
                  marginLeft: 12,
                  flex: 1,
                  fontSize: 14,
                  fontFamily: fonts.medium,
                }}>
                  {error}
                </Text>
              </View>
            ) : null}

            {/* Email Input */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{
                fontSize: 14,
                fontFamily: fonts.semiBold,
                color: colors.text,
                marginBottom: 10,
              }}>
                Email Address
              </Text>
              <View style={[{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.surfaceSecondary,
                borderRadius: 14,
                borderWidth: 2,
                borderColor: email ? colors.primary : colors.border,
                overflow: 'hidden',
              }, email && shadowStyles.sm]}>
                <View style={{ paddingLeft: 16 }}>
                  <MaterialIcons name="email" size={22} color={email ? colors.primary : colors.textTertiary} />
                </View>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="therapist@example.com"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={{
                    flex: 1,
                    paddingVertical: 18,
                    paddingHorizontal: 14,
                    fontSize: 16,
                    fontFamily: fonts.regular,
                    color: colors.text,
                  }}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={{ marginBottom: 28 }}>
              <Text style={{
                fontSize: 14,
                fontFamily: fonts.semiBold,
                color: colors.text,
                marginBottom: 10,
              }}>
                Password
              </Text>
              <View style={[{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.surfaceSecondary,
                borderRadius: 14,
                borderWidth: 2,
                borderColor: password ? colors.primary : colors.border,
                overflow: 'hidden',
              }, password && shadowStyles.sm]}>
                <View style={{ paddingLeft: 16 }}>
                  <MaterialIcons name="lock" size={22} color={password ? colors.primary : colors.textTertiary} />
                </View>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.textTertiary}
                  secureTextEntry={!showPassword}
                  style={{
                    flex: 1,
                    paddingVertical: 18,
                    paddingHorizontal: 14,
                    fontSize: 16,
                    fontFamily: fonts.regular,
                    color: colors.text,
                  }}
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  style={{ paddingHorizontal: 16 }}
                >
                  <MaterialIcons 
                    name={showPassword ? "visibility-off" : "visibility"} 
                    size={22} 
                    color={colors.textTertiary} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              style={[{
                backgroundColor: loading ? colors.textTertiary : colors.primary,
                borderRadius: 14,
                paddingVertical: 18,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
              }, !loading && shadowStyles.glow]}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <MaterialIcons name="login" size={22} color="#fff" />
                  <Text style={{
                    color: '#fff',
                    fontSize: 17,
                    fontFamily: fonts.semiBold,
                  }}>
                    Sign In
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Forgot Password */}
            <TouchableOpacity style={{ marginTop: 20, alignItems: 'center' }}>
              <Text style={{
                color: colors.primary,
                fontSize: 14,
                fontFamily: fonts.medium,
              }}>
                Forgot Password?
              </Text>
            </TouchableOpacity>
          </View>

          {/* Sign Up Link */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 28,
          }}>
            <Text style={{ color: colors.textSecondary, fontSize: 15, fontFamily: fonts.regular }}>
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/sign-up')}>
              <Text style={{
                color: colors.primary,
                fontSize: 15,
                fontFamily: fonts.semiBold,
              }}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>

          {/* Demo Credentials Info */}
          <View style={[{
            marginTop: 36,
            backgroundColor: colors.infoBg,
            borderRadius: 16,
            padding: 18,
            flexDirection: 'row',
            alignItems: 'flex-start',
            borderWidth: 1,
            borderColor: colors.info + '30',
          }, shadowStyles.sm]}>
            <MaterialIcons name="info-outline" size={22} color={colors.info} style={{ marginTop: 2 }} />
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={{
                fontSize: 14,
                fontFamily: fonts.semiBold,
                color: colors.info,
                marginBottom: 6,
              }}>
                Demo Credentials
              </Text>
              <Text style={{
                fontSize: 13,
                fontFamily: fonts.regular,
                color: isDark ? colors.textSecondary : '#0C4A6E',
                lineHeight: 20,
              }}>
                Email: therapist@example.com{'\n'}
                Password: password123
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
