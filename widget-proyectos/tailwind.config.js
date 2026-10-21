/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{ts,tsx}'],
  corePlugins: {
    // El sitio real ya tiene su propio reset en style.css.
    preflight: false,
  },
  theme: {
    extend: {},
  },
  plugins: [],
};
