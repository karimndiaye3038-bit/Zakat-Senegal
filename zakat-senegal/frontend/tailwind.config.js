/** Charte : vert profond (confiance), vert clair (soutien), doré (accents), blanc cassé (lisibilité). */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: { 50: '#ecf7f1', 100: '#d3eedf', 200: '#a8ddc0', 300: '#74c59b', 400: '#43aa78', 500: '#228f5e', 600: '#177a4e', 700: '#0f6340', 800: '#0b4f33', 900: '#083d28' },
        gold: { 50: '#fbf6e8', 100: '#f5ebc9', 400: '#d9b55a', 500: '#c9a03a', 600: '#a9822a' },
        cream: '#f8f6f0',
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'], display: ['Poppins', 'Inter', 'sans-serif'] },
      boxShadow: { soft: '0 8px 30px rgba(11, 79, 51, 0.08)' },
    },
  },
  plugins: [],
};
