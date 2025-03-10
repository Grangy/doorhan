module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",    // включаем App Router папки
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  mode: 'jit',
  theme: {
    extend: {
      colors: {
        'main-doorhan': '#123456', // Замените '#123456' на нужный вам HEX-код
      },  
    },
  },
  plugins: [],
};
