// Professional Medical-Grade Color Palette
// Dark mode with vibrant, high-contrast colors
// Light mode with clean, professional medical aesthetic

import { Platform, ViewStyle } from 'react-native';

export const colors = {
  // ============================================
  // LIGHT MODE - Clean Professional Medical
  // ============================================
  light: {
    // Primary Colors - Professional Blue
    primary: '#2563EB',      // Blue-600 - Primary actions
    primaryLight: '#3B82F6', // Blue-500 - Hover states
    primaryDark: '#1D4ED8',  // Blue-700 - Active states
    primaryBg: '#EFF6FF',    // Blue-50 - Subtle backgrounds

    // Secondary Colors - Slate Gray
    secondary: '#475569',     // Slate-600
    secondaryLight: '#64748B', // Slate-500
    secondaryDark: '#334155', // Slate-700
    secondaryBg: '#F8FAFC',   // Slate-50

    // Accent Colors - Emerald
    accent: '#059669',       // Emerald-600
    accentLight: '#10B981',  // Emerald-500
    accentDark: '#047857',   // Emerald-700
    accentBg: '#ECFDF5',     // Emerald-50

    // Background Colors
    background: '#FFFFFF',   // Pure white - Main background
    surface: '#FFFFFF',      // White - Cards, surfaces
    surfaceSecondary: '#F8FAFC', // Slate-50 - Secondary surfaces
    surfaceElevated: '#FFFFFF', // Elevated cards

    // Text Colors
    text: '#111827',         // Gray-900 - Primary text
    textSecondary: '#4B5563', // Gray-600 - Secondary text
    textTertiary: '#9CA3AF', // Gray-400 - Placeholder text
    textInverse: '#FFFFFF',  // White - Text on dark backgrounds

    // Border Colors
    border: '#E5E7EB',       // Gray-200 - Default borders
    borderFocus: '#2563EB',  // Blue-600 - Focus state
    borderError: '#DC2626',  // Red-600 - Error state
    borderLight: '#F3F4F6',  // Gray-100 - Subtle borders

    // Status Colors
    success: '#059669',      // Emerald-600
    successBg: '#ECFDF5',    // Emerald-50
    warning: '#D97706',      // Amber-600
    warningBg: '#FFFBEB',    // Amber-50
    error: '#DC2626',        // Red-600
    errorBg: '#FEF2F2',      // Red-50
    info: '#2563EB',         // Blue-600
    infoBg: '#EFF6FF',       // Blue-50

    // Recording States
    recording: '#DC2626',    // Red-600 - Active recording
    recordingBg: '#FEF2F2',  // Red-50
    paused: '#D97706',       // Amber-600 - Paused
    pausedBg: '#FFFBEB',     // Amber-50
    ready: '#059669',        // Emerald-600 - Ready
    readyBg: '#ECFDF5',      // Emerald-50

    // Card Colors
    cardPatient: '#EFF6FF',  // Blue-50
    cardSession: '#F8FAFC',  // Slate-50
    cardStats: '#ECFDF5',    // Emerald-50
    
    // Gradient overlay
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(0, 0, 0, 0.3)',
  },

  // ============================================
  // DARK MODE - Vibrant and High Contrast
  // ============================================
  dark: {
    // Primary Colors - Vibrant Blue
    primary: '#3B82F6',      // Blue-500 - Brighter primary
    primaryLight: '#60A5FA', // Blue-400 - Hover states
    primaryDark: '#2563EB',  // Blue-600 - Active states
    primaryBg: '#1E3A8A',    // Blue-900 - More visible background

    // Secondary Colors - Lighter Gray for contrast
    secondary: '#E5E7EB',     // Gray-200 - Brighter secondary
    secondaryLight: '#F3F4F6', // Gray-100
    secondaryDark: '#D1D5DB', // Gray-300
    secondaryBg: '#374151',   // Gray-700

    // Accent Colors - Vibrant Emerald
    accent: '#10B981',       // Emerald-500 - Brighter
    accentLight: '#34D399',  // Emerald-400
    accentDark: '#059669',   // Emerald-600
    accentBg: '#065F46',     // Emerald-800

    // Background Colors - Dark but not pure black
    background: '#111827',   // Gray-900 - Main background
    surface: '#1F2937',      // Gray-800 - Cards, surfaces
    surfaceSecondary: '#374151', // Gray-700 - Secondary surfaces
    surfaceElevated: '#374151', // Gray-700 - Elevated cards

    // Text Colors - High contrast
    text: '#F9FAFB',         // Gray-50 - Primary text (almost white)
    textSecondary: '#E5E7EB', // Gray-200 - Secondary text (brighter)
    textTertiary: '#9CA3AF', // Gray-400 - Placeholder text
    textInverse: '#111827',  // Gray-900 - Text on light backgrounds

    // Border Colors - More visible
    border: '#4B5563',       // Gray-600 - More visible borders
    borderFocus: '#3B82F6',  // Blue-500 - Focus state
    borderError: '#EF4444',  // Red-500 - Error state (brighter)
    borderLight: '#374151',  // Gray-700 - Subtle borders

    // Status Colors - Vibrant versions
    success: '#10B981',      // Emerald-500 (brighter)
    successBg: '#065F46',    // Emerald-800
    warning: '#F59E0B',      // Amber-500 (brighter)
    warningBg: '#78350F',    // Amber-900
    error: '#EF4444',        // Red-500 (brighter)
    errorBg: '#7F1D1D',      // Red-900
    info: '#3B82F6',         // Blue-500 (brighter)
    infoBg: '#1E3A8A',       // Blue-900

    // Recording States - Vibrant
    recording: '#EF4444',    // Red-500 - Active recording
    recordingBg: '#7F1D1D',  // Red-900
    paused: '#F59E0B',       // Amber-500 - Paused
    pausedBg: '#78350F',     // Amber-900
    ready: '#10B981',        // Emerald-500 - Ready
    readyBg: '#065F46',      // Emerald-800

    // Card Colors - More visible backgrounds
    cardPatient: '#1E3A8A',  // Blue-900
    cardSession: '#374151',  // Gray-700
    cardStats: '#065F46',    // Emerald-800
    
    // Gradient overlay
    overlay: 'rgba(0, 0, 0, 0.7)',
    overlayLight: 'rgba(0, 0, 0, 0.5)',
  }
};

