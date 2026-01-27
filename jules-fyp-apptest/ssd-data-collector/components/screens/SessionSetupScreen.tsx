import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, BackHandler, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { currentSession } from '../../store/SessionStore';
import { getColors, getShadows } from '../../theme/colors';
import { fonts } from '../../theme/fonts';

const SessionSetupScreen = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colors = getColors(isDark);
  const shadowStyles = getShadows(isDark);

  const [checklist, setChecklist] = useState({
    quietEnv: false,
    consent: false,
    ready: false,
    equipment: false,
  });

  const testProtocol = currentSession.testProtocol;
  const selectedProtocol = currentSession.selectedProtocol;

  const handleGoBack = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to go back? Your selections will be preserved.');
      if (confirmed) {
        router.back();
      }
    } else {
      Alert.alert(
        'Leave Setup?',
        'Are you sure you want to go back? Your selections will be preserved.',
        [
          { text: 'Stay', style: 'cancel' },
          { text: 'Go Back', onPress: () => router.back() }
        ]
      );
    }
  };

  // Prevent back navigation - show warning (native only)
  useEffect(() => {
    if (Platform.OS === 'web') return;
    
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleGoBack();
      return true;
    });

    return () => backHandler.remove();
  }, []);

  const toggleCheckbox = (key: keyof typeof checklist): void => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const allChecked = Object.values(checklist).every(Boolean);

  const checklistItems = [
    {
      key: 'quietEnv',
      icon: 'volume-off',
      title: 'Quiet Environment',
      description: 'Area is quiet and free from distractions',
    },
    {
      key: 'equipment',
      icon: 'mic',
      title: 'Equipment Ready',
      description: 'Microphone is working and positioned correctly',
    },
    {
      key: 'consent',
      icon: 'assignment-turned-in',
      title: 'Consent Obtained',
      description: 'Informed consent has been documented',
    },
    {
      key: 'ready',
      icon: 'child-care',
      title: 'Child Ready',
      description: 'Child is comfortable and ready to begin',
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={[{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.surface,
      }, shadowStyles.sm]}>
        <TouchableOpacity 
          onPress={handleGoBack} 
          style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{
          fontSize: 18,
          fontFamily: fonts.bold,
          color: colors.text,
        }}>
          Pre-Session Checklist
        </Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Test Info Card */}
        {testProtocol && selectedProtocol && (
          <View style={[{
            backgroundColor: testProtocol.language === 'Urdu' ? colors.secondaryBg : colors.primaryBg,
            borderRadius: 20,
            padding: 20,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: colors.border,
          }, shadowStyles.md]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <View style={[{
                backgroundColor: testProtocol.language === 'Urdu' ? colors.secondary : colors.primary,
                paddingHorizontal: 12,
                paddingVertical: 5,
                borderRadius: 10,
              }, shadowStyles.sm]}>
                <Text style={{ color: '#fff', fontSize: 11, fontFamily: fonts.bold, textTransform: 'uppercase' }}>
                  {testProtocol.language}
                </Text>
              </View>
              <Text style={{ color: colors.textSecondary, fontSize: 13, fontFamily: fonts.medium, marginLeft: 12 }}>
                ~{testProtocol.administrationTimeMinutes} minutes
              </Text>
            </View>
            <Text style={{
              fontSize: 20,
              fontFamily: fonts.bold,
              color: colors.text,
              marginBottom: 6,
            }}>
              {testProtocol.name} - {selectedProtocol.name}
            </Text>
            <Text style={{ fontSize: 14, fontFamily: fonts.medium, color: colors.textSecondary }}>
              {selectedProtocol.words.length} words to record
            </Text>
            {selectedProtocol.checkNotes && (
              <View style={[{
                marginTop: 14,
                padding: 14,
                backgroundColor: colors.infoBg,
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'flex-start',
                borderWidth: 1,
                borderColor: `${colors.info}30`,
              }, shadowStyles.sm]}>
                <MaterialIcons name="info-outline" size={18} color={colors.info} style={{ marginTop: 2 }} />
                <Text style={{ flex: 1, fontSize: 13, fontFamily: fonts.regular, color: colors.info, marginLeft: 10, lineHeight: 20 }}>
                  {selectedProtocol.checkNotes}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Microphone Status */}
        <View style={[{
          backgroundColor: colors.surface,
          borderRadius: 20,
          padding: 20,
          marginBottom: 24,
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: colors.border,
        }, shadowStyles.md]}>
          <View style={[{
            width: 60,
            height: 60,
            borderRadius: 18,
            backgroundColor: colors.successBg,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 18,
          }, shadowStyles.sm]}>
            <MaterialIcons name="mic" size={32} color={colors.success} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: 17,
              fontFamily: fonts.semiBold,
              color: colors.text,
              marginBottom: 4,
            }}>
              Microphone Status
            </Text>
            <Text style={{
              fontSize: 14,
              fontFamily: fonts.medium,
              color: colors.success,
            }}>
              Ready for Recording
            </Text>
          </View>
          <View style={[{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: colors.successBg,
            alignItems: 'center',
            justifyContent: 'center',
          }, shadowStyles.sm]}>
            <MaterialIcons name="check-circle" size={26} color={colors.success} />
          </View>
        </View>

        {/* Checklist */}
        <Text style={{
          fontSize: 12,
          fontFamily: fonts.bold,
          color: colors.textSecondary,
          marginBottom: 14,
          textTransform: 'uppercase',
          letterSpacing: 1.2,
        }}>
          Verification Checklist
        </Text>

        <View style={[{
          backgroundColor: colors.surface,
          borderRadius: 20,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: colors.border,
        }, shadowStyles.lg]}>
          {checklistItems.map((item, index) => (
            <TouchableOpacity
              key={item.key}
              onPress={() => toggleCheckbox(item.key as keyof typeof checklist)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 18,
                borderBottomWidth: index === checklistItems.length - 1 ? 0 : 1,
                borderBottomColor: colors.border,
                backgroundColor: checklist[item.key as keyof typeof checklist] ? colors.successBg : 'transparent',
              }}
            >
              <View style={[{
                width: 48,
                height: 48,
                borderRadius: 14,
                backgroundColor: checklist[item.key as keyof typeof checklist] 
                  ? colors.success 
                  : colors.surfaceSecondary,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 16,
              }, checklist[item.key as keyof typeof checklist] && shadowStyles.sm]}>
                <MaterialIcons 
                  name={checklist[item.key as keyof typeof checklist] ? 'check' : item.icon as any}
                  size={26}
                  color={checklist[item.key as keyof typeof checklist] ? '#fff' : colors.textSecondary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 16,
                  fontFamily: fonts.semiBold,
                  color: colors.text,
                  marginBottom: 3,
                }}>
                  {item.title}
                </Text>
                <Text style={{
                  fontSize: 13,
                  fontFamily: fonts.regular,
                  color: colors.textSecondary,
                }}>
                  {item.description}
                </Text>
              </View>
              <MaterialIcons
                name={checklist[item.key as keyof typeof checklist] ? 'check-box' : 'check-box-outline-blank'}
                size={28}
                color={checklist[item.key as keyof typeof checklist] ? colors.success : colors.textTertiary}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Instructions */}
        {testProtocol && (
          <View style={[{
            backgroundColor: colors.infoBg,
            borderRadius: 18,
            padding: 20,
            marginTop: 24,
            borderWidth: 1,
            borderColor: `${colors.info}30`,
          }, shadowStyles.sm]}>
            <Text style={{
              fontSize: 14,
              fontFamily: fonts.bold,
              color: colors.info,
              marginBottom: 14,
            }}>
              Assessment Instructions
            </Text>
            {testProtocol.instructions.map((instruction, idx) => (
              <View key={idx} style={{ flexDirection: 'row', marginBottom: 8 }}>
                <Text style={{ color: colors.info, marginRight: 10, fontFamily: fonts.semiBold }}>
                  {idx + 1}.
                </Text>
                <Text style={{ flex: 1, fontSize: 13, fontFamily: fonts.regular, color: isDark ? colors.textSecondary : '#0C4A6E', lineHeight: 20 }}>
                  {instruction}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Start Button */}
      <View style={[{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
      }, shadowStyles.lg]}>
        <Link href="/recording" asChild disabled={!allChecked}>
          <TouchableOpacity 
            style={{
              backgroundColor: allChecked ? colors.primary : colors.textTertiary,
              borderRadius: 16,
              paddingVertical: 18,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              ...shadowStyles.glow,
            }}
            disabled={!allChecked}
          >
            <MaterialIcons 
              name={allChecked ? "play-arrow" : "lock"} 
              size={26} 
              color="#fff" 
            />
            <Text style={{
              color: '#fff',
              fontSize: 18,
              fontFamily: fonts.bold,
            }}>
              {allChecked ? 'Begin Assessment' : 'Complete Checklist'}
            </Text>
          </TouchableOpacity>
        </Link>
        
        {!allChecked && (
          <Text style={{
            textAlign: 'center',
            fontSize: 13,
            fontFamily: fonts.medium,
            color: colors.textSecondary,
            marginTop: 10,
          }}>
            {Object.values(checklist).filter(Boolean).length} of {Object.keys(checklist).length} items verified
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
};

export default SessionSetupScreen;
