/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta profesional Verde Esmeralda
        primary: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',  // Verde principal
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        // Acento complementario (Verde más brillante)
        accent: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',  // Verde brillante
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
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
        'gradient-green': 'linear-gradient(135deg, #10b981 0%, #22c55e 100%)',
      },
      boxShadow: {
        'glow': '0 0 30px rgba(16, 185, 129, 0.4)',
        'glow-lg': '0 0 50px rgba(16, 185, 129, 0.5)',
        'glow-accent': '0 0 30px rgba(34, 197, 94, 0.4)',
        'cinema': '0 10px 40px rgba(0, 0, 0, 0.7)',
        'inner-glow': 'inset 0 0 20px rgba(16, 185, 129, 0.2)',
      },
    },
  },
  plugins: [],
}