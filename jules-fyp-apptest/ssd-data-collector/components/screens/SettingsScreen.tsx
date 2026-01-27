import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, Alert, Linking, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, Href } from 'expo-router';
import { useTheme, ThemeMode } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { getColors, getShadows } from '../../theme/colors';
import { fonts } from '../../theme/fonts';

const SettingsScreen = () => {
  const router = useRouter();
  const { theme, themeMode, setThemeMode, toggleTheme } = useTheme();
  const { signOut, user } = useAuth();
  const { settings, updateSetting, syncData, clearCache, syncStatus, getStorageInfo } = useSettings();
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [storageInfo, setStorageInfo] = useState({ usedBytes: 0, pendingSessions: 0 });

  const isDark = theme === 'dark';
  const colors = getColors(isDark);
  const shadowStyles = getShadows(isDark);

  // Load storage info on mount
  useEffect(() => {
    const loadStorageInfo = async () => {
      const info = await getStorageInfo();
      setStorageInfo(info);
    };
    loadStorageInfo();
  }, [getStorageInfo]);

  // Format bytes to human readable
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/');
          }
        },
      ]
    );
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const result = await syncData();
      if (result.success) {
        Alert.alert(
          'Sync Complete', 
          result.synced > 0 
            ? `Successfully synced ${result.synced} session(s) to the cloud.`
            : 'All data is already up to date.'
        );
      } else if (result.synced > 0 && result.failed > 0) {
        Alert.alert(
          'Partial Sync', 
          `Synced ${result.synced} session(s), but ${result.failed} failed. They will be retried automatically.`
        );
      } else {
        Alert.alert('Sync Failed', syncStatus.lastError || 'Could not sync data. Please try again.');
      }
      // Refresh storage info
      const info = await getStorageInfo();
      setStorageInfo(info);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'An error occurred during sync');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleClearCache = async () => {
    const message = storageInfo.usedBytes > 0 
      ? `This will clear ${formatBytes(storageInfo.usedBytes)} of cached data. Pending sessions will be preserved.`
      : 'This will clear temporary files and browser cache.';
    
    Alert.alert(
      'Clear Cache',
      message,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear Cache', 
          onPress: async () => {
            setIsClearingCache(true);
            try {
              const result = await clearCache();
              if (result.success) {
                let successMessage = 'Cache cleared successfully.';
                if (result.clearedBytes > 0 || result.clearedSessions > 0) {
                  successMessage = `Cleared ${formatBytes(result.clearedBytes)}`;
                  if (result.clearedSessions > 0) {
                    successMessage += ` and ${result.clearedSessions} item(s).`;
                  } else {
                    successMessage += '.';
                  }
                }
                Alert.alert('Success', successMessage);
                // Refresh storage info
                const info = await getStorageInfo();
                setStorageInfo(info);
              } else {
                Alert.alert('Error', 'Could not clear cache');
              }
            } catch (error) {
              Alert.alert('Error', 'An error occurred');
            } finally {
              setIsClearingCache(false);
            }
          }
        },
      ]
    );
  };

  const handleContactSupport = () => {
    const email = 'trazzaq744@gmail.com';
    const subject = 'Support Request - SSD Data Collector';
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
    
    if (Platform.OS === 'web') {
      window.open(mailtoUrl, '_blank');
    } else {
      Linking.openURL(mailtoUrl).catch(() => {
        Alert.alert('Error', 'Could not open email client');
      });
    }
  };

  const formatLastSync = (dateString: string | null) => {
    if (!dateString) return 'Never synced';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const SettingSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={{ marginBottom: 28 }}>
      <Text style={{
        fontSize: 12,
        fontFamily: fonts.bold,
        color: colors.textSecondary,
        marginBottom: 14,
        paddingHorizontal: 4,
        textTransform: 'uppercase',
        letterSpacing: 1.2,
      }}>
        {title}
      </Text>
      <View style={{
        backgroundColor: colors.surface,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border,
        ...shadowStyles.md,
      }}>
        {children}
      </View>
    </View>
  );

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    rightComponent,
    showArrow = true,
    isLast = false,
    iconColor,
    disabled = false,
    comingSoon = false,
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightComponent?: React.ReactNode;
    showArrow?: boolean;
    isLast?: boolean;
    iconColor?: string;
    disabled?: boolean;
    comingSoon?: boolean;
  }) => {
    const itemContent = (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 18,
          borderBottomWidth: isLast ? 0 : 1,
          borderBottomColor: colors.border,
          opacity: disabled || comingSoon ? 0.5 : 1,
        }}
      >
        <View style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          backgroundColor: iconColor ? `${iconColor}20` : colors.primaryBg,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 16,
        }}>
          <MaterialIcons 
            name={icon as any} 
            size={24} 
            color={iconColor || colors.primary} 
          />
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{
              fontSize: 16,
              fontFamily: fonts.medium,
              color: colors.text,
            }}>
              {title}
            </Text>
            {comingSoon && (
              <View style={{
                backgroundColor: colors.warning,
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 8,
                marginLeft: 8,
              }}>
                <Text style={{
                  fontSize: 10,
                  fontFamily: fonts.semiBold,
                  color: '#fff',
                }}>
                  Coming Soon
                </Text>
              </View>
            )}
          </View>
          {subtitle && (
            <Text style={{
              fontSize: 13,
              fontFamily: fonts.regular,
              color: colors.textSecondary,
              marginTop: 3,
            }}>
              {subtitle}
            </Text>
          )}
        </View>
        {rightComponent}
        {showArrow && !rightComponent && onPress && !disabled && !comingSoon && (
          <MaterialIcons name="chevron-right" size={24} color={colors.textTertiary} />
        )}
      </View>
    );

    if (Platform.OS === 'web' && comingSoon) {
      return (
        <div title="Coming Soon - This feature is not yet available" style={{ cursor: 'not-allowed' }}>
          {itemContent}
        </div>
      );
    }

    return (
      <TouchableOpacity
        onPress={disabled || comingSoon ? undefined : onPress}
        activeOpacity={onPress && !disabled && !comingSoon ? 0.7 : 1}
      >
        {itemContent}
      </TouchableOpacity>
    );
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
          Settings
        </Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={{
          backgroundColor: colors.surface,
          borderRadius: 20,
          padding: 22,
          marginBottom: 28,
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: colors.border,
          ...shadowStyles.lg,
        }}>
          <View style={{
            width: 68,
            height: 68,
            borderRadius: 20,
            backgroundColor: colors.primaryBg,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 18,
          }}>
            <Text style={{
              fontSize: 28,
              fontFamily: fonts.bold,
              color: colors.primary,
            }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'T'}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: 20,
              fontFamily: fonts.semiBold,
              color: colors.text,
            }}>
              Dr. {user?.name || 'Therapist'}
            </Text>
            <Text style={{
              fontSize: 14,
              fontFamily: fonts.regular,
              color: colors.textSecondary,
              marginTop: 3,
            }}>
              {user?.email || 'therapist@example.com'}
            </Text>
          </View>
        </View>

        {/* Appearance */}
        <SettingSection title="Appearance">
          <SettingItem
            icon="dark-mode"
            title="Dark Mode"
            subtitle={themeMode === 'system' ? 'Following system' : themeMode === 'dark' ? 'Enabled' : 'Disabled'}
            iconColor={isDark ? '#9CA3AF' : '#4B5563'}
            rightComponent={
              <Switch
                value={theme === 'dark'}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#fff"
              />
            }
            showArrow={false}
          />
          <SettingItem
            icon="brightness-6"
            title="Theme Mode"
            subtitle={
              themeMode === 'system' ? 'System Default' :
              themeMode === 'dark' ? 'Always Dark' : 'Always Light'
            }
            iconColor={colors.accent}
            onPress={() => {
              const modes: ThemeMode[] = ['light', 'dark', 'system'];
              const currentIndex = modes.indexOf(themeMode);
              const nextIndex = (currentIndex + 1) % modes.length;
              setThemeMode(modes[nextIndex]);
            }}
            isLast
          />
        </SettingSection>

        {/* Recording Settings */}
        <SettingSection title="Recording">
          <SettingItem
            icon="high-quality"
            title="High Quality Audio"
            subtitle="Better quality, larger file size"
            iconColor={colors.success}
            rightComponent={
              <Switch
                value={settings.highQualityAudio}
                onValueChange={(value) => updateSetting('highQualityAudio', value)}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#fff"
              />
            }
            showArrow={false}
            isLast
          />
        </SettingSection>

        {/* Notifications - Coming Soon */}
        <View style={{ opacity: 0.4 }}>
          <SettingSection title="Notifications (Coming Soon)">
            <View style={{ 
              flexDirection: 'row',
              alignItems: 'center',
              padding: 18,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}>
              <View style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                backgroundColor: `${colors.textTertiary}20`,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 16,
              }}>
                <MaterialIcons name="notifications" size={24} color={colors.textTertiary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontFamily: fonts.medium, color: colors.textTertiary }}>
                  Push Notifications
                </Text>
                <Text style={{ fontSize: 13, fontFamily: fonts.regular, color: colors.textTertiary, marginTop: 3 }}>
                  Session reminders and updates
                </Text>
              </View>
              <View style={{ 
                width: 50, 
                height: 30, 
                borderRadius: 15, 
                backgroundColor: colors.border,
                justifyContent: 'center',
                paddingLeft: 4,
              }}>
                <View style={{ 
                  width: 22, 
                  height: 22, 
                  borderRadius: 11, 
                  backgroundColor: colors.textTertiary 
                }} />
              </View>
            </View>
            <View style={{ 
              flexDirection: 'row',
              alignItems: 'center',
              padding: 18,
            }}>
              <View style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                backgroundColor: `${colors.textTertiary}20`,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 16,
              }}>
                <MaterialIcons name="alarm" size={24} color={colors.textTertiary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontFamily: fonts.medium, color: colors.textTertiary }}>
                  Session Reminders
                </Text>
                <Text style={{ fontSize: 13, fontFamily: fonts.regular, color: colors.textTertiary, marginTop: 3 }}>
                  Get reminded about scheduled sessions
                </Text>
              </View>
              <View style={{ 
                width: 50, 
                height: 30, 
                borderRadius: 15, 
                backgroundColor: colors.border,
                justifyContent: 'center',
                paddingLeft: 4,
              }}>
                <View style={{ 
                  width: 22, 
                  height: 22, 
                  borderRadius: 11, 
                  backgroundColor: colors.textTertiary 
                }} />
              </View>
            </View>
          </SettingSection>
        </View>

        {/* Data & Storage */}
        <SettingSection title="Data & Storage">
          <SettingItem
            icon="cloud-upload"
            title="Sync Data"
            subtitle={
              syncStatus.pendingCount > 0 || syncStatus.failedCount > 0
                ? `${syncStatus.pendingCount} pending, ${syncStatus.failedCount} failed • ${settings.lastSyncDate ? formatLastSync(settings.lastSyncDate) : 'Never synced'}`
                : settings.lastSyncDate 
                  ? `Last synced: ${formatLastSync(settings.lastSyncDate)}` 
                  : 'All data synced to cloud'
            }
            iconColor={syncStatus.failedCount > 0 ? colors.error : syncStatus.pendingCount > 0 ? colors.warning : colors.primary}
            onPress={handleSync}
            rightComponent={
              isSyncing || syncStatus.isSyncing ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : syncStatus.pendingCount > 0 ? (
                <View style={{
                  backgroundColor: colors.warning,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 12,
                }}>
                  <Text style={{ color: '#fff', fontSize: 12, fontFamily: fonts.semiBold }}>
                    {syncStatus.pendingCount}
                  </Text>
                </View>
              ) : undefined
            }
            disabled={isSyncing || syncStatus.isSyncing}
          />
          <SettingItem
            icon="sync"
            title="Auto-Sync"
            subtitle="Automatically sync when on WiFi"
            iconColor={colors.secondary}
            rightComponent={
              <Switch
                value={settings.autoSyncEnabled}
                onValueChange={(value) => updateSetting('autoSyncEnabled', value)}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#fff"
              />
            }
            showArrow={false}
          />
          <SettingItem
            icon="delete-sweep"
            title="Clear Cache"
            subtitle={
              storageInfo.usedBytes > 0 
                ? `Using ${formatBytes(storageInfo.usedBytes)} • ${storageInfo.pendingSessions} session(s) stored`
                : 'Free up storage space'
            }
            iconColor={colors.accent}
            onPress={handleClearCache}
            rightComponent={isClearingCache ? (
              <ActivityIndicator size="small" color={colors.accent} />
            ) : storageInfo.usedBytes > 0 ? (
              <Text style={{ fontSize: 12, fontFamily: fonts.medium, color: colors.textSecondary }}>
                {formatBytes(storageInfo.usedBytes)}
              </Text>
            ) : undefined}
            isLast
            disabled={isClearingCache}
          />
        </SettingSection>

        {/* Legal */}
        <SettingSection title="Legal">
          <SettingItem
            icon="privacy-tip"
            title="Privacy Policy"
            subtitle="How we handle your data"
            iconColor={colors.secondary}
            onPress={() => {
              Alert.alert(
                'Privacy Policy',
                'Your data is stored securely and is only used for speech assessment purposes. Patient data is encrypted and stored in compliance with healthcare data regulations.\n\nWe do not share your data with third parties without explicit consent.',
                [{ text: 'OK' }]
              );
            }}
          />
          <SettingItem
            icon="description"
            title="Terms of Service"
            subtitle="Usage terms and conditions"
            iconColor={colors.info}
            onPress={() => {
              Alert.alert(
                'Terms of Service',
                'By using this application, you agree to:\n\n• Use the app for legitimate speech therapy purposes\n• Maintain patient confidentiality\n• Not share login credentials\n• Report any security concerns immediately',
                [{ text: 'OK' }]
              );
            }}
            isLast
          />
        </SettingSection>

        {/* Support */}
        <SettingSection title="Support">
          <SettingItem
            icon="help-outline"
            title="Help Center"
            subtitle="FAQs and guides"
            iconColor={colors.primary}
            onPress={() => router.push('/help' as Href)}
          />
          <SettingItem
            icon="email"
            title="Contact Support"
            subtitle="Get help from our team"
            iconColor={colors.success}
            onPress={handleContactSupport}
          />
          <SettingItem
            icon="info-outline"
            title="About"
            subtitle="Version 1.0.0"
            iconColor={colors.textSecondary}
            onPress={() => router.push('/about' as Href)}
            isLast
          />
        </SettingSection>

        {/* Sign Out Button */}
        <TouchableOpacity
          onPress={handleSignOut}
          style={{
            backgroundColor: colors.errorBg,
            borderRadius: 16,
            padding: 18,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: `${colors.error}30`,
            ...shadowStyles.sm,
          }}
        >
          <MaterialIcons name="logout" size={22} color={colors.error} />
          <Text style={{
            color: colors.error,
            fontSize: 16,
            fontFamily: fonts.semiBold,
            marginLeft: 10,
          }}>
            Sign Out
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;
