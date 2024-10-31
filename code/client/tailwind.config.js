/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        slide: 'slide 10s linear infinite',
        'dropdown-open': 'dropdown-open 0.3s ease forwards',
        'scale-up': 'scale-up 0.3s ease forwards',
        'bounce': 'bounce 0.5s ease forwards',
        'rotate-in': 'rotate-in 0.3s ease forwards',
        'slide-in-left': 'slide-in-left 0.3s ease forwards',
      },
      keyframes: {
        slide: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '100% 50%' },
        },
        'dropdown-open': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'scale-up': {
          '0%': { opacity: '0', transform: 'scale(0.5)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'bounce': {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '60%': { opacity: '1', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'rotate-in': {
          '0%': { opacity: '0', transform: 'rotate(-20deg)' },
          '100%': { opacity: '1', transform: 'rotate(0)' },
        },
        'slide-in-left': {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: []
}

