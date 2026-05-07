/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SITE_URL?: string
  readonly PUBLIC_SUPABASE_URL: string
  readonly PUBLIC_SUPABASE_ANON_KEY: string
  // Public — shown in wa.me links, safe to expose
  readonly PUBLIC_WHATSAPP_BUSINESS_PHONE?: string
  // Server-only — never PUBLIC_*, never committed
  readonly SUPABASE_SERVICE_ROLE_KEY: string
  // WhatsApp Cloud API — server-only
  readonly WHATSAPP_ACCESS_TOKEN: string
  readonly WHATSAPP_PHONE_NUMBER_ID: string
  readonly WHATSAPP_APP_SECRET: string
  readonly WHATSAPP_WEBHOOK_VERIFY_TOKEN: string
  // Optional: override the default OTP template name
  readonly WHATSAPP_OTP_TEMPLATE_NAME?: string
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
