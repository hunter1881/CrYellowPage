/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        ink: '#1A1F1B',
        'ink-2': '#4A524C',
        'ink-3': '#7A8079',
        canopy: '#0E5A3F',
        'canopy-ink': '#063B28',
        'canopy-soft': '#E3EDE7',
        clay: '#B8462E',
        'clay-soft': '#F4E6E0',
        mist: '#F4F5F2',
        surface: '#FFFFFF',
        'surface-alt': '#FAFBF8',
        rule: '#D9DCD6',
        'rule-soft': '#E8EAE5',
        whatsapp: '#16A34A',
        star: '#C58A1E',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        civic: '2px',
        'civic-lg': '4px',
      },
    },
  },
  plugins: [],
}
