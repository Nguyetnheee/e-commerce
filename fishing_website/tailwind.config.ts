import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#f8f9fa',
          dim: '#d9dadb',
          bright: '#f8f9fa',
          'container-lowest': '#ffffff',
          'container-low': '#f3f4f5',
          container: '#edeeef',
          'container-high': '#e7e8e9',
          'container-highest': '#e1e3e4',
          variant: '#e1e3e4',
        },
        'on-surface': {
          DEFAULT: '#191c1d',
          variant: '#444653',
        },
        'inverse-surface': '#2e3132',
        'inverse-on-surface': '#f0f1f2',
        outline: {
          DEFAULT: '#757684',
          variant: '#c4c5d5',
        },
        'surface-tint': '#3755c3',
        primary: {
          DEFAULT: '#00288e',
          container: '#1e40af',
          fixed: '#dde1ff',
          'fixed-dim': '#b8c4ff',
        },
        'on-primary': {
          DEFAULT: '#ffffff',
          container: '#a8b8ff',
          fixed: '#001453',
          'fixed-variant': '#173bab',
        },
        'inverse-primary': '#b8c4ff',
        secondary: {
          DEFAULT: '#1f6c3a',
          container: '#a4f1b2',
          fixed: '#a6f4b5',
          'fixed-dim': '#8bd79b',
        },
        'on-secondary': {
          DEFAULT: '#ffffff',
          container: '#24703e',
          fixed: '#00210b',
          'fixed-variant': '#005226',
        },
        tertiary: {
          DEFAULT: '#5b2400',
          container: '#7f3500',
          fixed: '#ffdbca',
          'fixed-dim': '#ffb690',
        },
        'on-tertiary': {
          DEFAULT: '#ffffff',
          container: '#ffa677',
          fixed: '#341100',
          'fixed-variant': '#783200',
        },
        accent: {
          orange: '#e05600',
          'orange-hover': '#c84d00',
          yellow: '#fef3c7',
        },
        error: {
          DEFAULT: '#ba1a1a',
          container: '#ffdad6',
        },
        'on-error': {
          DEFAULT: '#ffffff',
          container: '#93000a',
        },
        background: '#f8f9fa',
        'on-background': '#191c1d',
      },
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          '"Noto Sans"',
          'sans-serif',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"'
        ],
      },
      fontSize: {
        'headline-xl': ['48px', { lineHeight: '56px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-lg': ['32px', { lineHeight: '40px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'headline-lg-mobile': ['28px', { lineHeight: '34px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'headline-md': ['24px', { lineHeight: '32px', letterSpacing: '0em', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '28px', letterSpacing: '0.01em', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '24px', letterSpacing: '0.01em', fontWeight: '400' }],
        'label-md': ['14px', { lineHeight: '20px', letterSpacing: '0.05em', fontWeight: '600' }],
        'label-sm': ['12px', { lineHeight: '16px', letterSpacing: '0.02em', fontWeight: '500' }],
      },
      borderRadius: {
        sm: '0.25rem',
        DEFAULT: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
        '2xl': '1.5rem',
      },
      spacing: {
        base: '4px',
        xs: '8px',
        sm: '16px',
        md: '24px',
        lg: '48px',
        xl: '80px',
        gutter: '24px',
        'margin-mobile': '16px',
        'margin-desktop': '64px',
      },
      boxShadow: {
        ambient: '0 20px 40px -15px rgba(0, 40, 142, 0.08), 0 10px 20px -10px rgba(31, 108, 58, 0.05)',
        'ambient-hover': '0 30px 60px -15px rgba(0, 40, 142, 0.12), 0 15px 30px -10px rgba(31, 108, 58, 0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
