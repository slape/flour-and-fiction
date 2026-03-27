import type {Config} from 'tailwindcss'
import typography from '@tailwindcss/typography'

export default {
  content: ['./app/**/*.{ts,tsx}', './sanity/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
    },
    extend: {
      colors: {
        black: '#1D1E1E',
        white: '#fff',
        crimson: {
          DEFAULT: '#C8133E',
          dark: '#a01032',
        },
        plum: {
          DEFAULT: '#4E2F4B',
          light: '#6b4268',
        },
        gray: {
          50: '#F9F9F9',
          100: '#f0f0f0',
          200: '#e0e0e0',
          300: '#c0c0c0',
          400: '#999999',
          500: '#727272',
          600: '#515151',
          700: '#383838',
          800: '#252525',
          900: '#1D1E1E',
          950: '#111111',
        },
      },
      fontFamily: {
        serif: ['var(--font-libre-baskerville)', 'Georgia', 'Times New Roman', 'serif'],
        body: ['Georgia', 'Times New Roman', 'serif'],
      },
      maxWidth: {
        content: '760px',
        wide: '1000px',
      },
      typography: {
        DEFAULT: {
          css: {
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: '1.125rem',
            lineHeight: '1.6',
            color: '#1D1E1E',
            a: {
              color: '#C8133E',
              textDecoration: 'none',
              '&:hover': {
                color: '#4E2F4B',
              },
            },
            h1: {
              fontFamily: 'var(--font-libre-baskerville), Georgia, serif',
            },
            h2: {
              fontFamily: 'var(--font-libre-baskerville), Georgia, serif',
            },
            h3: {
              fontFamily: 'var(--font-libre-baskerville), Georgia, serif',
            },
            h4: {
              fontFamily: 'var(--font-libre-baskerville), Georgia, serif',
            },
          },
        },
      },
    },
  },
  future: {
    hoverOnlyWhenSupported: true,
  },
  plugins: [typography],
} satisfies Config
