import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { getColors, getShadows } from '../../theme/colors';
import { fonts } from '../../theme/fonts';

const SignUpScreen = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colors = getColors(isDark);
  const shadowStyles = getShadows(isDark);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    let newErrors: { [key: string]: string } = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    if (!email.includes('@')) newErrors.email = "Invalid email format";
    if (!password) newErrors.password = "Password is required";
    if (password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    // Note: Sign up functionality would be implemented when backend supports it
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        "Account Creation", 
        "Account creation is currently managed by administrators. Please contact your system administrator.",
        [{ text: "OK", onPress: () => router.replace('/') }]
      );
    }, 1500);
  };

  const InputField = ({ 
    label, 
    value, 
    onChangeText, 
    placeholder,
    icon,
    error,
    secureTextEntry = false,
    keyboardType = 'default',
    autoCapitalize = 'none',
  }: any) => (
    <View style={{ marginBottom: 20 }}>
      <Text style={{
        fontSize: 14,
        fontFamily: fonts.semiBold,
        color: colors.text,
        marginBottom: 10,
      }}>
        {label}
      </Text>
      <View style={[{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surfaceSecondary,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: error ? colors.error : value ? colors.primary : colors.border,
        overflow: 'hidden',
      }, value && !error && shadowStyles.sm]}>
        <View style={{ paddingLeft: 16 }}>
          <MaterialIcons name={icon} size={22} color={error ? colors.error : value ? colors.primary : colors.textTertiary} />
        </View>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          style={{
            flex: 1,
            paddingVertical: 18,
            paddingHorizontal: 14,
            fontSize: 16,
            fontFamily: fonts.regular,
            color: colors.text,
          }}
        />
        {secureTextEntry && (
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
        )}
      </View>
      {error && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
          <MaterialIcons name="error-outline" size={14} color={colors.error} />
          <Text style={{
            fontSize: 12,
            fontFamily: fonts.medium,
            color: colors.error,
            marginLeft: 6,
          }}>
            {error}
          </Text>
        </View>
      )}
    </View>
  );

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
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 44,
              height: 44,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>

          {/* Logo Section */}
          <View style={{ alignItems: 'center', marginBottom: 40, marginTop: 24 }}>
            <View style={[{
              width: 80,
              height: 80,
              borderRadius: 24,
              backgroundColor: colors.primaryBg,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
            }, shadowStyles.lg]}>
              <MaterialIcons name="person-add" size={40} color={colors.primary} />
            </View>
            <Text style={{
              fontSize: 28,
              fontFamily: fonts.bold,
              color: colors.text,
              marginBottom: 6,
              letterSpacing: -0.5,
            }}>
              Create Account
            </Text>
            <Text style={{
              fontSize: 15,
              fontFamily: fonts.regular,
              color: colors.textSecondary,
              textAlign: 'center',
            }}>
              Register for clinical access
            </Text>
          </View>

          {/* Form Card */}
          <View style={[{
            backgroundColor: colors.surface,
            borderRadius: 24,
            padding: 28,
            borderWidth: 1,
            borderColor: colors.border,
          }, shadowStyles.xl]}>
            <InputField
              label="Full Name"
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
              icon="person"
              error={errors.name}
              autoCapitalize="words"
            />

            <InputField
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              placeholder="therapist@example.com"
              icon="email"
              error={errors.email}
              keyboardType="email-address"
            />

            <InputField
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Create a secure password"
              icon="lock"
              error={errors.password}
              secureTextEntry
            />

            <InputField
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Re-enter your password"
              icon="lock-outline"
              error={errors.confirmPassword}
              secureTextEntry
            />

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSignUp}
              disabled={isSubmitting}
              style={[{
                backgroundColor: isSubmitting ? colors.textTertiary : colors.primary,
                borderRadius: 14,
                paddingVertical: 18,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                marginTop: 10,
              }, !isSubmitting && shadowStyles.glow]}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <MaterialIcons name="person-add" size={22} color="#fff" />
                  <Text style={{
                    color: '#fff',
                    fontSize: 17,
                    fontFamily: fonts.semiBold,
                  }}>
                    Create Account
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Sign In Link */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 28,
          }}>
            <Text style={{ color: colors.textSecondary, fontSize: 15, fontFamily: fonts.regular }}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.replace('/')}>
              <Text style={{
                color: colors.primary,
                fontSize: 15,
                fontFamily: fonts.semiBold,
              }}>
                Sign In
              </Text>
            </TouchableOpacity>
          </View>

          {/* Info Note */}
          <View style={[{
            marginTop: 32,
            backgroundColor: colors.warningBg,
            borderRadius: 16,
            padding: 18,
            flexDirection: 'row',
            alignItems: 'flex-start',
            borderWidth: 1,
            borderColor: `${colors.warning}30`,
          }, shadowStyles.sm]}>
            <MaterialIcons name="info-outline" size={22} color={colors.warning} style={{ marginTop: 2 }} />
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={{
                fontSize: 14,
                fontFamily: fonts.semiBold,
                color: colors.warning,
                marginBottom: 6,
              }}>
                Administrator Access Required
              </Text>
              <Text style={{
                fontSize: 13,
                fontFamily: fonts.regular,
                color: isDark ? colors.textSecondary : '#78350F',
                lineHeight: 20,
              }}>
                New accounts require administrator approval. Contact your system administrator for access.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignUpScreen;
