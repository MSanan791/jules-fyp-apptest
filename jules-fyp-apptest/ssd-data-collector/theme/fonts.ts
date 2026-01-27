// Font configuration for the app
// Using Raleway Google Font

export const fonts = {
  regular: 'Raleway_400Regular',
  medium: 'Raleway_500Medium',
  semiBold: 'Raleway_600SemiBold',
  bold: 'Raleway_700Bold',
};

export const fontSizes = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
  '5xl': 40,
  '6xl': 48,
};

export const lineHeights = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
};

// Typography presets
export const typography = {
  // Headings
  h1: {
    fontFamily: fonts.bold,
    fontSize: fontSizes['4xl'],
    lineHeight: fontSizes['4xl'] * lineHeights.tight,
  },
  h2: {
    fontFamily: fonts.bold,
    fontSize: fontSizes['3xl'],
    lineHeight: fontSizes['3xl'] * lineHeights.tight,
  },
  h3: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes['2xl'],
    lineHeight: fontSizes['2xl'] * lineHeights.tight,
  },
  h4: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.xl,
    lineHeight: fontSizes.xl * lineHeights.tight,
  },
  h5: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.lg,
    lineHeight: fontSizes.lg * lineHeights.tight,
  },
  
  // Body text
  bodyLarge: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.lg,
    lineHeight: fontSizes.lg * lineHeights.normal,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.base,
    lineHeight: fontSizes.base * lineHeights.normal,
  },
  bodySmall: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm,
    lineHeight: fontSizes.sm * lineHeights.normal,
  },
  
  // Labels and captions
  label: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.sm,
    lineHeight: fontSizes.sm * lineHeights.normal,
  },
  caption: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.xs,
    lineHeight: fontSizes.xs * lineHeights.normal,
  },
  
  // Buttons
  button: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.md,
    lineHeight: fontSizes.md * lineHeights.tight,
  },
  buttonSmall: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.sm,
    lineHeight: fontSizes.sm * lineHeights.tight,
  },
};
