/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        "primary": "#007AFF",
        "background-light": "#F2F2F7",
        "background-dark": "#101922",
        "text-light": "#1C1C1E",
        "text-dark": "#FFFFFF",
        "status-success": "#34C759",
        "status-error": "#FF3B30",
        "disabled-bg": "#D1D1D6",
        "disabled-text": "#8E8E93",
        "border-light": "#E5E5EA",
        "border-dark": "#324d67",
        "text-muted-light": "#636366",
        "text-muted-dark": "#92adc9",
        "component-light": "#ffffff",
        "component-dark": "#192633",
      },
      fontFamily: {
        "display": ["System", "-apple-system", "BlinkMacSystemFont", "Roboto", "sans-serif"],
        "body": ["System", "-apple-system", "BlinkMacSystemFont", "Roboto", "sans-serif"],
        "medical": ["System", "-apple-system", "BlinkMacSystemFont", "Roboto", "sans-serif"],
      },
      borderRadius: {
        "DEFAULT": "0.5rem",
        "lg": "0.75rem",
        "xl": "1rem",
        "full": "9999px",
      },
    },
  },
  plugins: [],
}
