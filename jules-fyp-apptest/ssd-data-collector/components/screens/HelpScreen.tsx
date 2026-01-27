import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, Href } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { getColors, getShadows } from '../../theme/colors';
import { fonts } from '../../theme/fonts';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'How do I create a new patient record?',
    answer: 'From the Home screen, tap the "Add Patient" button or the "+" icon. Fill in the required information (First Name and Age) and any optional details, then tap "Create Patient".',
  },
  {
    question: 'How do I start a recording session?',
    answer: 'Navigate to a patient profile by selecting them from the Home screen. Tap "New Session", select your test protocol (TAAPU or GFTA/KLPA), then choose the specific assessment. The recording screen will guide you through each word.',
  },
  {
    question: 'Can I re-record a word?',
    answer: 'Yes! After recording a word, you can tap the refresh/re-record button to record it again. The new recording will replace the previous one.',
  },
  {
    question: 'What happens if I skip a word?',
    answer: 'Skipped words are marked as "Skipped" and will not be included in the upload. You can always go back to skipped words using the word navigation at the bottom of the recording screen.',
  },
  {
    question: 'How do I review my recordings before uploading?',
    answer: 'After completing all words (or tapping "Finish"), you\'ll be taken to the Review & Upload screen. Here you can play back any recording, re-record specific words, or proceed with the upload.',
  },
  {
    question: 'Where is my data stored?',
    answer: 'Recordings are temporarily stored on your device until uploaded. Once uploaded, they are securely stored on our HIPAA-compliant servers. Patient data is encrypted both in transit and at rest.',
  },
  {
    question: 'Can I use the app offline?',
    answer: 'Yes, you can record sessions offline. However, you\'ll need an internet connection to upload recordings and sync patient data with the server.',
  },
  {
    question: 'How do I change between light and dark mode?',
    answer: 'Go to Settings > Appearance and toggle the Dark Mode switch, or tap "Theme Mode" to choose between Light, Dark, or System (follows your device settings).',
  },
];

const HelpScreen = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colors = getColors(isDark);
  const shadowStyles = getShadows(isDark);
  
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleContactSupport = () => {
    const email = 'support@ssdcollector.app';
    const subject = 'Help Request - SSD Data Collector';
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
    
    if (Platform.OS === 'web') {
      window.open(mailtoUrl, '_blank');
    } else {
      Linking.openURL(mailtoUrl).catch(() => {});
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
          Help Center
        </Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Actions */}
        <View style={{
          backgroundColor: colors.surface,
          borderRadius: 20,
          padding: 20,
          marginBottom: 28,
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
            Quick Help
          </Text>
          
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              onPress={handleContactSupport}
              style={{
                flex: 1,
                backgroundColor: colors.primaryBg,
                borderRadius: 14,
                padding: 16,
                alignItems: 'center',
                ...shadowStyles.sm,
              }}
            >
              <MaterialIcons name="email" size={28} color={colors.primary} />
              <Text style={{
                fontSize: 13,
                fontFamily: fonts.medium,
                color: colors.primary,
                marginTop: 8,
              }}>
                Email Support
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => router.push('/about' as Href)}
              style={{
                flex: 1,
                backgroundColor: colors.accentBg,
                borderRadius: 14,
                padding: 16,
                alignItems: 'center',
                ...shadowStyles.sm,
              }}
            >
              <MaterialIcons name="info" size={28} color={colors.accent} />
              <Text style={{
                fontSize: 13,
                fontFamily: fonts.medium,
                color: colors.accent,
                marginTop: 8,
              }}>
                About App
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQs */}
        <Text style={{
          fontSize: 12,
          fontFamily: fonts.bold,
          color: colors.textSecondary,
          marginBottom: 14,
          paddingHorizontal: 4,
          textTransform: 'uppercase',
          letterSpacing: 1.2,
        }}>
          Frequently Asked Questions
        </Text>

        <View style={{
          backgroundColor: colors.surface,
          borderRadius: 20,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: colors.border,
          ...shadowStyles.md,
        }}>
          {faqs.map((faq, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setExpandedIndex(expandedIndex === index ? null : index)}
              style={{
                borderBottomWidth: index === faqs.length - 1 ? 0 : 1,
                borderBottomColor: colors.border,
              }}
            >
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 18,
              }}>
                <View style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: colors.primaryBg,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 14,
                }}>
                  <MaterialIcons name="help-outline" size={20} color={colors.primary} />
                </View>
                <Text style={{
                  flex: 1,
                  fontSize: 15,
                  fontFamily: fonts.medium,
                  color: colors.text,
                }}>
                  {faq.question}
                </Text>
                <MaterialIcons 
                  name={expandedIndex === index ? "expand-less" : "expand-more"} 
                  size={24} 
                  color={colors.textTertiary} 
                />
              </View>
              
              {expandedIndex === index && (
                <View style={{
                  paddingHorizontal: 18,
                  paddingBottom: 18,
                  paddingLeft: 68,
                }}>
                  <Text style={{
                    fontSize: 14,
                    fontFamily: fonts.regular,
                    color: colors.textSecondary,
                    lineHeight: 22,
                  }}>
                    {faq.answer}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Additional Help */}
        <View style={{
          marginTop: 28,
          backgroundColor: colors.infoBg,
          borderRadius: 16,
          padding: 18,
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: `${colors.info}30`,
          ...shadowStyles.sm,
        }}>
          <MaterialIcons name="lightbulb" size={24} color={colors.info} style={{ marginRight: 14 }} />
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: 14,
              fontFamily: fonts.medium,
              color: colors.info,
            }}>
              Need more help?
            </Text>
            <Text style={{
              fontSize: 13,
              fontFamily: fonts.regular,
              color: colors.textSecondary,
              marginTop: 4,
            }}>
              Contact our support team for personalized assistance.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HelpScreen;
