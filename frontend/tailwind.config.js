/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        neon: {
          blue: '#00f3ff',
          purple: '#8b5cf6',
          pink: '#ec4899',
        },
        dark: {
          900: '#0a0a0f',
          800: '#1a1a2e',
          700: '#2a2a3e',
        },
        light: {
          900: '#ffffff',
          800: '#f3f4f6',
          750: "#ececf1",
          700: '#e5e7eb',
        }
      },
      boxShadow: {
        'neon': '0 0 20px rgba(0, 243, 255, 0.5)',
        'neon-hover': '0 0 30px rgba(0, 243, 255, 0.7)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}