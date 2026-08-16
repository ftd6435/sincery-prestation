export default {content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#C1272D',
          dark: '#A01F24',
          light: '#E53238',
        },
        surface: {
          page: 'hsla(0, 0%, 98%, 1)',
          alt: 'hsla(0, 0%, 97%, 1)',
        },
        line: '#E5E7EB',
        success: { DEFAULT: '#10B981', bg: '#D1FAE5' },
        danger: { DEFAULT: '#EF4444', bg: '#FEE2E2' },
        warning: { DEFAULT: '#F59E0B', bg: '#FEF3C7' },
        info: { DEFAULT: '#3B82F6', bg: '#DBEAFE' },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },
      borderRadius: {
        sm: '4px',
        md: '6px',
        lg: '8px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.08)',
        hover: '0 4px 12px rgba(0,0,0,0.12)',
        elevated: '0 8px 24px rgba(0,0,0,0.15)',
        glow: '0 4px 16px rgba(193,39,45,0.25)',
      },
    },
  },
}
