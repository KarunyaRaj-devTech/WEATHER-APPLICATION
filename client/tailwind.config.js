module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
    theme: {
      extend: {
        animation: {
          float: 'float 6s ease-in-out infinite',
          'float-slow': 'float-slow 8s ease-in-out infinite',
          'float-delay': 'float-delay 7s ease-in-out infinite 1s',
          'pulse-fast': 'pulse-fast 1.5s ease-in-out infinite',
          shake: 'shake 0.5s ease-in-out',
        },
        keyframes: {
          float: {
            '0%, 100%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(-10px)' },
          },
          'float-slow': {
            '0%, 100%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(-5px)' },
          },
          'float-delay': {
            '0%, 100%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(-8px)' },
          },
          'pulse-fast': {
            '0%, 100%': { opacity: '1' },
            '50%': { opacity: '0.5' },
          },
          shake: {
            '0%, 100%': { transform: 'translateX(0)' },
            '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
            '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
          },
        },
      },
    },
    plugins: [],
  }