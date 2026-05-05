/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SITE_URL?: string
  readonly PUBLIC_SUPABASE_URL: string
  readonly PUBLIC_SUPABASE_ANON_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Alpine.js v3 ships without a bundled declaration file — declare minimal shape here
declare module 'alpinejs' {
  const Alpine: {
    start(): void
  }
  export default Alpine
}

// Custom window flags used by BaseLayout scripts
interface Window {
  _alpineStarted?: boolean
  _dlProg?: boolean
}
