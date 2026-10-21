/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{ts,tsx}'],
  corePlugins: {
    // El sitio real ya tiene su propio reset en style.css.
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        // Alias fijos para los tokens de shadcn que usa pricing-card.tsx —
        // estas tarjetas son paneles oscuros a propósito (como el resto de
        // los bloques de acento del sitio), no dependen de un tema claro/oscuro.
        card: '#111111',
        border: 'rgba(255,255,255,.14)',
        input: 'rgba(255,255,255,.14)',
        ring: '#FFFFFF',
        background: '#0A0A0A',
        muted: 'rgba(255,255,255,.06)',
        'muted-foreground': '#ABABA6',
        foreground: '#F2F2F0',
        primary: '#FFFFFF',
        'primary-foreground': '#0A0A0A',
        accent: 'rgba(255,255,255,.09)',
        'accent-foreground': '#F2F2F0',
        secondary: 'rgba(255,255,255,.06)',
        'secondary-foreground': '#F2F2F0',
        destructive: '#C0392B',
        'destructive-foreground': '#F2F2F0',
      },
      borderColor: {
        DEFAULT: 'rgba(255,255,255,.14)',
      },
    },
  },
  plugins: [],
};