// Get colors based on theme
export const getColors = (isDark: boolean) => isDark ? colors.dark : colors.light;

// Common gradients
export const gradients = {
  light: {
    primary: ['#2563EB', '#1D4ED8'],
    secondary: ['#475569', '#334155'],
    accent: ['#059669', '#047857'],
    success: ['#059669', '#047857'],
    recording: ['#DC2626', '#B91C1C'],
  },
  dark: {
    primary: ['#3B82F6', '#2563EB'],
    secondary: ['#E5E7EB', '#D1D5DB'],
    accent: ['#10B981', '#059669'],
    success: ['#10B981', '#059669'],
    recording: ['#EF4444', '#DC2626'],
  }
};

// Shadow type
interface ShadowSet {
  sm: ViewStyle;
  md: ViewStyle;
  lg: ViewStyle;
  xl: ViewStyle;
  glow: ViewStyle;
}

// Empty shadow set for web
const webShadows: ShadowSet = {
  sm: {},
  md: {},
  lg: {},
  xl: {},
  glow: {},
};

// Native shadow definitions
const nativeShadowsLight: ShadowSet = {
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

const nativeShadowsDark: ShadowSet = {
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
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
};

// Pre-compute shadow sets based on platform
const isWeb = Platform.OS === 'web';

export const shadows = {
  light: isWeb ? webShadows : nativeShadowsLight,
  dark: isWeb ? webShadows : nativeShadowsDark,
};

// Get shadows function
export function getShadows(isDark: boolean): ShadowSet {
  if (isWeb) {
    return webShadows;
  }
  return isDark ? nativeShadowsDark : nativeShadowsLight;
}

// Card styles
export const cardStyles = {
  light: {
    glass: {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
    },
    solid: {
      backgroundColor: '#FFFFFF',
    },
  },
  dark: {
    glass: {
      backgroundColor: 'rgba(31, 41, 55, 0.9)',
    },
    solid: {
      backgroundColor: '#1F2937',
    },
  }
};

export const getCardStyles = (isDark: boolean) => isDark ? cardStyles.dark : cardStyles.light;
