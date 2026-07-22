import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          DEFAULT: '#F5F0E8',
          dark: '#EDE5D5',
        },
        ink: {
          DEFAULT: '#1C1A16',
          light: '#4A4540',
        },
        sepia: {
          DEFAULT: '#8B4513',
          light: '#C8A882',
          line: '#C8B89A',
        },
        cameroon: {
          black: '#171210',
          red: '#A81C1C',
          gold: '#D4A017',
          goldLight: '#E8B923',
          indigo: '#1F3A63',
          green: '#2F5233',
        },
        admin: {
          bg: '#0E0D0B',
          surf: '#161410',
          surf2: '#1E1C18',
          border: '#2E2B25',
          text: '#E8E0D0',
          muted: '#7A7268',
          gold: '#C8922A',
        },
      },
      fontFamily: {
        playfair: ['var(--font-playfair)', 'Georgia', 'serif'],
        mono: ['var(--font-dm-mono)', 'monospace'],
        serif: ['var(--font-source-serif)', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}

export default config
