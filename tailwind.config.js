/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        teal: { DEFAULT: "#0D9488", hover: "#0b8279", light: "#E0F2F1" },
        shnoor: {
          gold: "#D4952D",
          navy: "#1B3A4B",
        },
      },
      fontFamily: {
        sans: ['Inter', 'DM Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
