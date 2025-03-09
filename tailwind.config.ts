import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        blue: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        // Include other color palettes you're using
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        green: {
          100: '#dcfce7',
          500: '#22c55e',
          800: '#166534',
        },
        yellow: {
          100: '#fef9c3',
          800: '#854d0e',
        },
        red: {
          100: '#fee2e2',
          500: '#ef4444',
          800: '#991b1b',
        },
        amber: {
          500: '#f59e0b',
        },
        purple: {
          500: '#a855f7',
        },
      },
    },
  },
  plugins: [],
};

export default config; 