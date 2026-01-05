import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: '#9054f8',
          foreground: 'hsl(var(--primary-foreground))',
          dark: '#7a42d9',
        },
        secondary: {
          DEFAULT: '#302249',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        "accent-green": "#1db954",
        "accent-pink": "#ff0055",
        "background-light": "#f6f5f8",
        "background-dark": "#161022",
        "glass-border": "rgba(255, 255, 255, 0.08)",
        "glass-surface": "rgba(30, 30, 40, 0.6)",
        "surface-dark": "#1e162e",
        "surface-light": "#2a213a",
        "border-dark": "#36294b",
        "text-muted": "#a58fcc",
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        neon: {
          pink: '#FF10F0',
          purple: '#8B5CF6',
          blue: '#3B82F6',
          green: '#10B981',
        },
        "bora-primary": "#8B5CF6",
        "bora-primary-dark": "#6D28D9",
        "background-deep": "#030014",
        "surface-lighter": "#2D2645",
        "panel-dark": "#0F0720",
        "panel-border": "#2E1065",
        "accent-neon": "#A855F7",
        "accent-cyan": "#06B6D4",
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(to right, #1e1b4b 1px, transparent 1px), linear-gradient(to bottom, #1e1b4b 1px, transparent 1px)",
        'cyber-gradient': "linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(15, 7, 32, 0.9) 100%)",
        'aurora': 'linear-gradient(130deg, #171023 0%, #302249 50%, #171023 100%)',
        'noise': 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.05\'/%3E%3C/svg%3E")',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-plus-jakarta-sans)', 'sans-serif'],
        body: ['var(--font-noto-sans)', 'sans-serif'],
      },
      animation: {
        blob: 'blob 7s infinite',
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'marquee': 'marquee 25s linear infinite',
      },
      keyframes: {
        blob: {
          '0%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
          '33%': {
            transform: 'translate(30px, -50px) scale(1.1)',
          },
          '66%': {
            transform: 'translate(-20px, 20px) scale(0.9)',
          },
          '100%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
        },
        marquee: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        }
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography'), require('@tailwindcss/forms'), require('@tailwindcss/container-queries')],
}
export default config