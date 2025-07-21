/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Optimize animations for performance
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'modal-pop': 'modalPop 0.2s ease-out',
        'spin-fast': 'spin 0.5s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        modalPop: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
  // Optimize for production
  future: {
    hoverOnlyWhenSupported: true,
  },
  // Reduce bundle size by removing unused utility classes
  corePlugins: {
    // Disable unused features for smaller bundle
    preflight: true,
    container: false,
    accessibility: false,
    backgroundOpacity: false,
    borderOpacity: false,
    boxShadowColor: false,
    divideOpacity: false,
    placeholderOpacity: false,
    ringOpacity: false,
    textOpacity: false,
  },
}
