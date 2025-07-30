module.exports = {
    content: [
      './pages/**/*.{js,ts,jsx,tsx}',   // Ensure you're including your files
      './components/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
      extend: {
        screens: {
          'cb': '410px',  // Custom breakpoint at 410px
          'sm': '480px',   // Example of other breakpoints
          'md': '768px',
          'lg': '1024px',
          'xl': '1440px',
        },
      },
    },
    plugins: [],
  }
  