module.exports = {
  content: ['./index.html', './js/**/*.js'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#f7bd91',
          soft: '#fcf4ef',
          accent: '#f4a163',
          deep: '#bd804d'
        },
        ink: { DEFAULT: '#111111', hover: '#33261d' },
        muted: '#f3f3f3'
      },
      fontFamily: { sans: ['Nunito', 'sans-serif'] },
      borderRadius: { card: '0.625rem' },
      boxShadow: { video: '0 12px 28px rgba(45,31,20,0.18)' },
      maxWidth: { container: '75rem' }
    }
  },
  plugins: []
};
