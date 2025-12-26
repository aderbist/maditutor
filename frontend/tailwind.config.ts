import type { Config } from 'tailwindcss'
const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0D0D0D',
        card: '#1A1A1A',
        'text-primary': '#E9ECEF',
        'text-secondary': '#CED4DA',
        accent: '#4DABF7',
      },
      spacing: {
        '18': '4.5rem',
      }
    },
  },
  plugins: [],
}
export default config