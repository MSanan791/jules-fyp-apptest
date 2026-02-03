import { Platform, ViewStyle } from 'react-native';

export const colors = {
  light: {
    primary: '#2563EB',      
    primaryLight: '#3B82F6', 
    primaryDark: '#1D4ED8',  
    primaryBg: '#EFF6FF',    

    secondary: '#475569',     
    secondaryLight: '#64748B', 
    secondaryDark: '#334155', 
    secondaryBg: '#F8FAFC',   

    accent: '#059669',       
    accentLight: '#10B981',  
    accentDark: '#047857',   
    accentBg: '#ECFDF5',     

    background: '#FFFFFF',   
    surface: '#FFFFFF',      
    surfaceSecondary: '#F8FAFC', 
    surfaceElevated: '#FFFFFF', 

    text: '#111827',         
    textSecondary: '#4B5563', 
    textTertiary: '#9CA3AF', 
    textInverse: '#FFFFFF',  

    border: '#E5E7EB',       
    borderFocus: '#2563EB',  
    borderError: '#DC2626',  
    borderLight: '#F3F4F6',  

    success: '#059669',      
    successBg: '#ECFDF5',    
    warning: '#D97706',      
    warningBg: '#FFFBEB',    
    error: '#DC2626',        
    errorBg: '#FEF2F2',      
    info: '#2563EB',         
    infoBg: '#EFF6FF',       

    recording: '#DC2626',    
    recordingBg: '#FEF2F2',  
    paused: '#D97706',       
    pausedBg: '#FFFBEB',     
    ready: '#059669',        
    readyBg: '#ECFDF5',      

    cardPatient: '#EFF6FF',  
    cardSession: '#F8FAFC',  
    cardStats: '#ECFDF5',    
    
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(0, 0, 0, 0.3)',
  },
  dark: {
    primary: '#3B82F6',      
    primaryLight: '#60A5FA', 
    primaryDark: '#2563EB',  
    primaryBg: '#1E3A8A',    

    secondary: '#E5E7EB',     
    secondaryLight: '#F3F4F6', 
    secondaryDark: '#D1D5DB', 
    secondaryBg: '#374151',   

    accent: '#10B981',       
    accentLight: '#34D399',  
    accentDark: '#059669',   
    accentBg: '#065F46',     

    background: '#111827',   
    surface: '#1F2937',      
    surfaceSecondary: '#374151', 
    surfaceElevated: '#374151', 

    text: '#F9FAFB',         
    textSecondary: '#E5E7EB', 
    textTertiary: '#9CA3AF', 
    textInverse: '#111827',  

    border: '#4B5563',       
    borderFocus: '#3B82F6',  
    borderError: '#EF4444',  
    borderLight: '#374151',  

    success: '#10B981',      
    successBg: '#065F46',    
    warning: '#F59E0B',      
    warningBg: '#78350F',    
    error: '#EF4444',        
    errorBg: '#7F1D1D',      
    info: '#3B82F6',         
    infoBg: '#1E3A8A',       

    recording: '#EF4444',    
    recordingBg: '#7F1D1D',  
    paused: '#F59E0B',       
    pausedBg: '#78350F',     
    ready: '#10B981',        
    readyBg: '#065F46',      

    cardPatient: '#1E3A8A',  
    cardSession: '#374151',  
    cardStats: '#065F46',    
    
    overlay: 'rgba(0, 0, 0, 0.7)',
    overlayLight: 'rgba(0, 0, 0, 0.5)',
  }
};

export const getColors = (isDark: boolean) => isDark ? colors.dark : colors.light;

interface ShadowSet {
  sm: ViewStyle;
  md: ViewStyle;
  lg: ViewStyle;
  xl: ViewStyle;
  glow: ViewStyle;
}

const webShadows: ShadowSet = { sm: {}, md: {}, lg: {}, xl: {}, glow: {} };

const nativeShadowsLight: ShadowSet = {
  sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 2 },
  md: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 4 },
  lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.16, shadowRadius: 16, elevation: 8 },
  xl: { shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.2, shadowRadius: 24, elevation: 12 },
  glow: { shadowColor: '#2563EB', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
};

const nativeShadowsDark: ShadowSet = {
  sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 4, elevation: 2 },
  md: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 8, elevation: 4 },
  lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.6, shadowRadius: 16, elevation: 8 },
  xl: { shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.7, shadowRadius: 24, elevation: 12 },
  glow: { shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 6 },
};

const isWeb = Platform.OS === 'web';

export const getShadows = (isDark: boolean): ShadowSet => {
  if (isWeb) return webShadows;
  return isDark ? nativeShadowsDark : nativeShadowsLight;
};