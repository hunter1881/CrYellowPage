/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        ink: '#0A0F0C',
        'ink-2': '#3D453F',
        'ink-3': '#7E857F',
        canopy: '#0E5A3F',
        'canopy-ink': '#063B28',
        'canopy-soft': '#DCE8DF',
        'canopy-bright': '#16C97A',
        accent: '#E8542A',
        'accent-soft': '#FBE5DC',
        clay: '#B8462E',
        'clay-soft': '#F6EAE4',
        mist: '#F5F3EC',
        surface: '#FFFFFF',
        'surface-alt': '#EBE8DD',
        'surface-dark': '#0E1F18',
        rule: '#DDD9CC',
        'rule-soft': '#E8E5D9',
        whatsapp: '#16A34A',
        star: '#E8A317',
        yellow: '#F5C242',
        'yellow-soft': '#FBEBC4',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        civic: '10px',
        'civic-lg': '18px',
        'civic-xl': '28px',
      },
      boxShadow: {
        civic: '0 1px 2px rgba(15,20,16,.04)',
        'civic-lg': '0 12px 32px rgba(15,20,16,.08), 0 1px 2px rgba(15,20,16,.04)',
      },
    },
  },
  plugins: [],
}
