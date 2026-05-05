/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        ink: '#0F1410',
        'ink-2': '#3D453F',
        'ink-3': '#7E857F',
        canopy: '#0E5A3F',
        'canopy-ink': '#063B28',
        'canopy-soft': '#E8F1EC',
        clay: '#B8462E',
        'clay-soft': '#F6EAE4',
        mist: '#FBFBF9',
        surface: '#FFFFFF',
        'surface-alt': '#F5F6F2',
        rule: '#E8EAE5',
        'rule-soft': '#F0F1ED',
        whatsapp: '#16A34A',
        star: '#D6A11C',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        civic: '10px',
        'civic-lg': '14px',
      },
      boxShadow: {
        civic: '0 1px 2px rgba(15,20,16,.04)',
        'civic-lg': '0 6px 24px rgba(15,20,16,.06), 0 1px 2px rgba(15,20,16,.04)',
      },
    },
  },
  plugins: [],
}
