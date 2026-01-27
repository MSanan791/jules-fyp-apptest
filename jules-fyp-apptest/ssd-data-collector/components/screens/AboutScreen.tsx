import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { getColors, getShadows } from '../../theme/colors';
import { fonts } from '../../theme/fonts';

const AboutScreen = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colors = getColors(isDark);
  const shadowStyles = getShadows(isDark);

  const appVersion = '1.0.0';
  const buildNumber = '2024.01.25';

  const openLink = (url: string) => {
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
    } else {
      Linking.openURL(url).catch(() => {});
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.surface,
        ...shadowStyles.sm,
      }}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{
          fontSize: 20,
          fontFamily: fonts.bold,
          color: colors.text,
        }}>
          About
        </Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 48, alignItems: 'center' }}
        showsVerticalScrollIndicator={false}
      >
        {/* App Logo & Name */}
        <View style={{
          alignItems: 'center',
          marginBottom: 32,
          marginTop: 20,
        }}>
          <View style={{
            width: 100,
            height: 100,
            borderRadius: 28,
            backgroundColor: colors.primaryBg,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
            ...shadowStyles.lg,
          }}>
            <MaterialIcons name="record-voice-over" size={52} color={colors.primary} />
          </View>
          <Text style={{
            fontSize: 28,
            fontFamily: fonts.bold,
            color: colors.text,
            marginBottom: 8,
          }}>
            SSD Data Collector
          </Text>
          <Text style={{
            fontSize: 14,
            fontFamily: fonts.regular,
            color: colors.textSecondary,
          }}>
            Speech Sound Assessment Tool
          </Text>
        </View>

        {/* Version Info */}
        <View style={{
          backgroundColor: colors.surface,
          borderRadius: 20,
          padding: 20,
          width: '100%',
          marginBottom: 24,
          borderWidth: 1,
          borderColor: colors.border,
          ...shadowStyles.md,
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ fontSize: 15, fontFamily: fonts.medium, color: colors.textSecondary }}>
              Version
            </Text>
            <Text style={{ fontSize: 15, fontFamily: fonts.semiBold, color: colors.text }}>
              {appVersion}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ fontSize: 15, fontFamily: fonts.medium, color: colors.textSecondary }}>
              Build
            </Text>
            <Text style={{ fontSize: 15, fontFamily: fonts.semiBold, color: colors.text }}>
              {buildNumber}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 15, fontFamily: fonts.medium, color: colors.textSecondary }}>
              Platform
            </Text>
            <Text style={{ fontSize: 15, fontFamily: fonts.semiBold, color: colors.text }}>
              {Platform.OS === 'ios' ? 'iOS' : Platform.OS === 'android' ? 'Android' : 'Web'}
            </Text>
          </View>
        </View>

        {/* Description */}
        <View style={{
          backgroundColor: colors.surface,
          borderRadius: 20,
          padding: 20,
          width: '100%',
          marginBottom: 24,
          borderWidth: 1,
          borderColor: colors.border,
          ...shadowStyles.md,
        }}>
          <Text style={{
            fontSize: 15,
            fontFamily: fonts.regular,
            color: colors.textSecondary,
            lineHeight: 24,
            textAlign: 'center',
          }}>
            SSD Data Collector is a professional tool designed for speech-language pathologists to conduct standardized speech sound assessments. The app supports TAAPU (Urdu) and GFTA/KLPA (English) protocols, enabling efficient data collection and analysis for speech sound disorders.
          </Text>
        </View>

        {/* Features */}
        <View style={{
          backgroundColor: colors.surface,
          borderRadius: 20,
          padding: 20,
          width: '100%',
          marginBottom: 24,
          borderWidth: 1,
          borderColor: colors.border,
          ...shadowStyles.md,
        }}>
          <Text style={{
            fontSize: 16,
            fontFamily: fonts.bold,
            color: colors.text,
            marginBottom: 16,
          }}>
            Key Features
          </Text>
          
          {[
            { icon: 'mic', text: 'High-quality audio recording' },
            { icon: 'people', text: 'Patient management system' },
            { icon: 'assessment', text: 'Standardized test protocols' },
            { icon: 'cloud-upload', text: 'Secure cloud sync' },
            { icon: 'security', text: 'HIPAA-compliant data storage' },
            { icon: 'offline-bolt', text: 'Offline recording support' },
          ].map((feature, index) => (
            <View 
              key={index}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: index === 5 ? 0 : 12,
              }}
            >
              <View style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: colors.successBg,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 14,
              }}>
                <MaterialIcons name={feature.icon as any} size={18} color={colors.success} />
              </View>
              <Text style={{
                fontSize: 14,
                fontFamily: fonts.regular,
                color: colors.text,
              }}>
                {feature.text}
              </Text>
            </View>
          ))}
        </View>

        {/* Credits */}
        <View style={{
          backgroundColor: colors.surface,
          borderRadius: 20,
          padding: 20,
          width: '100%',
          marginBottom: 24,
          borderWidth: 1,
          borderColor: colors.border,
          ...shadowStyles.md,
        }}>
          <Text style={{
            fontSize: 16,
            fontFamily: fonts.bold,
            color: colors.text,
            marginBottom: 12,
            textAlign: 'center',
          }}>
            Developed By
          </Text>
          <Text style={{
            fontSize: 15,
            fontFamily: fonts.medium,
            color: colors.textSecondary,
            textAlign: 'center',
            marginBottom: 8,
          }}>
            Speech Language Pathology Research Team
          </Text>
          <Text style={{
            fontSize: 13,
            fontFamily: fonts.regular,
            color: colors.textTertiary,
            textAlign: 'center',
          }}>
            In collaboration with clinical speech therapists
          </Text>
        </View>

        {/* Legal Links */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'center',
          gap: 24,
          marginBottom: 24,
        }}>
          <TouchableOpacity onPress={() => {}}>
            <Text style={{
              fontSize: 14,
              fontFamily: fonts.medium,
              color: colors.primary,
            }}>
              Privacy Policy
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {}}>
            <Text style={{
              fontSize: 14,
              fontFamily: fonts.medium,
              color: colors.primary,
            }}>
              Terms of Service
            </Text>
          </TouchableOpacity>
        </View>

        {/* Copyright */}
        <Text style={{
          fontSize: 12,
          fontFamily: fonts.regular,
          color: colors.textTertiary,
          textAlign: 'center',
        }}>
          © 2024 SSD Data Collector. All rights reserved.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AboutScreen;
