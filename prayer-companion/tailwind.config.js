/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
        ruqaa: ['"Aref Ruqaa"', 'serif'],
      },
      colors: {
        navy: '#121e42',
        'navy-light': '#1e3c72',
        brand: '#2a5298',
        orange: '#f97316',
        purple: '#7c3aed',
        emerald: '#10b981',
        sky: '#0284c7',
      },
      backgroundImage: {
        'prayer-gradient': 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #1e3c72 100%)',
        'fajr-gradient': 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
        'dhuhr-gradient': 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        'asr-gradient': 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        'maghrib-gradient': 'linear-gradient(135deg, #373b44 0%, #4286f4 100%)',
        'isha-gradient': 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
      },
    },
  },
  plugins: [],
};
