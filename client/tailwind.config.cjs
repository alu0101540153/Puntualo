/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta profesional Cyan/Turquesa
        primary: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',  // Cyan principal
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
          950: '#083344',
        },
        // Acento complementario (Cyan más brillante)
        accent: {
          50: '#f0fdff',
          100: '#ccfbff',
          200: '#99f6ff',
          300: '#5ee9ff',
          400: '#2dd9ff',
          500: '#00c2ff',  // Cyan brillante
          600: '#009ad4',
          700: '#0078a8',
          800: '#00567a',
          900: '#003d58',
        },
        // Escala de negros y grises
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#1e293b',
          800: '#111827',
          900: '#0a0e1a',
          950: '#000000',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-cinema': 'linear-gradient(180deg, #000000 0%, #0a0e1a 50%, #111827 100%)',
        'gradient-dark': 'linear-gradient(180deg, #000000 0%, #0a0e1a 40%, #111827 100%)',
        'gradient-cyan': 'linear-gradient(135deg, #06b6d4 0%, #00c2ff 100%)',
      },
      boxShadow: {
        'glow': '0 0 30px rgba(6, 182, 212, 0.4)',
        'glow-lg': '0 0 50px rgba(6, 182, 212, 0.5)',
        'glow-accent': '0 0 30px rgba(0, 194, 255, 0.4)',
        'cinema': '0 10px 40px rgba(0, 0, 0, 0.7)',
        'inner-glow': 'inset 0 0 20px rgba(6, 182, 212, 0.2)',
      },
    },
  },
  plugins: [],
}