/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{ts,tsx}'],
  corePlugins: {
    // El sitio real ya tiene su propio reset en style.css — si dejamos el
    // preflight de Tailwind activo, pisa márgenes/tipografía de todo el
    // sitio (no solo de este widget). Lo apagamos y usamos solo utilities.
    preflight: false,
  },
  theme: {
    extend: {},
  },
  plugins: [],
};
