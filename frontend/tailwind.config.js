/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "brand-primary": "var(--primary-bg)",
        "brand-secondary": "var(--secondary-bg)",
      },
    },
  },
  plugins: [],
};
