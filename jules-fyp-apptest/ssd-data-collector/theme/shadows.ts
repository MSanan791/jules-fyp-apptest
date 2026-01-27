// Shadow utilities that are safe for both web and native
import { Platform, ViewStyle } from 'react-native';

type ShadowLevel = 'sm' | 'md' | 'lg' | 'xl' | 'glow';

// Native shadow definitions
const nativeShadowsLight: Record<ShadowLevel, ViewStyle> = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  glow: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
};

const nativeShadowsDark: Record<ShadowLevel, ViewStyle> = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.7,
    shadowRadius: 24,
    elevation: 12,
  },
  glow: {
    shadowColor: '#60A5FA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
};

// Returns shadow style only on native platforms
// On web, returns undefined (which React ignores in style objects)
export const getShadow = (level: ShadowLevel, isDark: boolean): ViewStyle | undefined => {
  if (Platform.OS === 'web') {
    return undefined;
  }
  return isDark ? nativeShadowsDark[level] : nativeShadowsLight[level];
};

// For backwards compatibility - returns empty object on web
const emptyStyle: ViewStyle = {};

export const getShadowStyle = (level: ShadowLevel, isDark: boolean): ViewStyle => {
  if (Platform.OS === 'web') {
    return emptyStyle;
  }
  return isDark ? nativeShadowsDark[level] : nativeShadowsLight[level];
};
