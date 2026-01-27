import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { currentSession } from '../../store/SessionStore';
import { getColors, getShadows } from '../../theme/colors';
import { fonts } from '../../theme/fonts';
import { Protocol } from '../../data/testProtocols';

const ProtocolSelectionScreen = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colors = getColors(isDark);
  const shadowStyles = getShadows(isDark);
  
  const testProtocol = currentSession.testProtocol;

  if (!testProtocol) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <MaterialIcons name="error-outline" size={56} color={colors.error} />
        <Text style={{ color: colors.text, marginTop: 16, fontSize: 18, fontFamily: fonts.semiBold }}>
          No test selected
        </Text>
        <TouchableOpacity 
          onPress={() => router.push('/test-selection')}
          style={[{
            marginTop: 20,
            backgroundColor: colors.primary,
            paddingHorizontal: 28,
            paddingVertical: 14,
            borderRadius: 14,
          }, shadowStyles.glow]}
        >
          <Text style={{ color: '#fff', fontFamily: fonts.semiBold }}>Select Test</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleProtocolSelect = (protocol: Protocol) => {
    currentSession.setSelectedProtocol(protocol);
    router.push('/session-setup');
  };

  const ProtocolCard = ({ protocol, index }: { protocol: Protocol; index: number }) => {
    const isUrdu = testProtocol.language === 'Urdu';
    
    return (
      <TouchableOpacity
        onPress={() => handleProtocolSelect(protocol)}
        activeOpacity={0.7}
        style={[{
          backgroundColor: colors.surface,
          borderRadius: 20,
          marginBottom: 14,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: 'hidden',
        }, shadowStyles.md]}
      >
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 18,
        }}>
          {/* Index Badge */}
          <View style={[{
            width: 48,
            height: 48,
            borderRadius: 14,
            backgroundColor: isUrdu ? colors.secondaryBg : colors.primaryBg,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 16,
          }, shadowStyles.sm]}>
            <Text style={{
              fontSize: 20,
              fontFamily: fonts.bold,
              color: isUrdu ? colors.secondary : colors.primary,
            }}>
              {index + 1}
            </Text>
          </View>

          {/* Content */}
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: 17,
              fontFamily: fonts.semiBold,
              color: colors.text,
              marginBottom: 6,
            }}>
              {protocol.name}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialIcons name="mic" size={15} color={colors.textSecondary} />
                <Text style={{
                  fontSize: 13,
                  fontFamily: fonts.medium,
                  color: colors.textSecondary,
                  marginLeft: 5,
                }}>
                  {protocol.words.length} words
                </Text>
              </View>
              {protocol.checkNotes && (
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <MaterialIcons name="info-outline" size={14} color={colors.textTertiary} />
                  <Text 
                    style={{
                      fontSize: 12,
                      fontFamily: fonts.regular,
                      color: colors.textTertiary,
                      marginLeft: 5,
                      flex: 1,
                    }}
                    numberOfLines={1}
                  >
                    {protocol.checkNotes}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Arrow */}
          <View style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: colors.primaryBg,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <MaterialIcons name="chevron-right" size={22} color={colors.primary} />
          </View>
        </View>

        {/* Word Preview */}
        <View style={{
          backgroundColor: colors.surfaceSecondary,
          paddingHorizontal: 18,
          paddingVertical: 12,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {protocol.words.slice(0, 6).map((word, idx) => (
              <View key={idx} style={{
                backgroundColor: colors.surface,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.border,
              }}>
                <Text style={{ fontSize: 12, fontFamily: fonts.medium, color: colors.text }}>
                  {word.urdu ? `${word.urdu} (${word.word})` : word.word}
                </Text>
              </View>
            ))}
            {protocol.words.length > 6 && (
              <View style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
                backgroundColor: colors.primaryBg,
              }}>
                <Text style={{ fontSize: 12, fontFamily: fonts.semiBold, color: colors.primary }}>
                  +{protocol.words.length - 6}
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </TouchableOpacity>
    );
  };

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
          onPress={() => {
            // Use replace on web for more reliable navigation
            if (Platform.OS === 'web') {
              router.replace('/test-selection');
            } else {
              router.back();
            }
          }} 
          style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={{
            fontSize: 18,
            fontFamily: fonts.bold,
            color: colors.text,
          }}>
            {testProtocol.name}
          </Text>
          <Text style={{
            fontSize: 12,
            fontFamily: fonts.regular,
            color: colors.textSecondary,
          }}>
            {testProtocol.language} Assessment
          </Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Test Info Card */}
        <View style={[{
          backgroundColor: testProtocol.language === 'Urdu' ? colors.secondaryBg : colors.primaryBg,
          borderRadius: 20,
          padding: 20,
          marginBottom: 24,
          borderWidth: 1,
          borderColor: colors.border,
        }, shadowStyles.md]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <Text style={{
              fontSize: 22,
              fontFamily: fonts.bold,
              color: colors.text,
              flex: 1,
            }}>
              {testProtocol.fullName}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialIcons name="schedule" size={16} color={colors.textSecondary} />
              <Text style={{ color: colors.textSecondary, marginLeft: 6, fontSize: 13, fontFamily: fonts.medium }}>
                ~{testProtocol.administrationTimeMinutes} min
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialIcons name="child-care" size={16} color={colors.textSecondary} />
              <Text style={{ color: colors.textSecondary, marginLeft: 6, fontSize: 13, fontFamily: fonts.medium }}>
                Ages {testProtocol.targetAgeYears}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialIcons name="format-list-numbered" size={16} color={colors.textSecondary} />
              <Text style={{ color: colors.textSecondary, marginLeft: 6, fontSize: 13, fontFamily: fonts.medium }}>
                {testProtocol.protocols.length} protocols
              </Text>
            </View>
          </View>
        </View>

        {/* Section Title */}
        <Text style={{
          fontSize: 12,
          fontFamily: fonts.bold,
          color: colors.textSecondary,
          marginBottom: 14,
          textTransform: 'uppercase',
          letterSpacing: 1.2,
        }}>
          Select Protocol to Administer
        </Text>

        {/* Protocol Cards */}
        {testProtocol.protocols.map((protocol, index) => (
          <ProtocolCard key={protocol.id} protocol={protocol} index={index} />
        ))}

        {/* Instructions */}
        <View style={[{
          backgroundColor: colors.infoBg,
          borderRadius: 18,
          padding: 20,
          marginTop: 10,
          borderWidth: 1,
          borderColor: `${colors.info}30`,
        }, shadowStyles.sm]}>
          <Text style={{
            fontSize: 14,
            fontFamily: fonts.bold,
            color: colors.info,
            marginBottom: 12,
          }}>
            Instructions
          </Text>
          {testProtocol.instructions.map((instruction, idx) => (
            <View key={idx} style={{ flexDirection: 'row', marginBottom: 8 }}>
              <Text style={{ color: colors.info, marginRight: 10, fontFamily: fonts.semiBold }}>
                {idx + 1}.
              </Text>
              <Text style={{
                flex: 1,
                fontSize: 13,
                fontFamily: fonts.regular,
                color: isDark ? colors.textSecondary : '#0C4A6E',
                lineHeight: 20,
              }}>
                {instruction}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProtocolSelectionScreen;
