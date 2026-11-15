import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff1f1',
          100: '#ffe1e1',
          200: '#ffc7c7',
          300: '#ffa0a0',
          400: '#ff6969',
          500: '#f53737',
          600: '#e02020',
          700: '#bc1414',
          800: '#9b1414',
          900: '#801818',
          950: '#460707',
        },
        navy: {
          50: '#f0f4f9',
          100: '#dce5f0',
          200: '#bdcfe2',
          300: '#91b1cf',
          400: '#5f8eb8',
          500: '#3d72a0',
          600: '#2d5a84',
          700: '#25496c',
          800: '#1b334d',
          900: '#132437',
          950: '#0c1724',
        },
        school: {
          dark: '#121927',
          light: '#f8fafc',
          card: '#ffffff',
          accent: '#e02020',
          blue: '#1e3a8a',
          gold: '#f59e0b',
          green: '#10b981',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Poppins', 'Inter', 'sans-serif'],
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        marquee: 'marquee 28s linear infinite',
        fadeIn: 'fadeIn 0.3s ease-in-out',
        slideUp: 'slideUp 0.3s ease-out',
        shimmer: 'shimmer 2s infinite',
      }
    },
  },
  plugins: [],
};

export default config;
